var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

function createButton (text, btnClass, iconClass) {
    var button = $('<button class="btn ' + btnClass + '" style="float: right;"><span class="btnText">' +  text + '</span><span class="' + iconClass + '">&nbsp;</span></button>');
    return button;
};

var Toolbar = function (args) {
    args = args || {};
    var _this = this,
        container = $('<div class="toolbar">');

    this.domNode = container;
    this._syncState = args.syncState; 
    
    createButton("Branch In Sync", "syncButton", "icon icon-refresh-small")
        .appendTo(container)
        .on("click", function () {
            $(_this).trigger("svnUpdate");
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

module.exports = function () {
    return new Toolbar();
};