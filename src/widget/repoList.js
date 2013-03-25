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
            _this.handleAddClick();
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

RepoList.prototype.handleAddClick = function () {
    var _this = this;
    var html = $('<div style="width: 300px; border-bottom: 1px solid #eee; margin-bottom: 8px; padding-bottom: 8px;">');
    var dialog = $('<input style="display:none;" type="file" nwdirectory value="' + "" + '"/>');
    var browse = $('<button class="btn">Browse</button>');
    var name = $("<input type='text' placeholder='Repository Name'>");
    var input = $("<span>" + "Browse for repository location" + "</div>");
    browse.on('click', function () {
        dialog.trigger('click');
    });
    dialog.change(function () {
        if ($(this).val()) {
            input.html($(this).val());
            dialog.attr('value', input.html());
        }
    });
    html.append(name);
    html.append("<br>");
    html.append(browse);
    html.append(input);

    html.append(dialog);

    new Popup("Add Repo", null, function (doSave) {
        if (doSave) {
            var repo = {
                path: dialog.val(),
                name: name.val()
            };
            _this.repoList.push(repo);
            _this.addItem(repo);
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

RepoList.prototype.handleEditClick = function (repo) {

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
            _this.handleEditClick(repo);
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

    _.each(repoList, function (repo) {
        _this.addItem(repo);
    });
};

module.exports = function (svn) {
    return new RepoList(svn);
};