/* Application's specific parameters */

// Map DB names of parameters to element IDs in HTML (for new domain).
// To get map for edit popup, we add "-edit" suffix.
const fields = {
    "domain_name": "identifier",
    "collector_ip": "host-ip",
    "collector_port": "host-port",
    "credentials": "dropbox",
    "delegated_user_name": "email"
}

// How to validate each input element (for new domain).
// Possible values: ip, port, collector, other
const fieldsValidate = {
    "identifier": "other",
    "host-ip": "ip",
    "host-port": "port",
    "dropbox": "other",
    "email": "other"
}

// Map DB names of parameters to element IDs in HTML (for existing domains).
const fieldsEdit = {
    "domain_name": "dn",
    "collector_ip": "collector",
    "collector_port": "collector",
    "credentials": "file",
    "delegated_user_name": "dun"
}

// How to validate each input element (for existing domains).
// Possible values: ip, port, collector, other
const fieldsEditValidate = {
    "dn": "other",
    "collector": "collector",
    "dun": "other"
}

// Map DB names of parameters to their labels in FE.
const fieldsNames = {
    "credentials": "Credentials",
    "domain_name": "Domain Name",
    "delegated_user_name": "Delegated User Name",
    "collector_ip": "Target Collector",
    "collector_port": "Target Collector"
}

// How many milliseconds to wait, when displaying a message.
const WAIT_TIME = 1500;


const icons = ["login", "admin", "calendar", "chat", "drive", "jamboard", "meet", "mobile", "gplus", "rules", "saml", "token", "user_accounts"];

window.onload = function() {
    dropbox = document.getElementById('dropbox');
    dropbox.addEventListener("dragenter", stop, false);
    dropbox.addEventListener("dragover", stop, false);
    dropbox.addEventListener("drop", drop, false);

    dropbox = document.getElementById('dropbox-edit');
    dropbox.addEventListener("dragenter", stop, false);
    dropbox.addEventListener("dragover", stop, false);
    dropbox.addEventListener("drop", drop, false);
}

function isIconEnabled(domainEndpoints, iconName) {
    let result = domainEndpoints.find(endpoint => endpoint.name == iconName);
    return !result ? false : result.enabled;
}

function downloadCredentials(id) {
    $.ajax("api/domain/" + id)
        .done(function(res) {
            var credentials = res.credentials;
            var temp = document.createElement("a");
            temp.style.display = "none";
            temp.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(credentials));
            temp.setAttribute("download", "credentials.json");
            document.body.appendChild(temp);
            temp.click();
            document.body.removeChild(temp);
        })
        .fail(function(err) {
            openError("Unable to fetch credentials", "", err.responseText);
        })
}

function clickedIcon(event) {
    if (!onEdit)
        return;
    var sender = event.srcElement;
    if (sender.style.filter == "" || sender.style.filter == "none") {
        sender.style.filter = "grayscale(100%)";
    } else {
        sender.style.filter = "none";
    }
}