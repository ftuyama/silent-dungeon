/**
 * Release workflow: pre-flight checks → version bump → optional itch package.
 *
 * Mirrors CI (.github/workflows/test.yml) before bumping VERSION.
 *
 * Usage:
 *   node scripts/release.mjs [patch|minor|major|x.y.z] [options]
 *
 * Options:
 *   --no-bump       Skip version bump (checks only, or checks + itch)
 *   --no-git        Update version files without commit/tag
 *   --skip-checks   Skip validation (not recommended)
 *   --itch          Build and create itch.io ZIP after bump
 *   --dry-run       Print steps without executing
 *   -h, --help      Show help
 *
 * Default bump kind: minor
 */
import { execFileSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const VERSION_FILE = path.join(repoRoot, 'VERSION');
const EXPLICIT_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
const BUMP_KINDS = new Set(['patch', 'minor', 'major']);

const CHECKS = [
  ['validate:scenes', 'node scripts/validate-scenes.mjs'],
  ['validate:unreachable', 'node scripts/find-unreachable-scenes.mjs'],
  ['check:pt-br', 'node scripts/check-pt-br.mjs'],
  ['check:ascii-art', 'node scripts/check-pending-ascii-art.mjs'],
  ['validate:i18n', 'node scripts/i18n/validate-locale-parity.mjs'],
  ['validate:i18n:translations', 'node scripts/i18n/validate-i18n-translations.mjs'],
  ['check:engine-boundaries', 'node scripts/check-engine-boundaries.mjs'],
  ['build', 'npm run build'],
  ['test', 'npm run test'],
];

const useColor =
  !process.env.NO_COLOR &&
  process.env.FORCE_COLOR !== '0' &&
  (process.stdout.isTTY || process.env.FORCE_COLOR);

const c = useColor
  ? {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
    }
  : Object.fromEntries(
      ['reset', 'bold', 'dim', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray'].map(
        (k) => [k, ''],
      ),
    );

function paint(color, text) {
  return `${c[color]}${text}${c.reset}`;
}

function heading(title) {
  const line = '═'.repeat(Math.max(title.length + 4, 40));
  console.log(`\n${paint('cyan', line)}`);
  console.log(paint('bold', `  ${title}`));
  console.log(paint('cyan', line));
}

function badge(text, color) {
  return paint(color, `[${text}]`);
}

function usage() {
  console.log(`Usage: node scripts/release.mjs [patch|minor|major|x.y.z] [options]

Options:
  --no-bump       Skip version bump
  --no-git        Bump files only; no commit/tag
  --skip-checks   Skip validation (not recommended)
  --itch          Build and create itch.io ZIP after bump
  --dry-run       Print steps without executing
  -h, --help      Show help

Default bump kind: minor`);
}

function parseArgs(argv) {
  const flags = {
    noBump: false,
    noGit: false,
    skipChecks: false,
    itch: false,
    dryRun: false,
    help: false,
  };
  let bumpKind = 'minor';

  for (const arg of argv) {
    switch (arg) {
      case '--no-bump':
        flags.noBump = true;
        break;
      case '--no-git':
        flags.noGit = true;
        break;
      case '--skip-checks':
        flags.skipChecks = true;
        break;
      case '--itch':
        flags.itch = true;
        break;
      case '--dry-run':
        flags.dryRun = true;
        break;
      case '-h':
      case '--help':
        flags.help = true;
        break;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
        bumpKind = arg;
    }
  }

  if (!BUMP_KINDS.has(bumpKind) && !EXPLICIT_SEMVER_RE.test(bumpKind)) {
    throw new Error(`Invalid bump kind: ${bumpKind} (expected patch, minor, major, or x.y.z)`);
  }

  return { flags, bumpKind };
}

function readCurrentVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    throw new Error('Missing VERSION file');
  }
  return fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

