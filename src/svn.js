/*jslint node: true */
"use strict";

var spawn = require('child_process').spawn;
var path = require('path');

var SVN = function (repoRoot, readyCallback) {
    this.repoRoot = repoRoot;
    var scope = this;
    this.getInfo(function (info, err) {
        scope.info = info;
        if (readyCallback) {
            readyCallback(info, err);
        }
    });
};

var svn = SVN.prototype;

svn.diffExternal = function (file, revision, callback) {
    return this.run('svn', ['diff', '-c', revision, this.repoRoot + file], callback);
};

svn.diffLocal = function (file, callback) {
    return this.run('svn', ['diff', this.repoRoot + file], callback);
};

//TODO: ghetto. refactor
svn.getFile = function (file, revision, callback) {
    var path = this.repoRoot + file;
    if (revision) {
        return this.run('svn', ["cat", "-r", revision, path], callback);
    }
    return this.run('cat', [path], callback);
};

svn.getInfo = function (callback) {
    var _this = this;
    return this.run('svn', ['info', this.repoRoot], function (text, err) {
        console.log(text);
        console.log(err);
        if (!err) {
            callback(_this._parseInfo(text));
        } else {
            callback(null, err);
        }
    });
};

svn.getLog = function (limit, callback) {
    var _this = this;
    return this.run('svn', ['log', this.repoRoot, '-v', '-l', limit || 25, '-r', 'HEAD:1', '--incremental'], function (text, err) {
        callback(_this._parseLog(text));
    });
};

svn.revertLocal = function (file, callback) {
    return this.run('svn', ['revert', this.repoRoot + file], callback);
};

svn.getStatus = function (callback) {
    var _this = this;
    return this.run('svn', ['status', this.repoRoot], function (text, err) {
        callback(_this._parseStatus(text));
    });
};

svn.commit = function (options, callback) {
    var _this = this,
        args = ['commit', "-m", options.message].concat(options.files.map(function (file) { return _this.repoRoot + file; }));
    return this.run('svn', args, callback);
};

svn.add = function (path, callback) {
    return this.run('svn', ['add', this.repoRoot + path], callback);
};

svn.run = function (cmd, args, callback) {
    var text = "",
        err = "",
        proc = spawn(cmd, args);

    proc.stdout.on('data', function (data) {
        text += data;
    });

    proc.stderr.on('data', function (data) {
        err += data;
    });

    proc.on('close', function (code) {
        callback(text, err);
    });

    return function () {
        this.cancel = function () {
            proc.kill('SIGHUP');
        };
    };
};

svn._parseLogEntry = function (logText) {
    var array = logText.split("\n"),
        log = {},
        i = 0,
        header = array[0],
        change,
        relativeUrl = this.info.url.replace(this.info.repositoryroot, "");

    while (header === "") {
        header = array[i += 1];
    }

    header = header.split(" | ");

    log.revision = header[0].substr(1);
    log.author = header[1];
    log.date = new Date(header[2]);
    log.changedPaths = [];

    for (i = i + 2; i < array.length; i += 1) {
        change = array[i];
        if (change === "") {
            break;
        }
        log.changedPaths.push(path.normalize(change.trim().replace(relativeUrl, "")));
    }

    log.message = "";

    for (i += 1; i < array.length - 1; i += 1) {
        log.message += array[i];
        if (i !== array.length - 2) {
            log.message += "\n";
        }
    }

    return log;
};

svn._parseInfo = function (text) {
    var array = text.replace(/\r\n/g, "\n").split("\n"),
        info = {};
    array.forEach(function (line) {
        var firstColon = line.indexOf(":");
        info[line.substring(0, firstColon).replace(/\s*/g, "").toLowerCase()] = line.substring(firstColon + 1);
    });
    return info;
};


svn._parseLog = function (text) {
    var array = text.replace(/\r\n/g, "\n").replace(/\t/g, "     ").split("------------------------------------------------------------------------"),
        logList = [],
        item,
        i,
        j,
        line,
        header,
        message,
        changedPaths;

    for (i = 1; i < array.length; i += 1) {
        item = this._parseLogEntry(array[i]);
        if (item) {
            logList.push(item);
        }
    }

    return logList;
};

svn._parseStatus = function (text) {
    var split = text.replace(/\r\n/g, "\n").split("\n"),
        changes = [],
        line;

    for (var i = 0; i < split.length; i += 1) {
        line = split[i];
        if (line.trim().length > 1) {
            changes.push({
                status: line[0],
                path: path.resolve(line.substr(1).trim()).replace(this.repoRoot, "")
            });
        }
    }
    return changes;
};

module.exports = function (path, readyCallback) {
    return new SVN(path, readyCallback);
};