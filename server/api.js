/**
 * Functions for api fetch
 */
(function () {
  'use strict';

  var path = require('path'),
    fetchParse = require('./fetchParse');

  module.exports = function (app) {
    app.get('/', function (req, res) {
      res.sendFile(path.join(__dirname + '/public/index.html'));
    });

    // Get's latest issue number
    app.get('/latest', function (req, res) {
      fetchParse.latest(function (obj) {
        res.send(obj);
      });
    });

    app.get('/issue/:issuenumber', function (req, res) {
      fetchParse.issue(req.params.issuenumber, function (obj) {
        res.send(obj);
      });
    });

  };

})();