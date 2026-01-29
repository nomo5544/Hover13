// Content script для автоматичного розпізнавання біблійних посилань на сторінці та hover функціоналу

let bibleData = {};
let tooltip = null;

// Мапа скорочень книг
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

// Завантажуємо дані біблії
function initBibleData() {
    fetch(chrome.runtime.getURL('bibleText.json'))
        .then(response => response.json())
        .then(data => {
            bibleData = data;
            // Після завантаження даних обробляємо сторінку
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', processPage);
            } else {
                processPage();
            }
        })
        .catch(error => console.error('Помилка при завантаженні тексту біблії:', error));
}

// Ініціалізуємо при завантаженні
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBibleData);
} else {
    initBibleData();
}

// Функція для отримання виділеного тексту з HTML форматуванням
function getSelectedTextWithHtml() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    
    try {
        container.appendChild(range.cloneContents());
        return container.innerHTML;
    } catch (e) {
        return selection.toString();
    }
}

// Обробка сторінки - знаходження біблійних посилань (асинхронна, щоб не блокувати UI)
function processPage() {
    // Простий regex для розпізнавання біблійних посилань
    // Захоплює "1 Петра", "2 Тимофія" тощо
    const bibleRegex = /(\d+\s+)?([А-Яа-яІЇЄҐ][А-Яа-яІЇЄҐіїєґ'\s]{1,25}?)(?:\s*[\.\:]\s*|\s+)(\d+)(?:[\.\:](\d+(?:[\-\–]\d+)?))?/g;
    
    // Функція для обробки текстового вузла
    function processTextNode(node) {
        if (node.nodeType !== Node.TEXT_NODE) return;
        
        const text = node.textContent;
        if (!bibleRegex.test(text)) return;
        
        bibleRegex.lastIndex = 0; // Скидаємо regex
        
        const parent = node.parentNode;
        if (!parent || parent.classList.contains('bible-link-processed')) return;
        
        const matches = [];
        let match;
        bibleRegex.lastIndex = 0;
        
        while ((match = bibleRegex.exec(text)) !== null) {
            const numberPrefix = match[1] || '';
            const bookPart = match[2] || '';
            const chapter = match[3] || '';
            const verse = match[4] || "1";
            
            if (!bookPart.trim()) continue;
            
            matches.push({
                match: match[0],
                index: match.index,
                numberPrefix: numberPrefix.trim(),
                bookPart: bookPart.trim(),
                chapter: chapter,
                verse: verse
            });
        }
        
        if (matches.length === 0) return;
        
        // Створюємо фрагмент з обробленим текстом
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        matches.forEach(({ match, index, numberPrefix, bookPart, chapter, verse }) => {
            // Додаємо текст перед посиланням
            if (index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
            }
            
            // Формуємо повну назву книги
            const fullBookPart = numberPrefix ? (numberPrefix + ' ' + bookPart) : bookPart;
            const fullBookName = bookNameMap[fullBookPart] || bookNameMap[bookPart] || fullBookPart;
            const reference = `${fullBookName} ${chapter}:${verse}`;
            
            // Створюємо посилання
            const link = document.createElement('span');
            link.className = 'bible-link-hover';
            link.textContent = match;
            link.style.cursor = 'pointer';
            link.style.textDecoration = 'underline';
            link.style.color = '#0066cc';
            link.setAttribute('data-reference', reference);
            
            // Додаємо hover listeners
            link.addEventListener('mouseenter', handleMouseEnter);
            link.addEventListener('mouseleave', handleMouseLeave);
            
            fragment.appendChild(link);
            lastIndex = index + match.length;
        });
        
        // Додаємо залишок тексту
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Замінюємо оригінальний вузол
        parent.replaceChild(fragment, node);
        parent.classList.add('bible-link-processed');
    }
    
    // Асинхронна обробка вузлів, щоб не блокувати UI
    function processNodesAsync() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentNode;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (parent.classList.contains('bible-link-processed') || 
                        parent.classList.contains('bible-link-hover') ||
                        parent.classList.contains('tooltip')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        let processedCount = 0;
        const batchSize = 10; // Обробляємо по 10 вузлів за раз
        
        function processBatch() {
            let count = 0;
            let node;
            
            while ((node = walker.nextNode()) && count < batchSize) {
                processTextNode(node);
                count++;
                processedCount++;
            }
            
            // Якщо є ще вузли, продовжуємо асинхронно
            if (node) {
                setTimeout(processBatch, 0);
            }
        }
        
        // Починаємо обробку
        setTimeout(processBatch, 0);
    }
    
    // Запускаємо асинхронну обробку
    processNodesAsync();
    
    // Спостерігаємо за новими елементами (для динамічного контенту) - тільки для великих змін
    if (!window.bibleObserver) {
        let observerTimeout;
        window.bibleObserver = new MutationObserver(function(mutations) {
            clearTimeout(observerTimeout);
            // Дебаунс - обробляємо тільки після паузи в змінах
            observerTimeout = setTimeout(function() {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            setTimeout(() => processTextNode(node), 0);
                        } else if (node.nodeType === Node.ELEMENT_NODE && node.querySelector) {
                            const textNodes = [];
                            const walker = document.createTreeWalker(
                                node,
                                NodeFilter.SHOW_TEXT,
                                {
                                    acceptNode: function(textNode) {
                                        const parent = textNode.parentNode;
                                        if (!parent) return NodeFilter.FILTER_REJECT;
                                        if (parent.classList.contains('bible-link-processed') || 
                                            parent.classList.contains('bible-link-hover') ||
                                            parent.classList.contains('tooltip')) {
                                            return NodeFilter.FILTER_REJECT;
                                        }
                                        return NodeFilter.FILTER_ACCEPT;
                                    }
                                }
                            );
                            let textNode;
                            while (textNode = walker.nextNode()) {
                                textNodes.push(textNode);
                            }
                            // Обробляємо асинхронно
                            textNodes.forEach((tn, idx) => {
                                setTimeout(() => processTextNode(tn), idx * 10);
                            });
                        }
                    });
                });
            }, 500); // Чекаємо 500мс після останньої зміни
        });
        
        window.bibleObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Обробка hover
