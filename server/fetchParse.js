/**
 * fetchParse.js
 * Provides all fetching and parsing functions
 */
(function () {
  'use strict';

  var $ = {},
    request = require('request'),
    cheerio = require('cheerio'),
    config = require('./config.json');

  module.exports = {
    /**
     * Converts html to parsable object
     * @param   {String} html HTML to be parsed
     * @returns {Object} Parsed HTML
     */
    loadParser: function (html) {
      $ = cheerio.load(html);
    },

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
     * Gets issue number for a parsed issue html
     * @param   {Object} $ Parse HTML object
     * @returns {Number} Issue Number
     */
    getIssueNumber: function () {
      var title = config.err.ERR1;
      try {
        // First integer is taken as the title
        title = parseInt($('title').text().match(/\d+/)[0], 10) || title;
      } finally {
        return title;
      }
    },

    /**
     * Gets issue date for a parsed issue html
     * @returns {String} Date string
     */
    getIssueDate: function () {
      var date = config.err.ERR3;
      try {
        date = $('title').text().match(/(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec).*/i)[0] || date;
      } finally {
        return date;
      }
    },

    /**
     * Checks if anchor node is a valid article Anchor
     * @param   {Object} anchor Anchor object
     * @returns {Boolean} Is article
     */
    isValidArticle: function (anchor) {
      var isValid = false;
      try {
        var anchorHref = $(anchor).attr('href');
        // Contains the identifier and contains a text
        isValid = anchorHref && anchorHref.indexOf(config.identifier) !== -1 && $(anchor).text();
      } finally {
        return isValid;
      }
    },

    filterJob: function () {

    },

    filterSponsored: function () {

    },

    /**
     * Gets article title from the anchor
     * @param   {Object} anchor
     * @returns {String} Title
     */
    getArticleTitle: function (anchor) {
      return $(anchor).text();
    },

    /**
     * Gets link for the anchor
     * @param   {Object} anchor
     * @returns {String} Link
     */
    getArticleLink: function (anchor) {
      return $(anchor).attr('href');
    },

    /**
     * Get's an article summary text and others
     * @param   {[[Type]]} anchor [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    getArticleSnippets: function (anchor) {
      // --- td as parent is not selecting whole region, try with tbody---
      var parent = $(anchor).parent('td') || $(anchor).parent('li');
      var articleText = this.getArticleTitle(anchor);
      
      return parent.text().split('\n').filter(function (item) {
        // Filter empty text nodes and node containing the article text
        return item.trim() && item.indexOf(articleText) === -1;
      }).map(function (item) {
        // Trim spaces
        return item.trim();
      });
    },

    /**
     * Gets all articles for the issue
     * @returns {Array} Articles array
     */
    getArticles: function () {

      var index, anchor, allAnchors = $('a'),
        articles = [];

      for (index in allAnchors) {
        anchor = allAnchors[index];
        if (this.isValidArticle(anchor)) {
          articles.push({
            title: this.getArticleTitle(anchor),
            href: this.getArticleLink(anchor),
            snippet: this.getArticleSnippets(anchor)
          });
        }
      }

      return articles;
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
          // Set the parser
          self.loadParser(html);
          cb({
            issueNumber: self.getIssueNumber(),
            issueDate: self.getIssueDate(),
            articles: self.getArticles()
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