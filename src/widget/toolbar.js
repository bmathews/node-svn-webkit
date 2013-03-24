var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

function createButton (text, btnClass, iconClass) {
    var button = $('<button class="btn ' + btnClass + '" style="float: right;"><span class="btnText">' +  text + '</span><span class="' + iconClass + '">&nbsp;</span></button>');
    return button;
}

var Toolbar = function (args) {
    args = args || {};
    var _this = this,
        container = $('<div class="toolbar">');

    this.domNode = container;
    this._syncState = args.syncState;

    this.updateButton = createButton("Branch In Sync", "syncButton", "icon icon-refresh-small")
        .appendTo(container)
        .on("click", function () {
            _this.emit("svnUpdate");
        });

    this.breadCrumb = $('<div class="toolbar-breadcrumb">');
    container.append(this.breadCrumb);
};

util.inherits(Toolbar, EventEmitter);

Toolbar.prototype.addBreadCrumbNode = function (id, text, cb) {
    var node = $('<span rel="' + id + '"class="breadcrumb-node">').html(text);
    node.on('click', function (e) {
        cb(e, id, text);
    });
    this.breadCrumb.append(node);
};

Toolbar.prototype.removeBreadcrumbNodesAfter = function (id) {
    var node = this.breadCrumb.find('span[rel=' + id + ']'),
        index = Array.prototype.slice.call( this.breadCrumb[0].children ).indexOf(node[0]),
        childrenLength = this.breadCrumb[0].children.length;

    for (var i = childrenLength; i > index; i -= 1) {
        $(this.breadCrumb[0].children[i]).remove();
    }
};

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