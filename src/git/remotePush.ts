import simpleGit from "simple-git";

export async function pushToUserRepo(localDir: string, authUrl: string): Promise<{ pushSuccess: boolean }> {
    try {
        const git = simpleGit({ baseDir: localDir });

        await git.cwd(localDir);

        // Ensure remote origin points to user's repo
        const remotes = await git.getRemotes(true);
        if (remotes.find((r) => r.name === "origin")) {
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
    } catch (err: any) {
        const msg =
            err?.message ??
            err?.stderr ??
            err?.stdout ??
            String(err);

        console.log(`Error: ${msg}`);
        return { pushSuccess: false };
    }
}
