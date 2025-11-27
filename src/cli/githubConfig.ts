import { askVisible, askHidden } from "./prompts";

export interface GithubConfig {
    url: string;
    token: string;
}

export async function promptGithubConfig(): Promise<GithubConfig> {
    const url = await askVisible("Enter git repo URL: ");
    const token = await askHidden("Enter git token: ");

    return { url, token };
}
