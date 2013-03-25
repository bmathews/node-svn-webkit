var _ = require('underscore'),
    EventEmitter = require("events").EventEmitter,
    util = require('util'),
    Popup = require('./popup.js');
    SettingsProvider = require('../settingsProvider.js');

var RepoList = function (svn) {
    var _this = this;
    this.svn = svn;
    this.domNode = $("<div class='repo-list-wrapper flex-item'>");
    this.logContainer = $("<div class='repo-list'>");

    this.repoList = SettingsProvider.getValue("repoList", []);

    this.addButton = $('<button class="btn"><div class="icon-plus-sign"></div>Add Repo</button>')
        .appendTo(this.logContainer)
        .on('click', function () {
            _this.handleAddClick();
        });

    this.checkoutButton = $('<button class="btn"><div class="icon-download-alt"></div>Checkout Repo</button>')
        .appendTo(this.logContainer)
        .on('click', function () {
            _this.handleCheckoutClick();
        });

    this.showRepoList(this.repoList);

    this.domNode.append(this.logContainer);
};

util.inherits(RepoList, EventEmitter);

RepoList.prototype.handleAddClick = function () {
    var _this = this;
    var html = $('<div>');
    var dialog = $('<input style="display:none;" type="file" nwdirectory value="' + "" + '"/>');
    var browse = $('<button class="btn">Browse</button>');
    var name = $("<input type='text' value='name'>");
    var input = $("<span>" + "Browse for a repository" + "</div>");
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
    html.append(browse);
    html.append(input);

    html.append(dialog);

    new Popup("Add Repo", null, function (doSave) {
        if (doSave) {
            _this.repoList.push({
                path: dialog.val(),
                name: name.val()
            });
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
    this.repoList.splice(index);
    this.saveRepoList();
};

RepoList.prototype.handleEditClick = function (repo) {

};

RepoList.prototype.handleRepoClick = function (repo) {
    SettingsProvider.setValue("repo", repo.path);
};

RepoList.prototype.saveRepoList = function () {
    SettingsProvider.setValue("repoList", this.repoList);
};

RepoList.prototype.showRepoList = function (repoList) {
    var _this = this, listNode = this.logContainer, repoNode, editButton, deleteButton;

    _.each(repoList, function (repo) {
        repoNode = $('<div class="path repo-item"><span class="repoName">' + repo.name + '</span><span class="repoPath">' + repo.path + '</span></div>');

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
    });
};

module.exports = function (svn) {
    return new RepoList(svn);
};