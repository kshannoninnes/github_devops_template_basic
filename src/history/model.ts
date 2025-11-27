export type FileChangeType = "create" | "append" | "overwrite" | "delete";

// Describes a single change to a file within the repository.
export interface FileChange {
    path: string; // File path relative to the repo root (e.g. "src/index.ts")
    action: FileChangeType;
    content?: string; // Optional content for actions that write to the file
}

export interface Commit {
    kind: "commit";
    debugId: string;

    branch: string;
    message: string;
    changes: FileChange[];

    // Optional because if not supplied will use default git config
    authorName?: string;
    authorEmail?: string;
}

export interface CreateBranch {
    kind: "branch";
    debugId: string;

    name: string;
    from: string;
}

export interface MergeBranch {
    kind: "merge";
    debugId: string;

    from: string;
    into: string;
    message: string;
}

export interface RebaseBranch {
    kind: "rebase";
    debugId: string;
    branch: string;
    onto: string;
}


/**
 * A single step in the repository’s history sequence:
 * either a commit, branch creation, or branch merge.
 */
export type HistoryStep = Commit | CreateBranch | MergeBranch | RebaseBranch;
