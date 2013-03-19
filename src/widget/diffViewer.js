var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');
var SettingsProvider = require('../settingsProvider.js');

var DiffViewer = function () {
    this.domNode = $("<div class='file-diff flex-item'>");
};

util.inherits(DiffViewer, EventEmitter);

DiffViewer.prototype.show = function (file1, file2) {
    var mergely = $("<div id='mergely'>");
    this.domNode.append(mergely);

    mergely.mergely({
        cmsettings: { readOnly: true, lineWrapping: false, autoresize: false, mode: "text/javascript", theme: SettingsProvider.getValue("editorTheme", "default") },
        resize: function () {
            var w = $(mergely).parent().width();
            var h = $(mergely).parent().height();
            var content_width = w / 2.0 - 2 * 8 - 8;
            var content_height = h;
            var self = $(mergely);
            self.find('.mergely-column').css({ 'width': content_width + 'px' });
            self.find('.mergely-column, .mergely-canvas, .mergely-margin, .mergely-column textarea, .CodeMirror-scroll, .CodeMirror').css({ 'height': content_height + 'px' });
            self.find('.mergely-canvas').css({ 'height': content_height + 'px' });
            self.find('.mergely-column textarea').css({ 'width': content_width + 'px' });
            self.css({ 'width': w + 'px', 'height': h + 'px' });
            if (self.css('display') == 'none') {
                if (this.fadein !== false) self.fadeIn(this.fadein);
                else self.show();
                if (this.loaded) this.loaded();
            }
            if (this.resized) this.resized();
        }
    });

    mergely.mergely('lhs', file1);
    mergely.mergely('rhs', file2);
};


module.exports = function (svn, file1, file2) {
    return new DiffViewer(svn, file1, file2);
};