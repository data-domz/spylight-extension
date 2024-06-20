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

function highlightMatches(searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  
  // Traverse the DOM and highlight matches
  function traverseAndHighlight(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.nodeValue;
      if (regex.test(text)) {
        const span = document.createElement('span');
        span.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
        node.parentNode.replaceChild(span, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') { // Element node, excluding script and style tags
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverseAndHighlight(child);
      }
    }
  }

  traverseAndHighlight(document.body);
}
