function highlightText(text, className) {
    console.log(`Highlighting text: ${text} with class: ${className}`);
    const regex = new RegExp(`\\b${text}\\b`, 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(regex, `<span class="${className}">${text}</span>`);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlight") {
        try {
            highlightText(request.text, request.className);
            sendResponse({status: "done"});
        } catch (error) {
            console.error("Highlighting failed", error);
            sendResponse({status: "error", message: error.message});
        }
    }
});
