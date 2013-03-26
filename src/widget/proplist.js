var PropList = function (props) {
    var _this = this;
    this.domNode = $("<div class='propList'>");
    this.addPropButton = $("<button class='btn btn-addProp'>Add Property</button>");
    this.propContainer = $("<table></table>");
    this.domNode.append(buildPropList());
    this.domNode.append(this.propContainer);
    this.domNode.append(this.addPropButton);

    this.addPropButton.on('click', function () {
        _this.addProp("", "").find("input").focus();
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
    var rowHtml =
        "<tr>" +
            "<td><div><input type='text' list='svnPropList' value='" + propName + "'/></div></td>" +
            "<td><div><textarea>" + propValue.trim() + "</textarea></div></td>" +
            "<td><div><button class='btn'><i class='icon-trash'></i></button></div></td>" +
        "</tr>";
    var row = $(rowHtml);
    $('button', row).click(function() {
        row.remove();
    });
    this.propContainer.append(row);
    return row;
};

PropList.prototype.getProperties = function () {
    var props = {};
    $('tr', this.propContainer).each(function (ele) {
        props[$('td input', ele).val()] = $('td textarea', ele).val();
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