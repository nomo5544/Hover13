chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'read-clipboard') {
        const input = document.createElement('div');
        input.contentEditable = true;
        document.body.appendChild(input);
        input.focus();
        document.execCommand('paste');
        const html = input.innerHTML;
        document.body.removeChild(input);
        sendResponse(html); // Віддаємо "сирий" HTML
    }
    return true;
});
