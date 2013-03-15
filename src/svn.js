/*jslint node: true */
"use strict";

var spawn = require('child_process').spawn;
var path = require('path');

var SVN = function (repoRoot, readyCallback) {
    this.repoRoot = repoRoot;
    var scope = this;
    this.getInfo(function (info) {
        scope.info = info;
        if (readyCallback) {
            readyCallback(info);
        }
    });
};

var svn = SVN.prototype;

svn._processLogEntry = function (logText) {
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

svn.command = function (args, callback) {
    var cmd,
        text = "";

    cmd = spawn('svn', args.split(" "), { cwd: this.repoRoot });

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) {
        text += data;
    });

    cmd.on('close', function (code) {
        callback(text);
    });
};

svn._processLog = function (text) {
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
        item = this._processLogEntry(array[i]);
        if (item) {
            logList.push(item);
        }
    }

    return logList;
};

svn.diffExternal = function (file, revision, callback) {
    var path = this.repoRoot + file,
        cmd,
        text = "";

    cmd = spawn('svn', ['diff', '-c', revision, path]);

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) {
    });

    cmd.on('close', function (code) {
        callback(text.replace(/\t/g, "    "));
    });
};

svn.diffLocal = function (file, callback) {
    var path = this.repoRoot + file,
        cmd,
        text = "";

    cmd = spawn('svn', ['diff', path]);
    // cmd = spawn('svn', ['--diff-cmd', 'diff', '--extensions', '-y', 'diff', path]);

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) {
        text += data;
    });

    cmd.on('close', function (code) {
        callback(text.replace(/\t/g, "    "));
    });
};

svn.getFile = function (file, revision, callback) {
    var path = this.repoRoot + file,
        cmd,
        text = "";

    if (revision) {
        cmd = spawn('svn', ['cat', "-r", revision, path]);
    } else {
        cmd = spawn('cat', [path]);
    }

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) {
        text += data;
    });

    cmd.on('close', function (code) {
        callback(text);
    });
};

svn.getInfo = function (callback) {
    var cmd = spawn('svn', ['info', this.repoRoot]),
        text = "";

    console.log(this.repoRoot);

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) { 
        console.log(data);
    });

    cmd.on('close', function (code) {
        if (text.length) {

        } else {

        }
        var array = text.replace(/\r\n/g, "\n").split("\n"),
            info = {};
        array.forEach(function (line) {
            var firstColon = line.indexOf(":");
            info[line.substring(0, firstColon).replace(/\s*/g, "").toLowerCase()] = line.substring(firstColon + 1);
        });
        callback(info);
    });
};

svn.getLog = function (limit, callback) {
    var text = "",
        cmd = spawn('svn', ['log', this.repoRoot, '-v', '-l', limit || 25, '-r', 'HEAD:1', '--incremental']),
        scope = this;

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) { });

    cmd.on('close', function (code) {
        callback(scope._processLog(text));
    });
};

svn.revertLocal = function (file, callback) {
    var text = "",
        path = this.repoRoot + file,
        cmd = spawn('svn', ['revert', path]),
        scope = this;

    cmd.stdout.on('data', function (data) {
        text += data;
    });

    cmd.stderr.on('data', function (data) { });

    cmd.on('close', function (code) {
        callback(text);
    });
};

svn._processStatus = function (text) {
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

svn.getStatus = function (callback) {
    var cmd = spawn('svn', ['status', this.repoRoot]),
        text = "",
        scope = this;

    cmd.stdout.on('data', function (data) {
        if (String(data).length > 1) {
            text += data;
        }
    });

    cmd.stderr.on('data', function (data) { });

    cmd.on('close', function (code) {
        callback(scope._processStatus(text));
    });
};

svn.commit = function (options, callback) {
    var scope = this,
        cmd = spawn('svn', ['commit', "-m", options.message].concat(options.files.map(function (file) { return scope.repoRoot + file; }))),
        text = "";

    cmd.stdout.on('data', function (data) {
        if (String(data).length > 1) {
            text += data;
        }
    });

    cmd.stderr.on('data', function (data) { });

    cmd.on('close', function (code) {
        callback(text);
    });
};

svn.add = function (path, callback) {
    var cmd = spawn('svn', ['add', this.repoRoot + path]),
        text = "",
        scope = this;

    cmd.stdout.on('data', function (data) {
        if (String(data).length > 1) {
            text += data;
        }
    });

    cmd.stderr.on('data', function (data) { });

    cmd.on('close', function (code) {
        callback(text);
    });
};

module.exports = function (path, readyCallback) {
    return new SVN(path, readyCallback);
};