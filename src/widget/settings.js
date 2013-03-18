var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');
var SettingsProvider = require('../settingsProvider');

var Settings = function () {
    this.domNode = $("<div class='change-list settings flex-item'>");
    this.createField("Repo", "repo", "", "string");
    this.createField("Log limit", "logLimit", "15", "string");
    this.createField("Boolean test", "boolTest", true, "boolean");
};

util.inherits(Settings, EventEmitter);

Settings.prototype.createField = function (label, key, def, type) {
    var field, wrapper;
    wrapper = $("<label class='change-item' style='display: block'><span>" + label + ": </span></label>");
    if (type === "boolean") {
        field = $("<input type='checkbox' checked='" + SettingsProvider.getValue(key, def) + "'>");
        field[0].onclick = function () {
            SettingsProvider.setValue(key, field[0].checked);
        };
    } else if (type === "string") {
        field = $("<input type='text' value='" + SettingsProvider.getValue(key, def) + "'>");
        field[0].onblur = function () {
            SettingsProvider.setValue(key, field[0].value);
        };
    }
    wrapper.append(field);
    this.domNode.append(wrapper);

};

module.exports = function () {
    return new Settings();
};