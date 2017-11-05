'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _upgrade_config = require('./upgrade_config');

var _upgrade_config2 = _interopRequireDefault(_upgrade_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (server) {
    const savedObjectsClient = server.savedObjectsClientFactory({
      callCluster: server.plugins.elasticsearch.getCluster('admin').callWithInternalUser
    });

    var _ref2 = yield savedObjectsClient.find({
      type: 'config',
      page: 1,
      perPage: 1000,
      sortField: 'buildNum',
      sortOrder: 'desc'
    });

    const configSavedObjects = _ref2.saved_objects;


    return yield (0, _upgrade_config2.default)(server, savedObjectsClient)(configSavedObjects);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

module.exports = exports['default'];
