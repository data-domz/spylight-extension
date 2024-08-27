let matches = [];
let currentMatchIndex = -1;
let isQuestionHighlighting = false;
let isNumberHighlighting = false;
let isDateHighlighting = false;
let isAuthorHighlighting = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received request:', request);

    if (request.action === "search") {
        matches = highlightMatches(request.searchTerm);
        currentMatchIndex = 0;
        resetHighlightFlags();
        console.log('Search matches:', matches);
        sendResponse({ matches });
    }

    if (request.action === "next") {
        if (isQuestionHighlighting) {
            highlightSpecificQuestion(request.currentMatchIndex);
        } else if (isNumberHighlighting) {
            highlightSpecificNumber(request.currentMatchIndex);
        } else if (isDateHighlighting) {
            highlightSpecificDate(request.currentMatchIndex);
        } else if (isAuthorHighlighting) {
            highlightSpecificAuthor(request.currentMatchIndex);
        } else {
            highlightSpecificMatch(request.currentMatchIndex);
        }
        sendResponse({ currentMatchIndex });
    }

    if (request.action === "highlightPrevious") {
        if (isQuestionHighlighting) {
            highlightPreviousQuestion(request.prevMatchIndex);
        } else if (isNumberHighlighting) {
            highlightPreviousNumber(request.prevMatchIndex);
        } else if (isDateHighlighting) {
            highlightPreviousDate(request.prevMatchIndex);
        } else if (isAuthorHighlighting) {
            highlightPreviousAuthor(request.prevMatchIndex);
        } else {
            highlightPreviousMatch(request.prevMatchIndex);
        }
    }

    if (request.action === "highlightQuestions") {
        resetAllHighlights();
        matches = highlightQuestions();
        currentMatchIndex = 0;
        isQuestionHighlighting = true;
        if (matches.length > 0) {
            highlightSpecificQuestion(currentMatchIndex);
        }
        console.log('Questions highlighted:', matches);
        sendResponse({ questionCount: matches.length, matches });
    }

    if (request.action === "highlightNumbers") {
        resetAllHighlights();
        matches = highlightNumbers();
        currentMatchIndex = 0;
        isNumberHighlighting = true;
        if (matches.length > 0) {
            highlightSpecificNumber(currentMatchIndex);
        }
        console.log('Numbers highlighted:', matches);
        sendResponse({ numberCount: matches.length, matches });
    }

    if (request.action === "highlightDates") {
        resetAllHighlights();
        matches = highlightDates();
        currentMatchIndex = 0;
        isDateHighlighting = true;
        if (matches.length > 0) {
            highlightSpecificDate(currentMatchIndex);
        }
        console.log('Dates highlighted:', matches);
        sendResponse({ dateCount: matches.length, matches });
    }

    if (request.action === "highlightAuthors") {
        resetAllHighlights();
        matches = highlightAuthors();
        currentMatchIndex = 0;
        isAuthorHighlighting = true;
        if (matches.length > 0) {
            highlightSpecificAuthor(currentMatchIndex);
        }
        console.log('Authors highlighted:', matches);
        sendResponse({ authorCount: matches.length, matches });
    }
});

function resetAllHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-current, .highlight-questions, .highlight-questions-current, .highlight-numbers, .highlight-numbers-current, .highlight-dates, .highlight-dates-current, .highlight-authors, .highlight-authors-current');
    highlights.forEach((highlight) => {
        const originalContent = highlight.dataset.originalContent || highlight.textContent;
        const parent = highlight.parentNode;
        const textNode = document.createTextNode(originalContent);
        parent.replaceChild(textNode, highlight);
        parent.normalize();
    });
    matches = [];
    currentMatchIndex = -1;
    resetHighlightFlags();
}

function highlightMatches(searchTerm) {
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    removeHighlights();

    const escapedSearchTerm = escapeRegExp(searchTerm);
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

    const matches = [];
    let matchCount = 0;

    function traverseAndHighlight(node) {
        if (node.nodeType === 3 && isVisible(node.parentNode)) {
            const text = node.nodeValue;
            const match = text.match(regex);
            if (match) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                match.forEach((matchedTerm) => {
                    const matchIndex = text.indexOf(matchedTerm, lastIndex);
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

                    const span = document.createElement('span');
                    span.className = matchCount === 0 ? 'highlight-current' : 'highlight';
                    span.textContent = matchedTerm;
                    span.dataset.index = matchCount;
                    fragment.appendChild(span);

                    lastIndex = matchIndex + matchedTerm.length;
                    matchCount++;

                    matches.push({ textContent: matchedTerm, index: matchCount - 1 });
                });

                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                traverseAndHighlight(child);
            }
        }
    }

    traverseAndHighlight(document.body);

    return matches.filter(match => isVisible(document.querySelector(`.highlight[data-index="${match.index}"], .highlight-current[data-index="${match.index}"]`)));
}

