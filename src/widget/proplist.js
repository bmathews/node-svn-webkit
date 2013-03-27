var PropList = function (props) {
    var _this = this;
    this.domNode = $("<div class='propList'>");
    this.addPropButton = $("<button style='float: right; clear: both;' class='btn btn-addProp'><i class='icon-plus'></i></button>");
    this.propContainer = $("<div style='width: 500px; display: inline-block;'></div>");
    this.domNode.append(buildPropList());
    this.domNode.append(this.propContainer);
    this.domNode.append(this.addPropButton);

    this.editors = [];

    this.addPropButton.on('click', function () {
        _this.addProp("property", "").find(".edit").click();
    });

    this.setProperties(props);
};

function buildPropList() {
    var propList =
        "<datalist id='svnPropList'>" +
            "<option value='svn:externals'></option>" +
            "<option value='svn:executable'></option>" +
            "<option value='svn:mime-type'></option>" +
            "<option value='svn:externals'></option>" +
            "<option value='svn:ignore'></option>" +
        "</datalist>";
    return $(propList);
}

PropList.prototype.addProp = function (propName, propValue) {
    var _this = this;
    var rowHtml =
        "<div style='clear: both;' >" +
            "<div style='float: left;'><input class='propName' type='text' list='svnPropList' value='" + propName + "'/></div>" +
            "<div class='remove' style='float: right;'><button class='btn'><i class='icon-trash'></i></button></div>" +
            "<div class='edit' style='float: right;'><button class='btn'><i class='icon-pencil'></i></button></div>" +
            "<div class='editorRow' style='border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; clear: both; display: none; width: 500px;'><textarea class='editor' style='width: 500px; height: 200px; display: none;'>" + propValue.trim() + "</textarea></div>" +
        "</div>";
    var row = $(rowHtml);
    var editor = window.CodeMirror.fromTextArea(row.find('.editor')[0], {
        lineNumbers: true
    });
    $('.remove', row).click(function() {
        row.remove();
        _this.editors.splice(_this.editors.indexOf(editor), 1);
    });
    // var visible = false;
    $('.edit', row).click(function() {
        var visible = row.find('.editorRow').is(":visible");
        _this.domNode.find('.editorRow').slideUp(100);
        if (visible === false) {
            row.find('.editorRow').slideDown();
        }
        editor.setCursor(0);
        editor.setSize('500px', '200px');
    });
    this.editors.push(editor);
    this.propContainer.append(row);
    return row;
};

PropList.prototype.getProperties = function () {
    var props = {},
        inputs = this.domNode.find('.propName');
    this.editors.forEach(function (editor, index) {
        props[$(inputs[index]).val()] = editor.getValue();
    });
    return props;
};

PropList.prototype.setProperties = function (props) {
    this.propContainer.empty();
    for (var prop in props) {
        this.addProp(prop, props[prop]);
    }
};

module.exports = function (svn) {
    return new PropList(svn);
};