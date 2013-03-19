var _ = require('underscore');
require('date-utils');
var EventEmitter = require("events").EventEmitter;
var util = require('util');
var SettingsProvider = require('../settingsProvider.js');
var path = require('path');

var modeMap = {
  'apl': 'apl',
  'ast': 'asterisk',
  'c': 'clike',
  'cpp': 'clike',
  'java': 'clike',
  'cs': 'clike',
  'scaler': 'clike',
  'clj': 'clojure',
  'coffee': 'coffeescript',
  'lisp': 'commonlisp',
  'css': 'css',
  'd': 'd',
  'diff': 'diff',
  'ecl': 'ecl',
  'erlang': 'erlang',
  'gfm': 'gfm',
  'go': 'go',
  'groovy': 'groovy',
  'haskell': 'haskell',
  'asp': 'htmlembedded',
  'html': 'htmlembedded',
  'htm': 'htmlembedded',
  'jsp': 'htmlmixed',
  'http': 'http',
  'js': 'javascript',
  'json': 'javascript',
  'ts': 'javascript',
  'jinja': 'jinja2',
  'less': 'less',
  'lua': 'lua',
  'md': 'markdown',
  'nt': 'ntriples',
  'ocaml': 'ocaml',
  'pascal': 'pascal',
  'ext': 'perl',
  'php': 'php',
  'properties': 'clike',
  'py': 'python',
  'r': 'r',
  'rst': 'rst',
  'rb': 'ruby',
  'rust': 'rust',
  'sass': 'sass',
  'scheme': 'scheme',
  'sh': 'shell',
  'sql': 'sql',
  'vb': 'vb',
  'vbs': 'vbscript',
  'xml': 'xml',
  'xquery': 'xquery',
  'yaml': 'yaml',
  'z80': 'z80'
};


var DiffViewer = function () {
    this.domNode = $("<div class='file-diff flex-item'>");
};

util.inherits(DiffViewer, EventEmitter);

DiffViewer.prototype.show = function (ext, file1, file2) {
    var mergely = $("<div id='mergely'>");
    this.domNode.append(mergely);

    mergely.mergely({
        cmsettings: {
            readOnly: true,
            lineWrapping: false,
            autoresize: false,
            theme: SettingsProvider.getValue("editorTheme", "default"),
            modeURL: "./lib/mode/%N/%N.js",
            mode: modeMap[ext]
        },
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




module.exports = function () {
    return new DiffViewer();
};