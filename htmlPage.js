chrome.storage.local.get("copiedHtml", function (data) {
    if (data.copiedHtml) {
        document.getElementById("content").innerHTML = data.copiedHtml;
    }
});