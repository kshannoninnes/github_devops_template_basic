import fs from "node:fs";
import path from "node:path";
import type { FileChange } from "../history/model";

async function applyFileChange(change: FileChange): Promise<void> {
    const fullPath = path.resolve(change.path);

    switch (change.action) {
        case "create":
        case "overwrite":
            await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.promises.writeFile(fullPath, change.content ?? "", "utf8");
            break;

        case "append":
            await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.promises.appendFile(fullPath, change.content ?? "", "utf8");
            break;

        case "delete":
            try {
                await fs.promises.unlink(fullPath);
            } catch (err: any) {
                if (err?.code !== "ENOENT") {
                    throw err;
                }
            }
            break;
    }
}

export async function applyFileChanges(changes: FileChange[]): Promise<void> {
    for (const change of changes) {
        await applyFileChange(change);
    }
}
