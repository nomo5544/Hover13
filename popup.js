const openTextButton = document.getElementById("openTextButton");

const bookNameMap = {
    "Бут": "Буття",
    "Рим": "Римлян",
    // Додай інші скорочення, які ти можеш зустріти
};

openTextButton.addEventListener('click', function () {
    navigator.clipboard.read().then(function (clipboardItems) {
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type === 'text/html') {
                    clipboardItem.getType(type).then(function (blob) {
                        blob.text().then(function (html) {
                            const bibleRegex = /(\d?[А-Яа-яІЇЄҐ][а-яіїєґ']*)(?:\s*\.\s*|\s*\:\s*|\s+)(\d+)(?:[\.\:](\d+(?:[\-\–]\d+)?))?/g;
                            let modifiedHtml = html.replace(bibleRegex, function (match, bookPart, chapter, verse) {
                                const trimmedBookPart = bookPart.trim();
                                const fullBookName = bookNameMap[trimmedBookPart] || trimmedBookPart;
                                const reference = `${fullBookName} ${chapter}:${verse || "1"}`;
                                return `<a href="#" class="bible-link" data-reference="${reference}">${match}</a>`;
                            });

                            chrome.storage.local.set({ copiedHtml: modifiedHtml }, function () {
                                chrome.runtime.sendMessage({ action: "openTextPage" });
                            });
                        });
                    });
                    return;
                }
            }
        }
    }).catch(function (error) {
        console.error("Помилка при читанні буфера обміну: ", error);
        alert("Помилка при читанні буфера обміну.");
    });
});