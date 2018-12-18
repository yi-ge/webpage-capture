const kue = require('kue');
const express = require('express');
const kueUiExpress = require('kue-ui-express');
const app = express();
const basicAuth = require('basic-auth-connect');
const { kueAuthConfig, kueUIConfig, kueApiConfig, kueServerConfig } = require('../config')

module.exports = () => {
  app.use(basicAuth(kueAuthConfig.username, kueAuthConfig.password));

  kueUiExpress(app, kueUIConfig.path, kueApiConfig.path);

  // Mount kue JSON api
  app.use(kueApiConfig.path + '/', kue.app);

  app.listen(kueServerConfig);
}
