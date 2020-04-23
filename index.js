const Promise = require('bluebird');
const childProcess = require('child_process');
const fs = require('fs');
const tar = require('tar');
const path = require('path');
const tmp = require('tmp');

Promise.promisifyAll(childProcess);
Promise.promisifyAll(fs);
Promise.promisifyAll(tar);
Promise.promisifyAll(tmp);

const { execFileAsync, spawn } = childProcess;
const { unlinkAsync } = fs;

tmp.setGracefulCleanup();

function spawnNpmWithOutput(args, options) {
  if(!options.verbose) {
    return execFileAsync('npm', args, options);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('npm', args, Object.assign(options, {
      stdio: ['inherit', 'pipe', 'inherit'],
      env: Object.assign({}, process.env, Boolean(process.stdout.isTTY) && {
        NPM_CONFIG_COLOR: 'always'
      })
    }));
    let outData = '';
    proc.on('exit', exitCode => {
      if(exitCode === 0) { 
        resolve(outData);
      }
      reject(new Error(`npm failed with error code ${exitCode}`));
    });
    proc.on('error', reject);
    proc.stdout.on('data', data => {
      outData += data.toString('utf8');
    });
  });
}

async function packWithNpm({ sourceDir, targetDir, verbose }) {
  const output = (await spawnNpmWithOutput(['pack', sourceDir], {
    cwd: targetDir,
    verbose
  })).trim().split(/\n/);
  const packedFile = output[output.length - 1];
  const packedFileAbsolute = path.join(path.resolve(targetDir), packedFile);
  
  try {
    await tar.extractAsync({
      strip: 1,
      cwd: targetDir,
      file: packedFileAbsolute
    });
  } finally {
    await unlinkAsync(packedFileAbsolute);
  }
}

async function publish({tag, branch, version, push, packOptions}, pack = packWithNpm) {
  if (!tag) {
    tag = `v${version}`;
  }

  const tmpDir = await tmp.dirAsync();

  const git = (...args) => execFileAsync('git', args);
  const gitInTmpDir = (...args) => execFileAsync('git', args, {
    cwd: tmpDir
  });

  const tmpBranch = (branch)
    ? undefined
    : `publish-to-git-temp-${Math.random().toString(36).substring(2,12)}`;

  try {
    if (branch) {
      await git('worktree', 'add', '--no-checkout', tmpDir, branch);
    } else {
      await git('worktree', 'add', '--detach', tmpDir);
      await gitInTmpDir('checkout', '--orphan', tmpBranch);
      await gitInTmpDir('rm', '-rf', '.');
    }

    await pack(Object.assign({
      sourceDir: process.cwd(),
      targetDir: tmpDir,
    }, packOptions));

    await gitInTmpDir('add', '-A');

    const currentCommitMessage = (await git('log', '-n', '1', '--pretty=oneline', '--decorate=full')).trim();
    const message = `Published by publish-to-git
${currentCommitMessage}`;

    await gitInTmpDir('commit', '-m', message);

    const forceOptions = push.force ? ['-f'] : [];

    await git('tag', ...forceOptions, tag, `refs/heads/${branch || tmpBranch}`);

    if (push) {
      console.warn(`Pushing to remote ${push.remote}`);

      try {
        const objectsToPush = [`refs/tags/${tag}`];
        if (branch) objectsToPush.push(`refs/heads/${branch}`);
        await git('push', ...forceOptions, push.remote || 'origin', ...objectsToPush);
      } catch(err) {
        await git('tag', '-d', tag);
        if (branch) await gitInTmpDir('reset', '--hard', `HEAD~`);
        throw err;
      }
      console.log(`Pushed tag to ${push.remote} with tag: ${tag}`);
    } else {
      console.log(`Created local tag: ${tag}`);
    }
  } finally {
    try {
      await git('worktree', 'remove', tmpDir);
      if (tmpBranch) await git('branch', '-D', tmpBranch);
    } catch(err) {}
  }
}

module.exports = { publish, packWithNpm };
