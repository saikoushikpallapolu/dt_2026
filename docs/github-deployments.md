# GitHub deployment tracking

The Render Production Deployment workflow runs on pushes to main and can also be started from GitHub Actions using Run workflow on main. Its Production environment links to https://dt-2026.onrender.com. GitHub creates a deployment record for the environment job and marks it successful only when the job succeeds.

Render remains responsible for deploying the linked main branch automatically. This workflow observes that deployment; it does not trigger another build or require a Render secret. Keep Render auto-deploy set to On Commit. Do not configure Render to wait for this verification job before deploying, because the job itself waits for Render.

The verifier waits up to 20 minutes for Render to serve the workflow's exact full commit SHA. It checks API health, database-backed public faculty reads, the login page, and its JavaScript bundle, then confirms the revision again. Old revisions, failed builds, missing bundles, and timeouts cannot produce a successful result. New pushes cancel older verification runs.

After the first successful run, open the repository's Deployments panel to see Production and its successful status. The deployment count will reflect actual recorded runs. Preview is intentionally absent because there is no separately configured preview service. Add a Preview environment only with a real preview deployment and its own verification.

If no workflow starts, check that GitHub Actions is enabled and the workflow file is on main. If it times out, inspect Render deployment logs and ensure auto-deploy is enabled for the same branch. Existing environment protection rules may require approval before the job starts.

Run the verifier tests locally with `node --test scripts/verify-render-deployment.test.mjs`.
