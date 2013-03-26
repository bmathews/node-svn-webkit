var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

var FrameBar = function () {
    var _this = this,
        win = gui.Window.get(),
        container = $('<div class="framebar">'),
        tools = $('<div class="tools">')
            .appendTo(container),
        close = $('<div class="close">X</div>')
            .on('click', function () {
                win.close();
            })
            .appendTo(tools);
        min = $('<div class="min">_</div>')
            .on('click', function () {
                win.minimize();
            })
            .appendTo(tools),
        max = $('<div class="max">+</div>')
            .on('click', function () {
                win.maximize();
            })
            .appendTo(tools);

    switch (process.platform) {
        case "win32":
            container.addClass("windows");
            break;
        case "darwin":
            container.addClass("osx");
            break;
        case "linux":
            container.addClass("linux");
            break;
    }

    this.domNode = container;
};

util.inherits(FrameBar, EventEmitter);

module.exports = function (svn) {
    return new FrameBar(svn);
};