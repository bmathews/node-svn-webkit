var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var ChangeItem = function (change) {
    var status = change.status, path = change.path, checkBox, _this = this;
    this.domNode = $("<li title='" + path + "' class='change-item'></li>");
    checkBox = this.checkBox = $("<input type='checkbox' style='margin-right: 10px'>");
    this.domNode.append(this.checkBox);
    // var frag = window.document.createDocumentFragment();
    this.domNode.append($("<span class='status status-" + status + "'>" + status + "</span>")[0]);
    this.domNode.append($("<span>" + path + "</span>"));

    checkBox[0].onclick = function (e) {
        e.stopPropagation(e);
    };

    this.path = path;

    // this.domNode[0].appendChild(frag);
    this.domNode[0].onclick = function () {
        _this.handleChangeClick(path);
    };

    this.domNode[0].oncontextmenu = function (e) {
        _this.handleContextMenu(e, change);
    };
};

util.inherits(ChangeItem, EventEmitter);

ChangeItem.prototype.handleChangeClick = function (path) {
    this.emit("changeClick", path);
};

ChangeItem.prototype.handleContextMenu = function (evt, change) {
    this.emit("contextMenu", evt, change);
};

ChangeItem.prototype.setChecked = function (checked) {
    this.checkBox[0].checked = checked;
};

ChangeItem.prototype.getChecked = function (checked) {
    return this.checkBox[0].checked;
};

module.exports = function (change) {
    return new ChangeItem(change);
};