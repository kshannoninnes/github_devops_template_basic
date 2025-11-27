export function makeAuthUrl(
    repoUrl: string,
    token: string
): { repoUrlValid: boolean; authUrl: string } {
    try {
        const u = new URL(repoUrl);

        // GitHub ignores the username when using tokens.
        u.username = "git";

        // Ensure token is safe in a URL.
        u.password = encodeURIComponent(token);

        if (!u.pathname.endsWith(".git")) {
            u.pathname += ".git";
        }

        return { repoUrlValid: true, authUrl: u.toString() };
    }
    catch (_err) {
        return { repoUrlValid: false, authUrl: "" };
    }
}
