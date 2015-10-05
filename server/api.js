/**
 * Functions for api fetch
 */
(function() {
  'use strict';

  var weekly = require('./jsweekly');

  module.exports = function(app) {
    /**
     * Allows access to all origin
     */
    app.all('*', function(req, res, next) {

      // Specify the origin if you want to control the CORS origin
      res.header('Access-Control-Allow-Origin', '*');

      res.header('Access-Control-Allow-Methods', 'GET', 'POST');

      res.header('Access-Control-Allow-Headers', 'Content-Type');

      // Uncomment to allow with credentials. You'd need to give specific origin in that case
      //res.header('Access-Control-Allow-Credentials', true);
      next();
    });

    // Get's latest issue number
    app.get('/latest', function(req, res) {
      weekly.latest(function(obj) {
        res.send(obj);
      });
    });

    /**
     * Gets an issue
     */
    app.get('/issue/:issuenumber', function(req, res) {
      weekly.issue(req.params.issuenumber, function(obj) {
        res.send(obj);
      });
    });

    /**
     * Random count of articles
     */
    app.get('/random/:count', function(req, res) {
      weekly.random(req.params.count, function(obj) {
        res.send(obj);
      });
    });

    // Get's HTML content from a page URL
    app.get('/getHTML', function(req, res) {
      // URL sent to be parsed
      var url = req.query.url;
      if (url) {
        weekly.fetchContent(url, function(obj) {
          res.send(obj);
        });
      } else {
        res.status(500).json({
          error: 'URL not sent'
        });
      }
    });

  };

})();
