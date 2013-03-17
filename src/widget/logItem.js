var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var LogItem = function (log, isWorkingRev) {
    this.expanded = false;
    var _this = this,
        template = _.template("<div class='author'> <%= author %> </div>" +
                              "<div class='date'><%= date.toFormat('H:MIP') %></div>" +
                              "<div class='revision'><%= revision %></div>" +
                              "<div class='message'>  <%= message %> </div>"),
        item = $("<li class='log-item'>" + template(log) + "</li>"),
        changeList = $("<div style='display: none;'>");

    log.changedPaths.forEach(function (path) {
        var status = path.substr(0, 1), change;
        path = path.substr(1);
            change = $("<div title='" + path + "' class='path'><span class='status status-" + status + "'>" + status + "</span>" + path + "</div>");

        change.on('click', function (evt) {
            evt.stopPropagation();
            _this.handleChangeClick(path);
        });

        change.on('contextmenu', function (evt) {
            evt.stopPropagation();
            //TODO: show history
        });

        changeList.append(change);
    });

    if (isWorkingRev) {
        item.addClass("working-revision");
    }

    item.append(changeList);

    _this.changeListNode = changeList;

    item.on('click', function (evt) {
        evt.stopPropagation();
        _this.handleClick(evt, log, item);
    });

    this.domNode = item;
};

util.inherits(LogItem, EventEmitter);

LogItem.prototype.handleClick = function (evt, log, item) {
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

module.exports = function (log, isWorkingRev) {
    return new LogItem(log, isWorkingRev);
};