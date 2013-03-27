var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
var Popup = require('./popup.js');
require('date-utils');


var StatusBar = function (svn) {
    var _this = this,
        container = $('<div class="toolbar statusbar">');

    this.domNode = container;
    this.status = $('<div>');
    this.repoName = $('<div class="repoName">');
    this.domNode.append(this.status);
    this.domNode.append(this.repoName);

    svn.on('cmd', function (proc, cmd, args) {
        _this.handleCmdRun(proc, cmd, args);
    });
};

util.inherits(StatusBar, EventEmitter);

StatusBar.prototype.handleCmdRun = function (proc, cmd, args) {
    var _this = this;
    var node = $('<div class="process-status loading">' + cmd + " " + (args[0].length > 8 ? args[0].substr(0, 8) + " ..." : args[0])  + '</div>');
    var log = $("<div style='height: 300px; width: 400px; color: #333; overflow: scroll; border: 1px solid #ddd; padding: 5px; font-family: monospace;'>");
    var closed = false;

    log.innerHTML = cmd + " " + args.join(" ");

    proc.stdout.on('data', function (data) {
        log.html(log.html() + "<div class='data' >" + String(data) + "</div>");
        log[0].scrollTop = log[0].scrollHeight;
    });

    proc.stderr.on('data', function (data) {
        log.html(log.html() + "<div class='error' style='color: red;'>" + String(data) + "</div>");
        log[0].scrollTop = log[0].scrollHeight;
    });

    proc.on('close', function (code) {
        log.html(log.html() + "<div class='exit data' style='color: green;'>" + String(code) + "</div>");
        log[0].scrollTop = log[0].scrollHeight;
        closed = true;
    });

    node.on('click', function () {
        new Popup("", null, function (kill) {
            if (kill && !closed)  {
                proc.kill("SIGHUP");
            }
        }, {
            html: log,
            okMessage: "KILL",
            cancelMessage: "Close"
        });
    });
    node.attr('title', cmd + " " + args.join(" "));
    this.status.append(node);
    proc.on('close', function () {
        if (_this.status.children().length === 0) {
            _this.status.html("Idle");
        } else {
            node.remove();
        }
    });
};

StatusBar.prototype.setRepo = function (repo) {
    this.repoName.html(repo.name);
};

module.exports = function (svn) {
    return new StatusBar(svn);
};