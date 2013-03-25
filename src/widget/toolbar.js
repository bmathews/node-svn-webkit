var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

function createButton (text, btnClass, iconClass, dir) {
    var button = $('<button class="btn ' + btnClass + '" style="float: ' + dir + ';"><span class="btnText">' +  text + '</span><span class="' + iconClass + '">&nbsp;</span></button>');
    return button;
}

var Toolbar = function (args) {
    args = args || {};
    var _this = this,
        container = $('<div class="toolbar">');

    this.domNode = container;
    this._syncState = args.syncState;

    this.updateButton = createButton("Branch In Sync", "syncButton", "icon icon-refresh-small", "right")
        .appendTo(container)
        .on("click", function () {
            _this.emit("svnUpdate");
        });

    this.settingsButton = createButton("Settings", "", "icon icon-settings", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.showSettings();
        });

    this.repoButton = createButton("Repositories", "", "icon icon-repos", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.showRepositories();
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
        this.updateButton.find(".icon").addClass("loading");
    } else {
        this.updateButton.removeAttr("disabled");
        this.updateButton.find(".icon").removeClass("loading");
    }
};

module.exports = function () {
    return new Toolbar();
};