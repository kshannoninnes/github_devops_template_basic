import { promptGithubConfig } from "./cli/githubConfig";
import { pushToUserRepo } from "./git/remotePush";
import { createDummyRepoWithHistory, testRepoAccess, } from "./git/repoSetup";
import { makeAuthUrl } from "./utils/github";

const TEMPLATE_REPO_NAME = "devops_git_script_app";

async function main() {
    const { url, token } = await promptGithubConfig();
    console.log(""); // New line for formatting

    process.stdout.write(`Validating URL... `);
    const { repoUrlValid, authUrl } = makeAuthUrl(url, token);
    if (!repoUrlValid) {
        console.log(`Error creating authentication URL. Is the repo URL valid?`);
        return;
    }
    console.log(`Complete.`);

    process.stdout.write(`Validating access to git repository... `);
    const { testRepoPassed } = await testRepoAccess(authUrl);
    if (!testRepoPassed) {
        console.log(`Error validating access. Check the username, token, and url are all correct.`);
        return;
    }
    console.log(`Complete.`);

    // Step 4: Create a new local repo using the scripted history
    const { historySuccess } = await createDummyRepoWithHistory(TEMPLATE_REPO_NAME);
    if (!historySuccess) {
        console.log(`Error generating project and history.`);
        return;
    }

    // Step 6: Push generated project (all branches) to the user's repository
    process.stdout.write(`Updating user's repo with generated project... `);
    const { pushSuccess } = await pushToUserRepo(authUrl);
    if (!pushSuccess) {
        console.log(`Error pushing repo to Github repository.`);
        return;
    }
    console.log(`Complete.`);

    console.log(`\nFinished, good luck!`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
