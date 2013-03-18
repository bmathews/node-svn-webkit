var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var Browse = function (svn) {
    this.domNode = $("<div class='change-list browse flex-item'>");

    var tree = $('<div>');

    tree.fileTree({ root: svn.repoRoot }, function (path) {
        console.log(path);
    });

    this.domNode.append(tree);
};

util.inherits(Browse, EventEmitter);

module.exports = function (svn) {
    return new Browse(svn);
};