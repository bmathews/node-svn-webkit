var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var Browse = function (svn) {
    this.domNode = $("<div class='browse flex-item'>");

    var tree = $('<div class="panel">');

    tree.fileTree({ root: svn.repoRoot }, function (path) {
        console.log(path);
    });

    this.domNode.append(tree);
};

util.inherits(Browse, EventEmitter);

module.exports = function (svn) {
    return new Browse(svn);
};