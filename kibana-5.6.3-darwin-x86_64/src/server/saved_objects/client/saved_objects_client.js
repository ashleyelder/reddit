'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsClient = exports.V6_TYPE = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const V6_TYPE = exports.V6_TYPE = 'doc';

class SavedObjectsClient {
  constructor(kibanaIndex, mappings, callAdminCluster) {
    this.errors = _lib.errors;

    this._kibanaIndex = kibanaIndex;
    this._mappings = mappings;
    this._callAdminCluster = callAdminCluster;
  }

  /**
   * Persists an object
   *
   * @param {string} type
   * @param {object} attributes
   * @param {object} [options={}]
   * @property {string} [options.id] - force id on creation, not recommended
   * @property {boolean} [options.overwrite=false]
   * @returns {promise} - { id, type, version, attributes }
  */
  create(type, attributes = {}, options = {}) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const method = options.id && !options.overwrite ? 'create' : 'index';
      const response = yield _this._withKibanaIndexAndMappingFallback(method, {
        type,
        id: options.id,
        body: attributes,
        refresh: 'wait_for'
      }, {
        type: V6_TYPE,
        id: `${type}:${options.id || _uuid2.default.v1()}`,
        body: {
          type,
          [type]: attributes
        }
      });

      return (0, _lib.normalizeEsDoc)(response, { type, attributes });
    })();
  }

  /**
   * Creates multiple documents at once
   *
   * @param {array} objects - [{ type, id, attributes }]
   * @param {object} [options={}]
   * @property {boolean} [options.force=false] - overrides existing documents
   * @property {string} [options.format=v5]
   * @returns {promise} - [{ id, type, version, attributes, error: { message } }]
   */
  bulkCreate(objects, options = {}) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var _options$format = options.format;
      const format = _options$format === undefined ? 'v5' : _options$format;


      const bulkCreate = format === 'v5' ? _lib.v5BulkCreate : _lib.v6BulkCreate;
      const response = yield _this2._withKibanaIndex('bulk', {
        body: bulkCreate(objects, options),
        refresh: 'wait_for'
      });

      const items = (0, _lodash.get)(response, 'items', []);
      const missingTypesCount = items.filter(function (item) {
        const method = Object.keys(item)[0];
        return (0, _lodash.get)(item, `${method}.error.type`) === 'type_missing_exception';
      }).length;

      const formatFallback = format === 'v5' && items.length > 0 && items.length === missingTypesCount;

      if (formatFallback) {
        return _this2.bulkCreate(objects, Object.assign({}, options, { format: 'v6' }));
      }

      return (0, _lodash.get)(response, 'items', []).map(function (resp, i) {
        const method = Object.keys(resp)[0];
        var _objects$i = objects[i];
        const type = _objects$i.type,
              attributes = _objects$i.attributes;


        return (0, _lib.normalizeEsDoc)(resp[method], {
          id: resp[method]._id,
          type,
          attributes,
          error: resp[method].error ? { message: (0, _lodash.get)(resp[method], 'error.reason') } : undefined
        });
      });
    })();
  }

  /**
   * Deletes an object
   *
   * @param {string} type
   * @param {string} id
   * @returns {promise}
   */
  delete(type, id) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const response = yield _this3._withKibanaIndex('deleteByQuery', {
        body: (0, _lib.createIdQuery)({ type, id }),
        refresh: 'wait_for'
      });

      if ((0, _lodash.get)(response, 'deleted') === 0) {
        throw _lib.errors.decorateNotFoundError(_boom2.default.notFound());
      }
    })();
  }

  /**
   * @param {object} [options={}]
   * @property {string} options.type
   * @property {string} options.search
   * @property {string} options.searchFields - see Elasticsearch Simple Query String
   *                                        Query field argument for more information
   * @property {integer} [options.page=1]
   * @property {integer} [options.perPage=20]
   * @property {string} options.sortField
   * @property {string} options.sortOrder
   * @property {array|string} options.fields
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }], total, per_page, page }
   */
  find(options = {}) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const type = options.type,
            search = options.search,
            searchFields = options.searchFields;
      var _options$page = options.page;
      const page = _options$page === undefined ? 1 : _options$page;
      var _options$perPage = options.perPage;
      const perPage = _options$perPage === undefined ? 20 : _options$perPage,
            sortField = options.sortField,
            sortOrder = options.sortOrder,
            fields = options.fields;


      const esOptions = {
        _source: (0, _lib.includedFields)(type, fields),
        size: perPage,
        from: perPage * (page - 1),
        body: (0, _lib.createFindQuery)(_this4._mappings, { search, searchFields, type, sortField, sortOrder })
      };

      const response = yield _this4._withKibanaIndex('search', esOptions);

      return {
        saved_objects: (0, _lodash.get)(response, 'hits.hits', []).map(function (hit) {
          return (0, _lib.normalizeEsDoc)(hit);
        }),
        total: (0, _lodash.get)(response, 'hits.total', 0),
        per_page: perPage,
        page

      };
    })();
  }

  /**
   * Returns an array of objects by id
   *
   * @param {array} objects - an array ids, or an array of objects containing id and optionally type
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }] }
   * @example
   *
   * bulkGet([
   *   { id: 'one', type: 'config' },
   *   { id: 'foo', type: 'index-pattern' }
   * ])
   */
  bulkGet(objects = []) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (objects.length === 0) {
        return { saved_objects: [] };
      }

      const docs = objects.reduce(function (acc, { type, id }) {
        return [...acc, {}, (0, _lib.createIdQuery)({ type, id })];
      }, []);

      const response = yield _this5._withKibanaIndex('msearch', { body: docs });
      const responses = (0, _lodash.get)(response, 'responses', []);

      return {
        saved_objects: responses.map(function (r, i) {
          var _get = (0, _lodash.get)(r, 'hits.hits', []),
              _get2 = _slicedToArray(_get, 1);

          const hit = _get2[0];


          if (!hit) {
            return Object.assign({}, objects[i], {
              error: { statusCode: 404, message: 'Not found' }
            });
          }

          return (0, _lib.normalizeEsDoc)(hit, objects[i]);
        })
      };
    })();
  }

  /**
   * Gets a single object
   *
   * @param {string} type
   * @param {string} id
   * @returns {promise} - { id, type, version, attributes }
   */
  get(type, id) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const response = yield _this6._withKibanaIndex('search', { body: (0, _lib.createIdQuery)({ type, id }) });

      var _get3 = (0, _lodash.get)(response, 'hits.hits', []),
          _get4 = _slicedToArray(_get3, 1);

      const hit = _get4[0];


      if (!hit) {
        throw _lib.errors.decorateNotFoundError(_boom2.default.notFound());
      }

      return (0, _lib.normalizeEsDoc)(hit);
    })();
  }

  /**
   * Updates an object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {integer} options.version - ensures version matches that of persisted object
   * @returns {promise}
   */
  update(type, id, attributes, options = {}) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const response = yield _this7._withKibanaIndexAndMappingFallback('update', {
        id,
        type,
        version: options.version,
        refresh: 'wait_for',
        body: {
          doc: attributes
        }
      }, {
        type: V6_TYPE,
        id: `${type}:${id}`,
        body: {
          doc: {
            [type]: attributes
          }
        }
      });

      return (0, _lib.normalizeEsDoc)(response, { id, type, attributes });
    })();
  }

  _withKibanaIndexAndMappingFallback(method, params, fallbackParams) {
    const fallbacks = {
      'create': ['type_missing_exception'],
      'index': ['type_missing_exception'],
      'update': ['document_missing_exception']
    };

    return this._withKibanaIndex(method, params).catch(err => {
      const fallbackWhen = (0, _lodash.get)(fallbacks, method, []);
      const type = (0, _lodash.get)(err, 'body.error.type');

      if (type && fallbackWhen.includes(type)) {
        return this._withKibanaIndex(method, _extends({}, params, fallbackParams));
      }

      throw err;
    });
  }

  _withKibanaIndex(method, params) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      try {
        return yield _this8._callAdminCluster(method, _extends({}, params, {
          index: _this8._kibanaIndex
        }));
      } catch (err) {
        throw (0, _lib.decorateEsError)(err);
      }
    })();
  }
}
exports.SavedObjectsClient = SavedObjectsClient;
SavedObjectsClient.errors = _lib.errors;
