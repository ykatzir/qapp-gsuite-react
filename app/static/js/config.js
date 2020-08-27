function fetchDomains(column, desc) {
    var req = { url: "api/domain" };
    if (column != undefined)
        if (desc != undefined && desc)
            req.data = { "sort": column, "desc": desc };
        else
            req.data = { "sort": column };
    $.ajax(req)
        .done(function(res) {
            var table = document.getElementById('domains-table');
            table.children[1].innerHTML = "";
            for (var i = 0; res[i] != undefined; i++) {
                var domain = res[i];
                var html = "<tr class=\"bx--parent-row\" id=\"parent-" + domain.id + "\" data-parent-row data-event=\"expand\" onclick=\"toggle(event)\">\n                <td class=\"bx--table-expand\" data-event=\"expand\">\n                        <div class=\"expand-container\">\n                            <button class=\"bx--table-expand__button\">\n                            <svg focusable=\"false\" preserveAspectRatio=\"xMidYMid meet\" style=\"will-change: transform;\" xmlns=\"http://www.w3.org/2000/svg\" class=\"bx--table-expand__svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M11 8L6 13 5.3 12.3 9.6 8 5.3 3.7 6 3z\"></path></svg>\n                            </button>\n                        </div>\n                </td>\n            <td class=\"bx--table-column-checkbox\" data-event=\"stop(event)\">\n                    <input data-event=\"select\" id=\"bx--checkbox-" + domain.id + "\" class=\"bx--checkbox\" type=\"checkbox\">\n                    <label for=\"bx--checkbox-" + domain.id + "\" class=\"bx--checkbox-label\" aria-label=\"Label name\"></label>\n                </td>\n                <td>\n                    " + domain.domain_name + "\n                </td>\n                        <td>\n                    <div class=\"circle\" style=\"background-color: " + statusColor[domain.status] + ";\"></div><p style=\"display: inline; color: " + statusColor[domain.status] + "; font-size: 14px;\">" + cap(domain.status) + "</p>\n                </td>\n                        <td>\n                    <div class=\"bx--form-item\">\n                        <input class=\"bx--toggle-input\" id=\"toggle-" + domain.id + "\" onclick=\"enable(event)\" type=\"checkbox\"" + (domain.enabled ? " checked" : "") + ">\n                        <label class=\"bx--toggle-input__label\" for=\"toggle-" + domain.id + "\">\n                          <span class=\"bx--toggle__switch\">\n                          </span>\n                        </label>\n                      </div>\n                </td>\n                <td>\n                    <div class=\"bx--content-switcher\" id=\"switcher-" + domain.id + "\" onclick=\"stop(event)\">\n                        <button class=\"bx--content-switcher-btn edit\" onclick=\"edit(event)\">\n                            <svg focusable=\"false\" preserveAspectRatio=\"xMidYMid meet\" style=\"will-change: transform;\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M1 13H15V14H1zM12.7 4.5c.4-.4.4-1 0-1.4 0 0 0 0 0 0l-1.8-1.8c-.4-.4-1-.4-1.4 0 0 0 0 0 0 0L2 8.8V12h3.2L12.7 4.5zM10.2 2L12 3.8l-1.5 1.5L8.7 3.5 10.2 2zM3 11V9.2l5-5L9.8 6l-5 5H3z\"></path></svg>\n                        </button>\n                        <button id=\"delete-" + domain.id + "\" onclick=\"deleteDomain(event)\" class=\"bx--content-switcher-btn switcher-delete\">\n                            <svg focusable=\"false\" preserveAspectRatio=\"xMidYMid meet\" style=\"will-change: transform;\" xmlns=\"http://www.w3.org/2000/svg\" class=\"bx--btn__icon\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M6 6H7V12H6zM9 6H10V12H9z\"></path><path d=\"M2 3v1h1v10c0 .6.4 1 1 1h8c.6 0 1-.4 1-1V4h1V3H2zM4 14V4h8v10H4zM6 1H10V2H6z\"></path></svg>\n                        </button>\n                      </div>\n                </td>\n            </tr>\n        ";
                html += "<tr class=\"bx--expandable-row bx--expandable-row--hidden\" data-child-row>\n                <td colspan=\"6\">\n                <div class=\"bx--child-row-inner-container\">\n                    <table class=\"inside-table\">\n                        ";
                var fieldN = 0;
                for (var field in fieldsEdit) {
                    if (field != "collector_port" && fieldN % 3 == 0)
                        html += "<tr>\n                            ";
                    // Handle special cases
                    if (field == "credentials")
                        html += "<td>\n                                <label class=\"inside-label\">Credentials JSON</label>\n                                <p class=\"inside-value\"><a href=\"javascript:downloadCredentials(" + domain.id + ");\" id=\"credentials-" + domain.id + "\" style=\"visibility: visible\">Download Credentials File</a><input type=\"file\" id=\"file-" + domain.id + "\" name=\"file-uploader\" onchange=\"readFileId(" + domain.id + ")\" style=\"visibility: hidden\" /></p>\n                            </td>\n                            ";
                    else if (field == "collector_ip")
                        html += "<td>\n                                <label class=\"inside-label\">" + fieldsNames[field] + "</label><br/>\n                                <input class=\"bx--text-input inside-value\" id=\"collector-" + domain.id + "\" value=\"" + domain.collector_ip + ":" + domain.collector_port + "\" type=\"text\" readonly />\n                            </td>\n                            <th class=\"services-header\">Services</th>\n                        ";
                    else if (field == "collector_port") {
                        html += "";
                    } else
                        html += "<td>\n                                <label class=\"inside-label\">" + fieldsNames[field] + "</label><br/>\n                                <input class=\"bx--text-input inside-value\" id=\"" + fieldsEdit[field] + "-" + domain.id + "\" value=\"" + domain[field] + "\" type=\"text\" readonly />\n                            </td>\n                            ";
                    if (fieldN != Object.keys(fieldsEdit).length - 1 && fieldN % 3 == 2)
                        html += "</tr>\n                        ";
                    fieldN++;
                }
                html += "<td class=\"icon-container\">\n                                ";
                icons.forEach(icon => html += "<div class=\"wrapper\">\n                                    <img onclick=\"clickedIcon(event)\" id=\"" + icon + "-" + domain.id + "\" src=\"static/images/icons/" + icon + ".png\" class=\"icon\" style=\"" + (isIconEnabled(domain.domain_endpoints, icon) ? "" : "filter: grayscale(100%);") + "\" />\n                                    <p class=\"text\">" + cap(icon) + "</p>\n                                </div>\n");
                html += "                            </td>\n                        ";
                html += "</tr>\n                        <tr id=\"edit-buttons-" + domain.id + "\" style=\"visibility: hidden;\">\n                            <td>\n                                <button class=\"bx--btn bx--btn--danger-primary\" onclick=\"clickedId(" + domain.id + ")\" id=\"test-" + domain.id + "\" type=\"button\">Test Connection</button>\n                            </td>\n                            <td></td>\n                            <td style=\"float: right;\">\n                                <button class=\"bx--btn bx--btn--danger\" onclick=\"closeEdit()\" style=\"width: 40px; float: right;\">Cancel</button>\n                                <button class=\"bx--btn bx--btn--primary\" onclick=\"saveEdit(event)\" id=\"save-" + domain.id + "\" style=\"width: 40px; float: right;\">Save</button>\n                            </td>\n                        </tr>\n                    </table>\n                </div>\n                </td>\n            </tr>";
                table.children[1].innerHTML += html;
            }
        })
        .fail(function(err) {
            openError("Unable to fetch domains.", "", JSON.parse(err.responseText).message);
        })
}
fetchDomains();

