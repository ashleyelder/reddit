'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 *  Checks that a kibana index has all of the types specified. Any type
 *  that is not defined in the existing index will be added via the
 *  `indicies.putMapping` API.
 *
 *  @param  {Object} options
 *  @property {Function} options.log a method for writing log messages
 *  @property {string} options.indexName name of the index in elasticsearch
 *  @property {Function} options.callCluster a function for executing client requests
 *  @property {Array<Object>} options.types an array of objects with `name` and `mapping` properties
 *                                        describing the types that should be in the index
 *  @return {Promise<undefined>}
 */
let ensureTypesExist = exports.ensureTypesExist = (() => {
  var _ref = _asyncToGenerator(function* ({ log, indexName, callCluster, types }) {
    const index = yield callCluster('indices.get', {
      index: indexName,
      feature: '_mappings'
    });

    // could be different if aliases were resolved by `indices.get`
    const resolvedName = Object.keys(index)[0];
    const mappings = index[resolvedName].mappings;
    const literalTypes = Object.keys(mappings);
    const v6Index = literalTypes.length === 1 && literalTypes[0] === 'doc';

    // our types aren't really es types, at least not in v6
    const typesDefined = Object.keys(v6Index ? mappings.doc.properties : mappings);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const type = _step.value;

        if (v6Index && type.name === '_default_') {
          // v6 indices don't get _default_ types
          continue;
        }

        const defined = typesDefined.includes(type.name);
        if (defined) {
          continue;
        }

        log(['info', 'elasticsearch'], {
          tmpl: `Adding mappings to kibana index for SavedObject type "<%= typeName %>"`,
          typeName: type.name,
          typeMapping: type.mapping
        });

        if (v6Index) {
          yield callCluster('indices.putMapping', {
            index: indexName,
            type: 'doc',
            body: {
              properties: {
                [type.name]: type.mapping
              }
            },
            update_all_types: true
          });
        } else {
          yield callCluster('indices.putMapping', {
            index: indexName,
            type: type.name,
            body: type.mapping,
            update_all_types: true
          });
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  return function ensureTypesExist(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
