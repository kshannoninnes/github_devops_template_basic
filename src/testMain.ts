import { createDummyRepoWithHistory } from "./git/repoSetup";
import type {HistoryStep} from "./history/model";

const TEST_DIR = "test-project";

const testHistory: HistoryStep[] = [
    {
        kind: "commit",
        debugId: "init-project",
        branch: "main",
        message: "chore: initialise project structure",
        changes: [
            {
                path: "package.json",
                action: "create",
                content: JSON.stringify(
                    {
                        name: "demo-app",
                        version: "0.1.0",
                        scripts: {
                            start: "node src/index.js"
                        }
                    },
                    null,
                    2
                ),
            },
            {
                path: "src/index.ts",
                action: "create",
                content:
                    `console.log("Demo app starting...");\n`,
            },
            {
                path: "README.md",
                action: "create",
                content:
                    "# Demo App\n\nA small demo project used for teaching Git history.\n",
            },
        ],
    },

    {
        kind: "commit",
        debugId: "add-logger",
        branch: "main",
        message: "feat: add basic logger helper",
        changes: [
            {
                path: "src/logger.ts",
                action: "create",
                content:
                    `export function log(message: string): void {\n` +
                    `  console.log("[LOG]", message);\n` +
                    `}\n`,
            },
            {
                path: "src/index.ts",
                action: "overwrite",
                content:
                    `import { log } from "./logger";\n\n` +
                    `log("Demo app starting...");\n`,
            },
        ],
    },

    {
        debugId: "create-feature/auth-from-main",
        kind: "branch",
        name: "feature/auth",
        from: "main",
    },

    {
        kind: "commit",
        debugId: "add-auth-module",
        branch: "feature/auth",
        message: "feat: add basic auth module",
        changes: [
            {
                path: "src/auth.ts",
                action: "create",
                content:
                    `export function login(username: string, password: string): boolean {\n` +
                    `  // Extremely fake auth\n` +
                    `  return username === "demo" && password === "password";\n` +
                    `}\n`,
            },
            {
                path: "src/index.ts",
                action: "overwrite",
                content:
                    `import { log } from "./logger";\n` +
                    `import { login } from "./auth";\n\n` +
                    `log("Demo app starting...");\n` +
                    `log("Login success? " + login("demo", "password"));\n`,
            },
        ],
    },

    {
        kind: "merge",
        debugId: "merge-auth-into-main",
        from: "feature/auth",
        into: "main",
        message: "Merge branch 'feature/auth' into main",
    },
];

async function main() {
    console.log(`Creating test repo in ./${TEST_DIR} ...`);

    const { historySuccess } = await createDummyRepoWithHistory(TEST_DIR, testHistory);

    if (!historySuccess) {
        console.error("Failed to generate test project.");
        return;
    }

    console.log("Test project created successfully!");
    console.log("");
    console.log("Now run:");
    console.log(`  cd ${TEST_DIR}`);
    console.log("  git log --graph --oneline --all");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