function gitStatusPorcelain() {
  try {
    return execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function runStep(label, command, dryRun, index, total) {
  const progress = total ? paint('gray', `(${index}/${total})`) : '';
  console.log(`\n${paint('blue', '▶')} ${paint('bold', label)} ${progress}`);
  if (dryRun) {
    console.log(`  ${badge('dry-run', 'yellow')} ${paint('dim', command)}`);
    return;
  }
  try {
    execSync(command, { cwd: repoRoot, stdio: 'inherit', shell: true });
    console.log(`  ${badge('OK', 'green')} ${paint('dim', label)}`);
  } catch {
    console.log(`  ${badge('FAIL', 'red')} ${paint('bold', label)}`);
    throw new Error(`Pre-release check failed: ${label}`);
  }
}

function runChecks(dryRun) {
  const total = CHECKS.length;
  for (let i = 0; i < total; i++) {
    const [label, command] = CHECKS[i];
    runStep(label, command, dryRun, i + 1, total);
  }
}

function runBump(bumpKind, noGit, dryRun) {
  const args = ['node', 'scripts/bump-version.mjs'];
  if (noGit) args.push('--no-git');
  args.push(bumpKind);
  const command = args.join(' ');

  console.log(`\n${paint('blue', '▶')} ${paint('bold', `bump version`)} ${paint('gray', `(${bumpKind})`)}`);
  if (dryRun) {
    console.log(`  ${badge('dry-run', 'yellow')} ${paint('dim', command)}`);
    return;
  }
  execFileSync('node', args.slice(1), { cwd: repoRoot, stdio: 'inherit' });
  console.log(`  ${badge('OK', 'green')} ${paint('dim', 'version bumped')}`);
}

function runItch(dryRun) {
  runStep('itch package', 'npm run release:itch', dryRun);
}

const argv = process.argv.slice(2);

try {
  const { flags, bumpKind } = parseArgs(argv);

  if (flags.help) {
    usage();
    process.exit(0);
  }

  const current = readCurrentVersion();
  console.log(
    `${paint('bold', 'Release workflow')} — ${paint('dim', 'current version:')} ${paint('cyan', current)}`,
  );

  if (flags.dryRun) {
    console.log(`${badge('dry-run', 'yellow')} No files or git state will change.`);
  }

  const dirty = gitStatusPorcelain();
  if (dirty && !flags.noGit && !flags.dryRun) {
    console.log(`\n${badge('WARN', 'yellow')} ${paint('yellow', 'Working tree has uncommitted changes.')}`);
    console.log(`  ${paint('dim', 'Only VERSION, package.json and package-lock.json will be committed by the bump.')}`);
    console.log(`  ${paint('dim', 'Review with:')} ${paint('cyan', 'git status')}`);
  }

  if (!flags.skipChecks) {
    heading('Pre-release checks (CI parity)');
    runChecks(flags.dryRun);
    console.log(`\n${badge('PASS', 'green')} ${paint('green', `All ${CHECKS.length} checks passed.`)}`);
  } else {
    console.log(`\n${badge('SKIP', 'yellow')} ${paint('yellow', 'Pre-release checks skipped (--skip-checks)')}`);
  }

  if (!flags.noBump) {
    heading('Version bump');
    runBump(bumpKind, flags.noGit, flags.dryRun);
  } else {
    console.log(`\n${badge('SKIP', 'yellow')} ${paint('yellow', 'Version bump skipped (--no-bump)')}`);
  }

  if (flags.itch) {
    heading('Itch.io package');
    runItch(flags.dryRun);
  }

  heading('Release complete');
  if (!flags.noBump && !flags.noGit && !flags.dryRun) {
    const next = readCurrentVersion();
    console.log(
      `  ${paint('dim', 'Version:')} ${paint('gray', current)} ${paint('dim', '→')} ${paint('green', next)}`,
    );
    console.log(
      `  ${paint('dim', 'Push with:')} ${paint('cyan', `git push && git push origin v${next}`)}`,
    );
  }
  if (flags.itch && !flags.dryRun) {
    console.log(`  ${paint('dim', 'Itch ZIP:')} ${paint('cyan', 'release/silent-dungeon-itch.zip')}`);
    console.log(
      `  ${paint('dim', 'Upload:')} ${paint('cyan', 'npm run release:itch:push')} ${paint('gray', '(needs BUTLER_API_KEY)')}`,
    );
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n${badge('ERROR', 'red')} ${paint('red', message)}`);
  process.exit(1);
}
