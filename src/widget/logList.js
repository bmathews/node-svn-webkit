var _ = require('underscore'),
    EventEmitter = require("events").EventEmitter,
    util = require('util'),
    LogItem = require('./logItem.js'),
    SettingsProvider = require('../settingsProvider.js');

require('date-utils');

var LogList = function (svn, path) {
    var _this = this;
    this.svn = svn;
    this.domNode = $("<div class='log-list-wrapper flex-item'>");
    this.refreshButton = $('<button style="float: right; margin-top: 24px; margin-right: 10px; z-index: 10; position: relative;" class="btn"><i class="icon-refresh"></i></button>');
    this.domNode.append(this.refreshButton);
    this.logContainer = $("<div class='log-list'>");
    this.domNode.append(this.logContainer);
    this.fetchLogs(path);
    this.path = path;

    this.refreshButton[0].onclick = function () {
        _this.refresh();
    };
};

util.inherits(LogList, EventEmitter);

LogList.prototype.refresh = function () {
    this.logContainer.empty();
    this.fetchLogs(this.path);
};

LogList.prototype.fetchLogs = function (path) {
    var _this = this;
    _this.domNode.addClass('loading');
    this.svn.log(path, SettingsProvider.getValue('logLimit', 15), function (err, logs) {
        _this.domNode.removeClass('loading');
        if (!err) {
            _this.showLogs(logs);
        }
    });
};

LogList.prototype.showLogs = function (logs) {
    var listWrapper = this.logContainer,
        currentList,
        prevDate,
        _this = this,
        workingRev = this.svn.info.lastchangedrev;

    logs.forEach(function (log) {
        //create date slitter
        if (!prevDate || prevDate.toYMD().localeCompare(log.date.toYMD()) > 0) {
            dateSplitter = $("<div>");
            dateSplitter.addClass("date-splitter");
            dateSplitter.html(log.date.toFormat("MMMM D, YYYY"));
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
            _this.showLogItemContextMenu(evt, log);
        });
    });

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
    var _this = this;
    this.svn.switchAll(rev, function (err, text) {
        console.log(text);
        _this.refresh();
    });
};

LogList.prototype.handleRevert = function (rev) {
    this.svn.revertRevision("", rev, function (err, text) {
        window.confirm("err:" + err + "\n\n text:" + text);
    });
};

LogList.prototype.handleChangeClick = function (path, revision) {
    this.emit("changeClick", path, revision);
};

module.exports = function (svn, path) {
    return new LogList(svn, path);
};