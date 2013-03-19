var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');
var SettingsProvider = require('../settingsProvider');

var Settings = function () {
    this.domNode = $("<div class='change-list settings flex-item'>");
    this.createField("Repo", "repo", "", "string");
    this.createField("Log limit", "logLimit", "15", "string");
    this.createField("Sync Refresh Interval (in seconds)", "syncRefreshInterval", "60", "string");
    this.createField("Editor Theme", "editorTheme", "", "select",
                     ["default", "ambiance", "blackboard", "cobalt", "eclipse", "elegant", "erlang-dark", "lesser-dark", "monokai", "neat", "night", "rubyblue", "solarized dark", "solarized light", "twilight", "vibrant-ink", "xq-dark"]
                     );
};

util.inherits(Settings, EventEmitter);

Settings.prototype.createField = function (label, key, def, type, options) {
    var field, wrapper, currentValue = SettingsProvider.getValue(key, def);
    wrapper = $("<label class='change-item' style='display: block'><span>" + label + ": </span></label>");
    if (type === "boolean") {
        field = $("<input type='checkbox' checked='" + currentValue + "'>");
        field[0].onclick = function () {
            SettingsProvider.setValue(key, field[0].checked);
        };
    } else if (type === "string") {
        field = $("<input type='text' value='" + currentValue + "'>");
        field[0].onblur = function () {
            SettingsProvider.setValue(key, field[0].value);
        };
    } else if (type === "select") {
        field = $("<select>");
        options.forEach(function (opt) {
            var el = $('<option>' + opt + '</option>');
            field.append(el);
            if (opt === currentValue) {
                el.attr('selected', true);
            }
        });
        field.on('change', function () {
            SettingsProvider.setValue(key, options[field[0].selectedIndex]);
        });
    }
    wrapper.append(field);
    this.domNode.append(wrapper);

};

module.exports = function () {
    return new Settings();
};