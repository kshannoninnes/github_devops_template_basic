import * as readline from "node:readline";

/**
 * Asks a normal visible question (user input is shown).
 */
export function askVisible(query: string): Promise<string> {
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
export function askHidden(query: string): Promise<string> {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdout.write(query);

        let input = "";

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const onData = (chunk: string) => {
            // ENTER
            if (chunk === "\n" || chunk === "\r") {
                stdin.setRawMode(false);
                stdin.pause();
                stdout.write("\n");
                stdin.removeListener("data", onData);
                resolve(input.trim());
                return;
            }

            // Ctrl+C
            if (chunk === "\u0003") {
                stdin.setRawMode(false);
                stdin.pause();
                stdout.write("\n");
                process.exit(1);
            }

            input += chunk;
            stdout.write("*".repeat(chunk.length));
        };

        stdin.on("data", onData);
    });
}
