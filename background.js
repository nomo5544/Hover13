chrome.action.onClicked.addListener(async () => {
    try {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['CLIPBOARD'],
            justification: 'Read clipboard'
        }).catch(() => {});

        const processedHtml = await chrome.runtime.sendMessage({ type: 'read-clipboard' });

        if (processedHtml) {
            await chrome.storage.local.set({ "copiedHtml": processedHtml });
            chrome.tabs.create({ url: chrome.runtime.getURL("textPage.html") });
        }
        
        await chrome.offscreen.closeDocument();
    } catch (error) {
        console.error("Background error:", error);
    }
});
