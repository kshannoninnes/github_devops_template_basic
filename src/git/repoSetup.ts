import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import simpleGit from "simple-git";

export async function cloneTemplateRepo(
    remoteUrl: string,
    targetDir: string
): Promise<{ cloneSuccess: boolean }> {
    try {
        const fullPath = path.resolve(targetDir);

        if (fs.existsSync(fullPath)) {
            throw new Error(
                `Cannot clone: Directory "${targetDir}" already exists at ${fullPath}`
            );
        }

        const git = simpleGit();
        await git.clone(remoteUrl, targetDir);

        return { cloneSuccess: true };
    } catch (_err: any) {
        return { cloneSuccess: false };
    }
}

export async function runNpmInstall(
    dir: string
): Promise<{ npmInstallSuccess: boolean }> {
    return new Promise((resolve) => {
        const child = spawn("npm", ["install"], {
            cwd: dir,
            stdio: ["ignore", "ignore", "ignore"], // Silence the usual `npm install` output
        });

        child.once("exit", (code) => {
            resolve({ npmInstallSuccess: code === 0 });
        });

        child.once("error", () => {
            resolve({ npmInstallSuccess: false });
        });
    });
}

export async function testRepoAccess(repoUrl: string): Promise<{ testRepoPassed: boolean }> {
    try {
        const git = simpleGit();
        await git.listRemote([repoUrl]);
        return { testRepoPassed: true };
    } catch (_err: any) {
        return { testRepoPassed: false };
    }
}