function handleMouseEnter(event) {
    const link = event.target.closest('.bible-link-hover');
    if (!link) return;
    
    const reference = link.getAttribute('data-reference');
    if (!reference || !bibleData) return;
    
    const verseText = getVerseText(reference);
    if (verseText) {
        showTooltip(event, link, verseText);
    }
}

function handleMouseLeave(event) {
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
    }
}

function getVerseText(reference) {
    if (!reference || !bibleData) return null;
    
    // Нормалізуємо посилання
    const normalizedRef = reference.replace(/\s+/g, ' ').trim();
    
    // Перевіряємо точне збігання
    if (bibleData[normalizedRef]) {
        return normalizedRef + '\n' + bibleData[normalizedRef];
    }
    
    // Обробляємо діапазони (наприклад, "Буття 1:3-5")
    const rangeMatch = normalizedRef.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
        const [, book, chapter, startVerse, endVerse] = rangeMatch;
        const verses = [];
        for (let v = parseInt(startVerse); v <= parseInt(endVerse); v++) {
            const verseText = findVerseTextSimpleContent(book, chapter, v);
            if (verseText) {
                verses.push(`${book} ${chapter}:${v}\n${verseText}`);
            }
        }
        if (verses.length > 0) {
            return verses.join('\n\n');
        }
    }
    
    // Якщо це один вірш
    const singleMatch = normalizedRef.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (singleMatch) {
        const [, book, chapter, verse] = singleMatch;
        const verseNum = parseInt(verse);
        
        let verseText = findVerseTextSimpleContent(book, chapter, verseNum);
        
        if (verseText) {
            // Показуємо поточний вірш та наступні (до 5 віршів загалом)
            const verses = [`${book} ${chapter}:${verse}\n${verseText}`];
            let nextVerse = verseNum + 1;
            let count = 0;
            
            while (count < 4 && nextVerse <= 200) {
                const nextVerseText = findVerseTextSimpleContent(book, chapter, nextVerse);
                if (nextVerseText) {
                    verses.push(`${book} ${chapter}:${nextVerse}\n${nextVerseText}`);
                    count++;
                    nextVerse++;
                } else {
                    break;
                }
            }
            
            return verses.join('\n\n');
        }
    }
    
    return null;
}

// Спрощена функція для пошуку вірша
function findVerseTextSimpleContent(book, chapter, verse) {
    if (!bibleData || Object.keys(bibleData).length === 0) {
        return null;
    }
    
    // Спочатку перевіряємо стандартний формат "Книга Розділ:Вірш"
    const standardKey = `${book} ${chapter}:${verse}`;
    if (bibleData[standardKey]) {
        return bibleData[standardKey];
    }
    
    // Якщо не знайдено, шукаємо за нестандартним форматом
    const escapedBook = book.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchPattern = new RegExp(`^${escapedBook}\\s+${chapter}:`);
    
    // Спочатку збираємо всі ключі, що відповідають паттерну (обмежуємо до 200)
    const matchingKeys = [];
    let checkCount = 0;
    const maxChecks = 200;
    
    for (const key in bibleData) {
        if (checkCount >= maxChecks) break;
        
        if (searchPattern.test(key)) {
            matchingKeys.push({ key, value: bibleData[key] });
            checkCount++;
        }
    }
    
    if (matchingKeys.length === 0) {
        return null;
    }
    
    // Сортуємо за значенням (номер вірша)
    matchingKeys.sort((a, b) => {
        const valA = parseInt(a.value) || 0;
        const valB = parseInt(b.value) || 0;
        return valA - valB;
    });
    
    // Шукаємо вірш за значенням (номер вірша)
    for (const item of matchingKeys) {
        const value = item.value;
        if (String(value) === String(verse) || value === verse) {
            const textMatch = item.key.match(/^.+?:\s*(.+)$/);
            if (textMatch && textMatch[1]) {
                return textMatch[1].trim();
            }
        }
    }
    
    // Якщо не знайшли за значенням, спробуємо знайти за порядком (якщо значення - це порядковий номер)
    const verseIndex = verse - 1;
    if (verseIndex >= 0 && verseIndex < matchingKeys.length) {
        const item = matchingKeys[verseIndex];
        const textMatch = item.key.match(/^.+?:\s*(.+)$/);
        if (textMatch && textMatch[1]) {
            return textMatch[1].trim();
        }
    }
    
    return null;
}

