var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');

var Navigation = function () {
    var _this = this,
        items = ["History", "Changes", "Browse"],
        container = this.container = $('<div class="nav-container  flex-item">');

    items.forEach(function (item, index) {
        var node = $('<div class="nav-icon nav-icon-' + item.toLowerCase() + '">' + item + '</div>');

        node.click(function (e) {
            _this.select(item, false);
        });

        container.append(node);
    });

    _this.items = items;

    var wrapper = $('<div class="nav-wrapper flex-item flex row fixed">');
    wrapper.append(container);

    this.domNode = wrapper;

    this.createRouterListeners();
};

util.inherits(Navigation, EventEmitter);

/**
 * Create router listeners
 */
Navigation.prototype.createRouterListeners = function () {
    var _this = this;
    global.App.router.on('route:history', function () {
        _this.select("History", true);
    });

    global.App.router.on('route:changes', function () {
        _this.select("Changes", true);
    });

    global.App.router.on('route:browse', function () {
        _this.select("Browse", true);
    });
};

/**
 * Select an item
 * @param  {String} item   Item to select
 * @param  {Boolean} silent Whether to fire event or not
 */
Navigation.prototype.select = function (item, silent) {
    var node = $(this.container[0].children[this.items.indexOf(item)]);

    if (this.selectedNode) {
        this.selectedNode.removeClass("selected");
    }

    node.addClass("selected");
    this.selectedNode = node;

    if (!silent) {
        this.fireEvent(item);
    }
};

/**
 * Fires an event for the selected item
 * @param  {String} item Item selected
 */
Navigation.prototype.fireEvent = function (item) {
    switch (item) {
        case "History":
            App.router.showHistory();
            break;
        case "Changes":
            App.router.showChanges();
            break;
        case "Browse":
            App.router.showBrowse();
            break;
    }
};

module.exports = function () {
    return new Navigation();
};