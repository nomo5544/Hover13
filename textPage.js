chrome.storage.local.get("copiedHtml", function (data) { // Отримуємо copiedHtml
    if (data.copiedHtml) {
        const textContentDiv = document.getElementById("textcontent");
        textContentDiv.innerHTML = data.copiedHtml; // Встановлюємо HTML

        // Призначаємо mouseover listener ПІСЛЯ додавання HTML
        textContentDiv.addEventListener('mouseover', function(event) {
            if (event.target.classList.contains('bible-link')) {
                const reference = event.target.getAttribute('data-reference');
                if (bibleData && bibleData.hasOwnProperty(reference)) {
                    const bibleText = bibleData[reference];
                    showTooltip(event, bibleText);
                }
            }
        });
    }
});

let bibleData = {};
let tooltip = null;

fetch('bibleText.json')
    .then(response => response.json())
    .then(data => {
        bibleData = data;
    })
    .catch(error => console.error('Помилка при завантаженні тексту біблії:', error));

document.addEventListener('mouseout', function(event) {
    if (event.target.classList.contains('bible-link') && tooltip) {
        tooltip.remove();
        tooltip = null;
    }
});

function showTooltip(event, text) {
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = '#f0f0f0';
        tooltip.style.border = '1px solid #ccc';
        tooltip.style.padding = '8px';
        tooltip.style.fontSize = '24px';
        tooltip.style.zIndex = '1000';
        document.body.appendChild(tooltip);
    }
    tooltip.innerText = text;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    if (event.pageX + 10 + tooltipWidth > windowWidth) {
        tooltip.style.left = `${event.pageX - tooltipWidth - 10}px`;
    }
    if (event.pageY + 10 + tooltipHeight > windowHeight) {
        tooltip.style.top = `${event.pageY - tooltipHeight - 10}px`;
    }
}