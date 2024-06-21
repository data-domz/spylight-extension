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

function highlightMatches(searchTerm) {
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  const escapedSearchTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  console.log("Search Term:", searchTerm); // Debugging line
  console.log("Escaped Search Term:", escapedSearchTerm); // Debugging line
  console.log("Regex:", regex); // Debugging line

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight matches
  function traverseAndHighlight(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(regex);
      if (matches) {
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
  console.log("Highlight Questions function called"); // Debugging line

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight, .highlight-question');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  const regex = /[^.!?]*\?+/g;

  // Remove old highlights
  removeHighlights();

  // Traverse the DOM and highlight questions
  function traverseAndHighlight(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      const matches = text.match(regex);
      if (matches) {
        console.log("Matched questions:", matches); // Debugging line
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match, lastIndex);
          if (matchIndex > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
          }

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
        traverseAndHighlight(child);
      }
    }
  }

  traverseAndHighlight(document.body);
}
