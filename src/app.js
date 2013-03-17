var SVN = require ('./svn.js');
var _ = require('underscore');
var LogList = require('./widget/logList.js');
var ChangeList = require('./widget/changeList.js');
var DiffViewer = require('./widget/diffViewer.js');
var Navigation = require('./widget/navigation.js');
var Toolbar = require('./widget/toolbar.js');
var Settings = require('./widget/settings.js');
var SettingsProvider = require('./settingsProvider.js');
var Popup = require('./widget/popup.js');
var fs = require('fs');
var win = gui.Window.get();

require('date-utils');

$(window.document).keypress(function (e) {
    console.log("keypress");
    if (e.altKey && e.ctrlKey && e.which === 10) {
        win.showDevTools();
    }
});

var App = function (app) {
    var _this = this, wrapper, nav, center, centerWrapper, toolbar;

    wrapper = _this.createWrapper();
    nav = _this.createNavigation();
    center = _this.createCenter();
    toolbar = _this.createToolbar();

    wrapper.append(nav.domNode);
    wrapper.append(center);

    center.addClass("flex-item");
    toolbar.domNode.addClass("flex-item fixed");
    nav.domNode.addClass("flex-item fixed");

    this.center.append(toolbar.domNode);

    $(window.document.body).append(wrapper);

    // var path = window.prompt("SVN PATH???");
    _this.svn = new SVN(SettingsProvider.getValue("repo"), function (err, info) {
        if (err) {
            new Popup("Error", "Cannot find repository: \n" + SettingsProvider.getValue("repo"), function (conf) {
                nav.select("Settings");
            });
        } else {
            nav.select("Changes");
        }
        _this.svn.isUpToDate(function (upToDate) {
            toolbar.setSyncState(upToDate);
        });
    });

    // Every 10 seconds or so, check to see if we are up to date
    setInterval(function() {
        // TODO: Refactor to another method
        _this.svn.isUpToDate(function (upToDate) {
            toolbar.setSyncState(upToDate);
        });
    }, 10000);

    toolbar.on("svnUpdate", function () {
        toolbar.setUpdateButtonLoading(true);
        _this.svn.update(function(err, info) {
            toolbar.setUpdateButtonLoading(false);
            toolbar.setSyncState(!err);
        });
    });
};

App.prototype.createWrapper = function () {
    return this.main = $('<div class="flex row" style="width: 100%; height: 100%;">');
};

App.prototype.createNavigation = function () {
    var _this = this,
         nav = _this.navigation = new Navigation();

    nav.on("navigate", function (pageName) {
        _this.handleNavigate(pageName);
    });
    return nav;
};

App.prototype.createCenter = function () {
    return this.center = $('<div class="flex column">');
};

App.prototype.createToolbar = function () {
    return this.toolbar = new Toolbar();
};

App.prototype.removeScreen = function () {
    if (this.currentScreen) {
         this.currentScreen.domNode.remove();
        delete this.currentScreen;
    }
};

App.prototype.showScreen = function (newScreen) {
    this.currentScreen = newScreen;
    this.center.append(newScreen.domNode);
};

App.prototype.showLoading = function (loading) {
    if (loading) {
        this.center.addClass("loading");
    } else {
        this.center.removeClass("loading");
    }
};

App.prototype.handleNavigate = function (pageName) {
    this.removeScreen();

    var newScreen;

    if (pageName === "History") {
        newScreen = this.showHistory();
    } else if (pageName === "Settings") {
        newScreen = this.showSettings();
    } else if (pageName === "Changes") {
        newScreen = this.showChanges();
    }

    this.showScreen(newScreen);
};

App.prototype.showSettings = function () {
    var _this = this;

    if (!_this.settings) {
        _this.settings = new Settings(_this.svn);
    }

    return _this.settings;
};

App.prototype.showChanges = function () {
    var _this = this;

    if (!_this.changeList) {
        _this.changeList = new ChangeList(_this.svn);
        _this.changeList.on("changeClick", function (path) {
            _this.showDiff(path);
        });
    }

    return _this.changeList;
};

App.prototype.showHistory = function () {
    var _this = this;

    if (!_this.logList) {
        _this.logList = new LogList(_this.svn);
        _this.logList.on("changeClick", function (path, revision) {
            _this.showDiff(path, revision);
        });
    }

    return _this.logList;
};

App.prototype.showDiff = function (path, revision) {
    var _this = this;
    _this.removeScreen();
    _this.showLoading(true);
    _this.svn.getFile(path.trim(), revision, function (err, text1) {
        _this.svn.getFile(path.trim(), revision ? revision - 1 : "BASE", function (err, text2) {
            var diffViewer = new DiffViewer();
            _this.showScreen(diffViewer);
            diffViewer.show(text2, text1);
            _this.showLoading(false);
        });
    });
};

App.prototype.handleLogClick = function (log, node) {
    node.slideUp();
};

module.exports = function () {
    return new App();
};