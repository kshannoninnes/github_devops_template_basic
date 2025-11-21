import * as readline from "node:readline";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import simpleGit, { SimpleGit } from "simple-git";

async function main() {
    // Step 1: Define constants (eg. template repo URL)
    const TEMPLATE_REPO_NAME = `TemplateBlogApp`;
    const TEMPLATE_REPO_URL = `https://github.com/kshannoninnes/${TEMPLATE_REPO_NAME}`;

    // Step 1.5: Setup any configuration
    const git = simpleGit();

    // Step 2: Prompt user for git url, git username, and git token
    const { url, token } = await promptGithubConfig();
    console.log(""); // New line for formatting

    process.stdout.write(`Validating URL... `);
    const { repoUrlValid, authUrl } = makeAuthUrl(url, token);
    if(!repoUrlValid)
    {
        console.log("Error creating authentication URL. Is the repo URL valid?");
        return;
    }
    console.log(`Complete.`)

    // Step 3: Verify git repo exists
    process.stdout.write(`Validating access to git repository... `);
    const { testRepoPassed } = await testRepoAccess(git, authUrl);
    if(!testRepoPassed) {
        console.log(`Error validating access. Check the username, token, and url are all correct.`);
        return;
    }
    console.log(`Complete.`)

    // Step 4: Clone template repo into sub-dir in same dir as script
    process.stdout.write(`Cloning into ${TEMPLATE_REPO_NAME}... `);
    const { cloneSuccess } = await cloneTemplateRepo(TEMPLATE_REPO_URL, TEMPLATE_REPO_NAME);
    if (!cloneSuccess)
    {
        console.log("Error cloning into directory. Does it already exist?");
        return;
    }
    console.log(`Complete.`);

    // Step 5: cd into dir, run npm install
    process.stdout.write('Installing dependencies... ');
    const { npmInstallSuccess } = await runNpmInstall(TEMPLATE_REPO_NAME);
    if (!npmInstallSuccess) {
        console.log("Unknown error installing dependencies.");
        return;
    }
    console.log(`Complete.`);

    // Step 6: Push cloned project to the user's repository using their token and url
    process.stdout.write(`Updating user's repo with template project... `);
    const { pushSuccess } = await pushTemplateToUserRepo(TEMPLATE_REPO_NAME, authUrl);
    if(!pushSuccess){
        return;
    }
    console.log(`Complete.`);

    console.log("\nFinished, good luck!");
}

async function promptGithubConfig() {
    const url = await askVisible("Enter git repo URL: ");
    const token = await askHidden("Enter git token: ");

    return { url, token };
}

function makeAuthUrl(repoUrl: string, token: string): { repoUrlValid: boolean; authUrl: string } {
    try {
        const u = new URL(repoUrl);

        u.username = "git";
        u.password = encodeURIComponent(token);

        if (!u.pathname.endsWith(".git")) {
            u.pathname += ".git";
        }

        return { repoUrlValid: true, authUrl: u.toString() };
    }
    catch (err: any) {
        return { repoUrlValid: false, authUrl: "" };
    }
}

async function testRepoAccess(git: SimpleGit, repoUrl: string): Promise<{ testRepoPassed: boolean }> {
    try {
        await git.listRemote([repoUrl]);

        return { testRepoPassed: true };
    } catch (err: any) {
        return { testRepoPassed: false };
    }
}

export async function cloneTemplateRepo(authUrl: string, targetDir: string): Promise<{ cloneSuccess: boolean }> {
    try {
        const fullPath = path.resolve(targetDir);

        if (fs.existsSync(fullPath)) {
            throw new Error(
                `Cannot clone: Directory "${targetDir}" already exists at ${fullPath}`
            );
        }

        const git = simpleGit();
        await git.clone(authUrl, targetDir);

        return { cloneSuccess: true };
    } catch (err: any) {
        return { cloneSuccess: false };
    }
}

async function runNpmInstall(dir: string): Promise<{ npmInstallSuccess: boolean }> {
    return new Promise((resolve) => {
        const child = spawn("npm", ["install"], {
            cwd: dir,
            stdio: ["ignore", "ignore", "ignore"] // Silence the usual `npm install` output
        });

        child.once("exit", (code) => {
            resolve({ npmInstallSuccess: code === 0 });
        });

        child.once("error", () => {
            resolve({ npmInstallSuccess: false });
        });
    });
}

async function pushTemplateToUserRepo(localDir: string, authUrl: string): Promise<{ pushSuccess: boolean }> {
    try {
        const git = simpleGit({ baseDir: localDir });

        await git.cwd(localDir);

        // Ensure remote origin points to user's repo
        const remotes = await git.getRemotes(true);
        if (remotes.find(r => r.name === "origin")) {
            await git.remote(["set-url", "origin", authUrl]);
        } else {
            await git.addRemote("origin", authUrl);
        }

        // Fetch remote branches from the template repo
        await git.fetch(["--all"]);

        // Create local branches for each remote branch
        const remoteBranches = (await git.branch(["-r"])).all;

        for (const remote of remoteBranches) {
            if (!remote.startsWith("origin/")) continue;
            if (remote === "origin/HEAD") continue;

            const branchName = remote.replace("origin/", "");

            const localBranches = (await git.branchLocal()).all;

            if (localBranches.includes(branchName)) {
                await git.checkout(branchName);
            } else {
                await git.checkoutBranch(branchName, remote);
            }
        }

        // Push every branch
        await git.push(["--all", "origin"]);

        return { pushSuccess: true };
    }
    catch (err: any) {
        const msg =
            err?.message ??
            err?.stderr ??
            err?.stdout ??
            String(err);

        console.log(`Error: ${msg}`);
        return { pushSuccess: false };
    }
}

/**
 * Asks a normal visible question (user input is shown).
 */
function askVisible(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Asks a hidden question where typed or pasted characters appear as '*'.
 */
function askHidden(query: string): Promise<string> {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdout.write(query);

        let input = "";

        // Enable raw mode so we get individual keypress events
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const onData = (chunk: string) => {
            // ENTER pressed
            if (chunk === "\n" || chunk === "\r") {
                stdin.setRawMode(false);
                stdin.pause();
                stdout.write("\n");
                stdin.removeListener("data", onData);
                resolve(input.trim());
                return;
            }

            // CTRL+C pressed
            if (chunk === "\u0003") {
                stdin.setRawMode(false);
                stdin.pause();
                process.stdout.write("\n");
                process.exit(1);
            }

            // Normal input or paste
            input += chunk;
            stdout.write("*".repeat(chunk.length)); // mask each char, including paste
        };

        stdin.on("data", onData);
    });
}

await main();