'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeEsDoc = normalizeEsDoc;

var _lodash = require('lodash');

var _saved_objects_client = require('../saved_objects_client');

function normalizeEsDoc(doc, overrides = {}) {
  if (!doc) return {};

  let type;
  let id = doc._id;
  let attributes;

  if (doc._type === _saved_objects_client.V6_TYPE) {
    type = overrides.type || (0, _lodash.get)(doc, '_source.type');
    attributes = (0, _lodash.get)(doc, `_source.${type}`);

    // migrated v5 indices and objects created with a specified ID
    // have the type prefixed to the id.
    id = doc._id.replace(`${type}:`, '');
  } else {
    type = overrides.type || doc._type;
    attributes = doc._source;
  }

  return Object.assign({}, {
    id,
    type,
    version: doc._version,
    attributes
  }, overrides);
}
