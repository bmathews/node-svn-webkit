var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var Browse = function (svn) {
    this.svn = svn;
    var _this = this;
    this.domNode = $("<div class='browse flex-item'>");

    var tree = $('<div class="panel">');

    tree.fileTree({ root: svn.repoRoot }, function (path) {
        // console.log(path);
    }, function (path, evt) {
        _this.handlePathContextMenu(path, evt);
    });

    this.domNode.append(tree);
};

util.inherits(Browse, EventEmitter);

Browse.prototype.handlePathContextMenu = function (path, evt) {
    var _this = this;
    var menu = new gui.Menu();

    menu.append(new gui.MenuItem({
        label: 'Show History',
        click: function () {
            var relPath = path.replace(_this.svn.repoRoot, "");
            global.App.router.showHistory(relPath);
        }
    }));

    menu.popup(evt.clientX, evt.clientY);
};

module.exports = function (svn) {
    return new Browse(svn);
};