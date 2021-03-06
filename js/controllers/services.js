/*
 Copyright 2015 Skippbox, Ltd

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

kuiApp.factory('contextService', function (config, $rootScope, $location, $filter) {
    var kClientLib = require('node-kubernetes-client');
    var contextService = {};

    var selectedURL = null;
    var host = null;
    var protocol = null;
    contexts = config.Contexts;

    contextService.setSelectedURL = function (context_name, $rootScope) {
        selectedContext = $filter('filter')(contexts, {name: context_name.name})[0];
        selectedURL = selectedContext.cluster.server;
        protocol = selectedURL.substring(0, selectedURL.indexOf('//') - 1);
        host = selectedURL.substring(selectedURL.indexOf('//') + 2);
        token = selectedContext.user.token;
        contextService.createConnection();
    }

    contextService.getWebSocket = function (resourcePlural) {
        return new WebSocket("ws://" + contextService.getHost() + "/api/v1/namespaces/default/" + resourcePlural  + "?watch=true");
    }

    contextService.createConnection = function () {
        $rootScope.client = new kClientLib({
            "protocol": contextService.getProtocol(),
            "host": contextService.getHost(),
            "version": "v1",
            "token": contextService.getToken(),
            "namespace": "default"
        });
    }

    contextService.getConnection = function () {
        return $rootScope.client;
    }

    contextService.getSelectedURL = function () {
        return selectedURL;
    }

    contextService.getProtocol = function () {
        return protocol;
    }

    contextService.getHost = function () {
        return host;
    }

    contextService.getToken = function() {
        return token;
    }

    return contextService;
});


kuiApp.factory('k8s', function ($resource, contextService) {
    /*
     Pods: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/pods/:name', {}, {
     query: { method: 'GET' },
     del: { method: 'DELETE', params: {name: '@name'} }
     }
     ),
     */

    return {
        Services: $resource(contextService.getSelectedURL() + '/api/v1/namespaces/default/services/:name'),
        Replicationcontrollers: $resource(contextService.getSelectedURL() + '/api/v1/namespaces/default/replicationcontrollers/:name'),
        Namespaces: $resource(contextService.getSelectedURL() + '/api/v1/namespaces/:name'),
        Nodes: $resource(contextService.getSelectedURL() + '/api/v1/nodes/:name'),
        Secrets: $resource(contextService.getSelectedURL() + '/api/v1/namespaces/default/secrets/:name'),
        Resourcequotas: $resource(contextService.getSelectedURL() + '/api/v1/namespaces/default/resourcequotas/:name')
    };
});


kuiApp.factory('config', function ($filter) {
    yaml = require('js-yaml');
    fs = require('fs');

    // Get document, or throw exception on error
    try {
        config = yaml.safeLoad(fs.readFileSync('config.sample', 'utf8'));
    } catch (e) {
        console.log(e);
        return;
    }

    var contexts = [];
    var users = [];
    var clusters = [];

    angular.forEach(config.users, function (value, key) {
        var user = {};
        user.name = value.name;
        user.password = value.user.password;
        user.username = value.user.username;
        user.token = value.user.token;
        user.client_key = value.user['client-key'];
        user.client_certificate = value.user['client-certificate'];
        users.push(user);
    });

    angular.forEach(config.clusters, function (value, key) {
        var cluster = {};
        cluster.name = value.name;
        cluster.server = value.cluster.server;
        if (typeof value.cluster["certificate-authority"] != 'undefined') {
            cluster.certificate_authority = value.cluster["certificate-authority"];
        }
        if (typeof value.cluster["api-version"] != 'undefined') {
            cluster.api_version = value.cluster["api-version"];
        }
        //if (typeof value.cluster["insecure-skip-tls-verify"] != 'undefined') {
        cluster.insecure_skip_tls_verify = value.cluster["insecure-skip-tls-verify"];
        //}
        clusters.push(cluster);
    });

    angular.forEach(config.contexts, function (value, key) {
        var context = {};
        context.name = value.name;
        if (value.context.cluster == "") {
            context.cluster = "";
        } else {
            context.cluster = $filter('filter')(clusters, {name: value.context.cluster})[0];
        }
        if (value.context.user == "") {
            context.user = "";
        } else {
            context.user = $filter('filter')(users, {name: value.context.user})[0];
        }
        contexts.push(context);
    });

    return {
        Contexts: contexts,
        Users: users,
        Clusters: clusters
    };
});

kuiApp.factory('appstore', function ($q) {

  GitHubApi = require("github");
  github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    timeout: 5000,
  });

  getCommits = function ( callback ) {

    github.repos.getCommits({
      user: "skippbox",
      repo: "appstore"
    }, function(err, res) {
           if (!err)
            {
                callback(err, res[0].sha);
            }
            else {
                callback(err, null);
            }
        });
  };

  getRepo = function ( callback ) {

    github.repos.get({
        user: "skippbox",
        repo: "appstore"
        }, function(err, res) {
           if (!err)
            {
                callback(err, res);
            }
            else {
                callback(err, null);
            }
      });
  };

  getTree = function ( sha, callback ) {

      github.gitdata.getTree({
        user: "skippbox",
        repo: "appstore",
        sha: sha
        }, function(err, tree) {
           if (!err)
            {
                callback(err, tree);
            }
            else {
                callback(err, null);
            }
      });  
  };

  return {
    getCommits: getCommits,
    getRepo: getRepo,
    getTree: getTree,
  };
});


