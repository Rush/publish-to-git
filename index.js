const Promise = require('bluebird');
const ghpages = require('gh-pages');

const childProcess = require('child_process')

Promise.promisifyAll(childProcess);

const { execFileAsync } = childProcess;

const TEMPORARY_BRANCH = 'publish-to-git-temporary';

async function run({tag, push}) {
  try {
    await execFileAsync('git', ['branch', '-D', TEMPORARY_BRANCH]);
  } catch(err) {}

  const out = await execFileAsync('git', ['branch', TEMPORARY_BRANCH]);
  const commitId = (await execFileAsync('git',  ['subtree', 'split', '--prefix', 'dist', TEMPORARY_BRANCH])).trim();
  await execFileAsync('git', ['tag', tag, commitId]);

  if (push) {
    const out = await execFileAsync('git', ['push', push.remote || 'origin', tag]);
    console.log(out);
  }

  await execFileAsync('git', ['branch', '-D', TEMPORARY_BRANCH]);
}

run({
  tag: 'v1.1',
  push: {
    remote: 'origin'
  }
}).catch(err => {
  if(err.cmd) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
});