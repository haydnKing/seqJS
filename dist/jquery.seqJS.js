/*! Seqjs - v0.1.0 - 2014-04-09
* https://github.com/haydnKing/seqJS
* Copyright (c) 2014 Haydn King; Licensed MIT */
(function($) {

  // Collection method.
  $.fn.seqJS = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.seqJS = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.seqJS.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.seqJS.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].seqJS = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
