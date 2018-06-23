# publish-to-git
Publish private npm packages to Git repositories with npm publish semantics.

Default behavior takes the version from package.json, runs `npm pack` and then publishes the contents as an orphan tag `v<VERSION>` (for example `v1.0.0`)

Such tags can be easily referenced in `package.json` providing proper versioning to private Git npm packages along with an easy publish path compatible with `npm`.

## Installation
```js
npm install --save-dev publish-to-git
```

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
  main.js --tag v2.1.3 --no-push     # by default version from package.json is used
  main.js --remote https://USER:GITHUB_TOKEN@github.com/USER/REPO
  main.js --force    # useful in CI and when we want to override the same tag which triggered the build
```

## License
MIT
