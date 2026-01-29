let bibleData = {};

// Завантажуємо дані біблії перед обробкою HTML
fetch(chrome.runtime.getURL('bibleText.json'))
    .then(response => response.json())
    .then(data => {
        bibleData = data;
        // Після завантаження даних обробляємо HTML
        loadAndProcessHtml();
    })
    .catch(error => console.error('Помилка при завантаженні тексту біблії:', error));

let eventsAttached = false;

function enforceAllWidthLimits() {
    const textContentDiv = document.getElementById('textcontent');
    const docContainer = document.querySelector('.doc-container');
    if (!textContentDiv || !docContainer) return;
    
    // Отримуємо доступну ширину з урахуванням масштабу
    const viewportWidth = window.innerWidth;
    const scale = 1.7;
    
    // Отримуємо фактичний padding з computed styles
    const computedStyle = window.getComputedStyle(docContainer);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 96;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 96;
    const totalPadding = paddingLeft + paddingRight;
    
    // Обчислюємо доступну ширину з урахуванням padding
    const maxDocWidth = viewportWidth / scale;
    const availableWidth = Math.max(100, maxDocWidth - totalPadding);
    
    // Встановлюємо ширину doc-container, щоб він займав всю доступну ширину
    docContainer.style.maxWidth = `${maxDocWidth}px`;
    docContainer.style.width = '100%';
    
    // Встановлюємо ширину textcontent на всю доступну ширину
    textContentDiv.style.maxWidth = '100%';
    textContentDiv.style.width = '100%';
    
    // Обмежуємо всі verse-text-container
    const verseContainers = textContentDiv.querySelectorAll('.verse-text-container');
    verseContainers.forEach(container => {
        container.style.maxWidth = '100%';
        container.style.width = '100%';
        
        // Обмежуємо внутрішні елементи
        const innerElements = container.querySelectorAll('*');
        innerElements.forEach(el => {
            el.style.maxWidth = '100%';
            el.style.width = 'auto';
            el.style.overflowX = 'hidden';
            el.style.wordBreak = 'break-word';
            el.style.overflowWrap = 'break-word';
        });
    });
    
    // Обмежуємо всі інші елементи всередині textcontent
    const allElements = textContentDiv.querySelectorAll('*');
    allElements.forEach(el => {
        if (!el.classList.contains('verse-text-container') && !el.classList.contains('bible-link')) {
            el.style.maxWidth = '100%';
            el.style.overflowX = 'hidden';
            el.style.wordBreak = 'break-word';
            el.style.overflowWrap = 'break-word';
        }
    });
}

function loadAndProcessHtml() {
    chrome.storage.local.get("copiedHtml", function (data) {
        if (data.copiedHtml) {
            const textContentDiv = document.getElementById("textcontent");
            textContentDiv.innerHTML = data.copiedHtml; // Встановлюємо HTML

            // Використовуємо event delegation тільки для кліку (тільки один раз)
            if (!eventsAttached) {
                textContentDiv.addEventListener('click', handleClick, true);
                eventsAttached = true;
            }
            
            // Додаємо текст віршів до всіх посилань
            expandAllVerses(textContentDiv);
            
            // Після додавання всіх віршів обмежуємо ширину
            setTimeout(enforceAllWidthLimits, 0);
            setTimeout(enforceAllWidthLimits, 100);
            setTimeout(enforceAllWidthLimits, 300);
            setTimeout(enforceAllWidthLimits, 500); // Додаткова перевірка після повного завантаження
            
            // Обмежуємо при зміні розміру
            if (!window.textPageResizeHandler) {
                let resizeTimeout;
                window.textPageResizeHandler = () => {
                    clearTimeout(resizeTimeout);
                    // Викликаємо кілька разів для надійності
                    resizeTimeout = setTimeout(() => {
                        enforceAllWidthLimits();
                        setTimeout(enforceAllWidthLimits, 50);
                        setTimeout(enforceAllWidthLimits, 150);
                    }, 50);
                };
                window.addEventListener('resize', window.textPageResizeHandler);
                // Також слухаємо зміну орієнтації
                window.addEventListener('orientationchange', () => {
                    setTimeout(enforceAllWidthLimits, 100);
                    setTimeout(enforceAllWidthLimits, 300);
                });
            }
        }
    });
}

