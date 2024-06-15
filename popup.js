document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("highlight-questions").addEventListener("click", () => {
        console.log("Highlight Questions button clicked");
        highlight("?", "highlight-question");
    });

    document.getElementById("highlight-definitions").addEventListener("click", () => {
        console.log("Highlight Definitions button clicked");
        highlight("definition", "highlight-definition");
    });

    document.getElementById("highlight-keywords").addEventListener("click", () => {
        console.log("Highlight Keywords button clicked");
        highlight("keyword", "highlight-keyword");
    });
});

function highlight(text, className) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log("Sending message to content script");
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: highlightTextOnPage,
            args: [text, className]
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                console.log("Highlighting done:", results);
            }
        });
    });
}

function highlightTextOnPage(text, className) {
    const regex = new RegExp(`\\b${text}\\b`, 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(regex, `<span class="${className}">${text}</span>`);
}
