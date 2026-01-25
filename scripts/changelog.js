//Util: Generate CHANGELOG.md entries for a given sprint based on merged PRs.
//Usage:
// 1. Ensure you have a GitHub token with repo read access.
// 2. Run the script with desired sprint and date.
// # GH_TOKEN must be set (classic PAT or fine-grained token with repo read access)
// export GH_TOKEN=xxxxx

// npm run changelog -- --sprint 194 --date 2026-01-25
// # or default date=today:
// npm run changelog -- --sprint 194

require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { Octokit } = require("@octokit/rest");

function getToken() {
    return (
        process.env.GITHUB_TOKEN ||
        process.env.GH_TOKEN ||
        process.env.GITHUB_PAT ||
        process.env.PERSONAL_ACCESS_TOKEN
    );
}

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--sprint" || a === "-s") args.sprint = argv[++i];
        else if (a === "--date" || a === "-d") args.date = argv[++i];
        else if (a === "--base") args.base = argv[++i];
        else if (a === "--days") args.days = Number(argv[++i]);
    }
    return args;
}

function pad2(n) {
    return String(n).padStart(2, "0");
}

function formatMDY(date) {
    // M/d/yyyy (no leading zeros for M/d)
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
}

function toISODateOnly(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseDateOrToday(dateStr) {
    if (!dateStr) return new Date();
    // Expect YYYY-MM-DD
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) throw new Error(`Invalid --date "${dateStr}". Use YYYY-MM-DD.`);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

function getRepoFromEnv() {
    // Preferred in CI
    const repo = process.env.GITHUB_REPOSITORY; // "owner/name"
    if (repo && repo.includes("/")) {
        const [owner, name] = repo.split("/");
        return { owner, repo: name };
    }

    // Fallback for local: try parse from git remote (best effort)
    try {
        const { execSync } = require("child_process");
        const remote = execSync("git remote get-url origin", { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim();

        // https://github.com/owner/repo.git OR git@github.com:owner/repo.git
        const m =
            remote.match(/github\.com[/:]([^/]+)\/([^/.]+)(\.git)?$/i) ||
            remote.match(/github\.com[/:]([^/]+)\/([^/]+)\.git$/i);

        if (m) return { owner: m[1], repo: m[2] };
    } catch (_) {
        // ignore
    }

    throw new Error(
        "Cannot determine repo. Set GITHUB_REPOSITORY=owner/repo (recommended) or ensure git remote origin is set."
    );
}


function parseSprintMax(sprintStr) {
    // supports:
    // "194" -> 194
    // "249+250" -> max=250
    // "221_222_223" -> max=223
    // "221,222,223" -> max=223
    const nums = String(sprintStr)
        .split(/[^0-9]+/g)
        .filter(Boolean)
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n));

    if (!nums.length) throw new Error(`Invalid --sprint "${sprintStr}". Expected digits like 194 or 221_222_223.`);
    return Math.max(...nums);
}

function sprintToVersion(sprintStr) {
    const maxSprint = parseSprintMax(sprintStr);

    // rules from your doc:
    // major always 5
    // minor = hundreds of max sprint number
    // patch = tens
    // qualifier = ones
    const major = 5;
    const minor = Math.floor(maxSprint / 100);
    const patch = Math.floor((maxSprint % 100) / 10);
    const qualifier = maxSprint % 10;

    return `${major}.${minor}.${patch}-${qualifier}`;
}

function detectTypeFromTitle(title) {
    // Conventional Commits: type(scope?): subject
    // Example: feat(HCD-1234): something
    const m = title.trim().match(/^([a-zA-Z]+)(\([^)]+\))?:\s+/);
    const type = m ? m[1].toLowerCase() : "";
    if (["feat", "maintain", "build", "ci", "chore"].includes(type)) return type;
    return "chore"; // default bucket if not matched
}

function bucketName(type) {
    switch (type) {
        case "feat":
            return "New Features";
        case "maintain":
            return "Maintain";
        case "build":
            return "Build";
        case "ci":
            return "CI";
        case "chore":
        default:
            return "Chore";
    }
}

function makeEntry(pr) {
    const author = pr.user?.name || pr.user?.login || "unknown";
    // Match your example style:
    // - Merged PR 36201: feat(...): ... by **Full Name**
    return `- Merged PR ${pr.number}: ${pr.title} by **${author}**`;
}

async function listMergedPRs({ octokit, owner, repo, base, start, end }) {
    // We’ll page through recently updated closed PRs, then filter by merged_at within range.
    const per_page = 100;
    let page = 1;
    const results = [];

    while (true) {
        const res = await octokit.pulls.list({
            owner,
            repo,
            state: "closed",
            base,
            sort: "updated",
            direction: "desc",
            per_page,
            page,
        });

        if (!res.data.length) break;

        for (const pr of res.data) {
            // Stop condition: if PR updated_at is older than start by a lot,
            // BUT be careful: updated_at could be later than merged_at.
            // We can’t safely early-stop using updated_at strictly, but it’s still a good heuristic.
            // We'll use merged_at filter for truth.
            if (!pr.merged_at) continue;

            const mergedAt = new Date(pr.merged_at);
            if (mergedAt >= start && mergedAt <= end) {
                results.push(pr);
            }
        }

        // heuristic: if the last PR in the page has updated_at older than (start - 30 days), stop
        const lastUpdated = new Date(res.data[res.data.length - 1].updated_at);
        if (lastUpdated < addDays(start, -30)) break;

        page += 1;
        if (page > 20) break; // safety
    }

    // Sort by merged date ascending (optional, reads nicer)
    results.sort((a, b) => new Date(a.merged_at) - new Date(b.merged_at));
    return results;
}

