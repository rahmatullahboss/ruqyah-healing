import { access, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const repoRoot = process.cwd();
const deployConfigPath = path.join(repoRoot, '.wrangler', 'deploy', 'config.json');
const backupConfigPath = path.join(repoRoot, '.wrangler', 'deploy', 'config.pages-dev-backup.json');

let restoreNeeded = false;

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function temporarilyBypassStaleDeployConfig() {
  if (!(await pathExists(deployConfigPath))) {
    return;
  }

  const raw = await readFile(deployConfigPath, 'utf8')
    .then((contents) => JSON.parse(contents))
    .catch(() => null);

  if (!raw?.configPath) {
    return;
  }

  const redirectedConfigPath = path.resolve(path.dirname(deployConfigPath), raw.configPath);
  if (await pathExists(redirectedConfigPath)) {
    return;
  }

  await rename(deployConfigPath, backupConfigPath);
  restoreNeeded = true;
}

async function restoreDeployConfig() {
  if (!restoreNeeded) {
    return;
  }

  if (await pathExists(backupConfigPath)) {
    await rename(backupConfigPath, deployConfigPath);
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: 'inherit',
    });

    const forwardSignal = async (signal) => {
      child.kill(signal);
      await restoreDeployConfig();
      process.exit(1);
    };

    process.once('SIGINT', forwardSignal);
    process.once('SIGTERM', forwardSignal);

    child.on('exit', async (code) => {
      process.removeListener('SIGINT', forwardSignal);
      process.removeListener('SIGTERM', forwardSignal);
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code ?? 1}`));
    });
  });
}

try {
  await temporarilyBypassStaleDeployConfig();
  await run('npx', ['astro', 'build']);
  await run('wrangler', ['pages', 'dev', 'dist']);
} catch (error) {
  await restoreDeployConfig();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
