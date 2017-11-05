'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (server, savedObjectsClient) {
  const config = server.config();

  function createNewConfig() {
    return savedObjectsClient.create('config', {
      buildNum: config.get('pkg.buildNum')
    }, {
      id: config.get('pkg.version')
    });
  }

  return function (configSavedObjects) {
    // Check to see if there are any doc. If not then we set the build number and id
    if (configSavedObjects.length === 0) {
      return createNewConfig();
    }

    // if we already have a the current version in the index then we need to stop
    const devConfig = _lodash2.default.find(configSavedObjects, function currentVersion(configSavedObject) {
      return configSavedObject.id !== '@@version' && configSavedObject.id === config.get('pkg.version');
    });

    if (devConfig) {
      return _bluebird2.default.resolve();
    }

    // Look for upgradeable configs. If none of them are upgradeable
    // then create a new one.
    const configSavedObject = _lodash2.default.find(configSavedObjects, _is_upgradeable2.default.bind(null, server));
    if (!configSavedObject) {
      return createNewConfig();
    }

    // if the build number is still the template string (which it wil be in development)
    // then we need to set it to the max interger. Otherwise we will set it to the build num
    configSavedObject.attributes.buildNum = config.get('pkg.buildNum');

    server.log(['plugin', 'elasticsearch'], {
      tmpl: 'Upgrade config from <%= prevVersion %> to <%= newVersion %>',
      prevVersion: configSavedObject.id,
      newVersion: config.get('pkg.version')
    });

    return savedObjectsClient.create('config', configSavedObject.attributes, {
      id: config.get('pkg.version')
    });
  };
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _is_upgradeable = require('./is_upgradeable');

var _is_upgradeable2 = _interopRequireDefault(_is_upgradeable);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
