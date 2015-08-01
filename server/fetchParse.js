/**
 * fetchParse.js
 * Provides all fetching and parsing functions
 */
(function () {
  'use strict';

  var request = require('request'),
    cheerio = require('cheerio'),
    config = require('./config.json');

  module.exports = {
    /**
     * Fetches HTML content from a URL
     * @param {String} url URL to be fetched
     * @param {Function} cb Callback to send data
     */
    fetch: function (url, cb) {
      request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          cb(null, body);
        } else if (error) {
          cb(config.err.ERR2, null);
        }
      });
    },

    /**
     * Converts html to parsable object
     * @param   {String} html HTML to be parsed
     * @returns {Object} Parsed HTML
     */
    cheeriofy: function (html) {
      var $ = '';
      try {
        $ = cheerio.load(html);
      } finally {
        return $;
      }
    },

    /**
     * Gets issue number for a parse issue html
     * @param   {Object} $ Parse HTML object
     * @returns {Number} Issue Number
     */
    getIssueNumber: function ($) {
      var title = config.err.ERR1;
      try {
        // First integer is taken as the title
        title = parseInt($('title').text().match(/\d+/)[0], 10) || title;
      } finally {
        return title;
      }
    },

    /**
     * [[Description]]
     * @param   {[[Type]]} $ [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    getIssueDate: function ($) {
      var date = config.err.ERR3;
      try {
        date = $('title').text().match(/(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec).*/i)[0] || date;
      } finally {
        return date;
      }
    },

    /**
     * Fetches an issue details
     * @param {Number} issueNumber Issue Number
     * @param {Object} cb issue accessing callback
     */
    issue: function (issueNumber, cb) {
      var self = this,
        fetchURL = issueNumber ? config.issueRoot + issueNumber : config.latest;

      this.fetch(fetchURL, function (err, html) {
        if (err) {
          cb({
            err: err
          });
        } else {
          var $ = self.cheeriofy(html);
          cb({
            issueNumber: self.getIssueNumber($),
            issueDate: self.getIssueDate($)
          });
        }
      });
    },

    /**
     * Fetches the latest issue details
     * @param {Object} cb Latest issue accessing callback
     */
    latest: function (cb) {
      this.issue(null, cb);
    }

  };

})();