function highlightSpecificMatch(index) {
    const previousMatch = document.querySelector('.highlight-current');
    if (previousMatch) {
        previousMatch.classList.remove('highlight-current');
        previousMatch.classList.add('highlight');
    }

    const match = document.querySelector(`.highlight[data-index="${index}"], .highlight-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight');
        match.classList.add('highlight-current');
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightPreviousMatch(index) {
    const match = document.querySelector(`.highlight[data-index="${index}"], .highlight-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-current');
        match.classList.add('highlight');
    }
}

// Highlighting Questions
function highlightQuestions() {
    removeHighlights();

    const questionRegex = /([^.!?]*\?)/gi;
    let questionCount = 0;
    const matches = [];

    function traverseAndHighlightQuestions(node) {
        if (node.nodeType === 3 && isVisible(node.parentNode)) {
            const text = node.nodeValue;
            const match = text.match(questionRegex);
            if (match) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                match.forEach((matchedTerm) => {
                    const matchIndex = text.indexOf(matchedTerm, lastIndex);
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

                    const span = document.createElement('span');
                    span.className = questionCount === 0 ? 'highlight-questions-current' : 'highlight-questions';
                    span.textContent = matchedTerm;
                    span.dataset.index = questionCount;
                    fragment.appendChild(span);

                    lastIndex = matchIndex + matchedTerm.length;
                    questionCount++;

                    matches.push({ textContent: matchedTerm, index: questionCount - 1 });
                });

                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                traverseAndHighlightQuestions(child);
            }
        }
    }

    traverseAndHighlightQuestions(document.body);

    return matches.filter(match => isVisible(document.querySelector(`.highlight-questions[data-index="${match.index}"], .highlight-questions-current[data-index="${match.index}"]`)));
}

function highlightSpecificQuestion(index) {
    const previousMatch = document.querySelector('.highlight-questions-current');
    if (previousMatch) {
        previousMatch.classList.remove('highlight-questions-current');
        previousMatch.classList.add('highlight-questions');
    }

    const match = document.querySelector(`.highlight-questions[data-index="${index}"], .highlight-questions-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-questions');
        match.classList.add('highlight-questions-current');
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightPreviousQuestion(index) {
    const match = document.querySelector(`.highlight-questions[data-index="${index}"], .highlight-questions-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-questions-current');
        match.classList.add('highlight-questions');
    }
}

// Highlighting Numbers
function highlightNumbers() {
    removeHighlights();

    const numberRegex = /\b\d+(\.\d+)?\b/g;
    let matchCount = 0;
    const matches = [];

    function traverseAndHighlight(node) {
        if (node.nodeType === 3 && isVisible(node.parentNode)) {
            const text = node.nodeValue;
            const match = text.match(numberRegex);
            if (match) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                match.forEach((matchedTerm) => {
                    const matchIndex = text.indexOf(matchedTerm, lastIndex);
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

                    const span = document.createElement('span');
                    span.className = matchCount === 0 ? 'highlight-numbers-current' : 'highlight-numbers';
                    span.textContent = matchedTerm;
                    span.dataset.index = matchCount;
                    fragment.appendChild(span);

                    lastIndex = matchIndex + matchedTerm.length;
                    matchCount++;

                    matches.push({ textContent: matchedTerm, index: matchCount - 1 });
                });

                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                traverseAndHighlight(child);
            }
        }
    }

    traverseAndHighlight(document.body);

    return matches.filter(match => isVisible(document.querySelector(`.highlight-numbers[data-index="${match.index}"], .highlight-numbers-current[data-index="${match.index}"]`)));
}

function highlightSpecificNumber(index) {
    const previousMatch = document.querySelector('.highlight-numbers-current');
    if (previousMatch) {
        previousMatch.classList.remove('highlight-numbers-current');
        previousMatch.classList.add('highlight-numbers');
    }

    const match = document.querySelector(`.highlight-numbers[data-index="${index}"], .highlight-numbers-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-numbers');
        match.classList.add('highlight-numbers-current');
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightPreviousNumber(index) {
    const match = document.querySelector(`.highlight-numbers[data-index="${index}"], .highlight-numbers-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-numbers-current');
        match.classList.add('highlight-numbers');
    }
}