function buildSprintSection({ sprintStr, version, startDate, endDate, grouped }) {
    const startMDY = formatMDY(startDate);
    const endMDY = formatMDY(endDate);

    const buckets = ["New Features", "Maintain", "Build", "CI", "Chore"];

    const lines = [];
    lines.push(`---`);
    lines.push(`## Sprint ${sprintStr}: ${startMDY} to ${endMDY}`);
    lines.push(`### Version: ${version}`);

    for (const b of buckets) {
        lines.push(`**${b}:**`);
        const items = grouped[b] || [];
        if (!items.length) {
            lines.push(`- N/A`);
        } else {
            for (const it of items) lines.push(it);
        }
        lines.push(""); // blank line between sections
    }

    return lines.join("\n").trimEnd() + "\n";
}

function ensureChangelogHeaderExists(changelogPath) {
    if (fs.existsSync(changelogPath)) return;

    const header = `# Change Log
All notable changes to this project will be documented in this file every sprint.

## Version format is based on Sprint number (Maximum sprint number if any):
- Format the version string as "{majorVersion}.{minorVersion}.{patchVersion}-{qualifier}"
- Major version is always 5 (based on hoselato update)
- Minor version is based on the hundreds of max sprint number
- Patch version is based on the tens
- Qualifier is based on the ones place (last digit)
- Date time format is M/d/yyyy.

## Define commit types:
The format adheres to [Angular Commit Message](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)

---
`;
    fs.writeFileSync(changelogPath, header, "utf8");
}

function appendIfNotDuplicate(changelogPath, sprintStr, sectionText) {
    const existing = fs.readFileSync(changelogPath, "utf8");
    const marker = `## Sprint ${sprintStr}:`;
    if (existing.includes(marker)) {
        console.log(`CHANGELOG already contains Sprint ${sprintStr}. Skipping append.`);
        return false;
    }
    fs.appendFileSync(changelogPath, "\n" + sectionText, "utf8");
    return true;
}

async function main() {
    const args = parseArgs(process.argv);
    const sprintStr = args.sprint;
    if (!sprintStr) throw new Error("Missing required --sprint (example: --sprint 194 or --sprint 221_222_223)");

    const base = args.base || "main";
    const days = Number.isFinite(args.days) && args.days > 0 ? args.days : 14;

    // Interpret --date as sprint end date in UTC for stable results
    const endDate = parseDateOrToday(args.date);
    const startDate = addDays(endDate, -days); // inclusive-ish range; matches “back 2-week-pass”

    // Make end inclusive to end-of-day
    const endInclusive = addDays(endDate, 1);
    endInclusive.setUTCMilliseconds(endInclusive.getUTCMilliseconds() - 1);

    const token = getToken();
    if (!token) {
        throw new Error(
            "Missing GitHub token. Set GITHUB_TOKEN (CI) or GH_TOKEN (local) with permission to read PRs."
        );
    }

    const { owner, repo } = getRepoFromEnv();
    const octokit = new Octokit({ auth: token });

    console.log(`Repo: ${owner}/${repo}`);
    console.log(`Base: ${base}`);
    console.log(`Sprint: ${sprintStr}`);
    console.log(`Range: ${toISODateOnly(startDate)} -> ${toISODateOnly(endDate)} (last ${days} days)`);

    const prs = await listMergedPRs({
        octokit,
        owner,
        repo,
        base,
        start: startDate,
        end: endInclusive,
    });

    const grouped = {
        "New Features": [],
        Maintain: [],
        Build: [],
        CI: [],
        Chore: [],
    };

    for (const pr of prs) {
        const type = detectTypeFromTitle(pr.title);
        const bucket = bucketName(type);
        grouped[bucket].push(makeEntry(pr));
    }

    const version = sprintToVersion(sprintStr);
    const section = buildSprintSection({
        sprintStr,
        version,
        startDate,
        endDate,
        grouped,
    });

    const changelogPath = path.resolve(process.cwd(), "CHANGELOG.md");
    ensureChangelogHeaderExists(changelogPath);

    const appended = appendIfNotDuplicate(changelogPath, sprintStr, section);
    if (appended) {
        console.log(`✅ Appended Sprint ${sprintStr} section to CHANGELOG.md (${prs.length} merged PRs found).`);
    }

    // Exit code still 0 even if no PRs; we wrote N/A
}

main().catch((err) => {
    console.error("❌ changelog generation failed:");
    console.error(err.message || err);
    process.exit(1);
});


