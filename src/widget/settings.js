var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var Settings = function () {
    this.domNode = $("<div class='change-list settings'>");
    this.createField("Repo", "repo", "", "string");
    this.createField("Log limit", "logLimit", "15", "string");
    this.createField("Boolean test", "boolTest", true, "boolean");
};

util.inherits(Settings, EventEmitter);

Settings.prototype.createField = function (label, key, def, type) {
    var field, wrapper, _this = this;
    wrapper = $("<label class='change-item' style='display: block'><span>" + label + ": </span></label>");
    if (type === "boolean") {
        field = $("<input type='checkbox' checked='" + _this.getValue(key, def) + "'>");
        field[0].onclick = function () {
            _this.setValue(key, field[0].checked);
        };
    } else if (type === "string") {
        field = $("<input type='text' value='" + _this.getValue(key, def) + "'>");
        field[0].onblur = function () {
            _this.setValue(key, field[0].value);
        };
    }
    wrapper.append(field);
    this.domNode.append(wrapper);
};

Settings.prototype.getValue = function (key, def) {
    var val = window.localStorage[key];
    return val !== undefined ? JSON.parse(val) : def;
};

Settings.prototype.setValue = function (key, value) {
    return (window.localStorage[key] = JSON.stringify(value));
};

module.exports = function () {
    return new Settings();
};