var _ = require('underscore'),
    EventEmitter = require("events").EventEmitter,
    util = require('util'),
    ChangeItem = require('./changeItem.js'),
    Popup = require('./popup.js'),
    path = require('path');

require('date-utils');

var ChangeList = function (svn) {
    var _this = this, win = gui.Window.get();
    this.svn = svn;
    this.domNode = $("<div class='changes flex-item loading'>");
    this.showChanges();

    //refresh if focused
    win.on("focus", function () {
        if (_this.lastUpdate && _this.lastUpdate.getSecondsBetween(new Date()) >= 30) {
            _this.refresh();
        }
    });
};

util.inherits(ChangeList, EventEmitter);

ChangeList.prototype.showChanges = function () {

    var _this = this;
    var header = $('<div class="commit-wrapper"></div>');

    this.refreshButton = $('<button class="btn"><i class="icon-refresh"></i></button>');
    header.append(this.refreshButton);
    header.append($('<span class="title" style="margin-left: 8px;">Uncommited Changes</span>'));
    this.commitButton = $('<button class="btn" style="float: right;">Commit</button>');
    header.append(this.commitButton);


    this.message = $("<textarea class='commit-message' placeholder='Commit message'>");


    var changesWrapper = this.changesWrapper = $('<div class="panel">');
    var changesTools = $('<div class="changes-tools">');
    this.selectAllCheckBox = $("<input type='checkbox' style='margin-top: 1px; vertical-align: top; float: left; margin-right: 6px;'>");
    var label = $('<label></label>');
    label.append(this.selectAllCheckBox);
    label.append($('<span>Select All</span>'));
    changesTools.append(label);
    changesWrapper.append(changesTools);

    this.selectAllCheckBox[0].onclick = function (e) {
        _this.selectAll(_this.selectAllCheckBox[0].checked);
    };

    this.commitButton[0].onclick = function () {
        var paths = _this.getSelectedPaths();
        if (paths.length) {
            //TODO: Load spinner. Enable/disable
            _this.svn.commit({
                message: _this.message[0].value,
                files: paths
            }, function (err, text) {
                if (!err) {
                    new Popup("Success!", text, function () {

                    });
                } else {
                    new Popup("Error!", err, function () {

                    });
                }
            });
        }
    };

    this.message[0].oncontextmenu = function (e) {
        _this.showRecentMessages(e);
    };

    this.message[0].onblur = function () {
        _this.saveRecentMessage();
    };

    this.refreshButton[0].onclick = function () {
        _this.refresh();
    };

    _this.svn.status(function (err, changes) {
        _this.domNode.append(header);
        _this.domNode.append(_this.message);
        _this.domNode.append(changesWrapper);
        changesTools.append($("<div style='float: right; color: #aaa; font-size: 11px; margin-top: 1px;'>" + changes.length + " local changes</div>"));
        _this.renderChanges(changes);
        _this.domNode.removeClass('loading');
    });
};

ChangeList.prototype.getSelectedItems = function () {
    return this.items.filter(function (item) { return item.getChecked(); });
};

ChangeList.prototype.getSelectedPaths = function () {
    return this.getSelectedItems().map(function (item) { return item.path; });
};

ChangeList.prototype.getRecent = function () {
    return window.localStorage.recents ? JSON.parse(window.localStorage.recents) : [];
};

ChangeList.prototype.saveRecent = function (recent) {
    window.localStorage.recents = JSON.stringify(recent);
};

ChangeList.prototype.saveRecentMessage = function () {
    var message = this.message[0].value;
    var recents = this.getRecent();
    if (message != recents[0] && message.trim().length) {
        recents = [message].concat(recents);

        if (recents.length > 10) {
            recents.pop();
        }

        this.saveRecent(recents);
    }
};

