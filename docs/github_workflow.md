# Team GitHub Workflow (Frontend + Backend)

To ensure smooth collaboration and prevent merge conflicts, both the frontend and backend developers must follow this Git workflow.

## 🌿 1. Branching Strategy
Never commit directly to the `main` branch. 
Both developers should create "feature branches" off of `main` for their respective tasks.

*   **Frontend Branches**: Prefix with `feat/ui-` or `fix/ui-` (e.g., `feat/ui-login-screen`, `feat/ui-lobby`)
*   **Backend Branches**: Prefix with `feat/api-` or `fix/api-` (e.g., `feat/api-supabase-hooks`, `fix/api-turn-logic`)

## 🛠️ 2. The Daily Workflow

Before starting new work, **always** ensure you have the latest code from `main`:
```bash
git checkout main
git pull origin main
```

Then create and switch to your feature branch:
```bash
git checkout -b feat/ui-lobby-screen
```

## 💾 3. Committing Changes
Make your changes, save, and commit frequently. Use descriptive commit messages.
```bash
git add .
git commit -m "feat: added lobby screen UI mapping to players list hook"
```

## 🚀 4. Pushing and Merging (Pull Requests)
Once your feature is complete:
1.  **Push your branch to GitHub**:
    ```bash
    git push origin your-branch-name
    ```
2.  **Open a Pull Request (PR)**: Go to GitHub and open a PR from your branch into `main`.
3.  **Request Review**: Assign your coworker as a reviewer. They should briefly look over the code to make sure it doesn't break their parts.
4.  **Merge**: Once approved, click "Squash and Merge" on GitHub.
5.  **Clean up**: Delete the branch on GitHub, then pull the newly updated `main` to your local machine:
    ```bash
    git checkout main
    git pull origin main
    git branch -d your-branch-name
    ```

## 🛡️ 5. Avoiding Merge Conflicts
Conflicts happen when both of you edit the *exact same file on the exact same line*. To avoid this:

*   **Separate Files**: The frontend dev should focus entirely on files inside `/screens` and `/components`. The backend dev should focus entirely on `/services` and `/config`.
*   **App.js / Entry Point Rules**: If someone needs to edit the main navigation or `App.js`, announce it to the other person first (e.g., "Hey, I'm checking out App.js to add the new screen route").
*   **Communicate**: If you change a prop name or a variable that the other person relies on, tell them immediately!

## 🚑 6. What to do if you hit a Merge Conflict?
If GitHub says "This branch has conflicts that must be resolved":
1.  On your local machine, checkout your feature branch.
2.  Run `git pull origin main` (This will pull the latest main changes into your branch).
3.  Git will yell at you about conflicts. Open the conflicting file in your code editor (like VS Code).
4.  Look for the `<<<<<<< HEAD` blocks. Compare your code with your coworker's code, decide which to keep (or combine them), save the file.
5.  Run:
    ```bash
    git add .
    git commit -m "fix: resolved merge conflicts"
    git push origin your-branch-name
    ```
6.  The PR is now ready to merge!

## 🧾 7. File Responsibility Signature (Required)
To keep the codebase structured and accountable, every file that is created or heavily modified in a feature branch must have a clear owner and scope.

Add this short header at the top of the file:

```ts
/**
 * File Responsibility
 * Owner: Frontend | Backend
 * Scope: short sentence describing what this file owns
 */
```

Rules:

*   One clear owner per file during a feature cycle.
*   If ownership changes, update the header in the same PR.
*   Keep scope specific (UI only, data access only, realtime only, etc.).
*   During code review, reviewer must check that the header is present and matches the file content.
