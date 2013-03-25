var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var ChangeItem = function (change) {
    var status = change.status, path = change.path, checkBox, _this = this;
    this.domNode = $("<li title='" + path + "' class='path'></li>");
    checkBox = this.checkBox = $("<input type='checkbox' style='margin-right: 10px'>");
    this.domNode.append(this.checkBox);
    this.domNode.append($("<span class='status status-" + status + "'>" + status + "</span>")[0]);
    this.domNode.append($("<span>" + path + "</span>"));

    checkBox.on('click', function (evt) {
        evt.stopPropagation();
    });

    this.path = path;

    this.domNode.on('click', function (evt) {
        _this.handleChangeClick(evt, path);
    });

    this.domNode.on('contextmenu', function (evt) {
        _this.handleContextMenu(evt, change);
    });
};

util.inherits(ChangeItem, EventEmitter);

ChangeItem.prototype.handleChangeClick = function (evt, path) {
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