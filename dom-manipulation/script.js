// Array of quote objects with text and category properties
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
    { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
    { text: "The best way to predict the future is to invent it.", category: "Innovation" },
    { text: "Be the change you wish to see in the world.", category: "Change" },
    { text: "Everything you've ever wanted is on the other side of fear.", category: "Courage" },
    { text: "The journey of a thousand miles begins with one step.", category: "Journey" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", category: "Growth" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const toggleFormBtn = document.getElementById('toggleForm');
const addQuoteForm = document.getElementById('addQuoteForm');
const categoryFilter = document.getElementById('categoryFilter');

// Current filter
let currentFilter = 'all';

// Local Storage Keys
const QUOTES_KEY = 'dynamicQuotes';
const LAST_QUOTE_KEY = 'lastViewedQuote';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    toggleFormBtn.addEventListener('click', toggleAddQuoteForm);
    categoryFilter.addEventListener('change', handleCategoryFilter);
    
    // Initialize category filter
    updateCategoryFilter();
    
    // Load quotes from localStorage
    loadQuotes();
    updateCategoryFilter();
    
    // Show last viewed quote if available, else show random
    if (!loadLastViewedQuote()) {
        showRandomQuote();
    }
    
    // Wire up export button
    const exportBtn = document.getElementById('exportQuotes');
    if (exportBtn) exportBtn.addEventListener('click', exportQuotesToJson);
    
    // Wire up import input
    const importInput = document.getElementById('importFile');
    if (importInput) importInput.addEventListener('change', importFromJsonFile);
});

/**
 * Displays a random quote from the quotes array
 * Uses advanced DOM manipulation to create and update elements
 */
function showRandomQuote() {
    // Filter quotes based on current category selection
    let filteredQuotes = quotes;
    if (currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }
    
    if (filteredQuotes.length === 0) {
        displayQuote("No quotes available for this category.", "Empty");
        saveLastViewedQuote({ text: "No quotes available for this category.", category: "Empty" });
        return;
    }
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    
    displayQuote(selectedQuote.text, selectedQuote.category);
    saveLastViewedQuote(selectedQuote);
}

/**
 * Displays a quote in the quote display area
 * @param {string} text - The quote text
 * @param {string} category - The quote category
 */
function displayQuote(text, category) {
    // Clear existing content
    quoteDisplay.innerHTML = '';
    
    // Create quote text element
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${text}"`;
    
    // Create category element
    const quoteCategory = document.createElement('div');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `— ${category}`;
    
    // Add elements to display
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
    
    // Add fade-in animation
    quoteDisplay.style.opacity = '0';
    setTimeout(() => {
        quoteDisplay.style.transition = 'opacity 0.5s ease-in';
        quoteDisplay.style.opacity = '1';
    }, 10);
}

/**
 * Toggles the visibility of the add quote form
 */
function toggleAddQuoteForm() {
    const isVisible = addQuoteForm.style.display !== 'none';
    
    if (isVisible) {
        addQuoteForm.style.display = 'none';
        toggleFormBtn.textContent = 'Add New Quote';
    } else {
        addQuoteForm.style.display = 'block';
        toggleFormBtn.textContent = 'Hide Form';
        
        // Clear form inputs
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
    }
}

/**
 * Adds a new quote to the quotes array and updates the DOM
 */
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validate input
    if (!quoteText || !quoteCategory) {
        alert('Please enter both quote text and category!');
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Update category filter options
    updateCategoryFilter();
    
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Hide form
    toggleAddQuoteForm();
    
    // Show success message
    showSuccessMessage('Quote added successfully!');
    
    // Show the newly added quote
    displayQuote(newQuote.text, newQuote.category);
    
    // Save to localStorage
    saveQuotes();
    saveLastViewedQuote(newQuote);
}

/**
 * Updates the category filter dropdown with all available categories
 */
function updateCategoryFilter() {
    // Get all unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

/**
 * Handles category filter changes
 */
function handleCategoryFilter() {
    currentFilter = categoryFilter.value;
    showRandomQuote();
}

/**
 * Shows a temporary success message
 * @param {string} message - The message to display
 */
function showSuccessMessage(message) {
    // Create success message element
    const successMsg = document.createElement('div');
    successMsg.textContent = message;
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(successMsg);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 300);
    }, 3000);
}

