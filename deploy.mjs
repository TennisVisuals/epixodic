/**
 * Deploy dist/ to the gh-pages branch.
 *
 * Uses a temporary git worktree so the working tree stays untouched.
 * Run via: pnpm run deploy:pages
 */
import { execSync } from 'child_process';
import { mkdtempSync, cpSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const silent = (cmd) => execSync(cmd, { stdio: 'pipe' }).toString().trim();

// Clean up any stale worktrees from previous interrupted runs
run('git worktree prune');

const tmp = mkdtempSync(join(tmpdir(), 'epixodic-deploy-'));

try {
  // Check if gh-pages branch exists on the remote
  let hasRemoteBranch = false;
  try {
    silent('git ls-remote --exit-code --heads origin gh-pages');
    hasRemoteBranch = true;
  } catch {
    // branch doesn't exist yet
  }

  if (hasRemoteBranch) {
    // Checkout existing gh-pages branch into worktree
    run(`git worktree add "${tmp}" gh-pages`);
    // Remove old files (but keep .git)
    run(`git -C "${tmp}" rm -rf .`);
  } else {
    // First deploy: create orphan branch
    run(`git worktree add --detach "${tmp}"`);
    run(`git -C "${tmp}" checkout --orphan gh-pages`);
    run(`git -C "${tmp}" rm -rf .`);
  }

  // Copy built files into the worktree
  cpSync('dist', tmp, { recursive: true });
  writeFileSync(join(tmp, '.nojekyll'), '');
  writeFileSync(join(tmp, 'CNAME'), 'epixodic.com');

  // Commit and force-push
  run(`git -C "${tmp}" add -A`);
  const status = silent(`git -C "${tmp}" status --porcelain`);
  if (!status) {
    console.log('\nNo changes to deploy.');
    process.exit(0);
  }
  run(`git -C "${tmp}" commit -m "Deploy to GitHub Pages"`);
  run(`git -C "${tmp}" push origin gh-pages --force`);

  console.log('\nDeployed to https://epixodic.com/');
} finally {
  // Clean up worktree
  try {
    run(`git worktree remove "${tmp}" --force`);
  } catch {
    // worktree may already be cleaned up
  }
}
