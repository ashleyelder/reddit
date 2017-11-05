'use strict';

var _jest = require('jest');

var _jest2 = _interopRequireDefault(_jest);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = process.argv.slice(2);

argv.push('--config', (0, _path.resolve)(__dirname, './config.json'));

_jest2.default.run(argv);
