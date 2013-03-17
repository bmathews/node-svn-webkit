var _ = require('underscore'),
    EventEmitter = require("events").EventEmitter,
    util = require('util'),
    LogItem = require('./logItem.js');

require('date-utils');

var LogList = function (svn) {
    var _this = this;
    this.svn = svn;
    this.domNode = $("<div class='log-list flex-item loading'>");
    svn.log(JSON.parse(window.localStorage.logLimit), function (err, logs) {
        _this.showLogs(logs);
        _this.domNode.removeClass('loading');
    });
};

util.inherits(LogList, EventEmitter);

LogList.prototype.showLogs = function (logs) {
    var listWrapper = this.domNode,
        currentList,
        prevDate,
        _this = this;

    logs.forEach(function (log) {
        if (!prevDate || prevDate.toYMD().localeCompare(log.date.toYMD()) > 0) {
            dateSplitter = $("<div>");
            dateSplitter.addClass("date-splitter");
            dateSplitter.html(log.date.toFormat("D MMM, YYYY"));
            listWrapper.append(dateSplitter);
            currentList = $("<ul>");
            listWrapper.append(currentList);
        }

        prevDate = log.date;

        var logItem = new LogItem(log);
        currentList.append(logItem.domNode);
        logItem.on("changeClick", function (path) {
            _this.handleChangeClick(path, log.revision);
        });
    });

    this.domNode.append(listWrapper);
};

LogList.prototype.handleChangeClick = function (path, revision) {
    this.emit("changeClick", path, revision);
};

module.exports = function (svn) {
    return new LogList(svn);
};