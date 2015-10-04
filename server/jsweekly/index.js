/**
 * fetchParse.js
 * Provides all fetching and parsing functions
 */
(function() {
  'use strict';

  var $ = {},
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    cheerio = require('cheerio'),
    unfluff = require('unfluff'),
    config = require('./config.json');

  var _private = {
    /**
     * Converts html to parsable object
     * @param   {String} html HTML to be parsed
     * @returns {Object} Parsed HTML
     */
    loadParser: function(html) {
      $ = cheerio.load(html);
    },

    /**
     * Fetches HTML content from a URL
     * @param {String} url URL to be fetched
     * @param {Function} cb Callback to send data
     */
    fetch: function(url, cb) {
      request(url, function(error, response, body) {
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
    getIssueNumber: function() {
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
    getIssueDate: function() {
      var date = config.err.ERR3;
      try {
        date = $('title').text().match(/(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec).*/i)[0] || date;
      } finally {
        return date;
      }
    },

    /**
     * Checks if the anchor is in allowed List
     * @param   {String} anchorHref Anchors Href
     * @returns {Boolean} Is Anchor valid
     */
    inAllowedList: function(anchorHref) {
      var isValid = false;

      config.allowedLinks.forEach(function(link) {
        if (anchorHref.indexOf(link) !== -1) {
          isValid = true;
          return false;
        }
      });

      return isValid;
    },

    /**
     * Checks if anchor node is a valid article Anchor
     * @param   {Object} anchor Anchor object
     * @returns {Boolean} Is article
     */
    isValidArticle: function(anchor) {
      var isValid = false;
      try {
        var anchorHref = $(anchor).attr('href');
        // Contains the identifier and contains a text
        isValid = (anchorHref && anchorHref.indexOf(config.identifier) !== -1 && $(anchor).text()) || this.inAllowedList(anchorHref);
      } finally {
        return isValid;
      }
    },

    /**
     * Gets article title from the anchor
     * @param   {Object} anchor
     * @returns {String} Title
     */
    getArticleTitle: function(anchor) {
      return $(anchor).text();
    },

    /**
     * Gets link for the anchor
     * @param   {Object} anchor
     * @returns {String} Link
     */
    getArticleLink: function(anchor) {
      return $(anchor).attr('href');
    },

    /**
     * Cleans a text; removes special characters and spaces from the edges
     * @param   {String}   text  String to be cleaned
     * @param   {String} clear Text to be removed from the string
     * @returns {String} Cleaned string
     */
    getCleanText: function(text, clear) {
      return text.replace(clear, '').replace(/^\W+|\W+$/g, '').trim('\n');
    },


    /**
     * Predicts article text, tags and publisher
     * @param   {Array} snippetArr Array containing snippet texts
     * @returns {Object} Article Text, tags and publisher
     */
    predictDetails: function(snippetArr) {

      var article = {
          text: '',
          tags: [],
          publisher: '',
          unpredicted: []
        },
        length = snippetArr.length;

      snippetArr.forEach(function(arrText, index) {
        if (arrText.length > config.minArticleSummaryLen && arrText > article.text) {
          article.text = arrText;
        } else if (length <= 2 || index === length - 1) {
          article.publisher = arrText;
        } else if (index < length && !arrText.match(/\s/)) {
          article.tags.push(arrText);
        } else {
          article.unpredicted.push(arrText);
        }
      });

      return article;
    },

    /**
     * Get's an article summary text and others
     * @param   {[[Type]]} anchor [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    getArticleSnippets: function(anchor) {
      var self = this;
      // Assumes that all anchors are contained within a 'li' or 'table'
      var liParent = $(anchor).closest('li');
      var tableParent = $(anchor).closest('table');

      var parent = (liParent.length && liParent) || (tableParent.length && tableParent);
      var articleText = this.getArticleTitle(anchor);

      var snippetArr = [];

      // If 'li' snippet is children content
      if (liParent.length && liParent) {
        var children = parent.children(),
          text;

        for (var index = 0; index < children.length; index++) {
          text = this.getCleanText($(children[index]).text(), articleText);
          if (text) {
            snippetArr.push(text);
          }
        }
      } else { // for 'table' content
        snippetArr = parent.text().split('\n').filter(function(item) {
          return self.getCleanText(item, articleText);
        }).map(function(item) {
          return self.getCleanText(item, articleText);
        });
      }

      return this.predictDetails(snippetArr);
    },

    /**
     * Gets all articles for the issue
     * @returns {Array} Articles array
     */
    getArticles: function() {

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
     * Checks if an issue is already cached, if so, returns the issue object
     * @param  {String}   issueNo Issue Number
     * @param  {Function} cb  Callback function to return the issue status
     */
    isIssueCached: function(issueNo, cb) {
      fs.readFile(path.join(__dirname, 'filecache/' + issueNo + '.json'), 'utf8', function(err, data) {
        if (err) {
          cb(err);
        } else {
          cb(null, data);
        }
      });
    },

    /**
     * Creates a copy of parsed issue. This avoids further web scrapping
     */
    cacheIssue: function(issueNo, issueObj) {
      fs.writeFile(path.join(__dirname, 'filecache/' + issueNo + '.json'), JSON.stringify(issueObj), function(err) {
        if (err) {
          return console.log(err);
        }
      });
    }
  };

  module.exports = {

    /**
     * Fetches an issue details
     * @param {Number} issueNumber Issue Number
     * @param {Object} cb issue accessing callback
     */
    issue: function(issueNumber, cb) {
      var issueObj;
      var fetchURL = (issueNumber && issueNumber !== 'latest') ? config.issueRoot + issueNumber : config.latest;

      _private.isIssueCached(issueNumber, function(err, data) {
        // If the issue is already cached, retun the cache data
        if (data) {
          cb(JSON.parse(data));
        } else {
          // Else fetch fresh data
          _private.fetch(fetchURL, function(err, html) {
            if (err) {
              cb({
                error: err
              });
            } else {
              // Set the parser
              _private.loadParser(html);
              issueObj = {
                issueNumber: _private.getIssueNumber(),
                issueDate: _private.getIssueDate(),
                issueURL: fetchURL,
                articles: _private.getArticles()
              };

              // Cache the fetched issue
              _private.cacheIssue(issueObj.issueNumber, issueObj);
              cb(issueObj);
            }
          });
        }
      });
    },

    /**
     * Fetches the latest issue details
     * @param {Object} cb Latest issue accessing callback
     */
    latest: function(cb) {
      this.issue(null, cb);
    },

    /**
     * Fetches content from a url
     * @param  {String} url URL
     * @param  {Function} cb  Callback function
     */
    fetchContent: function(url, cb) {
      var parsedObj = {};
      _private.fetch(url, function(err, html) {
        if (err) {
          cb({
            error: err
          });
        } else {
          parsedObj = unfluff(html);
          cb(parsedObj);
        }
      });
    }

  };

})();
