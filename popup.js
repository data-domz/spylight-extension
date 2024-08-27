document.addEventListener('DOMContentLoaded', function() {
    let currentMatchIndex = -1;
    let matches = [];
    const navigationButtons = document.getElementById('navigationButtons');
    const historyBox = document.getElementById('historyContent');

    // Hide navigation buttons initially
    navigationButtons.style.display = 'none';

    document.getElementById('searchButton').addEventListener('click', async () => {
        console.log('Search button clicked');
        const searchTerm = document.getElementById('searchTerm').value;
        if (searchTerm) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: "search", searchTerm });
            if (response && response.matches) {
                matches = response.matches;
                currentMatchIndex = 0;
                resetHighlightFlags();
                console.log('Search matches:', matches);
                updateHistory(`Found ${matches.length} matches for "${searchTerm}"`);

                if (matches.length > 1) {
                    navigationButtons.style.display = 'flex';
                } else {
                    navigationButtons.style.display = 'none';
                }
            } else {
                console.error('No matches found or an error occurred.');
            }
        }
    });

    document.getElementById('nextButton').addEventListener('click', async () => {
        if (matches.length > 1) {
            const prevMatchIndex = currentMatchIndex;
            currentMatchIndex = (currentMatchIndex + 1) % matches.length;

            console.log('Next button clicked:', currentMatchIndex);
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: "highlightPrevious", prevMatchIndex });
            await chrome.tabs.sendMessage(tab.id, { action: "next", currentMatchIndex });
            highlightHistoryItem(currentMatchIndex);
        }
    });

    document.getElementById('prevButton').addEventListener('click', async () => {
        if (matches.length > 1) {
            const prevMatchIndex = currentMatchIndex;
            currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;

            console.log('Previous button clicked:', currentMatchIndex);
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: "highlightPrevious", prevMatchIndex });
            await chrome.tabs.sendMessage(tab.id, { action: "next", currentMatchIndex });
            highlightHistoryItem(currentMatchIndex);
        }
    });

    document.getElementById('highlightQuestionsButton').addEventListener('click', async () => {
        console.log('Highlight Questions button clicked');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "highlightQuestions" });
        if (response && response.matches) {
            matches = response.matches;
            currentMatchIndex = 0;
            resetHighlightFlags();
            isQuestionHighlighting = true;
            console.log('Highlight questions matches:', matches);
            updateHistory(`Found and highlighted ${response.questionCount} questions`, matches);

            if (matches.length > 1) {
                navigationButtons.style.display = 'flex';
            } else {
                navigationButtons.style.display = 'none';
            }
        } else {
            console.error('No matches found or an error occurred.');
        }
    });

    document.getElementById('highlightNumbersButton').addEventListener('click', async () => {
        console.log('Highlight Numbers button clicked');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "highlightNumbers" });
        if (response && response.matches) {
            matches = response.matches;
            currentMatchIndex = 0;
            resetHighlightFlags();
            isNumberHighlighting = true;
            console.log('Highlight numbers matches:', matches);
            updateHistory(`Found and highlighted ${response.numberCount} numbers`, matches);

            if (matches.length > 1) {
                navigationButtons.style.display = 'flex';
            } else {
                navigationButtons.style.display = 'none';
            }
        } else {
            console.error('No matches found or an error occurred.');
        }
    });

    document.getElementById('highlightDatesButton').addEventListener('click', async () => {
        console.log('Highlight Dates button clicked');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "highlightDates" });
        if (response && response.matches) {
            matches = response.matches;
            currentMatchIndex = 0;
            resetHighlightFlags();
            isDateHighlighting = true;
            console.log('Highlight dates matches:', matches);
            updateHistory(`Found and highlighted ${response.dateCount} dates`, matches);

            if (matches.length > 1) {
                navigationButtons.style.display = 'flex';
            } else {
                navigationButtons.style.display = 'none';
            }
        } else {
            console.error('No matches found or an error occurred.');
        }
    });

    document.getElementById('highlightAuthorsButton').addEventListener('click', async () => {
        console.log('Highlight Authors button clicked');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "highlightAuthors" });
        if (response && response.matches) {
            matches = response.matches;
            currentMatchIndex = 0;
            resetHighlightFlags();
            isAuthorHighlighting = true;
            console.log('Highlight authors matches:', matches);
            updateHistory(`Found and highlighted ${response.authorCount} author names`, matches);

            if (matches.length > 1) {
                navigationButtons.style.display = 'flex';
            } else {
                navigationButtons.style.display = 'none';
            }
        } else {
            console.error('No matches found or an error occurred.');
        }
    });

    function resetHighlightFlags() {
        isQuestionHighlighting = false;
        isNumberHighlighting = false;
        isDateHighlighting = false;
        isAuthorHighlighting = false;
    }

    function updateHistory(message, matches) {
        historyBox.innerHTML = ''; // Clear previous history
        const entry = document.createElement('div');
        entry.textContent = message;
        historyBox.appendChild(entry);

        // Create a scrollable list of matches
        if (matches && matches.length > 0) {
            const matchList = document.createElement('ul');
            matchList.style.maxHeight = '200px'; // Adjust height as necessary
            matchList.style.overflowY = 'auto';
            matchList.style.padding = '10px';
            matchList.style.border = '1px solid #ddd';
            matchList.style.marginTop = '10px';

            matches.forEach((match, index) => {
                const matchItem = document.createElement('li');
                matchItem.textContent = match.textContent;
                matchItem.dataset.index = index;

                // Make list item clickable
                matchItem.addEventListener('click', async () => {
                    currentMatchIndex = index;
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    await chrome.tabs.sendMessage(tab.id, { action: "highlightSpecificMatch", currentMatchIndex });
                    highlightHistoryItem(currentMatchIndex);
                });

                matchList.appendChild(matchItem);
            });

            historyBox.appendChild(matchList);
        }
    }

    function highlightHistoryItem(index) {
        const listItems = historyBox.querySelectorAll('li');
        listItems.forEach(item => {
            item.style.backgroundColor = '';
        });
        const currentItem = historyBox.querySelector(`li[data-index="${index}"]`);
        if (currentItem) {
            currentItem.style.backgroundColor = 'lightblue';
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
