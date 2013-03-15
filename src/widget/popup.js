var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var Popup = function (title, msg, callback) {
    var _this = this;
    this.domNode = $("<div class='popup'>");
    var okButton = $("<button class='btn btn-ok'>Ok</button>");
    var cancelButton = $("<button class='btn btn-cancel'>Cancel</button>");
    var titleNode = $("<div class='popup-title'>" + title + "</div>");
    var message = $("<div class='popup-msg'>" + msg + "</div>");
    var cover = this.cover = $("<div class='popup-cover'>");

    this.domNode.append(titleNode).append(message).append(okButton).append(cancelButton);

    okButton.click(function () {
        callback(true);
        _this.close();
    });

    cancelButton.click(function () {
        callback(false);
        _this.close();
    });
    $(window.document.body).append(cover);
    cover.append(this.domNode);
};


util.inherits(Popup, EventEmitter);

Popup.prototype.close = function () {
    var _this = this;
    // _this.domNode.remove();
    // cover.remove();
    this.cover.addClass("popup-fade-out");
    window.setTimeout(function () {
        _this.cover.remove();
        _this.domNode.remove();
    }, 500);
};

module.exports = function (title, msg, callback) {
    return new Popup(title, msg, callback);
};