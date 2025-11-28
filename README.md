# DevOps Git History Generator

A CLI tool that scaffolds a Next.js application and programmatically generates a realistic git history with branches, merges, and simulated commits for DevOps training scenarios.

## How It Works

This project uses `simple-git` to simulate developer activity on a fresh repository. When executed, the script asks for GitHub credentials and a target repository URL. It then scaffolds a base Next.js application and iterates through a predefined list of "history steps" (commits, branch creations, merges, and file modifications). Once the simulated history is fully applied locally, the tool pushes all branches and tags to the specified remote repository, effectively "hydrating" a blank repo with a complex project history.

## Prerequisites

- Node.js (v20 or later recommended)
- Git installed, with global user.name and user.email configured

## Installation & Building

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Build the Script**

    The project uses `esbuild` to bundle the TypeScript source and templates into a single executable file.
    ```bash
    npm run build
    ```

3.  **Where to find the final standalone script**
    ```bash
    dist/devops-git-setup.cjs
    ```
    This standalone script can be given to anyone to run without any other project files, as long as they have the prerequisites from above installed and configured.

## Running the Application

To run the build script, copy the final standalone `devops-git-setup.cjs` file wherever you like.

**On Linux (tested on Ubuntu LTS 24.04):**

1.  Make the script executable:
    ```bash
    chmod +x devops-git-setup.cjs
    ```

2.  Run the script:
    ```bash
    ./devops-git-setup.cjs
    ```

**On Windows:**

1.  Open a PowerShell terminal.
2.  Run the script using Node:
    ```bash
    node devops-git-setup.cjs
    ```
    
**macOS: Untested**

## Customizing the Git History

The specific sequence of git operations (branches, commits, merges) are not hardcoded in the logic but defined as data. To change the history that gets generated:

1.  Open **`src/history/sequence.ts`**.
2.  Locate the `mainHistory` array.
3.  You can modify existing steps here, or add new ones using the types defined in `model.ts`:
    *   `kind: "commit"`: Adds changes to files.
    *   `kind: "branch"`: Creates a new branch from a parent.
    *   `kind: "merge"`: Merges two branches.
    *   `kind: "rebase"`: Rebases a branch onto another.

**Example of adding a commit:**
```typescript
{
    kind: "commit",
    debugId: "add-readme",
    branch: "main",
    message: "docs: update readme",
    changes: [
        {
            path: "README.md",
            action: "append",
            content: "\nNew content here."
        }
    ]
},
```

After making changes, run `npm run build` again to update the output script.