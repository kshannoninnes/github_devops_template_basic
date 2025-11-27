import simpleGit from "simple-git";

export async function pushToUserRepo(authUrl: string): Promise<{ pushSuccess: boolean }> {
    try {
        const git = simpleGit();

        const remotes = await git.getRemotes(true);
        if (remotes.find((r) => r.name === "origin")) {
            await git.remote(["set-url", "origin", authUrl]);
        } else {
            await git.addRemote("origin", authUrl);
        }

        // This tells GitHub to treat `main` as the default branch (uses the first pushed branch)
        await git.checkout("main");
        await git.push(["-u", "origin", "main"]);

        // TODO remove the --force once testing is complete
        await git.push(["--all", "origin", "--force"]);

        return { pushSuccess: true };
    } catch (err: any) {
        const msg =
            err?.message ??
            err?.stderr ??
            err?.stdout ??
            String(err);

        console.log(`Error pushing repo to Github repository: ${msg}`);
        return { pushSuccess: false };
    }
}
