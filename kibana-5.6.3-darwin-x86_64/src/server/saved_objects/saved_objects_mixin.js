'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.savedObjectsMixin = savedObjectsMixin;

var _client = require('./client');

var _routes = require('./routes');

function savedObjectsMixin(kbnServer, server) {
  const prereqs = {
    getSavedObjectsClient: {
      assign: 'savedObjectsClient',
      method(req, reply) {
        reply(req.getSavedObjectsClient());
      }
    }
  };

  server.route((0, _routes.createBulkGetRoute)(prereqs));
  server.route((0, _routes.createCreateRoute)(prereqs));
  server.route((0, _routes.createDeleteRoute)(prereqs));
  server.route((0, _routes.createFindRoute)(prereqs));
  server.route((0, _routes.createGetRoute)(prereqs));
  server.route((0, _routes.createUpdateRoute)(prereqs));

  server.decorate('server', 'savedObjectsClientFactory', ({ callCluster }) => {
    return new _client.SavedObjectsClient(server.config().get('kibana.index'), kbnServer.uiExports.mappings.getCombined(), callCluster);
  });

  const savedObjectsClientCache = new WeakMap();
  server.decorate('request', 'getSavedObjectsClient', function () {
    const request = this;

    if (savedObjectsClientCache.has(request)) {
      return savedObjectsClientCache.get(request);
    }

    var _server$plugins$elast = server.plugins.elasticsearch.getCluster('admin');

    const callWithRequest = _server$plugins$elast.callWithRequest;

    const callCluster = (...args) => callWithRequest(request, ...args);
    const savedObjectsClient = server.savedObjectsClientFactory({ callCluster });

    savedObjectsClientCache.set(request, savedObjectsClient);
    return savedObjectsClient;
  });
}
