const { publish } = require('./');

const argv = require('yargs')
  .usage('Usage: $0')
  .example('$0 --tag v2.1.3 --no-push')
  .example('$0 --remote https://USER:GITHUB_TOKEN@github.com/USER/REPO')
  .describe('remote', 'Git remote, may be remote name or full URL to the repo')
  .default('remote', 'origin')
  .describe('tag', 'Tag name to which src will be published, for example: v1.2.3 - by default uses version from package.json')
  .describe('push', 'Push update to the remote')
  .boolean('push')
  .default('push', 'true')
  .argv;

const path = require('path');
const packageJson = require(path.join(process.cwd(), '/package.json'));

publish({
  tag: argv.tag,
  name: packageJson.name,
  version: packageJson.version,
  push: argv.push && {
    remote: argv.remote,
  },
  packOptions: {
    verbose: true
  }
}).catch(err => {
  if (err.cmd) {
    console.error(err.message);
    if (err.cmd.match(/^git push/)) {
      console.warn(`Cleaned up unpushed tag - please try again`);
    }
  } else {
    console.error(err);
  }
  process.exit(1);
});