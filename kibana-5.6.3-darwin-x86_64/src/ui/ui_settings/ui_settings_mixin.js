'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.uiSettingsMixin = uiSettingsMixin;

var _ui_settings_service_factory = require('./ui_settings_service_factory');

var _ui_settings_service_for_request = require('./ui_settings_service_for_request');

var _mirror_status = require('./mirror_status');

var _ui_exports_consumer = require('./ui_exports_consumer');

var _routes = require('./routes');

function uiSettingsMixin(kbnServer, server, config) {
  const status = kbnServer.status.create('ui settings');

  // reads the "uiSettingDefaults" from uiExports
  const uiExportsConsumer = new _ui_exports_consumer.UiExportsConsumer();
  kbnServer.uiExports.addConsumer(uiExportsConsumer);

  if (!config.get('uiSettings.enabled')) {
    status.disabled('uiSettings.enabled config is set to `false`');
    return;
  }

  // Passed to the UiSettingsService.
  // UiSettingsService calls the function before trying to read data from
  // elasticsearch, giving us a chance to prevent it from happening.
  //
  // If the ui settings status isn't green we shouldn't be attempting to get
  // user settings, since we can't be sure that all the necessary conditions
  // (e.g. elasticsearch being available) are met.
  const readInterceptor = () => {
    if (status.state !== 'green') {
      return {};
    }
  };

  const getDefaults = () => uiExportsConsumer.getUiSettingDefaults();

  // don't return, just let it happen when the plugins are ready
  kbnServer.ready().then(() => {
    (0, _mirror_status.mirrorStatus)(status, kbnServer.status.getForPluginId('elasticsearch'));
  });

  server.decorate('server', 'uiSettingsServiceFactory', (options = {}) => {
    return (0, _ui_settings_service_factory.uiSettingsServiceFactory)(server, _extends({
      getDefaults
    }, options));
  });

  server.decorate('request', 'getUiSettingsService', function () {
    return (0, _ui_settings_service_for_request.getUiSettingsServiceForRequest)(server, this, {
      getDefaults,
      readInterceptor
    });
  });

  server.decorate('server', 'uiSettings', () => {
    throw new Error(`
      server.uiSettings has been removed, see https://github.com/elastic/kibana/pull/12243.
    `);
  });

  server.route(_routes.deleteRoute);
  server.route(_routes.getRoute);
  server.route(_routes.setManyRoute);
  server.route(_routes.setRoute);
}