function submitModal() {
    var name = document.getElementById("identifier").value;
    var logSource = document.getElementById("create-log-source").checked;
    var ips = [],
        ports = [],
        others = [],
        tcollectors = [];
    for (var field in fieldsValidate) {
        if (fieldsValidate[field] == "ip")
            ips.push(field);
        else if (fieldsValidate[field] == "port")
            ports.push(field);
        else if (fieldsValidate[field] == "collector")
            tcollectors.push(field);
        else
            others.push(field);
    }
    if (!validate(ips = ips, ports = ports, others = others, tcollectors = tcollectors, suffix = "", style = "border-bottom: 2px #a3222f solid"))
        return;

    // Load inputs to "data".
    var data = {};
    for (var field in fields)
        data[field] = document.getElementById(fields[field]).value;

    data["credentials"] = fileContent;
    data["domain_endpoints"] = [
        { name: "login", enabled: false },
        { name: "admin", enabled: false },
        { name: "calendar", enabled: false },
        { name: "chat", enabled: false },
        { name: "drive", enabled: false },
        { name: "jamboard", enabled: false },
        { name: "meet", enabled: false },
        { name: "mobile", enabled: false },
        { name: "gplus", enabled: false },
        { name: "rules", enabled: false },
        { name: "saml", enabled: false },
        { name: "token", enabled: false },
        { name: "user_accounts", enabled: false }
    ];
    $.ajax({
            url: "api/domain",
            type: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            data: JSON.stringify(data)
        })
        .done(function() {
            if (logSource)
                createLogSource(name);
            else {
                openSuccess("Success", "Successfully added domain.", "updating...");
                setTimeout(function() {
                    location.reload();
                }, WAIT_TIME);
            }
        })
        .fail(function(err) {
            var caption = "";
            if (typeof(JSON.parse(err.responseText).message) == typeof({}))
                for (var key in JSON.parse(err.responseText).message) {
                    caption += fieldsNames[key] + " - " + JSON.parse(err.responseText).message[key][0] + "\n";
                    document.getElementById(fields[key]).style.borderBottom = "2px #a3222f solid";
                }
            else {
                caption = JSON.parse(err.responseText).message;
                document.getElementById("identifier").style.borderBottom = "2px #a3222f solid";
            }
            openError("Unable to add domain.", "", caption);
        })
    resetModal();
}

