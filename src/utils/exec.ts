import { spawn } from "node:child_process";
import path from "node:path";

function runCommand(cmd: string, args: string[], cwd: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, {
            cwd,
            stdio: "inherit",   // ALWAYS show output
        });

        child.once("exit", (code) => resolve({ success: code === 0 }));
        child.once("error", () => resolve({ success: false }));
    });
}

export async function installBootstrap(projectRoot: string): Promise<{ bootstrapInstalled: boolean }> {
    const { success } = await runCommand("npm", ["install", "bootstrap"], projectRoot);
    return { bootstrapInstalled: success };
}

export async function runCreateNextApp(parentDir: string, projName: string): Promise<{ createNextAppSuccess: boolean }> {
    const { success } = await runCommand(
        "npx",
        [
            "--yes",
            "create-next-app@latest",
            projName,
            "--ts",
            "--app",
            "--eslint",
            "--no-tailwind",
            "--no-experimental-react",
            "--yes",
        ],
        parentDir
    );

    if(!success) {
        return { createNextAppSuccess: false };
    }

    const projectRoot = path.join(parentDir, projName);
    await installBootstrap(projectRoot);

    return { createNextAppSuccess: success };
}