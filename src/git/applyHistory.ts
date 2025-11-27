import simpleGit from "simple-git";

import { applyFileChanges } from "./fileChanges";
import type { HistoryStep, Commit, CreateBranch, MergeBranch, RebaseBranch } from "../history/model";

export async function applyHistory(history: HistoryStep[]): Promise<void> {
    for (const step of history) {
        console.log(`Applying step: ${step.debugId} (${step.kind})`);

        switch (step.kind) {
            case "commit":
                await applyCommit(step);
                break;
            case "branch":
                await applyBranch(step);
                break;
            case "merge":
                await applyMerge(step);
                break;
            case "rebase":
                await applyRebase(step);
                break;
        }
    }
}

/**
 * Apply a commit:
 *  - checkout/create branch
 *  - apply file changes
 *  - stage
 *  - commit
 */
async function applyCommit(step: Commit): Promise<void> {
    const git = simpleGit();
    const locals = await git.branchLocal();

    if (locals.all.includes(step.branch)) {
        await git.checkout(step.branch);
    } else {
        await git.checkoutLocalBranch(step.branch);
    }

    await applyFileChanges(step.changes);
    await git.add(".");

    const options: Record<string, string> = {};
    if (step.authorName && step.authorEmail) {
        options["--author"] = `${step.authorName} <${step.authorEmail}>`;
    }

    await git.commit(step.message, undefined, options);
}

async function applyBranch(step: CreateBranch): Promise<void> {
    const git = simpleGit();
    const locals = await git.branchLocal();

    if (!locals.all.includes(step.from)) {
        throw new Error(
            `Cannot create branch "${step.name}" from non-existent base "${step.from}".`
        );
    }

    await git.checkout(step.from);

    if (locals.all.includes(step.name)) {
        await git.checkout(step.name);
    } else {
        await git.checkoutLocalBranch(step.name);
    }
}

async function applyMerge(step: MergeBranch): Promise<void> {
    const git = simpleGit();
    await git.checkout(step.into);
    await git.merge([step.from, "-m", step.message]);
}

async function applyRebase(step: RebaseBranch): Promise<void> {
    const git = simpleGit();
    const locals = await git.branchLocal();

    if (!locals.all.includes(step.branch)) {
        throw new Error(`Cannot rebase non-existent branch "${step.branch}".`);
    }
    if (!locals.all.includes(step.onto)) {
        throw new Error(`Cannot rebase onto non-existent branch "${step.onto}".`);
    }

    // git checkout <branch>
    await git.checkout(step.branch);

    // git rebase <onto>
    await git.rebase([step.onto]);
}