function edit(event) {
    if (!getTR(event).className.includes("expandable"))
        toggle(event);
    onEdit = true;
    var sender = event.target;
    var switcher = sender;
    while (switcher.id == "") {
        switcher = switcher.parentElement;
    }
    var id = switcher.id.split("-")[1];
    editWhat = id;
    switcher.children[0].style.backgroundColor = "#9193f1";
    lastInputs = [];
    var i = 0;
    for (var input in fieldsEdit) {
        if (input == "credentials")
            continue;
        document.getElementById(fieldsEdit[input] + "-" + id).readOnly = false;
        lastInputs[i++] = document.getElementById(fieldsEdit[input] + "-" + id).value;
        document.getElementById(fieldsEdit[input] + "-" + id).style = "background: linear-gradient(to right, #000, #000) 5px calc(100% - 5px)/calc(100% - 10px) 2px no-repeat;"
    }
    icons.forEach(icon => {
        document.getElementById(icon + "-" + id).style.cursor = "pointer";
        lastInputs[i++] = document.getElementById(icon + "-" + id).style.filter
    });
    document.getElementById("edit-buttons-" + id).style.visibility = "visible";
    document.getElementById("credentials-" + id).style.visibility = "hidden";
    document.getElementById("file-" + id).style.visibility = "visible";
}

function closeEdit() {
    if (!onEdit)
        return;
    var id = editWhat;
    document.getElementById("switcher-" + id).children[0].style = "";
    var i = 0;
    for (var input in fieldsEdit) {
        if (input == "credentials")
            continue;
        document.getElementById(fieldsEdit[input] + "-" + id).value = lastInputs[i++];
        document.getElementById(fieldsEdit[input] + "-" + id).readOnly = true;
        document.getElementById(fieldsEdit[input] + "-" + id).style = "";
    }

    icons.forEach(icon => {
        document.getElementById(icon + "-" + id).style.cursor = "default";
        document.getElementById(icon + "-" + id).style.filter = lastInputs[i++];
    });

    document.getElementById("edit-buttons-" + id).style.visibility = "hidden";
    onEdit = false;

    document.getElementById("credentials-" + id).style.visibility = "visible";
    document.getElementById("file-" + id).style.visibility = "hidden";
    document.getElementById("file-" + id).value = "";

    fileContent = "";

    var tr = document.getElementById("switcher-" + id);
    while (tr.tagName.toLowerCase() != "tr" && tr.tagName != undefined) {
        tr = tr.parentElement;
    }
    document.getElementById("test-" + id).style.backgroundColor = "#f4f4f4";
    document.getElementById("test-" + id).style.borderColor = "inherit";
    document.getElementById("test-" + id).style.color = "black";

    tr.children[0].children[0].children[0].click();
}

