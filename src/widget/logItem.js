var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var LogItem = function (log) {
    this.expanded = false;
    var _this = this,
        template = _.template("<div class='author'> <%= author %> </div>" +
                              "<div class='date'><%= date.toFormat('H:MIP') %></div>" +
                              "<div class='message'>  <%= message %> </div>"),
        item = $("<li class='log-item'>" + template(log) + "</li>"),
        changeList = $("<div style='display: none;'>");

    log.changedPaths.forEach(function (path) {
        var status = path.substr(0, 1), change;
        path = path.substr(1);
            change = $("<div title='" + path + "' class='path'><span class='status status-" + status + "'>" + status + "</span>" + path + "</div>");

        change[0].onclick = function (e) {
            e.stopPropagation();
            _this.handleChangeClick(path);
        };
        changeList.append(change);
    });

    item.append(changeList);

    _this.changeListNode = changeList;

    item[0].onclick = function () {
        _this.handleClick(log, item);
    };

    this.domNode = item;
};

util.inherits(LogItem, EventEmitter);

LogItem.prototype.handleClick = function () {
    if (this.expanded) {
        this.changeListNode.slideUp();
    } else {
        this.changeListNode.slideDown();
    }
    this.expanded = !this.expanded;
};

LogItem.prototype.handleChangeClick = function (path) {
    this.emit("changeClick", path);
};

module.exports = function (log) {
    return new LogItem(log);
};