var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var Popup = function (title, msg, callback, options) {
    var _this = this;
    var opts = options || {};
    this.domNode = $("<div class='popup'>");
    var okButton = $("<button class='btn btn-ok'>" + (opts.okMessage || "Ok") + "</button>");
    var cancelButton = $("<button class='btn btn-cancel'>" + (opts.cancelMessage || "Cancel") + "</button>");
    var titleNode = $("<div class='popup-title'>" + title + "</div>");
    var message = $("<div class='popup-msg'>" + msg + "</div>");
    var cover = this.cover = $("<div class='popup-cover'>");

    this.domNode.append(titleNode);

    if (!opts.html) {
        this.domNode.append(message);
    } else {
        this.domNode.append(opts.html);
    }

    if (opts.ok !== false) this.domNode.append(okButton);
    if (opts.cancel !== false) this.domNode.append(cancelButton);

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
    this.cover.addClass("popup-fade-out");
    window.setTimeout(function () {
        _this.cover.remove();
        _this.domNode.remove();
    }, 500);
};

module.exports = function (title, msg, callback, options) {
    return new Popup(title, msg, callback, options);
};