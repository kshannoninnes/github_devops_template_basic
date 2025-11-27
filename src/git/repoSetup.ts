import path from "node:path";
import fs from "node:fs";
import simpleGit from "simple-git";

import { applyHistory } from "./applyHistory";
import { mainHistory } from "../history/sequence";
import type { HistoryStep } from "../history/model"
import { runCreateNextApp } from "../utils/exec";

export async function testRepoAccess(repoUrl: string): Promise<{ testRepoPassed: boolean }> {
    try {
        const git = simpleGit();
        await git.listRemote([repoUrl]);
        return { testRepoPassed: true };
    } catch (_err: any) {
        return { testRepoPassed: false };
    }
}

async function createProject(parentDir: string, targetDir: string): Promise<{ createProjectSuccess: boolean }>
{
    const appRoot = path.resolve(targetDir);

    if (fs.existsSync(appRoot)) {
        console.error(`Directory "${targetDir}" already exists.`);
        return { createProjectSuccess: false };
    }

    const { createNextAppSuccess } = await runCreateNextApp(parentDir, targetDir);

    if (!createNextAppSuccess) {
        console.error("Failed to scaffold Next.js app.");
        return { createProjectSuccess: false };
    }

    return { createProjectSuccess: true };
}

async function applyGitHistory(testHistory?: HistoryStep[]): Promise<{ applyGitHistorySuccess: boolean }>
{
    try {
        if (testHistory === undefined)
        {
            await applyHistory(mainHistory);
        }
        else
        {
            await applyHistory(testHistory);
        }

        return { applyGitHistorySuccess: true };
    }
    catch (err) {
        console.error("Failed to apply project history:", err);
        return { applyGitHistorySuccess: false };
    }
}

export async function createDummyRepoWithHistory(targetDir: string, testHistory?: HistoryStep[]):
    Promise<{ historySuccess: boolean }>
{
    try {
        const parentDir = process.cwd();
        const repoRoot = path.resolve(targetDir);

        const { createProjectSuccess } = await createProject(parentDir, targetDir);
        if (!createProjectSuccess) {
            return { historySuccess: false };
        }

        // const { createGitRepoSuccess } = await createGitRepo(repoRoot);
        // if (!createGitRepoSuccess) {
        //     return { historySuccess: false };
        // }

        process.chdir(repoRoot);

        const { applyGitHistorySuccess } = await applyGitHistory(testHistory);
        if (!applyGitHistorySuccess) {
            return { historySuccess: false };
        }

        return { historySuccess: true };
    }
    catch (err) {
        console.error("Error while generating fake repo:", err);
        return { historySuccess: false };
    }
}