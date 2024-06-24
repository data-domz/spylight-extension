document.getElementById('searchButton').addEventListener('click', () => {
  const searchTerm = document.getElementById('searchTerm').value;
  if (searchTerm) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: highlightMatches,
        args: [searchTerm]
      });
    });
  }
});

document.getElementById('highlightQuestionsButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: highlightQuestions
    });
  });
});

document.getElementById('highlightNumbersButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: highlightNumbers
    });
  });
});

document.getElementById('highlightDefinitionsButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: highlightDefinitions
    });
  });
});

document.getElementById('highlightQuotesButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: highlightQuotes
    });
  });
});

document.getElementById('clearHighlightsButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: clearHighlights
    });
  });
});

function highlightMatches(searchTerm) {
  console.log("highlightMatches function called with searchTerm:", searchTerm);

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-url');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  const escapedSearchTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  console.log("Regex for matching:", regex); // Debugging line

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight matches
  function traverseAndHighlight(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(regex);
      if (matches) {
        console.log("Matches found:", matches); // Debugging line
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match, lastIndex);
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

          const span = document.createElement('span');
          span.className = 'highlight';
          span.textContent = match;
          fragment.appendChild(span);

          lastIndex = matchIndex + match.length;
        });

        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { // Element node, excluding script and style tags
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlight(child);
      }
    }
  }

  traverseAndHighlight(document.body);
}

function highlightQuestions() {
  console.log("highlightQuestions function called");

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-url');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  // Regular expression to identify questions
  const questionRegex = /(\b(who|what|where|when|why|how)\b.*?\?|.*?\?)/gi;
  console.log("Regex for identifying questions:", questionRegex); // Debugging line

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight questions
  function traverseAndHighlightQuestions(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(questionRegex);
      if (matches) {
        console.log("Question matches found:", matches); // Debugging line
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match, lastIndex);
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

          const span = document.createElement('span');
          span.className = 'highlight-question';
          span.textContent = match;
          fragment.appendChild(span);

          lastIndex = matchIndex + match.length;
        });

        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { // Element node, excluding script and style tags
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlightQuestions(child);
      }
    }
  }

  traverseAndHighlightQuestions(document.body);
}

function highlightNumbers() {
  console.log("highlightNumbers function called");

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-url');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  // Regular expression to identify numbers
  const numberRegex = /\b\d+(\.\d+)?\b/g;
  console.log("Regex for identifying numbers:", numberRegex); // Debugging line

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight numbers
  function traverseAndHighlightNumbers(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(numberRegex);
      if (matches) {
        console.log("Number matches found:", matches); // Debugging line
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match, lastIndex);
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

          const span = document.createElement('span');
          span.className = 'highlight-number';
          span.textContent = match;
          fragment.appendChild(span);

          lastIndex = matchIndex + match.length;
        });

        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { // Element node, excluding script and style tags
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlightNumbers(child);
      }
    }
  }

  traverseAndHighlightNumbers(document.body);
}

function highlightDefinitions() {
  console.log("highlightDefinitions function called");

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-url');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  // Regular expression to identify definitions
  const definitionRegex = /\b(is|are|means|refers to)\b.*?[.;]/gi;
  console.log("Regex for identifying definitions:", definitionRegex); // Debugging line

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight definitions
  function traverseAndHighlightDefinitions(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(definitionRegex);
      if (matches) {
        console.log("Definition matches found:", matches); // Debugging line
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match, lastIndex);
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

          const span = document.createElement('span');
          span.className = 'highlight-definition';
          span.textContent = match;
          fragment.appendChild(span);

          lastIndex = matchIndex + match.length;
        });

        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { // Element node, excluding script and style tags
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlightDefinitions(child);
      }
    }
  }

  traverseAndHighlightDefinitions(document.body);
}

function highlightQuotes() {
  console.log("highlightQuotes function called");

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-quote');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  // Regular expression to identify quotes
  const quoteRegex = /"([^"]*)"|'([^']*)'/g;
  console.log("Regex for identifying quotes:", quoteRegex); // Debugging line

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight quotes
  function traverseAndHighlightQuotes(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(quoteRegex);
      if (matches) {
        console.log("Quote matches found:", matches); // Debugging line
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match, lastIndex);
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));

          const span = document.createElement('span');
          span.className = 'highlight-quote';
          span.textContent = match;
          fragment.appendChild(span);

          lastIndex = matchIndex + match.length;
        });

        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { // Element node, excluding script and style tags
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlightQuotes(child);
      }
    }
  }

  traverseAndHighlightQuotes(document.body);
}

function clearHighlights() {
  console.log("clearHighlights function called");

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-url');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  removeHighlights();
}


// Issues to Debug:
// 1. not all numbers are selected (spcecial character interference)
// 2. some quotes are missed due to fonts and distinctions between ' ' and ""
// 3. history function needs to be added and displayed to user