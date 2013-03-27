var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
var Popup = require("./popup.js");
require('date-utils');

function createButton (text, btnClass, iconClass, dir) {
    var button = $('<button class="btn ' + btnClass + '" style="float: ' + dir + ';"><span class="btnText">' +  text + '</span><i class="icon ' + iconClass + '"></i></button>');
    return button;
}

var Toolbar = function () {
    var _this = this,
        container = $('<div class="toolbar">');

    this.domNode = container;

    this.backButton = createButton("", "", "icon-white icon-arrow-left", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.back();
        });

    this.forwardButton = createButton("", "", "icon-white icon-arrow-right", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.forward();
        });

    this.menuButton = createButton("", "", "icon-white icon-align-justify", "right")
        .appendTo(container)
        .on("click", function (e) {
            _this.handleMenuClick(e);
        });

    this.updateButton = createButton("Update&nbsp;&nbsp", "syncButton", "icon-white icon-ok", "right")
        .appendTo(container)
        .on("click", function () {
            _this.emit("svnUpdate");
        });

    this.settingsButton = createButton("", "", "icon-white icon-wrench", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.showSettings();
        });

    this.repoButton = createButton("", "", "icon-white icon-bookmark", "left")
        .appendTo(container)
        .on("click", function () {
            global.App.router.showRepositories();
        });


    global.App.router.on('statechange', function (backEnabled, forwardEnabled) {
        _this.backButton.prop('disabled', !backEnabled);
        _this.backButton.find("i").toggleClass("icon-white", backEnabled);

        _this.forwardButton.prop('disabled', !forwardEnabled);
        _this.forwardButton.find("i").toggleClass("icon-white", forwardEnabled);
    });

};

util.inherits(Toolbar, EventEmitter);

Toolbar.prototype.setSvn = function(svn) {
    this.svn = svn;
};

Toolbar.prototype._updateSyncButton = function() {
    // $('.syncButton .btnText', this.domNode).text(this._syncState ? "Update" : "Update");
    $('.syncButton i', this.domNode).toggleClass('icon-ok', this._syncState);
    $('.syncButton i', this.domNode).toggleClass('icon-warning-sign', !this._syncState);
};

Toolbar.prototype.setSyncState = function (synced) {
    this._syncState = synced;
    this._updateSyncButton();
};

Toolbar.prototype.setUpdateButtonLoading = function (loading) {
    this.updateButton.prop("disabled", loading);
    this.updateButton.find("i").toggleClass("icon-white", !loading);
    this.updateButton.find("i").toggleClass("loading", loading);
};


Toolbar.prototype.handleMenuClick = function (evt) {
     var menu = new gui.Menu(), _this = this;

    menu.append(new gui.MenuItem({
        label: "Clean Up",
        click: function () {
            _this.svn.cleanup("", function (err, text) {
                window.confirm(err + text);
            });
        }
    }));
    menu.append(new gui.MenuItem({
        label: "Switch...",
        enabled: true,
        click: function () {
            _this.handleSwitchClicked();
        }
    }));
    menu.append(new gui.MenuItem({
        label: "Branch/Tag...",
        enabled: false,
        click: function () {

        }
    }));
    menu.append(new gui.MenuItem({
        label: "Export...",
        enabled: false,
        click: function () {

        }
    }));
    menu.popup(evt.clientX, evt.clientY);
};

Toolbar.prototype.handleSwitchClicked = function () {
    var html =
            '<div style="width: 400px;">' +
                '<div style="font-weight: 700;">From:</div>' +
                '<div>' + this.svn.info.url + '</div>' +
                '<div style="margin-top: 10px; font-weight: 700;">To:</div>' +
                '<input style="width: 100%;"type="text" value="' + this.svn.info.url + '"/>' +
            '</div>',
        popup;

    html = $(html);

    popup = new Popup("Switch...", null, function (confirm) {
        if (confirm) {
            _this.svn.switchUrl(html.find('input').val(), function (err, info) {
                if (!err) {
                    window.confirm(info + err);
                } else {
                    window.confirm(info + err);
                }
            });
        }
    }, {
        html: html
    });
    // new Popup(title, msg, callback, options)
};

module.exports = function () {
    return new Toolbar();
};