function submitModalEdit() {
    var ips = [],
        ports = [],
        others = [],
        tcollectors = [];
    for (var field in fieldsValidate) {
        if (field == "identifier")
            continue;
        if (fieldsValidate[field] == "ip")
            ips.push(field);
        else if (fieldsValidate[field] == "port")
            ports.push(field);
        else if (fieldsValidate[field] == "collector")
            tcollectors.push(field);
        else
            others.push(field);
    }
    if (!validate(ips = ips, ports = ports, others = others, tcollectors = tcollectors, suffix = "-edit", style = "border-bottom: 2px #a3222f solid"))
        return;

    var params = [];
    getSelectedIds().forEach(id => {
        if (!Number.isInteger(id))
            return;
        var change = { "id": id };
        for (var field in fields) {
            if (field == "domain_name")
                continue;
            if (field == "credentials")
                if (fileContent[0] == "{") {
                    change["credentials"] = fileContent;
                    continue;
                }
            var val = document.getElementById(fields[field] + "-edit").value;
            if (val != "")
                change[field] = val;
        }
        params.push(change);
    });

    $.ajax({
            url: "api/domain",
            type: "PUT",
            headers: { "Accept": "application/json; charset=utf-8", "Content-Type": "application/json; charset=utf-8" },
            data: JSON.stringify(params)
        })
        .done(function() {
            openSuccess("Success", "Successfully edited domains.", "updating...");
            setTimeout(function() {
                location.reload();
            }, WAIT_TIME);
        })
        .fail(function(err) {
            var caption = "";
            if (typeof(JSON.parse(err.responseText).message) == typeof({}))
                for (var key in JSON.parse(err.responseText).message) {
                    caption += fieldsNames[key] + " - " + JSON.parse(err.responseText).message[key][0] + "\n";
                    document.getElementById(fields[key] + "-edit").style.borderBottom = "2px #a3222f solid";
                }
            else
                caption = JSON.parse(err.responseText).message;
            openError("Unable to edit domain.", "", caption);
        })
    resetModal();
}

function clicked() {
    document.getElementById("test").style = "";
    document.getElementById("new-error").style = "display: none";
    document.getElementById("new-success").style = "display: none";

    var ips = [],
        ports = [],
        others = [],
        tcollectors = [];
    for (var field in fieldsValidate) {
        if (fieldsValidate[field] == "ip")
            ips.push(field);
        else if (fieldsValidate[field] == "port")
            ports.push(field);
        else if (fieldsValidate[field] == "collector")
            tcollectors.push(field);
        else
            others.push(field);
    }
    if (!validate(ips = ips, ports = ports, others = others, tcollectors = tcollectors, suffix = "", style = "border-bottom: 2px #a3222f solid"))
        return;

    startLoad();
    $.ajax({
            url: "api/connection",
            type: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            data: JSON.stringify({
                "credentials": fileContent,
                "delegated_user_name": document.getElementById("email")
            })
        })
        // TODO: Map types of errors, and display accordingly in message
        .done(function() {
            var color = "#25c196";
            document.getElementById("test").style.backgroundColor = color;
            document.getElementById("test").style.borderColor = color;
            document.getElementById("test").style.color = "white";
            stopLoad();
            openSuccessNew("Test Connection Success", "Authorization with the given parameters was successful.");
        })
        .fail(function() {
            var color = "#a73559";
            document.getElementById("test").style.backgroundColor = color;
            document.getElementById("test").style.borderColor = color;
            document.getElementById("test").style.color = "white";
            stopLoad();
            openErrorNew("Test Connection Error", "Authorization with the given parameters was unsuccessful.");
        })
}