function showTooltip(event, link, text) {
    if (tooltip) {
        tooltip.remove();
    }
    
    if (!link || !text) return;
    
    tooltip = document.createElement('div');
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = '#fff';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.padding = '12px 16px';
    tooltip.style.fontSize = '14px';
    tooltip.style.lineHeight = '1.6';
    tooltip.style.zIndex = '10000';
    tooltip.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.2)';
    tooltip.style.borderRadius = '4px';
    tooltip.style.maxWidth = '500px';
    tooltip.style.maxHeight = '400px';
    tooltip.style.overflowY = 'auto';
    tooltip.style.overflowX = 'hidden';
    tooltip.style.whiteSpace = 'pre-wrap';
    tooltip.style.wordWrap = 'break-word';
    tooltip.style.overflowWrap = 'break-word';
    tooltip.style.wordBreak = 'break-word';
    tooltip.style.boxSizing = 'border-box';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    // Отримуємо позицію посилання (відносно viewport)
    const linkRect = link.getBoundingClientRect();
    
    // Позиціонуємо tooltip поруч з посиланням (справа)
    let left = linkRect.right + 15;
    let top = linkRect.top;
    
    // Перевіряємо межі viewport
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Адаптуємо maxWidth до доступного простору
    const maxAvailableWidth = Math.min(500, windowWidth - 40);
    tooltip.style.maxWidth = `${maxAvailableWidth}px`;
    
    // Перераховуємо розмір після зміни maxWidth
    const newTooltipRect = tooltip.getBoundingClientRect();
    
    // Якщо підказка виходить за праву межу, показуємо зліва від посилання
    if (left + newTooltipRect.width > windowWidth) {
        left = linkRect.left - newTooltipRect.width - 15;
        // Якщо все ще виходить, позиціонуємо над посиланням по центру
        if (left < 10) {
            left = Math.max(10, linkRect.left + (linkRect.width / 2) - (newTooltipRect.width / 2));
            // Якщо і це не працює, позиціонуємо зліва від вікна
            if (left + newTooltipRect.width > windowWidth) {
                left = Math.max(10, windowWidth - newTooltipRect.width - 10);
            }
        }
    }
    
    // Якщо підказка виходить за нижню межу, позиціонуємо вище
    if (top + newTooltipRect.height > windowHeight) {
        top = linkRect.bottom - newTooltipRect.height;
        // Якщо все ще виходить, позиціонуємо зверху посилання
        if (top < 10) {
            top = linkRect.top - newTooltipRect.height - 10;
            // Якщо і це не працює, позиціонуємо зверху вікна
            if (top < 10) {
                top = Math.max(10, windowHeight - newTooltipRect.height - 10);
            }
        }
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    
    // Додаємо обробник зміни розміру вікна для перепозиціонування
    const updatePosition = () => {
        if (!tooltip || !link) return;
        const linkRect = link.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = linkRect.right + 15;
        let top = linkRect.top;
        
        if (left + tooltipRect.width > windowWidth) {
            left = linkRect.left - tooltipRect.width - 15;
            if (left < 10) {
                left = Math.max(10, linkRect.left + (linkRect.width / 2) - (tooltipRect.width / 2));
            }
        }
        
        if (top + tooltipRect.height > windowHeight) {
            top = linkRect.bottom - tooltipRect.height;
            if (top < 10) {
                top = linkRect.top - tooltipRect.height - 10;
            }
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };
    
    if (!window.contentTooltipResizeHandler) {
        window.contentTooltipResizeHandler = updatePosition;
        window.addEventListener('resize', window.contentTooltipResizeHandler);
    }
}

// Слухаємо повідомлення від popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
        const selectedHtml = getSelectedTextWithHtml();
        const selectedText = window.getSelection().toString();
        
        sendResponse({
            success: true,
            html: selectedHtml || selectedText,
            text: selectedText
        });
    }
    return true;
});
