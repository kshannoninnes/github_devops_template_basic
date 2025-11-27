import type { HistoryStep } from "./model";

// These imports are treated as raw text by the bundler
// This is made possible with the --loader flag in the build command
// the template-modules.d.ts file in /src, and giving the files a
// .template file format
import appPage from "@/template_app_files/app/page.tsx.template";
import blogList from "@/template_app_files/app/Components/BlogList.tsx.template";
import navbar from "@/template_app_files/app/Components/Navbar.tsx.template";
import navbarCss from "@/template_app_files/app/Components/Navbar.module.css.ts.template";
import createBlogPage from "@/template_app_files/app/Createblog/page.tsx.template";
import blogIdPage from "@/template_app_files/app/blog/[id]/page.tsx.template";

export const mainHistory: HistoryStep[] = [
    {
        kind: "branch",
        debugId: "create-dev-branch",
        name: "dev",
        from: "main",
    },
    {
        kind: "branch",
        debugId: "create-testing-branch",
        name: "testing",
        from: "dev",
    },
    {
        kind: "branch",
        debugId: "create-rc-branch",
        name: "rc",
        from: "testing",
    },
    {
        kind: "branch",
        debugId: "create-feature-bootstrap-app",
        name: "feature/bootstrap-app",
        from: "dev",
    },

    {
        kind: "commit",
        debugId: "bootstrap-navbar-and-list",
        branch: "feature/bootstrap-app",
        message: "feat: add navbar and blog list",
        authorName: "Bianca Lee",
        authorEmail: "bianca.lee@example.com",
        changes: [
            {
                path: "app/page.tsx",
                action: "overwrite",
                content: appPage,
            },
            {
                path: "app/Components/BlogList.tsx",
                action: "create",
                content: blogList,
            },
            {
                path: "app/Components/Navbar.tsx",
                action: "create",
                content: navbar,
            },
            {
                path: "app/Components/Navbar.module.css",
                action: "create",
                content: navbarCss,
            },
        ],
    },

    {
        kind: "commit",
        debugId: "add-createblog-and-blog-details",
        branch: "feature/bootstrap-app",
        message: "feat: add create blog and blog details pages",
        authorName: "Carlos Mendoza",
        authorEmail: "carlos.mendoza@example.com",
        changes: [
            {
                path: "app/Createblog/page.tsx",
                action: "create",
                content: createBlogPage,
            },
            {
                path: "app/blog/[id]/page.tsx",
                action: "create",
                content: blogIdPage,
            },
        ],
    },

    {
        kind: "commit",
        debugId: "add-sample-blog-data",
        branch: "feature/bootstrap-app",
        message: "chore: add sample blog seed data",
        authorName: "Alex Johnson",
        authorEmail: "alex.johnson@example.com",
        changes: [
            {
                path: "data/sample-blogs.json",
                action: "create",
                content: JSON.stringify(
                    [
                        {
                            id: 1,
                            author: "Alice Example",
                            title: "Welcome to the course blog",
                            description: "First sample post to verify the list layout.",
                            imageUrl: "https://placehold.co/600x400",
                            createdAt: "2025-11-24",
                        },
                        {
                            id: 2,
                            author: "Bob Student",
                            title: "DevOps pipelines 101",
                            description: "A quick intro post to test navigation to detail pages.",
                            imageUrl: "https://placehold.co/600x400",
                            createdAt: "2025-11-25",
                        },
                    ],
                    null,
                    2
                ) + "\n",
            },
        ],
    },


    {
        kind: "merge",
        debugId: "merge-feature-bootstrap-into-dev",
        from: "feature/bootstrap-app",
        into: "dev",
        message: "Merge branch 'feature/bootstrap-app' into dev",
    },

    {
        kind: "commit",
        debugId: "add-branching-docs",
        branch: "dev",
        message: "docs: add branching workflow overview",
        authorName: "Alex Johnson",
        authorEmail: "alex.johnson@example.com",
        changes: [
            {
                path: "docs/branching-strategy.md",
                action: "create",
                content:
                    "# Branching Strategy\n\n" +
                    "- `dev`: integration branch for new features\n" +
                    "- `testing`: used for manual / automated QA\n" +
                    "- `rc`: release candidate branch\n" +
                    "- `main`: production history (rebased from `rc`)\n\n" +
                    "Feature branches are merged into `dev`, which is then merged into `testing` and `rc`.\n",
            },
        ],
    },

    {
        kind: "commit",
        debugId: "add-dev-setup-docs",
        branch: "dev",
        message: "docs: add local setup instructions",
        authorName: "Bianca Lee",
        authorEmail: "bianca.lee@example.com",
        changes: [
            {
                path: "README.md",
                action: "append",
                content:
                    "\n\n## Local development\n\n" +
                    "1. Run `npm install`.\n" +
                    "2. Run `npm run dev`.\n" +
                    "3. Open `http://localhost:3000`.\n" +
                    "4. Create a test blog and verify it appears on the home page.\n",
            },
        ],
    },

    {
        kind: "merge",
        debugId: "merge-dev-into-testing",
        from: "dev",
        into: "testing",
        message: "Merge branch 'dev' into testing",
    },

    {
        kind: "commit",
        debugId: "add-testing-notes",
        branch: "testing",
        message: "chore: add basic testing instructions",
        authorName: "Bianca Lee",
        authorEmail: "bianca.lee@example.com",
        changes: [
            {
                path: "docs/testing-notes.md",
                action: "create",
                content:
                    "# Testing Notes\n\n" +
                    "1. Run `npm test`.\n" +
                    "2. Verify the home page lists sample blogs.\n" +
                    "3. Verify a new blog can be created from `/Createblog`.\n" +
                    "4. Verify blog detail pages under `/blog/:id` render correctly.\n",
            },
        ],
    },

    {
        kind: "merge",
        debugId: "merge-testing-into-rc",
        from: "testing",
        into: "rc",
        message: "Merge branch 'testing' into rc",
    },

    {
        kind: "commit",
        debugId: "add-rc-release-notes",
        branch: "rc",
        message: "chore: prepare first release candidate notes",
        authorName: "Carlos Mendoza",
        authorEmail: "carlos.mendoza@example.com",
        changes: [
            {
                path: "RELEASE_NOTES.md",
                action: "create",
                content:
                    "# Release Candidate 1\n\n" +
                    "- Initial blog layout with navbar and list.\n" +
                    "- Create blog page and blog detail view.\n" +
                    "- Documented branching strategy and testing steps.\n",
            },
        ],
    },

    {
        kind: "rebase",
        debugId: "rebase-main-onto-rc",
        branch: "main",
        onto: "rc",
    },

];
