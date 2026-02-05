const bookNameMap = {
    "Бут": "Буття", "Буття": "Буття",
    "Вих": "Вихід", "Вихід": "Вихід",
    "Лев": "Левит", "Левит": "Левит",
    "Чис": "Числа", "Числа": "Числа",
    "Повт": "Повторення Закону", "Повторення": "Повторення Закону",
    "ІсН": "Ісус Навин", "Нав": "Ісус Навин",
    "Суд": "Судді", "Суддів": "Судді",
    "Рут": "Рут", "Рути": "Рут",
    "1Сам": "1 Самуїлова", "1Самуїлова": "1 Самуїлова", "1 Сам": "1 Самуїлова",
    "2Сам": "2 Самуїлова", "2Самуїлова": "2 Самуїлова", "2 Сам": "2 Самуїлова",
    "1Цар": "1 Царів", "1Царів": "1 Царів", "1 Цар": "1 Царів",
    "2Цар": "2 Царів", "2Царів": "2 Царів", "2 Цар": "2 Царів",
    "1Хр": "1 Хронік", "1Хронік": "1 Хронік", "1 Хр": "1 Хронік",
    "2Хр": "2 Хронік", "2Хронік": "2 Хронік", "2 Хр": "2 Хронік",
    "Езд": "Ездра", "Ездри": "Ездра",
    "Неем": "Неемія", "Неемії": "Неемія",
    "Ест": "Естер", "Естери": "Естер",
    "Йов": "Йов", "Йова": "Йов",
    "Пс": "Псалми", "Псалом": "Псалми", "Псалми": "Псалми",
    "Прип": "Приповісті", "Приповістей": "Приповісті",
    "Еккл": "Екклезіаст", "Екклезіяст": "Екклезіаст",
    "Пісн": "Пісня Пісень", "Пісня": "Пісня Пісень",
    "Іс": "Ісая", "Ісаї": "Ісая",
    "Єр": "Єремія", "Єремії": "Єремія",
    "Плач": "Плач Єремії", "Плач": "Плач Єремії",
    "Єзк": "Єзекіїль", "Єзекіїля": "Єзекіїль",
    "Дан": "Даниїл", "Даниїла": "Даниїл",
    "Ос": "Осія", "Осії": "Осія",
    "Йоіл": "Йоіл", "Йоіла": "Йоіл",
    "Ам": "Амос", "Амоса": "Амос",
    "Ов": "Овдій", "Овд": "Овдій",
    "Йона": "Йона", "Йони": "Йона",
    "Мих": "Михей", "Михея": "Михей",
    "Наум": "Наум", "Наума": "Наум",
    "Авк": "Авакум", "Авакума": "Авакум",
    "Соф": "Софонія", "Софонії": "Софонія",
    "Ог": "Огій", "Огія": "Огій",
    "Зах": "Захарія", "Захарії": "Захарія",
    "Мал": "Малахія", "Малахії": "Малахія",
    "Мат": "Від Матвія", "Матвія": "Від Матвія", "Мт": "Від Матвія", "Мф": "Від Матвія",
    "Мар": "Від Марка", "Марка": "Від Марка", "Мр": "Від Марка", "Марк": "Від Марка",
    "Лук": "Від Луки", "Луки": "Від Луки", "Лк": "Від Луки",
    "Ів": "Від Івана", "Івана": "Від Івана",
    "Дії": "Дії Апостолів", "Дії": "Дії Апостолів",
    "Рим": "До Римлян", "Римлянам": "До Римлян",
    "1Кор": "1 до Коринтян", "1Коринтянам": "1 до Коринтян", "1 Кор": "1 до Коринтян",
    "2Кор": "2 до Коринтян", "2Коринтянам": "2 до Коринтян", "2 Кор": "2 до Коринтян",
    "Гал": "До Галатів", "Галатів": "До Галатів",
    "Еф": "До Ефесян", "Ефесянам": "До Ефесян",
    "Фил": "До Филип'ян", "Филип'янам": "До Филип'ян",
    "Кол": "До Колосян", "Колосянам": "До Колосян",
    "1Сол": "1 до Солунян", "1Солунянам": "1 до Солунян", "1 Сол": "1 до Солунян",
    "2Сол": "2 до Солунян", "2Солунянам": "2 до Солунян", "2 Сол": "2 до Солунян",
    "1Тим": "1 до Тимофія", "1Тимофію": "1 до Тимофія", "1 Тим": "1 до Тимофія",
    "2Тим": "2 до Тимофія", "2Тимофію": "2 до Тимофія", "2 Тим": "2 до Тимофія",
    "Тит": "До Тита", "Титу": "До Тита",
    "Флм": "До Филимона", "Филимону": "До Филимона",
    "Євр": "До Євреїв", "Євреям": "До Євреїв",
    "Як": "Якова", "Якова": "Якова",
    "1Пет": "1 Петра", "1Петра": "1 Петра", "1 Пет": "1 Петра",
    "2Пет": "2 Петра", "2Петра": "2 Петра", "2 Пет": "2 Петра",
    "1Ів": "1 Івана", "1Івана": "1 Івана", "1 Ів": "1 Івана",
    "2Ів": "2 Івана", "2 Івана": "2 Івана", "2 Ів": "2 Івана",
    "3Ів": "3 Івана", "3Івана": "3 Івана", "3 Ів": "3 Івана",
    "Юди": "Юди", "Юд": "Юди",
    "Об": "Об'явлення", "Об'яв": "Об'явлення", "Одкр": "Об'явлення", "Об'явлення": "Об'явлення"
};

