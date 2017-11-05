'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorateBadRequestError = decorateBadRequestError;
exports.isBadRequestError = isBadRequestError;
exports.decorateNotAuthorizedError = decorateNotAuthorizedError;
exports.isNotAuthorizedError = isNotAuthorizedError;
exports.decorateForbiddenError = decorateForbiddenError;
exports.isForbiddenError = isForbiddenError;
exports.decorateNotFoundError = decorateNotFoundError;
exports.isNotFoundError = isNotFoundError;
exports.decorateConflictError = decorateConflictError;
exports.isConflictError = isConflictError;
exports.decorateEsUnavailableError = decorateEsUnavailableError;
exports.isEsUnavailableError = isEsUnavailableError;
exports.decorateGeneralError = decorateGeneralError;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const code = Symbol('SavedObjectsClientErrorCode');

function decorate(error, errorCode, statusCode, message) {
  const boom = _boom2.default.boomify(error, {
    statusCode,
    message,
    override: false
  });

  boom[code] = errorCode;

  return boom;
}

// 400 - badRequest
const CODE_BAD_REQUEST = 'SavedObjectsClient/badRequest';
function decorateBadRequestError(error, reason) {
  return decorate(error, CODE_BAD_REQUEST, 400, reason);
}
function isBadRequestError(error) {
  return error && error[code] === CODE_BAD_REQUEST;
}

// 401 - Not Authorized
const CODE_NOT_AUTHORIZED = 'SavedObjectsClient/notAuthorized';
function decorateNotAuthorizedError(error, reason) {
  return decorate(error, CODE_NOT_AUTHORIZED, 401, reason);
}
function isNotAuthorizedError(error) {
  return error && error[code] === CODE_NOT_AUTHORIZED;
}

// 403 - Forbidden
const CODE_FORBIDDEN = 'SavedObjectsClient/forbidden';
function decorateForbiddenError(error, reason) {
  return decorate(error, CODE_FORBIDDEN, 403, reason);
}
function isForbiddenError(error) {
  return error && error[code] === CODE_FORBIDDEN;
}

// 404 - Not Found
const CODE_NOT_FOUND = 'SavedObjectsClient/notFound';
function decorateNotFoundError(error, reason) {
  return decorate(error, CODE_NOT_FOUND, 404, reason);
}
function isNotFoundError(error) {
  return error && error[code] === CODE_NOT_FOUND;
}

// 409 - Conflict
const CODE_CONFLICT = 'SavedObjectsClient/conflict';
function decorateConflictError(error, reason) {
  return decorate(error, CODE_CONFLICT, 409, reason);
}
function isConflictError(error) {
  return error && error[code] === CODE_CONFLICT;
}

// 500 - Es Unavailable
const CODE_ES_UNAVAILABLE = 'SavedObjectsClient/esUnavailable';
function decorateEsUnavailableError(error, reason) {
  return decorate(error, CODE_ES_UNAVAILABLE, 503, reason);
}
function isEsUnavailableError(error) {
  return error && error[code] === CODE_ES_UNAVAILABLE;
}

// 500 - General Error
const CODE_GENERAL_ERROR = 'SavedObjectsClient/generalError';
function decorateGeneralError(error, reason) {
  return decorate(error, CODE_GENERAL_ERROR, 500, reason);
}
