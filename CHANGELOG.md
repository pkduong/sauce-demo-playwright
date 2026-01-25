# Change Log
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

### 1. New Features:
   - These commits introduce new features or functionalities into the codebase. They are typically larger changes that expand the capabilities of the application.    
   - **Examples:**   
     - New test case implemented for a feature.    
     - New method(s) written for a new test case.    
     - Integration with external systems (e.g., Auto-create Jira tasks, Auto-create Portal page, Auto-update PowerPoint Sprint).    
      
   **Example Commit Message:**  
   `feat(HCD-1234): Implement TC HCDVN-1111`    
   `feat(HCD-1234): Add new method compareExcelValue to CommonPage.java`    
   `feat(HCD-1234): Implement new function Auto-create Jira tasks`    


### 2. Maintain:
   - These commits are focused on maintaining or improving existing features. This could involve refactoring, adding or updating methods within existing test cases, or fixing minor issues in the codebase without introducing new functionality.    
   - **Examples:**    
     - Updating existing test cases with new data or minor changes.
     - Add new method(s) replace existing out-dated method(s)
     - Refactoring methods or adding enhancements to existing features.
      
   **Example Commit Message:**  
   `maintain(HCD-2345): Maintain TC HCDVN-2222`    
   `maintain(HCD-2345): Replace out-dated method compareExcelValue with compareExcelValueNew in CommonPage.java`    


### 3. Build:
   - These commits are related to the build and deployment process. This could involve changes to the build configuration files, dependency management. This category also includes changes related to tokens, keys    
   - **Examples:**  
     - Modifying build configuration files (e.g., `pom.xml`)    
     - Changing or managing environment-specific variables such as tokens, keys, or other credentials used in the build process.    
      
  **Example Commit Message:**  
  `build(HCD-3456): Update java.version from 7 to 11 in pom.xml`    
  `build(HCD-3456): Update serenity.maven.version from 3.8.1 to 6.2.1 in pom.xml`    
  `build(HCD-3456): Update bsl.username and bsl.password in data.properties`    
  `build(HCD-3456): Update bsl.api.basic.token in data.properties`    


### 4. CI (Continuous Integration):
   - These commits are related to Continuous Integration (CI) systems. They typically involve modifying CI/CD configurations or improving the integration pipeline.     
   - **Examples:**    
     - Adding or modifying CI/CD configuration files (yaml for Azure).    
      
   **Example Commit Message:**  
   `ci(HCD-4567): Change time for running pipeline c1-RegressionSmokeTest.yml and c1-RegressionProduct.yml`    
   `ci(HCD-4467): Change flag on Zephyr of C1 Sprint 195`


### 5. Chore:
   - This type covers commits related to maintenance tasks, refactoring, or any minor improvements that are not directly related to functionality, configuration, or the build process. These tasks generally don't affect the behavior of the application but are important for code cleanliness, readability, or minor adjustments.
   - **Examples:**
      - Code cleanup (removing dead code or unused imports).    
      - Fixing typos in code or documentation.    
      - Adding or updating comments.    
      - Refactoring method or variable names for readability.    
      - Minor styling or formatting changes to match the style guide.    

   **Example Commit Messages:**  
   `chore(): Fix typo in CHANGELOG.md`    
   `chore(): Refactor method names for readability`    
   `chore(): Update comments in user service`    
   `chore(): Reformat code`    
   `chore(): Reformat cucumber table`    
   `chore(): Remove personal pipeline tag`    
   `chore(): Remove unused variables in class`    
   `chore(HCD-2345): Refactor BslPage.java with SonarLint`    

**Notes:**  
- Pull Request should not be identical to commit message

---

---
## Sprint 194: 1/11/2026 to 1/25/2026
### Version: 5.1.9-4
**New Features:**
- Merged PR 1: feat: add playwright fixtures for logged-in state by **pkduong**

**Maintain:**
- N/A

**Build:**
- N/A

**CI:**
- N/A

**Chore:**
- N/A
