var EventEmitter = require("events").EventEmitter;
var util = require('util');
var _ = require("underscore");

var Router = function (app) {
    var _this = this;
    this.app = app;
    this.doPushHistory = true;

    $(window.document).keypress(function (e) {
        if (e.which === 98) {
            _this.back();
        } else if (e.which === 102) {
            _this.forward();
        }
    });
};

util.inherits(Router, EventEmitter);

var current = -1;
var historyStack = [];
var historySize = 10;

Router.prototype._pushHistory = function (func, args) {
    if (this.doPushHistory) { //simple protection when going back/forward
        historyStack.push({
            func: func,
            args: args || []
        });

        //trim to historySize
        if (current < historySize) {
            current += 1;
            historyStack = historyStack.slice(0, current + 1); //clear forwards
        } else {
            historyStack = _.last(historyStack, historySize);
        }
    }
    this.emit("statechange", current > 0, current < historyStack.length - 1);
};

Router.prototype._execHistory = function (cur) {
    this.doPushHistory = false;
    var item = historyStack[cur];
    item.func.apply(this, item.args);
    this.doPushHistory = true;
};

Router.prototype.back = function () {
    if (current > 0) {
        current -= 1;
        this._execHistory(current);
    }
};

Router.prototype.forward = function () {
    if (current !== historyStack.length - 1) {
        current += 1;
        this._execHistory(current);
    }
};

Router.prototype.showRepo = function (repo) {
    this.app.setRepo(repo);
    this._pushHistory(this.showRepo, [repo]);
};

Router.prototype.showRepositories = function () {
    this.app.hideMenu();
    this.app.showRepositories();
    this._pushHistory(this.showRepositories);
};

Router.prototype.newRepository = function () {
    this.app.hideMenu();
    this.app.showNewRepository();
    this._pushHistory(this.newRepository);
};

Router.prototype.openRepository = function (repo) {
    this.showHistory();
    this._pushHistory(this.openRepository, [repo]);
};

Router.prototype.editRepository = function (repo) {
    this.app.hideMenu();
    this.app.editRepository(repo);
    this._pushHistory(this.editRepository, [repo]);
};

Router.prototype.showHistory = function (path, revision) {
    this.app.showMenu();
    this.app.showHistory(path, revision);
    this._pushHistory(this.showHistory, [path, revision]);
    this.emit("route:history");
};

Router.prototype.showDiffExternal = function (path, revision) {
    this.app.showMenu();
    this.app.showDiffExternal(path, revision);
    this._pushHistory(this.showDiffExternal, [path, revision]);
    this.emit("route:history");
};

Router.prototype.showChanges = function () {
    this.app.showMenu();
    this.app.showChanges();
    this._pushHistory(this.showChanges);
    this.emit("route:changes");
};

Router.prototype.showDiffLocal = function (path) {
    this.app.showMenu();
    this.app.showDiffLocal(path);
    this._pushHistory(this.showDiffLocal, [path]);
    this.emit("route:changes");
};

Router.prototype.showSettings = function () {
    this.app.hideMenu();
    this.app.showSettings();
    this._pushHistory(this.showSettings);
};

Router.prototype.showBrowse = function () {
    this.app.showMenu();
    this.app.showBrowse();
    this._pushHistory(this.showBrowse);
    this.emit("route:browse");
};

module.exports = function (app) {
    return new Router(app);
};