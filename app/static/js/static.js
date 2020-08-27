/* Parameters and function definitions that shouldn't be changed. */

// Parameters which their intial value shouldn't be changed:
const regexIp = new RegExp("^((\\d\\d?|1\\d\\d|2([0-4]\\d|5[0-5]))\.){3}(\\d\\d?|1\\d\\d|2([0-4]\\d|5[0-5]))$");
const regexPort = new RegExp("^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$");

const statusColor = {
    "active": "#24a148",
    "configured": "#8a8a8a",
    "failed": "#da1e28"
}

var onEdit = false;
var editWhat = -1;
var lastInputs = [];
var fileContent = "";

// Functions that generally shouldn't be changed:
function openError(header, subtitle, caption) {
    resetError();
    document.getElementById("error-header").innerText = header;
    document.getElementById("error-subtitle").innerText = subtitle;
    document.getElementById("error-caption").innerText = caption;
    document.getElementById("open-error").click();
}

function openSuccess(header, subtitle, caption) {
    resetSuccess();
    document.getElementById("success-header").innerText = header;
    document.getElementById("success-subtitle").innerText = subtitle;
    document.getElementById("success-caption").innerText = caption;
    document.getElementById("open-success").click();
}

function openErrorNew(header, subtitle) {
    document.getElementById("new-error").style = "";
    document.getElementById("new-error-title").innerText = header;
    document.getElementById("new-error-subtitle").innerText = subtitle;
}

function openSuccessNew(header, subtitle) {
    document.getElementById("new-success").style = "";
    document.getElementById("new-success-title").innerText = header;
    document.getElementById("new-success-subtitle").innerText = subtitle;
}

function openErrorEdit(header, subtitle) {
    document.getElementById("edit-error").style = "";
    document.getElementById("edit-error-title").innerText = header;
    document.getElementById("edit-error-subtitle").innerText = subtitle;
}

function openSuccessEdit(header, subtitle) {
    document.getElementById("edit-success").style = "";
    document.getElementById("edit-success-title").innerText = header;
    document.getElementById("edit-success-subtitle").innerText = subtitle;
}

function resetError() {
    document.getElementById("error-header").innerText = "";
    document.getElementById("error-subtitle").innerText = "";
    document.getElementById("error-caption").innerText = "";
}

function resetSuccess() {
    document.getElementById("success-header").innerText = "";
    document.getElementById("success-subtitle").innerText = "";
    document.getElementById("success-caption").innerText = "";
}

function getSelectedIds() {
    var selected = document.getElementsByClassName("bx--data-table--selected");
    var selectedIds = [];
    Array.prototype.forEach.call(selected, row => {
        if (row.id == "")
            return;
        selectedIds.push(parseInt(row.id.split("-")[1]));
    });
    return selectedIds;
}

function sortTable(event) {
    if (!event.target.className.includes("ascending") && event.target.className.includes(" ")) {
        fetchDomains();
        return;
    }

    if (event.target.className.includes("ascending")) {
        // Order descending
        fetchDomains(event.target.id, true);
    } else {
        // Order ascending
        fetchDomains(event.target.id, false);
    }
}

function readFile() {
    var reader = new FileReader();
    reader.onload = function() {
        fileContent = reader.result;
    };
    reader.readAsText(document.getElementById('file-uploader').files[0]);
    clearNames(document.getElementById('file-uploader').files[0].name);
}

function readFileId(id) {
    var reader = new FileReader();
    reader.onload = function() {
        fileContent = reader.result;
    };
    reader.readAsText(document.getElementById('file-' + id).files[0]);
    if (id == "edit")
        clearNames(document.getElementById('file-edit').files[0].name);
}

function clearNames(name) {
    var elms = document.getElementsByClassName("bx--file__selected-file");
    for (var i = 0; i < elms.length; i++)
        if (elms[i].innerText != name)
            elms[i].parentElement.removeChild(elms[i]);
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var reader = new FileReader();
    reader.onload = function() {
        fileContent = reader.result;
    };
    reader.readAsText(e.dataTransfer.files[0]);
    clearNames(e.dataTransfer.files[0].name);
}

function createLogSource(domain) {
    $.ajax({ url: "api/logsource/" + domain, type: "POST" })
        .done(function() {
            openSuccess("Success", "Successfully added domain, and created log source.", "updating...");
            setTimeout(function() {
                location.reload();
            }, WAIT_TIME);
        })
        .fail(function(err) {
            openError("Unable to create log source.", "", JSON.parse(err.responseText).message);
        })
}

function deleteDomain(event) {
    var deleteId = event.target.id.split("-");
    if (deleteId.length != 2 || deleteId[0] != "delete")
        return;
    $.ajax({ url: "api/domain/" + deleteId[1], type: "DELETE" })
        .done(function() {
            openSuccess("Success", "Successfully deleted domain.", "updating...");
            setTimeout(function() {
                location.reload();
            }, WAIT_TIME);
        })
        .fail(function(err) {
            openError("Unable to delete domain.", "", err.statusText);
        })
}

