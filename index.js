const Promise = require('bluebird');
const ghpages = require('gh-pages');

Promise.promisifyAll(ghpages);

ghpages.publish('dist', {
  branch: null,
  push: false,
  tag: 'dupa'
}).then(() => {
  console.log('DONE');
});