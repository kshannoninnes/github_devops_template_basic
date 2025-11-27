import { promptGithubConfig } from "./cli/githubConfig"
import { TEMPLATE_REPO_NAME, TEMPLATE_REPO_URL } from "./config";
import { pushToUserRepo } from "./git/remotePush";
import { cloneTemplateRepo, runNpmInstall, testRepoAccess } from "./git/repoSetup";
import { makeAuthUrl } from "./utils/github"

async function main() {

    // Step 2: Prompt user for git url, and git token
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
    const { testRepoPassed } = await testRepoAccess(authUrl);
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
    const { pushSuccess } = await pushToUserRepo(TEMPLATE_REPO_NAME, authUrl);
    if(!pushSuccess){
        return;
    }
    console.log(`Complete.`);

    console.log("\nFinished, good luck!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});