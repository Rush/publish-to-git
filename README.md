# publish-to-git
Publish private npm packages to Git repositories with npm publish semantics (uses same files as `npm publish`)

Default behavior takes the version from package.json, runs `npm pack` and then pushes the contents to an orphan tag `v<VERSION>` (for example `v1.0.0`)

Such tags can be easily referenced in `package.json` providing proper versioning to private Git npm packages along with an easy publish path compatible with `npm`.

## Installation
```js
npm install --save-dev publish-to-git
```
Requirements: `node > 8.0.0` and `git` command being in the `PATH`.

## Consumption of private NPM packages
For Github
```
"some-package": "reponame/repo#v1.0.0",
"some-package-with-semver": "reponame/repo#semver:^v1.0.0",
```

For Gitlab
```
"some-package": "gitlab:reponame/repo#v1.0.0"
"some-package-with-semver": "gitlab:reponame/repo#semver:^v1.0.0",
```

For some other Git repo:
```
"some-package": "git+ssh://git@somehow.com:somerepo#v1.0.0"
"some-package-with-semver": "git+ssh://git@somehow.com:somerepo#semver:^v1.0.0",
```

## Usage
In package.json
```js
"scripts": {
  "publish": "publish-to-git"
}
```

or run with `npx`:
```
# npx publish-to-git
```

See also a few options which may assist in your particular use case:
```
Options:
  --help     Show help [boolean]
  --version  Show version number [boolean]
  --remote   Git remote, may be remote name or full URL to the repo [default: "origin"]
  --tag      Tag name to which src will be published, for example: v1.2.3 - by default uses version from package.json
  --push     Push update to the git remote (pass --no-push to disable) [boolean] [default: "true"]
  --force    Override any existing tag on the remote as well as locally (git tag -f, git push -f) [boolean]

Examples:
  publish-to-git --tag v2.1.3 --no-push     # by default version from package.json is used
  publish-to-git --remote https://USER:GITHUB_TOKEN@github.com/USER/REPO
  publish-to-git --force    # useful in CI and when we want to override the same tag which triggered the build
```

## Programmatic usage

```js
const { publish } = require('publish-to-git');

const options = {
  tag: 'v1.0.0', // you can also provide version: '1.0.0' instead of tag
  push: { // set to false to not push
    remote: 'origin', // set to URL or remote name
    force: false, // set to true to force push
  }
};

publish(options).then(() => {
  console.log('Done');
});
```

Please see https://github.com/Rush/publish-to-git/blob/master/main.js for reference

## Usage in Drone CI

This example assumes that the developer pushes a tag that's identical to the version in package json. CI will complete the build and override tag contents. If you find this approach ugly, you could push tags in form of `build-v1.0.0` and then have `publish-to-git` publish using default options.

```yaml
pipeline:
  # other pipelines here, like build etc.
  publish-to-git:
    commands:
      - git config --global user.email "admin@drone" # git will complain if these are not set
      - git config --global user.name "Drone CI"
      - npx publish-to-git --force # this will override existing tag with npm package contents
    when:
      event: tag
```

## License
MIT
