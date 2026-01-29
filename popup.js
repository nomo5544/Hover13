const openTextButton = document.getElementById("openTextButton");
const getSelectedButton = document.getElementById("getSelectedButton");
const statusDiv = document.getElementById("status");

function setStatus(message, isError = false) {
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.style.color = isError ? '#d32f2f' : '#666';
    }
}

const bookNameMap = {
    "Бут": "Буття",
    "Рим": "Римлян",
    "1Кор": "1 Коринтян",
    "2Кор": "2 Коринтян",
    "1Петр": "1 Петра",
    "2Петр": "2 Петра",
    "1Тим": "1 Тимофія",
    "2Тим": "2 Тимофія",
    "1Ів": "1 Івана",
    "2Ів": "2 Івана",
    "3Ів": "3 Івана",
    "Матв": "Матвія",
    "Марк": "Марка",
    "Лук": "Луки",
    "Ів": "Івана",
    "Дії": "Дії",
    "Гал": "Галатів",
    "Еф": "Ефесян",
    "Фил": "Филип'ян",
    "Кол": "Колосян",
    "1Сол": "1 Солунян",
    "2Сол": "2 Солунян",
    "Тит": "Тита",
    "Євр": "Євреїв",
    "Як": "Якова",
    "Юд": "Юди",
    "Об": "Об'явлення",
    "Пс": "Псалми",
    "Прип": "Приповісті",
    "Екл": "Еклезіаст",
    "Пісн": "Пісня над піснями",
    "Іс": "Ісаї",
    "Єр": "Єремії",
    "Пл": "Плач Єремії",
    "Єз": "Єзекіїла",
    "Дан": "Даниїла",
    "Ос": "Осії",
    "Йоіл": "Йоіла",
    "Ам": "Амоса",
    "Авд": "Авдія",
    "Йон": "Йони",
    "Мих": "Михея",
    "Наум": "Наума",
    "Авв": "Аввакума",
    "Соф": "Софонії",
    "Ог": "Огія",
    "Зах": "Захарії",
    "Мал": "Малахії"
};

// Зберігаємо оригінальний HTML для подальшої обробки
let originalHtml = null;

// Кнопка отримання виділеного тексту
getSelectedButton.addEventListener('click', async function() {
    getSelectedButton.disabled = true;
    setStatus("Отримання виділеного тексту...");
    
    try {
        // Отримуємо активну вкладку
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error("Не вдалося знайти активну вкладку");
        }
        
        // Відправляємо повідомлення content script
        chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" }, function(response) {
            if (chrome.runtime.lastError) {
                throw new Error(chrome.runtime.lastError.message);
            }
            
            if (response && response.success) {
                if (response.html && response.html.trim()) {
                    originalHtml = response.html;
                    setStatus("Виділений текст отримано! Натисніть 'Відкрити сторінку'");
                } else if (response.text && response.text.trim()) {
                    originalHtml = null;
                    setStatus("Виділений текст отримано! Натисніть 'Відкрити сторінку'");
                } else {
                    throw new Error("Виділений текст порожній. Виділіть текст на сторінці і спробуйте знову.");
                }
            } else {
                throw new Error("Не вдалося отримати виділений текст");
            }
            
            getSelectedButton.disabled = false;
        });
    } catch (error) {
        console.error("Помилка при отриманні виділеного тексту: ", error);
        setStatus("Помилка!", true);
        getSelectedButton.disabled = false;
        
        let errorMessage = "Не вдалося отримати виділений текст.\n\n";
        
        if (error.message.includes("Could not establish connection")) {
            errorMessage += "Переконайтеся, що:\n";
            errorMessage += "1. Ви виділили текст на сторінці\n";
            errorMessage += "2. Сторінка повністю завантажилася\n";
            errorMessage += "3. Спробуйте перезавантажити сторінку";
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
});

// Кнопка відкриття сторінки з обробленим текстом
openTextButton.addEventListener('click', function () {
    if (!originalHtml) {
        setStatus("Спочатку отримайте виділений текст!", true);
        return;
    }
    
    openTextButton.disabled = true;
    setStatus("Обробка...");
    
    processHtml(originalHtml);
});

function processHtml(html) {
    setStatus("Обробка посилань...");
    
    // Простий regex для розпізнавання біблійних посилань
    // Захоплює "1 Петра", "2 Тимофія" тощо
    const bibleRegex = /(\d+\s+)?([А-Яа-яІЇЄҐ][А-Яа-яІЇЄҐіїєґ'\s]{1,25}?)(?:\s*[\.\:]\s*|\s+)(\d+)(?:[\.\:](\d+(?:[\-\–]\d+)?))?/g;
    
    let modifiedHtml = html.replace(bibleRegex, function (match, numberPrefix, bookPart, chapter, verse) {
        const trimmedBookPart = (bookPart || '').trim();
        if (!trimmedBookPart || trimmedBookPart.length < 2) return match;
        
        // Якщо є числовий префікс (наприклад, "1 " перед "Петра"), додаємо його до назви книги
        const numberPart = numberPrefix ? numberPrefix.trim() : '';
        const fullBookPart = numberPart ? (numberPart + ' ' + trimmedBookPart) : trimmedBookPart;
        
        // Перевіряємо мапу скорочень
        let fullBookName = bookNameMap[fullBookPart] || bookNameMap[trimmedBookPart] || fullBookPart;
        
        // Якщо є вірш, використовуємо його, інакше встановлюємо "1"
        const versePart = verse || "1";
        
        // Формуємо посилання з діапазоном, якщо він є
        const reference = `${fullBookName} ${chapter}:${versePart}`;
        
        return `<a href="#" class="bible-link" data-reference="${reference}">${match}</a>`;
    });

    setStatus("Відкриття сторінки...");
    chrome.storage.local.set({ copiedHtml: modifiedHtml }, function () {
        if (chrome.runtime.lastError) {
            console.error("Помилка збереження: ", chrome.runtime.lastError);
            setStatus("Помилка збереження!", true);
            openTextButton.disabled = false;
            alert("Помилка при збереженні даних: " + chrome.runtime.lastError.message);
            return;
        }
        chrome.runtime.sendMessage({ action: "openTextPage" }, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Помилка відкриття сторінки: ", chrome.runtime.lastError);
                setStatus("Помилка!", true);
                openTextButton.disabled = false;
            } else {
                setStatus("Готово!");
                setTimeout(() => {
                    openTextButton.disabled = false;
                    setStatus("");
                }, 1000);
            }
        });
    });
}
