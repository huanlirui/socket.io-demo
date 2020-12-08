'use strict';

var init = function () {
  if (process.env.NODE_ENV === 'production') {
    return {
      redis: {
        host: redisURI.hostname,
        port: redisURI.port,
        password: redisPassword,
      },
    };
  } else {
    return require('./config.json');
  }
};

module.exports = init();