function enable(event) {
    var sender = event.target;
    var id = sender.id.split("-")[1];
    $.ajax({
            url: "api/domain/" + id,
            type: "PUT",
            headers: { "Accept": "application/json; charset=utf-8", "Content-Type": "application/json; charset=utf-8" },
            data: JSON.stringify({ "enabled": sender.checked })
        })
        .done(function() {
            openSuccess("Success", "Successfully edited domain.", "updating...");
            setTimeout(function() {
                document.getElementById("modal-success").click();
            }, WAIT_TIME / 2);
        })
        .fail(function(err) {
            var toggle = document.getElementById("toggle-" + id);
            toggle.onclick = function(event) { event.stopPropagation(); }
            toggle.click();
            toggle.onclick = function(event) { enable(event); };
            openError("Failed to enable domain.", "", err.statusText);
        })
}

function startLoad() {
    document.getElementById("open-load").click();
}

function stopLoad() {
    document.getElementById("modal-load").click();
}

function stop(event) {
    event.preventDefault();
    event.stopPropagation();
}

function getTR(event) {
    var sender = event.target;
    var tr = sender.parentElement;
    while (tr.tagName.toLowerCase() != "tr" && tr.tagName != undefined) {
        tr = tr.parentElement;
    }
    return tr;
}

function toggle(event) {
    if (onEdit)
        stop(event);
    getTR(event).children[0].children[0].children[0].click();
}

function validate(ips = [], ports = [], others = [], tcollectors = [], suffix = "", style = "", defStyle = "") {
    for (input in ips) document.getElementById(ips[input] + "" + suffix).style = defStyle;
    for (input in ports) document.getElementById(ports[input] + "" + suffix).style = defStyle;
    for (input in others) document.getElementById(others[input] + "" + suffix).style = defStyle;
    for (input in tcollectors) document.getElementById(tcollectors[input] + "" + suffix).style = defStyle;

    var ret = true;
    for (id in others) {
        var obj = document.getElementById(others[id] + "" + suffix);
        if (obj.value == "") {
            ret = false;
            obj.style = style;
        }
    }

    for (id in tcollectors) {
        var obj = document.getElementById(tcollectors[id] + "" + suffix);
        if (obj.value == "") {
            ret = false;
            obj.style = style;
        }
        var ip = obj.value.split(":")[0];
        var port = obj.value.split(":")[1];
        if (!regexIp.test(ip) || !regexPort.test(port)) {
            ret = false;
            obj.style = style;
        }
    }

    for (id in ips) {
        var obj = document.getElementById(ips[id] + "" + suffix);
        if (obj.value == "" || !regexIp.test(obj.value)) {
            ret = false;
            obj.style = style;
        }
    }

    for (id in ports) {
        var obj = document.getElementById(ports[id] + "" + suffix);
        if (obj.value == "" || !regexPort.test(obj.value)) {
            ret = false;
            obj.style = style;
        }
    }

    return ret;
}

function resetModal() {
    document.getElementById("test").style.backgroundColor = "#f4f4f4";
    document.getElementById("test").style.borderColor = "inherit";
    document.getElementById("test").style.color = "black";
    for (var key in fields)
        document.getElementById(fields[key]).style.borderBottom = "1px #8d8d8d solid";
    document.getElementById("modal-vs9344weov").children[0].children[1].children[0].reset();

    document.getElementById("test-edit").style.backgroundColor = "#f4f4f4";
    document.getElementById("test-edit").style.borderColor = "inherit";
    document.getElementById("test-edit").style.color = "black";
    for (var key in fields) {
        if (key != "domain_name")
            document.getElementById(fields[key] + "-edit").style.borderBottom = "1px #8d8d8d solid";
    }
    document.getElementById("modal-edit").children[0].children[1].children[0].reset();
    document.getElementById("new-error").style = "display: none;";
    document.getElementById("new-success").style = "display: none;";
    document.getElementById("edit-error").style = "display: none;";
    document.getElementById("edit-success").style = "display: none;";
}

function onclickModal(event) {
    if (event.target.id.split("-")[0] == "modal")
        resetModal();
}

function bulkDelete(event) {
    $.ajax({
            url: "api/domain?domain_ids=" + getSelectedIds().join(),
            type: "DELETE"
        })
        .done(function() {
            openSuccess("Success", "Successfully deleted domains.", "updating...");
            setTimeout(function() {
                location.reload();
            }, WAIT_TIME)
        })
        .fail(function(err) {
            openError("Unable to delete multiple domains.", "", err.statusText);
        })
}

function cap(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}