var _ = require('underscore');
require('date-utils');
var util = require('util');

var SettingsProvider = function () { };

SettingsProvider.prototype.getValue = function (key, def) {
    var val = window.localStorage[key];
    return val !== undefined ? JSON.parse(val) : def;
};

SettingsProvider.prototype.setValue = function (key, value) {
    return (window.localStorage[key] = JSON.stringify(value));
};

module.exports = new SettingsProvider();