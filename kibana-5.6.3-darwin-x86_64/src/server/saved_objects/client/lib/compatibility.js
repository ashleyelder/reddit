'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.v5BulkCreate = v5BulkCreate;
exports.v6BulkCreate = v6BulkCreate;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _saved_objects_client = require('../saved_objects_client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {array} objects - [{ type, id, attributes }]
 * @param {object} [options={}]
 * @property {boolean} [options.overwrite=false] - overrides existing documents
 * @returns {array}
 */
function v5BulkCreate(objects, options = {}) {
  return objects.reduce((acc, object) => {
    const method = object.id && !options.overwrite ? 'create' : 'index';

    acc.push({ [method]: { _type: object.type, _id: object.id } });
    acc.push(object.attributes);

    return acc;
  }, []);
}

/**
 * @param {array} objects - [{ type, id, attributes }]
 * @param {object} [options={}]
 * @property {boolean} [options.overwrite=false] - overrides existing documents
 * @returns {array}
 */
function v6BulkCreate(objects, options = {}) {
  return objects.reduce((acc, object) => {
    const method = object.id && !options.overwrite ? 'create' : 'index';

    acc.push({ [method]: {
        _type: _saved_objects_client.V6_TYPE,
        _id: `${object.type}:${object.id || _uuid2.default.v1()}`
      } });

    acc.push(Object.assign({}, { type: object.type }, { [object.type]: object.attributes }));

    return acc;
  }, []);
}
