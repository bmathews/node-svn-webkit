var _ = require('underscore'),
    EventEmitter = require("events").EventEmitter,
    util = require('util'),
    Popup = require('./popup.js');
    SettingsProvider = require('../settingsProvider.js');

var RepoList = function (svn) {
    var _this = this;
    this.svn = svn;
    this.domNode = $("<div class='repo-list-wrapper flex-item'>");
    var wrapper = $("<div class='repo-list'>");
    var buttonBar = $('<div class="repo-controls">');
    this.logContainer = $("<div>");

    this.repoList = SettingsProvider.getValue("repoList", []);

    this.addButton = $('<button class="btn"><div class="icon-plus-sign"></div>Add Repo</button>')
        .appendTo(buttonBar)
        .on('click', function () {
            _this.handleAddEditClick({});
        });

    this.checkoutButton = $('<button class="btn"><div class="icon-download-alt"></div>Checkout Repo</button>')
        .appendTo(buttonBar)
        .on('click', function () {
            _this.handleCheckoutClick();
        });

    this.showRepoList(this.repoList);

    wrapper.append(buttonBar);
    wrapper.append(this.logContainer);
    this.domNode.append(wrapper);
};

util.inherits(RepoList, EventEmitter);

RepoList.prototype.handleAddEditClick = function (repo) {
    var _this = this;
    var html = $('<div style="width: 400px; border-bottom: 1px solid #eee; margin-bottom: 8px; padding-bottom: 8px;">');
    var dialog = $('<input style="display:none;" type="file" nwdirectory value="' + (repo.path ? repo.path : "") + '"/>');
    var browse = $('<button class="btn"><i class="icon-folder-open"></i></button>');
    var name = $("<input type='text' placeholder='Repository Name' value='" + (repo.name ? repo.name : "") + "'>");
    var input = $("<span'>" + (repo.path || "Browse for repository location") + "</div>");
    var username = $("<input type='text' placeholder='Username' value='" + (repo.username ? repo.username : "") + "'>");
    var pw = $("<input type='password' placeholder='Password' value='" + (repo.pw ? repo.pw : "") + "'>");
    var locationwrapper = $("<div style='overflow: hidden; white-space: nowrap; text-overflow: ellipsis;'>");

    browse.on('click', function () {
        dialog.trigger('click');
    });
    dialog.change(function () {
        if ($(this).val()) {
            input.html($(this).val());
            dialog.attr('value', input.html());
        }
    });
    html.append($("<div class='repo-label'>Repo Name</div>"));
    html.append(name).append($("<div>"));
    html.append($("<div class='repo-label'>Location</div>"));
    locationwrapper.append(browse);
    locationwrapper.append(input);
    html.append(locationwrapper).append($("<div>"));
    html.append($("<div class='repo-label'>Username</div>"));
    html.append(username).append($("<div>"));
    html.append($("<div class='repo-label'>Password</div>"));
    html.append(pw).append($("<div>"));

    html.append(dialog);

    new Popup(repo.name ? "Edit Repo" : "Add Repo", null, function (doSave) {
        if (doSave) {
            var edit = !!repo.name;

            repo.path = dialog.attr('value');
            repo.name = name.val();
            repo.username = username.val();
            repo.pw = pw.val();

            if (!edit) {
                _this.repoList.push(repo);
                _this.addItem(repo);
            } else {
                _this.showRepoList(_this.repoList);
            }

            _this.saveRepoList();
        }
    }, {
        okMessage: "Save",
        html: html
    });
};

RepoList.prototype.handleCheckoutClick = function () {

};

RepoList.prototype.handleRemoveClick = function (repo) {
    var index = this.repoList.indexOf(repo);
    this.repoList.splice(index, 1);
    this.logContainer.children()[index].remove();
    this.saveRepoList();
};

RepoList.prototype.handleRepoClick = function (repo) {
    SettingsProvider.setValue("repo", repo);
    global.App.router.showRepo(repo);
};

RepoList.prototype.saveRepoList = function () {
    SettingsProvider.setValue("repoList", this.repoList);
};

RepoList.prototype.addItem = function (repo) {
    var _this = this, listNode = this.logContainer, repoNode, editButton, deleteButton;

    repoNode = $('<div class="path repo-item"><span class="repoName">' + repo.name + '</span><span class="repoPath">' + repo.path + '</span></div>')
        .on('click', function (e) {
            _this.handleRepoClick(repo);
        });

    editButton = $('<button style="float: right;" class="btn"><i class="icon-pencil"></i></button>')
        .appendTo(repoNode)
        .on('click', function (e) {
            e.stopPropagation();
            _this.handleAddEditClick(repo);
        });

    deleteButton = $('<button style="float: right;" class="btn"><i class="icon-trash"></i></button>')
        .appendTo(repoNode)
        .on('click', function (e) {
            e.stopPropagation();
            _this.handleRemoveClick(repo);
        });

    listNode.append(repoNode);
};

RepoList.prototype.showRepoList = function (repoList) {
    var _this = this;
    this.logContainer.empty();

    _.each(repoList, function (repo) {
        _this.addItem(repo);
    });
};

module.exports = function (svn) {
    return new RepoList(svn);
};