function expandAllVerses(container) {
    const links = container.querySelectorAll('.bible-link');
    links.forEach(link => {
        const reference = link.getAttribute('data-reference');
        if (reference && bibleData) {
            const verseText = getVerseText(reference);
            if (verseText) {
                // Перевіряємо, чи вже є контейнер з текстом
                const existingContainer = link.nextElementSibling;
                if (existingContainer && existingContainer.classList.contains('verse-text-container')) {
                    // Оновлюємо існуючий контейнер
                    existingContainer.textContent = verseText;
                    existingContainer.style.display = 'block';
                    return;
                }
                
                // Створюємо контейнер для тексту вірша з використанням grid
                const verseContainer = document.createElement('div');
                verseContainer.className = 'verse-text-container';
                // Тільки стилі, які не конфліктують з CSS
                verseContainer.style.marginTop = '8px';
                verseContainer.style.marginBottom = '12px';
                verseContainer.style.padding = '10px';
                verseContainer.style.backgroundColor = '#f5f5f5';
                verseContainer.style.borderLeft = '3px solid #4CAF50';
                verseContainer.style.borderRadius = '4px';
                verseContainer.style.fontSize = '13px';
                verseContainer.style.lineHeight = '1.6';
                verseContainer.style.whiteSpace = 'pre-line';
                
                // Створюємо внутрішній елемент для тексту
                const textWrapper = document.createElement('div');
                textWrapper.textContent = verseText;
                
                verseContainer.appendChild(textWrapper);
                
                // Вставляємо після посилання
                link.parentNode.insertBefore(verseContainer, link.nextSibling);
                
                // Викликаємо глобальну функцію для обмеження ширини
                setTimeout(enforceAllWidthLimits, 0);
                setTimeout(enforceAllWidthLimits, 100);
                
                // Додаємо обробник кліку для показу/приховування (опціонально)
                link.style.cursor = 'pointer';
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (verseContainer.style.display === 'none') {
                        verseContainer.style.display = 'block';
                    } else {
                        verseContainer.style.display = 'none';
                    }
                });
            }
        }
    });
}


function handleClick(event) {
    const link = event.target.closest('.bible-link');
    if (link) {
        // Перевіряємо, чи є вже контейнер з текстом
        const nextSibling = link.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains('verse-text-container')) {
            // Перемикаємо видимість
            if (nextSibling.style.display === 'none') {
                nextSibling.style.display = 'block';
            } else {
                nextSibling.style.display = 'none';
            }
        }
    }
}

function getVerseText(reference) {
    if (!reference || !bibleData || Object.keys(bibleData).length === 0) {
        return null;
    }
    
    // Нормалізуємо посилання (прибираємо зайві пробіли)
    const normalizedRef = reference.replace(/\s+/g, ' ').trim();
    
    // Спочатку перевіряємо точне збігання
    if (bibleData[normalizedRef]) {
        return normalizedRef + '\n' + bibleData[normalizedRef];
    }
    
    // Обробляємо діапазони (наприклад, "Буття 1:3-5")
    const rangeMatch = normalizedRef.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
        const [, book, chapter, startVerse, endVerse] = rangeMatch;
        const verses = [];
        for (let v = parseInt(startVerse); v <= parseInt(endVerse); v++) {
            const verseText = findVerseTextSimple(book, chapter, v);
            if (verseText) {
                verses.push(`${book} ${chapter}:${v}\n${verseText}`);
            }
        }
        if (verses.length > 0) {
            return verses.join('\n\n');
        }
    }
    
    // Якщо це один вірш, спробуємо знайти наступні вірші в тому ж розділі
    const singleMatch = normalizedRef.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (singleMatch) {
        const [, book, chapter, verse] = singleMatch;
        const verseNum = parseInt(verse);
        
        // Шукаємо вірш
        let verseText = findVerseTextSimple(book, chapter, verseNum);
        
        if (verseText) {
            // Показуємо поточний вірш та наступні (до 5 віршів загалом)
            const verses = [`${book} ${chapter}:${verse}\n${verseText}`];
            let nextVerse = verseNum + 1;
            let count = 0;
            
            // Додаємо наступні вірші, якщо вони є (максимум 4 додаткові)
            while (count < 4 && nextVerse <= 200) {
                const nextVerseText = findVerseTextSimple(book, chapter, nextVerse);
                if (nextVerseText) {
                    verses.push(`${book} ${chapter}:${nextVerse}\n${nextVerseText}`);
                    count++;
                    nextVerse++;
                } else {
                    // Якщо наступного вірша немає, зупиняємося
                    break;
                }
            }
            
            return verses.join('\n\n');
        }
    }
    
    return null;
}

// Спрощена функція для пошуку вірша
function findVerseTextSimple(book, chapter, verse) {
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


