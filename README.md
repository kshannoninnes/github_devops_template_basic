## Github Template Setup for DevOps

This script is designed to support students learning DevOps by automating the setup of a prepared template project. It handles cloning the template repository, installing its dependencies, and pushing the project into a target GitHub repository so it is ready for use in a DevOps environment.

---

### What the Script Does

1. Prompts for:
    - A destination GitHub repository URL
    - A GitHub Access Token

2. Validates:
    - URL formatting
    - Access permissions to the target repository

3. Clones the defined template project into a new local directory.

4. Installs all project dependencies.

5. Pushes all branches from the template repository to the specified destination repository.

---

### Requirements

- Node.js v20+
- Git
- A GitHub Access Token

---

### Usage

#### Build
Run the following command from the root project directory
```bash
npm run build
```

The script will be located in the dist folder. This .mjs script file can be shared and run without any other dependencies.

#### Run
```bash
node devops-git-setup.mjs
```