/**
 * Creates a more advanced form for adding quotes with validation
 * This function demonstrates additional DOM manipulation techniques
 */
function createAddQuoteForm() {
    // This function could be used to create a more sophisticated form
    // For now, we're using the HTML form, but this shows how you could
    // dynamically create forms using JavaScript
    
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    formContainer.innerHTML = `
        <h3>Add a New Quote</h3>
        <div class="form-group">
            <label for="dynamicQuoteText">Quote Text:</label>
            <textarea id="dynamicQuoteText" placeholder="Enter your quote here..." rows="3"></textarea>
        </div>
        <div class="form-group">
            <label for="dynamicQuoteCategory">Category:</label>
            <input id="dynamicQuoteCategory" type="text" placeholder="Enter category" />
        </div>
        <button onclick="addQuoteFromDynamicForm()">Add Quote</button>
    `;
    
    return formContainer;
}

// Additional utility functions for advanced DOM manipulation

/**
 * Removes a quote from the array and updates the display
 * @param {number} index - Index of the quote to remove
 */
function removeQuote(index) {
    if (index >= 0 && index < quotes.length) {
        quotes.splice(index, 1);
        updateCategoryFilter();
        showRandomQuote();
        showSuccessMessage('Quote removed successfully!');
    }
}

/**
 * Edits an existing quote
 * @param {number} index - Index of the quote to edit
 * @param {string} newText - New quote text
 * @param {string} newCategory - New quote category
 */
function editQuote(index, newText, newCategory) {
    if (index >= 0 && index < quotes.length) {
        quotes[index].text = newText;
        quotes[index].category = newCategory;
        updateCategoryFilter();
        showRandomQuote();
        showSuccessMessage('Quote updated successfully!');
    }
}

// --- Web Storage and JSON Handling Enhancements ---

function loadQuotes() {
    const stored = localStorage.getItem(QUOTES_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                quotes = parsed;
            }
        } catch (e) {}
    }
}

function saveQuotes() {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function saveLastViewedQuote(quoteObj) {
    sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(quoteObj));
}

function loadLastViewedQuote() {
    const stored = sessionStorage.getItem(LAST_QUOTE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.text && parsed.category) {
                displayQuote(parsed.text, parsed.category);
                return true;
            }
        } catch (e) {}
    }
    return false;
}

function exportQuotesToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes.filter(q => q.text && q.category));
                saveQuotes();
                updateCategoryFilter();
                showSuccessMessage('Quotes imported successfully!');
                showRandomQuote();
            } else {
                alert('Invalid JSON format.');
            }
        } catch (err) {
            alert('Failed to import quotes: ' + err.message);
        }
    };
    fileReader.readAsText(file);
}

// Patch DOMContentLoaded for storage and controls
const origDOMContentLoaded = document.onreadystatechange;
document.addEventListener('DOMContentLoaded', function() {
    loadQuotes();
    updateCategoryFilter();
    if (!loadLastViewedQuote()) {
        showRandomQuote();
    }
    const exportBtn = document.getElementById('exportQuotes');
    if (exportBtn) exportBtn.addEventListener('click', exportQuotesToJson);
    const importInput = document.getElementById('importFile');
    if (importInput) importInput.addEventListener('change', importFromJsonFile);
});

// Patch addQuote to save to localStorage and sessionStorage
const origAddQuote = addQuote;
addQuote = function() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    if (!quoteText || !quoteCategory) {
        alert('Please enter both quote text and category!');
        return;
    }
    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    updateCategoryFilter();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    toggleAddQuoteForm();
    showSuccessMessage('Quote added successfully!');
    displayQuote(newQuote.text, newQuote.category);
    saveLastViewedQuote(newQuote);
};

// Patch showRandomQuote to save last viewed quote
const origShowRandomQuote = showRandomQuote;
showRandomQuote = function() {
    let filteredQuotes = quotes;
    if (currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }
    if (filteredQuotes.length === 0) {
        displayQuote("No quotes available for this category.", "Empty");
        saveLastViewedQuote({ text: "No quotes available for this category.", category: "Empty" });
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    displayQuote(selectedQuote.text, selectedQuote.category);
    saveLastViewedQuote(selectedQuote);
};

// Make importFromJsonFile globally accessible for HTML inline handler
window.importFromJsonFile = importFromJsonFile;