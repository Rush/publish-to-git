const Promise = require('bluebird');
const ghpages = require('gh-pages');

Promise.promisifyAll(ghpages);

ghpages.publishAsync('dist', {
  branch: 'release',
  push: true,
  tag: 'dupa'
}).then(() => {
  console.log('DONE');
});