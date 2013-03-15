var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

var Toolbar = function () {
    var _this = this,
        container = $('<div class="toolbar">');

    this.domNode = container;
};

util.inherits(Toolbar, EventEmitter);


module.exports = function () {
    return new Toolbar();
};