function clickedModalEdit() {
    document.getElementById("test-edit").style = "";
    document.getElementById("edit-error").style = "display: none";
    document.getElementById("edit-success").style = "display: none";

    var ips = [],
        ports = [],
        others = [],
        tcollectors = [];
    for (var field in fieldsValidate) {
        if (field == "identifier")
            continue;
        if (fieldsValidate[field] == "ip")
            ips.push(field);
        else if (fieldsValidate[field] == "port")
            ports.push(field);
        else if (fieldsValidate[field] == "collector")
            tcollectors.push(field);
        else
            others.push(field);
    }
    if (!validate(ips = ips, ports = ports, others = others, tcollectors = tcollectors, suffix = '-edit', style = 'border-bottom: 2px #a3222f solid;'))
        return;

    let delegatedUser = document.getElementById('email-edit').value;

    var ids = getSelectedIds();
    for (id in ids) {
        startLoad();
        $.ajax({
                url: "api/connection",
                type: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                data: JSON.stringify({
                    "credentials": fileContent,
                    "delegated_user_name": delegatedUser
                })
            })
            // TODO: Map types of errors, and display accordingly in message
            .done(function() {
                if (document.getElementById("test-edit").style.backgroundColor == "#a73559")
                    return;
                var color = "#25c196";
                document.getElementById("test-edit").style.backgroundColor = color;
                document.getElementById("test-edit").style.borderColor = color;
                document.getElementById("test-edit").style.color = "white";
                stopLoad();
                if (document.getElementById("edit-error").style !== "")
                    openSuccessEdit("Test Connection Success", "All tested domains were authorized successfully.");
            })
            .fail(function() {
                var color = "#a73559";
                document.getElementById("test-edit").style.backgroundColor = color;
                document.getElementById("test-edit").style.borderColor = color;
                document.getElementById("test-edit").style.color = "white";
                stopLoad();
                document.getElementById("edit-success").style = "display: none";
                openErrorEdit("Test Connection Failed", "Some tested domains were not authorized.");
            })
    }
}

function clickedId(id) {
    document.getElementById("test-" + id).style = "";

    var ips = [],
        ports = [],
        others = [],
        tcollectors = [];
    for (var field in fieldsEditValidate) {
        if (fieldsEditValidate[field] == "ip")
            ips.push(field);
        else if (fieldsEditValidate[field] == "port")
            ports.push(field);
        else if (fieldsEditValidate[field] == "collector")
            tcollectors.push(field);
        else
            others.push(field);
    }
    if (!validate(ips = ips, ports = ports, others = others, tcollectors = tcollectors, suffix = ('-' + id), style = "background: linear-gradient(to right, #a3222f, #a3222f) 5px calc(100% - 5px)/calc(100% - 10px) 2px no-repeat;", defStyle = 'background: linear-gradient(to right, #000, #000) 5px calc(100% - 5px)/calc(100% - 10px) 2px no-repeat;'))
        return;

    let delegatedUser = document.getElementById('dun-' + id).value;

    startLoad();
    if (fileContent == "") {
        $.ajax("api/domain/" + id)
            // TODO: Map types of errors, and display accordingly in message
            .done(function(res) {
                $.ajax({
                        url: "api/connection",
                        type: "POST",
                        headers: { "Content-Type": "application/json; charset=utf-8" },
                        data: JSON.stringify({
                            "credentials": res.credentials,
                            "delegated_user_name": delegatedUser
                        })
                    })
                    .done(function() {
                        var color = "#25c196";
                        document.getElementById("test-" + id).style.backgroundColor = color;
                        document.getElementById("test-" + id).style.borderColor = color;
                        document.getElementById("test-" + id).style.color = "white";
                        stopLoad();
                        openSuccess("Test Connection Success", "All tested domains were authorized successfully.", "");
                    })
                    .fail(function() {
                        var color = "#a73559";
                        document.getElementById("test-" + id).style.backgroundColor = color;
                        document.getElementById("test-" + id).style.borderColor = color;
                        document.getElementById("test-" + id).style.color = "white";
                        stopLoad();
                        openError("Test Connection Failed", "Some tested domains were not authorized.", "");
                    })
            })
            .fail(function(err) {
                openError("Unable to fetch credentials", "", err.responseText);
                stopLoad();
            })
    } else {
        $.ajax({
                url: "api/connection",
                type: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                data: JSON.stringify({
                    "credentials": fileContent,
                    "delegated_user_name": delegatedUser
                })
            })
            // TODO: Map types of errors, and display accordingly in message
            .done(function() {
                var color = "#25c196";
                document.getElementById("test-" + id).style.backgroundColor = color;
                document.getElementById("test-" + id).style.borderColor = color;
                document.getElementById("test-" + id).style.color = "white";
                stopLoad();
                openSuccess("Test Connection Success", "All tested domains were authorized successfully.", "");
            })
            .fail(function() {
                var color = "#a73559";
                document.getElementById("test-" + id).style.backgroundColor = color;
                document.getElementById("test-" + id).style.borderColor = color;
                document.getElementById("test-" + id).style.color = "white";
                stopLoad();
                openError("Test Connection Failed", "Some tested domains were not authorized.", "");
            })
    }
}

