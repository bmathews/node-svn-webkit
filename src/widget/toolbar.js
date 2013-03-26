var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

function createButton (text, btnClass, iconClass, dir) {
    var button = $('<button class="btn ' + btnClass + '" style="float: ' + dir + ';"><span class="btnText">' +  text + '</span><i class="' + iconClass + '"></i></button>');
    return button;
}

var Toolbar = function (args) {
    args = args || {};
    var _this = this,
        container = $('<div class="toolbar">');

    this.domNode = container;
    this._syncState = args.syncState;

    this.backButton = createButton("", "", "icon-white icon-arrow-left", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.back();
        });

    this.forwardButton = createButton("", "", "icon-white icon-arrow-right", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.forward();
        });

    this.updateButton = createButton("Branch In Sync", "syncButton", "icon-white icon-refresh", "right")
        .appendTo(container)
        .on("click", function () {
            _this.emit("svnUpdate");
        });

    this.settingsButton = createButton("", "", "icon-white icon-wrench", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.showSettings();
        });

    this.repoButton = createButton("", "", "icon-white icon-bookmark", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.showRepositories();
        });

    global.App.router.on('statechange', function (backEnabled, forwardEnabled) {
        _this.backButton.prop('disabled', !backEnabled);
        _this.backButton.find("i").toggleClass("icon-white", backEnabled);

        _this.forwardButton.prop('disabled', !forwardEnabled);
        _this.forwardButton.find("i").toggleClass("icon-white", forwardEnabled);
    });

};

util.inherits(Toolbar, EventEmitter);

Toolbar.prototype._updateSyncButton = function() {
    $('.syncButton .btnText', this.domNode).text(this._syncState ? "Branch In Sync" : "Sync Branch");
};

Toolbar.prototype.setSyncState = function (synced) {
    this._syncState = synced;
    this._updateSyncButton();
};

Toolbar.prototype.setUpdateButtonLoading = function (loading) {
    this.updateButton.prop("disabled", loading);
    this.updateButton.find("i").toggleClass("icon-white", !loading);
};

module.exports = function () {
    return new Toolbar();
};