let bibleData = {};
let tooltip = null;

// Завантаження бази
fetch('bibleText.json')
    .then(response => response.json())
    .then(data => {
        bibleData = data;
        render();
    })
    .catch(err => console.error("Помилка завантаження JSON:", err));

function render() {
    chrome.storage.local.get("copiedHtml", function (data) {
        if (!data.copiedHtml) return;

        const container = document.getElementById("textcontent");
        let html = data.copiedHtml;

        // Очищаємо пробіли
        html = html.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');

        // Покращений Regex
        const bibleRegex = /(\d?\s?[А-Яа-яІЇЄҐ][а-яіїєґ']{0,15}\.?)\s*(\d+)(?:\s*[\:\.]\s*(\d+(?:\s*[,\-\–]\s*\d+)*))?/g;

        const processedHtml = html.replace(bibleRegex, function (match, bookPart, chapter, versesStr) {
            const cleanBookKey = bookPart.trim().replace(/\.$/, "");
            const fullBookName = bookNameMap[cleanBookKey];

            if (!fullBookName) return match;

            return `<span class="bible-link" 
                    data-book="${fullBookName}" 
                    data-chapter="${chapter}" 
                    data-verses="${versesStr || "1"}" 
                    style="color: blue !important; cursor: pointer !important; ">${match}</span>`;
        });

        container.innerHTML = processedHtml;
        setupEventListeners(container);
    });
}

function setupEventListeners(container) {
    container.addEventListener('mouseover', (e) => {
        const link = e.target.closest('.bible-link');
        if (link) {
            const book = link.getAttribute('data-book');
            const chapter = link.getAttribute('data-chapter');
            const versesStr = link.getAttribute('data-verses');
            const combinedText = getCombinedText(book, chapter, versesStr);
            if (combinedText) showTooltip(e, combinedText);
        }
    });

    container.addEventListener('mousemove', (e) => {
        if (tooltip) {
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY + 15) + 'px';
        }
    });

    container.addEventListener('mouseout', (e) => {
        if (e.target.closest('.bible-link')) {
            hideTooltip();
        }
    });
}

function getCombinedText(book, chapter, versesStr) {
    const verseNumbers = versesStr.match(/\d+/g);
    if (!verseNumbers) return null;

    let result = [];
    if (versesStr.includes('-') || versesStr.includes('–')) {
        const start = parseInt(verseNumbers[0]);
        const end = parseInt(verseNumbers[verseNumbers.length - 1]);
        for (let i = start; i <= end; i++) {
            const ref = `${book} ${chapter}:${i}`;
            if (bibleData[ref]) result.push(`<b>${i}</b> ${bibleData[ref]}`);
        }
    } else {
        verseNumbers.forEach(v => {
            const ref = `${book} ${chapter}:${v}`;
            if (bibleData[ref]) result.push(`<b>${v}</b> ${bibleData[ref]}`);
        });
    }
    return result.length > 0 ? result.join('<br>') : null;
}

function showTooltip(event, text) {
    hideTooltip();
    tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: absolute; background: #ffffff; border: 1px solid #8b4513; 
        padding: 15px; z-index: 10000; font-size: 22px; max-width: 550px; 
        border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
        color: #2c3e50; line-height: 1.5; pointer-events: none;
    `;
    tooltip.innerHTML = text;
    document.body.appendChild(tooltip);
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY + 15) + 'px';
}

function hideTooltip() {
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
    }
}