// Highlighting Dates
function highlightDates() {
    removeHighlights();

    const dateRegex = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(15|16|17|18|19|20)\d{2})\b/g;
    let matchCount = 0;
    const matches = [];

    function traverseAndHighlight(node) {
        if (node.nodeType === 3 && isVisible(node.parentNode)) {
            let text = node.nodeValue;
            const match = text.match(dateRegex);
            if (match) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                match.forEach((matchedTerm) => {
                    const matchIndex = text.indexOf(matchedTerm, lastIndex);
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

                    const span = document.createElement('span');
                    span.className = matchCount === 0 ? 'highlight-dates-current' : 'highlight-dates';
                    span.textContent = matchedTerm.trim();
                    span.dataset.index = matchCount;
                    fragment.appendChild(span);

                    lastIndex = matchIndex + matchedTerm.length;
                    matchCount++;

                    matches.push({ textContent: matchedTerm.trim(), index: matchCount - 1 });
                });

                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                traverseAndHighlight(child);
            }
        }
    }

    traverseAndHighlight(document.body);

    return matches.filter(match => isVisible(document.querySelector(`.highlight-dates[data-index="${match.index}"], .highlight-dates-current[data-index="${match.index}"]`)));
}

function highlightSpecificDate(index) {
    const previousMatch = document.querySelector('.highlight-dates-current');
    if (previousMatch) {
        previousMatch.classList.remove('highlight-dates-current');
        previousMatch.classList.add('highlight-dates');
    }

    const match = document.querySelector(`.highlight-dates[data-index="${index}"], .highlight-dates-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-dates');
        match.classList.add('highlight-dates-current');
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightPreviousDate(index) {
    const match = document.querySelector(`.highlight-dates[data-index="${index}"], .highlight-dates-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-dates-current');
        match.classList.add('highlight-dates');
    }
}

// Highlighting Authors
function highlightAuthors() {
    removeHighlights();

    const authorTags = ['p', 'span', 'div', 'a', 'li'];
    const authorClasses = ['author', 'byline', 'contributor', 'by', 'author-name', 'authors-list-item'];
    let matchCount = 0;
    const matches = [];

    function traverseAndHighlight(node) {
        if (node.nodeType === 1 && isVisible(node)) {
            // Check if the node matches any of the specified tags and classes
            if (authorTags.includes(node.tagName.toLowerCase()) && authorClasses.some(cls => node.classList.contains(cls))) {
                const span = document.createElement('span');
                span.className = matchCount === 0 ? 'highlight-authors-current' : 'highlight-authors';
                span.textContent = node.textContent.trim();
                span.dataset.index = matchCount;
                
                node.textContent = ''; // Clear the existing text
                node.appendChild(span); // Insert the highlighted text

                matches.push({ textContent: span.textContent, index: matchCount });
                matchCount++;
            }

            // Recursively traverse child nodes
            for (let child = node.firstChild; child; child = child.nextSibling) {
                traverseAndHighlight(child);
            }
        }
    }

    traverseAndHighlight(document.body);

    return matches.filter(match => isVisible(document.querySelector(`.highlight-authors[data-index="${match.index}"], .highlight-authors-current[data-index="${match.index}"]`)));
}

function highlightSpecificAuthor(index) {
    const previousMatch = document.querySelector('.highlight-authors-current');
    if (previousMatch) {
        previousMatch.classList.remove('highlight-authors-current');
        previousMatch.classList.add('highlight-authors');
    }

    const match = document.querySelector(`.highlight-authors[data-index="${index}"], .highlight-authors-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-authors');
        match.classList.add('highlight-authors-current');
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightPreviousAuthor(index) {
    const match = document.querySelector(`.highlight-authors[data-index="${index}"], .highlight-authors-current[data-index="${index}"]`);
    if (match) {
        match.classList.remove('highlight-authors-current');
        match.classList.add('highlight-authors');
    }
}

function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function resetHighlightFlags() {
    isQuestionHighlighting = false;
    isNumberHighlighting = false;
    isDateHighlighting = false;
    isAuthorHighlighting = false;
}

function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-current, .highlight-questions, .highlight-questions-current, .highlight-numbers, .highlight-numbers-current, .highlight-dates, .highlight-dates-current, .highlight-authors, .highlight-authors-current');
    highlights.forEach((highlight) => {
        highlight.classList.remove('highlight', 'highlight-current', 'highlight-questions', 'highlight-questions-current', 'highlight-numbers', 'highlight-numbers-current', 'highlight-dates', 'highlight-dates-current', 'highlight-authors', 'highlight-authors-current');
    });
}
