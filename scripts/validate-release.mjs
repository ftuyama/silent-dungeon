/**
 * Pre-release validation — mirrors CI (.github/workflows/test.yml).
 *
 * Usage:
 *   node scripts/validate-release.mjs [options]
 *
 * Options:
 *   --dry-run   Print steps without executing
 *   -h, --help  Show help
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const CHECKS = [
  ['validate:scenes', 'node scripts/validate-scenes.mjs'],
  ['validate:unreachable', 'node scripts/find-unreachable-scenes.mjs'],
  ['check:pt-br', 'node scripts/check-pt-br.mjs'],
  ['check:narrative-voice', 'node scripts/check-narrative-voice.mjs'],
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
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
    }
  : Object.fromEntries(
      ['reset', 'bold', 'dim', 'red', 'green', 'yellow', 'blue', 'cyan', 'gray'].map((k) => [k, '']),
    );

function paint(color, text) {
  return `${c[color]}${text}${c.reset}`;
}

function badge(text, color) {
  return paint(color, `[${text}]`);
}

function heading(title) {
  const line = '═'.repeat(Math.max(title.length + 4, 40));
  console.log(`\n${paint('cyan', line)}`);
  console.log(paint('bold', `  ${title}`));
  console.log(paint('cyan', line));
}

function usage() {
  console.log(`Usage: node scripts/validate-release.mjs [options]

Runs all pre-release checks (CI parity): scenes, i18n, build, test, etc.

Options:
  --dry-run   Print steps without executing
  -h, --help  Show help`);
}

function parseArgs(argv) {
  const flags = { dryRun: false, help: false };
  for (const arg of argv) {
    switch (arg) {
      case '--dry-run':
        flags.dryRun = true;
        break;
      case '-h':
      case '--help':
        flags.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }
  return flags;
}

function runStep(label, command, dryRun, index, total) {
  const progress = paint('gray', `(${index}/${total})`);
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
  console.log(`\n${badge('PASS', 'green')} ${paint('green', `All ${total} checks passed.`)}`);
}

try {
  const { dryRun, help } = parseArgs(process.argv.slice(2));
  if (help) {
    usage();
    process.exit(0);
  }
  heading('Pre-release checks (CI parity)');
  if (dryRun) {
    console.log(`${badge('dry-run', 'yellow')} No commands will be executed.`);
  }
  runChecks(dryRun);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n${badge('ERROR', 'red')} ${paint('red', message)}`);
  process.exit(1);
}
