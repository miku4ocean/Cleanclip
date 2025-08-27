/*
 * Simplified Readability.js for CleanClip
 * Extract main content from web pages
 */

(function() {
  'use strict';

  function Readability(doc) {
    this._doc = doc;
    this._articleTitle = '';
    this._articleContent = null;
  }

  Readability.prototype = {
    _getInnerText: function(e, normalizeSpaces) {
      normalizeSpaces = (typeof normalizeSpaces === 'undefined') ? true : normalizeSpaces;
      var textContent = e.textContent.trim();

      if (normalizeSpaces) {
        return textContent.replace(/\s{2,}/g, ' ');
      } else {
        return textContent;
      }
    },

    _getNodeAncestors: function(node, maxDepth) {
      maxDepth = maxDepth || 0;
      var i = 0, ancestors = [];
      while (node.parentNode) {
        ancestors.push(node.parentNode);
        if (maxDepth && ++i === maxDepth)
          break;
        node = node.parentNode;
      }
      return ancestors;
    },

    _grabArticle: function() {
      var doc = this._doc;
      var page = doc.body;
      var pageCacheHtml = page.innerHTML;

      var stripUnlikelyCandidates = true;
      var elementsToScore = [];
      var node = null;

      var nodesToScore = [];
      this._forEachNode(page.querySelectorAll("*"), function(node) {
        var matchString = node.className + ' ' + node.id;

        if (!this._isProbablyVisible(node)) {
          return;
        }

        if (stripUnlikelyCandidates) {
          if (/banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|foot|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i.test(matchString) &&
              !/and|article|body|column|main|shadow/i.test(matchString)) {
            return;
          }

          if (node.tagName === 'DIV' && /nav|navigation|menu/i.test(matchString)) {
            return;
          }
        }

        if (node.tagName === 'P' || node.tagName === 'TD' || node.tagName === 'PRE' || node.tagName === 'DIV') {
          nodesToScore.push(node);
        }
      }.bind(this));

      var candidates = [];
      this._forEachNode(nodesToScore, function(node) {
        if (!node.parentNode || typeof(node.parentNode.tagName) === 'undefined')
          return;

        var innerText = this._getInnerText(node);
        if (innerText.length < 25)
          return;

        var ancestors = this._getNodeAncestors(node, 5);
        if (ancestors.length === 0)
          return;

        var contentScore = 0;
        contentScore += 1;
        contentScore += innerText.split(',').length;
        contentScore += Math.min(Math.floor(innerText.length / 100), 3);

        this._forEachNode(ancestors, function(ancestor, level) {
          if (!ancestor.tagName || !ancestor.parentNode || typeof(ancestor.parentNode.tagName) === 'undefined')
            return;

          if (typeof(ancestor.readability) === 'undefined') {
            this._initializeNode(ancestor);
            candidates.push(ancestor);
          }

          var scoreDivider = level === 0 ? 1 : level === 1 ? 2 : level * 3;
          ancestor.readability.contentScore += contentScore / scoreDivider;
        }.bind(this));
      }.bind(this));

      var topCandidates = [];
      for (var c = 0, cl = candidates.length; c < cl; c += 1) {
        var candidate = candidates[c];
        var readability = candidate.readability;

        readability.contentScore = readability.contentScore * (1 - this._getLinkDensity(candidate));

        for (var t = 0; t < 5; t++) {
          var aTopCandidate = topCandidates[t];
          if (!aTopCandidate || readability.contentScore > aTopCandidate.readability.contentScore) {
            topCandidates.splice(t, 0, candidate);
            if (topCandidates.length > 5)
              topCandidates.pop();
            break;
          }
        }
      }

      var topCandidate = topCandidates[0];
      if (!topCandidate) {
        topCandidate = doc.createElement('DIV');
        topCandidate.innerHTML = page.innerHTML;
      }

      var articleContent = doc.createElement('DIV');
      articleContent.innerHTML = topCandidate.innerHTML;

      this._prepArticle(articleContent);

      return articleContent;
    },

    _initializeNode: function(node) {
      node.readability = {'contentScore': 0};

      switch (node.tagName) {
        case 'DIV':
          node.readability.contentScore += 5;
          break;

        case 'PRE':
        case 'TD':
        case 'BLOCKQUOTE':
          node.readability.contentScore += 3;
          break;

        case 'ADDRESS':
        case 'OL':
        case 'UL':
        case 'DL':
        case 'DD':
        case 'DT':
        case 'LI':
        case 'FORM':
          node.readability.contentScore -= 3;
          break;

        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'H6':
        case 'TH':
          node.readability.contentScore -= 5;
          break;
      }

      node.readability.contentScore += this._getClassWeight(node);
    },

    _getClassWeight: function(e) {
      var weight = 0;
      if (typeof(e.className) === 'string' && e.className !== '') {
        if (/-ad-|banner|combx|comment|community|cover-wrap|disqus|extra|foot|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup/i.test(e.className))
          weight -= 25;

        if (/article|body|column|main|shadow/i.test(e.className))
          weight += 25;
      }

      if (typeof(e.id) === 'string' && e.id !== '') {
        if (/-ad-|banner|combx|comment|community|cover-wrap|disqus|extra|foot|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup/i.test(e.id))
          weight -= 25;

        if (/article|body|column|main|shadow/i.test(e.id))
          weight += 25;
      }

      return weight;
    },

    _getLinkDensity: function(element) {
      var textLength = this._getInnerText(element).length;
      if (textLength === 0)
        return 0;

      var linkLength = 0;
      this._forEachNode(element.querySelectorAll('a'), function(linkNode) {
        linkLength += this._getInnerText(linkNode).length;
      }.bind(this));

      return linkLength / textLength;
    },

    _prepArticle: function(articleContent) {
      this._cleanStyles(articleContent);
      this._clean(articleContent, 'script');
      this._clean(articleContent, 'style');
      this._clean(articleContent, 'iframe');
      this._clean(articleContent, 'input');
      this._clean(articleContent, 'textarea');
      this._clean(articleContent, 'select');
      this._clean(articleContent, 'button');
      this._clean(articleContent, 'form');
      this._clean(articleContent, 'footer');
      this._clean(articleContent, 'nav');
    },

    _clean: function(e, tag) {
      var isEmbed = tag === 'object' || tag === 'embed' || tag === 'iframe';

      this._forEachNode(e.querySelectorAll(tag), function(element) {
        element.parentNode.removeChild(element);
      });
    },

    _cleanStyles: function(e) {
      if (!e || e.tagName.toLowerCase() === 'svg')
        return;

      for (var i = 0; i < e.attributes.length; i++) {
        var attribute = e.attributes[i];
        if (attribute.name !== 'class' && attribute.name !== 'id') {
          e.removeAttribute(attribute.name);
          i--;
        }
      }

      this._forEachNode(e.children, function(node) {
        this._cleanStyles(node);
      }.bind(this));
    },

    _isProbablyVisible: function(node) {
      return (!node.style || node.style.display !== 'none') &&
             !node.hasAttribute('hidden') &&
             (!node.hasAttribute('aria-hidden') || node.getAttribute('aria-hidden') !== 'true');
    },

    _forEachNode: function(nodeList, fn) {
      Array.prototype.forEach.call(nodeList, fn, this);
    },

    parse: function() {
      var doc = this._doc;
      
      // Get title
      var title = doc.querySelector('title');
      this._articleTitle = title ? title.textContent.trim() : '';

      // Get main content
      this._articleContent = this._grabArticle();

      return {
        title: this._articleTitle,
        content: this._articleContent,
        textContent: this._getInnerText(this._articleContent),
        length: this._getInnerText(this._articleContent).length
      };
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Readability;
  } else {
    window.Readability = Readability;
  }
})();