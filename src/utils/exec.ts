import { spawn } from "node:child_process";
import path from "node:path";

function runCommand(cmd: string, args: string[], cwd: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
        // Only use shell: true if we're running on windows (errors without)
        const useShell = process.platform === "win32";

        // Windows complains if you use shell: true (required)
        // and pass args to spawn as an array, so we instead use
        // a single string to run the command instead.
        const cmdString = cmd + ' ' + args.join(' ');

        const child = spawn(cmdString, {
            cwd,
            stdio: "inherit",   // ALWAYS show output
            shell: useShell
        });

        child.once("exit", (code) => resolve({ success: code === 0 }));
        child.once("error", (err) => {
            console.error(`spawn error for command "${cmdString}":`, err);
            resolve({success: false});
        })
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
            "--no-git",
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