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
        _this = this,
        workingRev = this.svn.info.lastchangedrev;

    logs.forEach(function (log) {
        //create date slitter
        if (!prevDate || prevDate.toYMD().localeCompare(log.date.toYMD()) > 0) {
            dateSplitter = $("<div>");
            dateSplitter.addClass("date-splitter");
            dateSplitter.html(log.date.toFormat("D MMM, YYYY"));
            listWrapper.append(dateSplitter);
            currentList = $("<ul>");
            listWrapper.append(currentList);
        }

        prevDate = log.date;

        //create log item
        var logItem = new LogItem(log, log.revision === workingRev);
        currentList.append(logItem.domNode);
        logItem.on("changeClick", function (path) {
            _this.handleChangeClick(path, log.revision);
        });
        logItem.domNode.on('contextmenu', function (evt) {
            console.log("log item contextmenu");
            _this.showLogItemContextMenu(evt, log);
        });
    });

    this.domNode.append(listWrapper);
};

LogList.prototype.showLogItemContextMenu = function (evt, log) {
    var menu = new gui.Menu(),
        rev = log.revision,
        _this = this;

    menu.append(new gui.MenuItem({
        label: 'Revert Changes From Revision ' + rev,
        click: function () {
            _this.handleRevert(rev);
        }
    }));

    menu.append(new gui.MenuItem({
        label: 'Switch to Revision ' + rev,
        click: function () {
            _this.handleSwitch(rev);
        }
    }));

    menu.popup(evt.clientX, evt.clientY);
};

LogList.prototype.handleSwitch = function (rev) {
    this.svn.switchAll(rev, function (err, text) {
        console.log(text);
        //TODO: refresh view
    });
};

LogList.prototype.handleRevert = function (rev) {
    //TODO: revert root to revision
};

LogList.prototype.handleChangeClick = function (path, revision) {
    this.emit("changeClick", path, revision);
};

module.exports = function (svn) {
    return new LogList(svn);
};