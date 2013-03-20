/*jslint node: true */
"use strict";

var spawn = require('child_process').spawn;
var path = require('path');
var util = require('util');
var EventEmitter = require("events").EventEmitter;

var SVN = function (repoRoot, readyCallback) {
    this.repoRoot = repoRoot;
    this.refreshInfoCache("info", readyCallback);
};

util.inherits(SVN, EventEmitter);

var svn = SVN.prototype;



// TODO: this function really necessary, all I am saving is the scope[...] call?
svn.refreshInfoCache = function (infoCacheName, callback, revision) {
    var scope = this;
    this.getInfo(function (err, info) {
        scope[infoCacheName] = info;
        if (callback) {
            callback(err, info);
        }
    }, revision);
};

svn.switchAll = function (rev, callback) {
    return this.run('svn', ['switch', this.info.url, this.repoRoot, '-r', rev], callback);
};

// svn.switchPaths = function (rev, paths, callback) {
//     var _this = this, absPaths = paths.map(function (file) { return _this.repoRoot + file; });
//     return this.run('svn', ['switch', '-r', rev].concat(absPaths), callback);
// };

svn.diffExternal = function (file, revision, callback) {
    return this.run('svn', ['diff', '-c', revision, this.repoRoot + file], callback);
};

svn.diffLocal = function (file, callback) {
    return this.run('svn', ['diff', this.repoRoot + file], callback);
};

svn.update = function (callback, revision) {
    var args = ['update', this.repoRoot];
    var _this = this;
    if (revision !== undefined) {
        args = args.concat(["-r", revision]);
    }
    return this.run('svn', args, function (text, err) {
        if (!err) {
            // Update the info if we successfully updated
            _this.refreshInfoCache("info", function (err, info) {
                callback(!err);
            });
        } else {
            callback(false);
        }
    });
};

svn.isUpToDate = function(callback) {
    var _this = this;
    _this.refreshInfoCache("info", function (err, info) {
        if (!err) {
            _this.refreshInfoCache("headInfo", function (headErr, headInfo) {
                callback(!headErr && parseInt(info.revision, 10) >= parseInt(headInfo.revision, 10));
            }, "HEAD");
        } else {
            callback(false);
        }
    });
};

//TODO: ghetto. refactor
svn.getFile = function (file, revision, callback) {
    var path = this.repoRoot + file;
    if (revision) {
        return this.run('svn', ["cat", "-r", revision, path], callback);
    }
    return this.run('cat', [path], callback);
};

svn.getInfo = function (callback, revision) {
    var _this = this,
        args = ['info', this.repoRoot];
    if (revision) {
        args = args.concat(['-r', revision]);
    }

    return this.run('svn', args, function (err, text) {
        if (!err) {
            callback(null, _this._parseInfo(text));
        } else {
            callback(err, null);
        }
    });
};

svn.log = function (limit, callback) {
    var _this = this;
    return this.run('svn', ['log', this.repoRoot, '-v', '-l', limit || 25, '-r', 'HEAD:1', '--incremental'], function (err, text) {
        if (!err) {
            callback(null, _this._parseLog(text));
        } else {
            callback(err, null);
        }
    });
};

svn.revertLocal = function (file, callback) {
    return this.run('svn', ['revert', this.repoRoot + file], callback);
};

//TODO: implement
svn.revertRevision = function (file, rev, callback) {

};

svn.status = function (callback) {
    var _this = this;
    return this.run('svn', ['status', this.repoRoot], function (err, text) {
        if (!err) {
            callback(null, _this._parseStatus(text));
        } else {
            callback(err, null);
        }
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

    this.emit("cmd", proc, cmd, args);

    console.warn("Running cmd: ", cmd, args);

    proc.stdout.on('data', function (data) {
        text += data;
    });

    proc.stderr.on('data', function (data) {
        data += "";

        //ssh warning, ignore
        if (data.indexOf("Killed by signal 15.") === -1) {
            err += data;
            console.error(data);
        }
    });

    proc.on('close', function (code) {
        callback(err, text);
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
        info[line.substring(0, firstColon).replace(/\s*/g, "").toLowerCase()] = line.substring(firstColon + 1).trim();
    });
    return info;
};


svn._parseLog = function (text) {
    var array = text.replace(/\r\n/g, "\n").split("------------------------------------------------------------------------"),
        logList = [],
        item,
        i;

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