/**
 * Functions for api fetch
 */
(function() {
  'use strict';

  var weekly = require('./jsweekly');

  module.exports = function(app) {
    // Get's latest issue number
    app.get('/latest', function(req, res) {
      weekly.latest(function(obj) {
        res.send(obj);
      });
    });

    app.get('/issue/:issuenumber', function(req, res) {
      weekly.issue(req.params.issuenumber, function(obj) {
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
