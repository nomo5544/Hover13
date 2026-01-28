chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "openHtmlPage") {
        chrome.tabs.create({ url: chrome.runtime.getURL("htmlPage.html") });
    } else if (request.action === "openTextPage") {
        chrome.tabs.create({ url: chrome.runtime.getURL("textPage.html") });
    }
});