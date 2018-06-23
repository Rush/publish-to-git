const Promise = require('bluebird');
const ghpages = require('gh-pages');

Promise.promisifyAll(ghpages);

ghpages.publishAsync('dist', {
  branch: 'release',
  push: true,
  tag: 'dupa',
  user: {
    name: 'Drone',
    email: 'rush@rushbase.net'
  }
}).then(() => {
  console.log('DONE');
});