ChangeList.prototype.showRecentMessages = function (evt) {
    var menu = new gui.Menu(), _this = this, recents = this.getRecent();

    if (recents.length) {
        menu.append(new gui.MenuItem({
            label: "Recent messages",
            enabled: false
        }));
        menu.append(new gui.MenuItem({
            type: "separator"
        }));
        recents.forEach(function (recent) {
            menu.append(new gui.MenuItem({
                label: recent.length > 20 ? recent.substr(0, 20) + "..." : recent,
                tooltip: recent.length > 20 ? recent : null,
                click: function () {
                    _this.message[0].value = recent;
                }
            }));
        });
    }

    menu.popup(evt.clientX, evt.clientY);
};

ChangeList.prototype.refresh = function () {
    var _this = this;
    if (_this.list) {
        _this.list.remove();
    }

    _this.domNode.addClass('loading');
    _this.svn.status(function (err, changes) {
        //TODO: Preserve checked items somehow
        _this.renderChanges(changes);
        _this.domNode.removeClass('loading');
    });
};

ChangeList.prototype.renderChanges = function (changes) {
    var listWrapper = this.changesWrapper,
        list = $("<ul class='change-list'>"),
        prevDate,
        _this = this;

    _this.lastUpdate = new Date();

    _this.items = [];

    changes.forEach(function (change) {
        var changeItem = new ChangeItem(change);
        changeItem.on("changeClick", function (path) {
            _this.handleChangeClick(path);
        });
        changeItem.on('contextMenu', function (evt, change) {
            _this.handleContextMenu(evt, change);
        });
        _this.items.push(changeItem);
        list.append(changeItem.domNode);
    });

    _this.list = list;

    listWrapper.append(list);
};

ChangeList.prototype.selectAll = function (checked) {
    this.items.forEach(function (item) {
        item.setChecked(checked !== false ? true : false);
    }, this);
    this.selectAllCheckBox[0].checked = checked;
};

ChangeList.prototype.handleChangeClick = function (path) {
    global.App.router.showDiffLocal(path);
};

ChangeList.prototype.handleContextMenu = function (evt, change) {
    var menu = new gui.Menu(), status = change.status, _this = this,
        selected = this.getSelectedPaths();

    menu.append(new gui.MenuItem({
        label: 'Select All',
        click: function () {
            _this.selectAll(true);
        }
    }));

    menu.append(new gui.MenuItem({
        label: 'Deselect All',
        click: function () {
            _this.selectAll(false);
        }
    }));

    menu.append(new gui.MenuItem({
        type: "separator"
    }));

    menu.append(new gui.MenuItem({
        label: 'Reveal File',
        click: function () {
            // Open a file in file explorer.
            gui.Shell.showItemInFolder(path.resolve(_this.svn.repoRoot + change.path));
        }
    }));

    menu.append(new gui.MenuItem({
        label: 'Edit File',
        click: function () {
            // Open a text file with default text editor.
            gui.Shell.openItem(path.resolve(_this.svn.repoRoot + change.path));
        }
    }));

    menu.append(new gui.MenuItem({
        type: "separator"
    }));

    menu.append(new gui.MenuItem({
        label: 'Show History',
        click: function () {
            global.App.router.showHistory(change.path);
        }
    }));

    menu.append(new gui.MenuItem({
        label: status === "A" ? 'Undo Add' : 'Revert Changes',
        enabled: status !== "?",
        click: function () {
            new Popup("Comfirm removal", "This action is not undoable. Are you sure you want to discard all changes to \"<b>" + change.path.substr(change.path.lastIndexOf("/") + 1) + "</b>\"?" , function (conf) {
                if (conf) {
                    _this.svn.revertLocal(change.path, function (err, text) {
                        console.log("Revert done: ", text);
                        _this.refresh();
                    });
                }
            });
        }
    }));

    menu.append(new gui.MenuItem({
        label: 'Remove',
        enabled: false
    }));

    menu.append(new gui.MenuItem({
        label: 'Add',
        enabled: status === "?",
        click: function () {
            _this.svn.add(change.path, function (err, text) {
                console.log("Add done: ", text);
                _this.refresh();
            });
        }
    }));

    menu.popup(evt.clientX, evt.clientY);
};

module.exports = function (svn) {
    return new ChangeList(svn);
};