function saveEdit(event) {
    if (!onEdit)
        return;

    var id = event.target.id.split("-")[1];

    var ips = [],
        ports = [],
        others = [],
        tcollectors = [];
    for (var field in fieldsEditValidate) {
        if (fieldsEditValidate[field] == "ip")
            ips.push(field);
        else if (fieldsEditValidate[field] == "port")
            ports.push(field);
        else if (fieldsEditValidate[field] == "collector")
            tcollectors.push(field);
        else
            others.push(field);
    }
    if (!validate(ips = ips, ports = ports, others = others, tcollectors = tcollectors, suffix = ("-" + id), style = "background: rgba(0, 0, 0, 0) linear-gradient(to right, #a3222f, #a3222f) no-repeat scroll 5px calc(100% - 5px) / calc(100% - 10px) 2px", defStyle = "background: rgba(0, 0, 0, 0) linear-gradient(to right, #000, #000) no-repeat scroll 5px calc(100% - 5px) / calc(100% - 10px) 2px"))
        return;
    id = event.target.id.split("-")[1];
    var data = {};
    for (var field in fieldsEdit) {
        if (field == "collector_ip")
            data[field] = document.getElementById(fieldsEdit[field] + "-" + id).value.split(":")[0];
        else if (field == "collector_port")
            data[field] = document.getElementById(fieldsEdit[field] + "-" + id).value.split(":")[1];
        else if (field != "credentials")
            data[field] = document.getElementById(fieldsEdit[field] + "-" + id).value;
    }
    var domain_endpoints = [];
    for (service in icons)
        domain_endpoints.push({ name: icons[service], enabled: document.getElementById(icons[service] + "-" + id).style.filter != "grayscale(100%)" });
    data["domain_endpoints"] = domain_endpoints;
    if (fileContent != undefined && fileContent[0] == "{")
        data["credentials"] = fileContent;
    $.ajax({
            url: "api/domain/" + id,
            type: "PUT",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            data: JSON.stringify(data)
        })
        .done(function() {
            openSuccess("Success", "Successfully edited domain.", "updating...");
            setTimeout(function() {
                location.reload();
            }, WAIT_TIME);
        })
        .fail(function(err) {
            var caption = "";
            if (typeof(JSON.parse(err.responseText).message) == typeof({}))
                for (var key in JSON.parse(err.responseText).message) {
                    caption += fieldsNames[key] + " - " + JSON.parse(err.responseText).message[key][0] + "\n";
                    document.getElementById(fieldsEdit[key] + "-" + id).style = "background: rgba(0, 0, 0, 0) linear-gradient(to right, #a3222f, #a3222f) no-repeat scroll 5px calc(100% - 5px) / calc(100% - 10px) 2px";
                }
            openError("Unable to edit domain.", "", caption);
        })
}