document.addEventListener('copy', () => {
    // Чекаємо 100 мілісекунд, щоб текст встиг потрапити в буфер
    setTimeout(async () => {
        try {
            const data = await navigator.clipboard.read();
            for (const item of data) {
                if (item.types.includes("text/html")) {
                    const blob = await item.getType("text/html");
                    const html = await blob.text();
                    // Записуємо новий HTML у пам'ять
                    chrome.storage.local.set({ "copiedHtml": html });
                }
            }
        } catch (e) {
            console.log("Доступ до буфера обмежений");
        }
    }, 100);
});
