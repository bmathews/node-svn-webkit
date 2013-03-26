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
        if (!backEnabled) {
            _this.backButton.attr("disabled", true);
            _this.backButton.find("i").removeClass("icon-white");
        } else {
            _this.backButton.removeAttr("disabled");
            _this.backButton.find("i").addClass("icon-white");
        }
        if (!forwardEnabled) {
            _this.forwardButton.attr("disabled", true);
            _this.forwardButton.find("i").removeClass("icon-white");
        } else {
            _this.forwardButton.removeAttr("disabled");
            _this.forwardButton.find("i").addClass("icon-white");
        }
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
    if (loading) {
        this.updateButton.attr("disabled", true);
        this.updateButton.find("i").removeClass("icon-white");
        // this.updateButton.find("i").addClass("loading");
    } else {
        this.updateButton.removeAttr("disabled");
        this.updateButton.find("i").addClass("icon-white");
        // this.updateButton.find("i").removeClass("loading");
    }
};

module.exports = function () {
    return new Toolbar();
};