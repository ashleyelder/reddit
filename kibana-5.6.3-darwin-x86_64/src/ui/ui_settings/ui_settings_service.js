'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UiSettingsService = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function hydrateUserSettings(userSettings) {
  return Object.keys(userSettings).map(key => ({ key, userValue: userSettings[key] })).filter(({ userValue }) => userValue !== null).reduce((acc, { key, userValue }) => _extends({}, acc, { [key]: { userValue } }), {});
}

/**
 *  Service that provides access to the UiSettings stored in elasticsearch.
 *
 *  @class UiSettingsService
 *  @param {Object} options
 *  @property {string} options.index Elasticsearch index name where settings are stored
 *  @property {string} options.type type of ui settings Elasticsearch doc
 *  @property {string} options.id id of ui settings Elasticsearch doc
 *  @property {AsyncFunction} options.callCluster function that accepts a method name and
 *                            param object which causes a request via some elasticsearch client
 *  @property {AsyncFunction} [options.readInterceptor] async function that is called when the
 *                            UiSettingsService does a read() an has an oportunity to intercept the
 *                            request and return an alternate `_source` value to use.
 */
class UiSettingsService {
  constructor(options) {
    const type = options.type,
          id = options.id,
          savedObjectsClient = options.savedObjectsClient;
    var _options$readIntercep = options.readInterceptor;
    const readInterceptor = _options$readIntercep === undefined ? _lodash.noop : _options$readIntercep;
    var _options$getDefaults = options.getDefaults;
    const getDefaults = _options$getDefaults === undefined ? () => ({}) : _options$getDefaults;


    this._savedObjectsClient = savedObjectsClient;
    this._getDefaults = getDefaults;
    this._readInterceptor = readInterceptor;
    this._type = type;
    this._id = id;
  }

  getDefaults() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return yield _this._getDefaults();
    })();
  }

  // returns a Promise for the value of the requested setting
  get(key) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const all = yield _this2.getAll();
      return all[key];
    })();
  }

  getAll() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const raw = yield _this3.getRaw();

      return Object.keys(raw).reduce(function (all, key) {
        const item = raw[key];
        const hasUserValue = 'userValue' in item;
        all[key] = hasUserValue ? item.userValue : item.value;
        return all;
      }, {});
    })();
  }

  getRaw() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const userProvided = yield _this4.getUserProvided();
      return (0, _lodash.defaultsDeep)(userProvided, (yield _this4.getDefaults()));
    })();
  }

  getUserProvided(options) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return hydrateUserSettings((yield _this5._read(options)));
    })();
  }

  setMany(changes) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6._write(changes);
    })();
  }

  set(key, value) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      yield _this7.setMany({ [key]: value });
    })();
  }

  remove(key) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      yield _this8.set(key, null);
    })();
  }

  removeMany(keys) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const changes = {};
      keys.forEach(function (key) {
        changes[key] = null;
      });
      yield _this9.setMany(changes);
    })();
  }

  _write(changes) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      yield _this10._savedObjectsClient.update(_this10._type, _this10._id, changes);
    })();
  }

  _read(options = {}) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      const interceptValue = yield _this11._readInterceptor(options);
      if (interceptValue != null) {
        return interceptValue;
      }

      var _options$ignore401Err = options.ignore401Errors;
      const ignore401Errors = _options$ignore401Err === undefined ? false : _options$ignore401Err;
      var _savedObjectsClient$e = _this11._savedObjectsClient.errors;
      const isNotFoundError = _savedObjectsClient$e.isNotFoundError,
            isForbiddenError = _savedObjectsClient$e.isForbiddenError,
            isEsUnavailableError = _savedObjectsClient$e.isEsUnavailableError,
            isNotAuthorizedError = _savedObjectsClient$e.isNotAuthorizedError;


      const isIgnorableError = function isIgnorableError(error) {
        return isNotFoundError(error) || isForbiddenError(error) || isEsUnavailableError(error) || ignore401Errors && isNotAuthorizedError(error);
      };

      try {
        const resp = yield _this11._savedObjectsClient.get(_this11._type, _this11._id);
        return resp.attributes;
      } catch (error) {
        if (isIgnorableError(error)) {
          return {};
        }

        throw error;
      }
    })();
  }
}
exports.UiSettingsService = UiSettingsService;
