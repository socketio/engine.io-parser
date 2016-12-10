'use strict';

var zuulConfig = module.exports = {
  tunnel: {
    type: 'localtunnel'
  },
  ui: 'mocha-bdd',

  // only used when run with saucelabs
  // not activated when dev or phantom
  concurrency: 2, // ngrok only accepts two tunnels by default
  // if browser does not sends output in 120s since last output:
  // stop testing, something is wrong
  browser_output_timeout: 120 * 1000,
  browser_open_timeout: 60 * 4 * 1000,
  // we want to be notified something is wrong asap, so no retry
  browser_retries: 1,

  browsers: [{
    name: 'chrome',
    version: 'latest'
  }, {
    name: 'firefox',
    version: 'latest'
  }, {
    name: 'internet explorer',
    version: '6..10'
  }, {
    name: 'safari',
    version: 'latest'
  }, {
    name: 'iphone',
    version: '-3..latest'
  }, {
    name: 'android',
    version: '-3..latest'
  }, {
    name: 'ipad',
    version: 'latest'
  }, {
    name: 'microsoftedge',
    version: 'latest'
  }]
};

if (process.env.CI === 'true') {
  zuulConfig.tunnel = {
    type: 'ngrok',
    bind_tls: true
  };
}
