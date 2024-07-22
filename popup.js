document.getElementById('searchButton').addEventListener('click', () => {
  const searchTerm = document.getElementById('searchTerm').value;
  if (searchTerm) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: highlightMatches,
        args: [searchTerm]
      }, (results) => {
        const count = results[0].result;
        updateHistory('Search', searchTerm, count);
      });
    });
  }
});

document.getElementById('highlightQuestionsButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: highlightQuestions
    }, () => {
      updateHistory('Highlight Questions', 'Questions');
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
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-quote');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }

  const escapedSearchTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

  removeHighlights();

  let count = 0;
  function traverseAndHighlight(node) {
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      const matches = text.match(regex);
      if (matches) {
        count += matches.length;
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
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlight(child);
      }
    }
  }

  traverseAndHighlight(document.body);
  return count;
}

function highlightQuestions() {
  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-quote');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }

  const questionRegex = /(\b(who|what|where|when|why|how)\b.*?\?|.*?\?)/gi;

  removeHighlights();

  function traverseAndHighlightQuestions(node) {
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      const matches = text.match(questionRegex);
      if (matches) {
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
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlightQuestions(child);
      }
    }
  }

  traverseAndHighlightQuestions(document.body);
}

function clearHighlights() {
  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question, .highlight-number, .highlight-definition, .highlight-quote');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }

  removeHighlights();
}

function updateHistory(action, term, count) {
  const historyList = document.getElementById('historyList');
  const newItem = document.createElement('div');
  newItem.className = 'history-item';
  newItem.innerHTML = `<span>${action}: ${term}</span><span class="count">Count: ${count}</span>`;
  historyList.appendChild(newItem);
}
