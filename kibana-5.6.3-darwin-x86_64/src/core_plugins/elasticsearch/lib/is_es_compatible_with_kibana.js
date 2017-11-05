'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isEsCompatibleWithKibana;

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isEsCompatibleWithKibana(esVersion, kibanaVersion) {
  const esVersionNumbers = {
    major: _semver2.default.major(esVersion),
    minor: _semver2.default.minor(esVersion),
    patch: _semver2.default.patch(esVersion)
  };

  const kibanaVersionNumbers = {
    major: _semver2.default.major(kibanaVersion),
    minor: _semver2.default.minor(kibanaVersion),
    patch: _semver2.default.patch(kibanaVersion)
  };

  // Accept the next major version of ES.
  if (esVersionNumbers.major === kibanaVersionNumbers.major + 1) {
    return true;
  }

  // Reject any other major version mismatches with ES.
  if (esVersionNumbers.major !== kibanaVersionNumbers.major) {
    return false;
  }

  // Reject older minor versions of ES.
  if (esVersionNumbers.minor < kibanaVersionNumbers.minor) {
    return false;
  }

  return true;
} /**
   * Determines whether the version of Kibana is compatible with the version of
   * Elasticsearch. Compatibility means that the versions are expected to behave
   * at least satisfactorily together. Incompatible versions likely won't work at
   * all.
   */

module.exports = exports['default'];
