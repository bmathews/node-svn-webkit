var _ = require('underscore');
var util = require('util');
var EventEmitter = require("events").EventEmitter;
require('date-utils');


var Navigation = function () {
    var _this = this,
        items = ["History", "Changes", "Settings"],
        container = $('<div class="nav-container">');

    items.forEach(function (item, index) {
        var node = $('<div class="nav-icon icon-' + item.toLowerCase() + '">' + item + '</div>');

        node.click(function (e) {
            _this.handleItemClick(item, node);
        });

        container.append(node);
    });

    _this.items = items;

    this.domNode = container;
};

util.inherits(Navigation, EventEmitter);

Navigation.prototype.select = function (item) {
    this.handleItemClick(item, $(this.domNode[0].children[this.items.indexOf(item)]));
};

Navigation.prototype.handleItemClick = function (item, node) {
    if (this.selectedNode) {
        this.selectedNode.removeClass("selected");
    }

    node.addClass("selected");
    this.selectedNode = node;

    console.log("Clicked: " + item);
    this.emit("navigate", item);
};


module.exports = function () {
    return new Navigation();
};