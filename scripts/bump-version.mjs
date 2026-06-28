/**
 * Bump game release version across repo sources of truth.
 *
 * Source of truth: VERSION (imported by GameApp via ?raw).
 * Also updates package.json and package-lock.json root version fields,
 * then commits and creates an annotated git tag (vX.Y.Z).
 *
 * Usage:
 *   node scripts/bump-version.mjs patch
 *   node scripts/bump-version.mjs minor
 *   node scripts/bump-version.mjs major
 *   node scripts/bump-version.mjs 1.2.3
 *   node scripts/bump-version.mjs --no-git patch
 */
import { execFileSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const VERSION_FILE = path.join(repoRoot, 'VERSION');
const PACKAGE_JSON = path.join(repoRoot, 'package.json');
const PACKAGE_LOCK = path.join(repoRoot, 'package-lock.json');
const VERSION_PATHS = ['VERSION', 'package.json', 'package-lock.json'];

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;
const EXPLICIT_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;

function usage() {
  console.error('Usage: node scripts/bump-version.mjs [--no-git] <patch|minor|major|x.y.z>');
  process.exit(1);
}

function runGit(args) {
  execFileSync('git', args, { cwd: repoRoot, stdio: 'inherit' });
}

function tagExists(tag) {
  try {
    execSync(`git rev-parse -q --verify refs/tags/${tag}`, { cwd: repoRoot, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function hasStagedChanges() {
  try {
    execSync('git diff --cached --quiet', { cwd: repoRoot, stdio: 'pipe' });
    return false;
  } catch {
    return true;
  }
}

function commitAndTag(next, noGit) {
  if (noGit) {
    console.log('Skipping git commit and tag (--no-git)');
    return;
  }

  const tag = `v${next}`;
  const commitMsg = `chore: release ${tag}`;

  if (tagExists(tag)) {
    throw new Error(`Tag ${tag} already exists`);
  }

  runGit(['add', ...VERSION_PATHS]);

  if (!hasStagedChanges()) {
    console.log('No staged changes; skipping commit and tag');
    return;
  }

  runGit(['commit', '-m', commitMsg]);
  runGit(['tag', '-a', tag, '-m', `Release ${tag}`]);
  console.log(`Created commit and annotated tag ${tag}`);
  console.log(`Push with: git push && git push origin ${tag}`);
}

function parseVersion(raw) {
  const m = raw.trim().match(SEMVER_RE);
  if (!m) throw new Error(`Invalid semver: ${raw}`);
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4],
    build: m[5],
  };
}

function formatVersion({ major, minor, patch, prerelease, build }) {
  let version = `${major}.${minor}.${patch}`;
  if (prerelease) version += `-${prerelease}`;
  if (build) version += `+${build}`;
  return version;
}

function bumpVersion(current, kind) {
  if (EXPLICIT_SEMVER_RE.test(kind)) {
    parseVersion(kind);
    return kind.trim();
  }

  const parsed = parseVersion(current);
  switch (kind) {
    case 'major':
      return formatVersion({
        major: parsed.major + 1,
        minor: 0,
        patch: 0,
      });
    case 'minor':
      return formatVersion({
        major: parsed.major,
        minor: parsed.minor + 1,
        patch: 0,
      });
    case 'patch':
      return formatVersion({
        major: parsed.major,
        minor: parsed.minor,
        patch: parsed.patch + 1,
      });
    default:
      throw new Error(`Unknown bump kind: ${kind}`);
  }
}

function readCurrentVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    throw new Error(`Missing ${path.relative(repoRoot, VERSION_FILE)}`);
  }
  return fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

function writeVersionFile(next) {
  fs.writeFileSync(VERSION_FILE, `${next}\n`, 'utf8');
}

function writePackageJson(next) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.version = next;
  fs.writeFileSync(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

function writePackageLock(next) {
  const lock = JSON.parse(fs.readFileSync(PACKAGE_LOCK, 'utf8'));
  lock.version = next;
  if (lock.packages?.['']) {
    lock.packages[''].version = next;
  }
  fs.writeFileSync(PACKAGE_LOCK, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
}

const args = process.argv.slice(2);
const noGit = args.includes('--no-git');
const kind = args.find((arg) => arg !== '--no-git');
if (!kind) usage();

try {
  const current = readCurrentVersion();
  const next = bumpVersion(current, kind);

  writeVersionFile(next);
  writePackageJson(next);
  writePackageLock(next);

  console.log(`Version bumped: ${current} → ${next}`);
  console.log('Updated: VERSION, package.json, package-lock.json');

  commitAndTag(next, noGit);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
