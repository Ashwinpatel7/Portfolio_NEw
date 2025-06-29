// ==================== NAVBAR FUNCTIONALITY ====================
// Note: No navbar found in HTML, but keeping scroll functionality for future use
let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");
const scrollThreshold = 100; // Only hide navbar after scrolling this many pixels

window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    // Show/hide navbar based on scroll direction
    if (currentScroll > lastScrollTop && currentScroll > scrollThreshold) {
        navbar.style.top = "-70px";
    } else {
        navbar.style.top = "0";
    }

    // Add/remove background blur
    if (currentScroll > 50) {
        navbar.style.backgroundColor = "rgba(31, 31, 31, 0.95)";
        navbar.style.backdropFilter = "blur(5px)";
    } else {
        navbar.style.backgroundColor = "var(--bg-light)";
        navbar.style.backdropFilter = "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// ==================== ON PAGE LOAD ====================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("current-year").textContent = new Date().getFullYear(); // Update footer year
    loadQuotes();       // Load quotes from books.json
    typeWriterName();   // Start name animation
    setupSmoothScrolling(); // Setup nav link scroll
});

// ==================== SMOOTH SCROLLING ====================
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });

                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    window.location.hash = targetId;
                }
            }
        });
    });
}

// ==================== CONTACT FORM HANDLER ====================
document.getElementById("contact-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector("button");
    const thankYou = document.getElementById("thank-you-message");

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
        await fetch("https://formsubmit.co/ajax/ashwinpatel7677@gmail.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                name: form.name.value,
                email: form.email.value,
                message: form.message.value,
                _subject: "New Portfolio Message"
            })
        });

        form.style.display = "none";
        thankYou.style.display = "block";

    } catch (error) {
        btn.textContent = "Failed - Try Again";
        btn.disabled = false;
        alert("Message failed to send. Please email me directly at ashwinpatel7677@gmail.com");
    }
});

// ==================== TYPEWRITER NAME ANIMATION ====================
function typeWriterName() {
    const name = "Kaushal Vyas";
    const letters = [
         { char: "A", class: "a" },
        { char: "s", class: "s" },
        { char: "h", class: "h" },
        { char: "w", class: "w" },
        { char: "i", class: "i" },
        { char: "n", class: "n" },
        { char: " ", class: "space" },
        { char: "P", class: "p" },
        { char: "a", class: "a2" },
        { char: "t", class: "t" },
        { char: "e", class: "e" },
        { char: "l", class: "l" }
    ];

    const nameElement = document.getElementById("animated-name");
    if (!nameElement) return; // Safety check

    nameElement.innerHTML = "";

    let i = 0;
    const speed = 150;

    function type() {
        if (i < letters.length) {
            const span = document.createElement("span");
            span.className = letters[i].class;
            span.textContent = letters[i].char;
            nameElement.appendChild(span);
            i++;
            setTimeout(type, speed);
        } else {
            // Remove cursor after typing is complete
            const cursor = nameElement.querySelector('.typewriter-cursor');
            if (cursor) cursor.style.display = 'none';
        }
    }

    setTimeout(type, 1500); // Initial delay
}

// ==================== LOAD QUOTES FROM LOCAL JSON ====================
async function loadQuotes() {
    const container = document.getElementById("threads-container");
    if (!container) return; // Safety check

    try {
        // Show loading state
        container.innerHTML = '<div class="loading-quotes">Loading book quotes...</div>';

        const response = await fetch("./assets/books.json");
        if (!response.ok) throw new Error("Failed to fetch quotes from books.json");

        const data = await response.json();

        // Handle both single book object and array of books
        const books = Array.isArray(data) ? data : [data];

        if (!books || books.length === 0) {
            container.innerHTML = "<p>No quotes found in books.json file.</p>";
            return;
        }

        // Generate book cards HTML
        container.innerHTML = books.map((book, index) => {

            // Get quotes array
            const allQuotes = Array.isArray(book.quotes) ? book.quotes : "No quotes available";
            const firstQuote = allQuotes[0] || "No quotes available";
            //   <span class="quote-count">${allQuotes.length} quote${allQuotes.length !== 1 ? 's' : ''}</span>
            return `
  <div class="book-card" data-book-index="${index}">
    <div class="book-preview" onclick="toggleBookQuotes(${index})">
      <div class="book-cover">
        <img src="${book.coverImage || './assets/placeholder-book.jpg'}" alt="${book.bookName || book.book || 'Unknown Title'}" class="book-image">
      </div>
      <div class="book-content">
        <div class="book-header">
          <h3 class="book-title">${book.bookName || book.book || 'Unknown Title'}</h3>
          <p class="book-author">By ${book.author || 'Unknown Author'}</p>
        </div>
        <div class="featured-quote">
          ${truncateText(firstQuote, 120)}
        </div>
        <div class="book-meta">
          ${book.publishYear ? `<span class="meta-item">
            <div class="meta-icon">📅</div>
            <div class="meta-label">Published On</div>
            <div class="meta-value">${book.publishYear}</div>
          </span>` : ''}
          ${book.genre ? `<span class="meta-item">
            <div class="meta-icon">📚</div>
            <div class="meta-label">Genre</div>
            <div class="meta-value">${book.genre}</div>
          </span>` : ''}
          ${book.dateOfCompletion ? `<span class="meta-item">
            <div class="meta-icon">✅</div>
            <div class="meta-label">Completed on</div>
            <div class="meta-value">${formatDate(book.dateOfCompletion)}</div>
          </span>` : ''}
        </div>
      </div>
      <div class="expand-indicator">
        <span class="expand-arrow">▼</span>
      </div>
    </div>
    
    <div class="quotes-container">
      <div class="quotes-list">
        ${allQuotes.map((quote, qIndex) => `
          <div class="quote-item">
            <div class="quote-number">${qIndex + 1}.</div>
            <div class="quote-text">${quote}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
`;
        }).join('');
    } catch (error) {
        console.error("Error loading quotes:", error);
        container.innerHTML = `
      <div class="error-message">
        <p>❌ Failed to load quotes from books.json. Please check if the file exists in the assets folder.</p>
        <button onclick="loadQuotes()" class="btn" style="margin-top: 10px;">Retry</button>
      </div>
    `;
    }
}

// ==================== TOGGLE BOOK QUOTES EXPANSION ====================
function toggleBookQuotes(bookIndex) {
    const bookCard = document.querySelector(`[data-book-index="${bookIndex}"]`);
    if (!bookCard) return;

    const isExpanded = bookCard.classList.contains('expanded');
    const arrow = bookCard.querySelector('.expand-arrow');

    // Close all other expanded cards first
    document.querySelectorAll('.book-card.expanded').forEach(card => {
        if (card !== bookCard) {
            card.classList.remove('expanded');
            const otherArrow = card.querySelector('.expand-arrow');
            if (otherArrow) otherArrow.textContent = '▼';
        }
    });

    // Toggle current card
    if (isExpanded) {
        bookCard.classList.remove('expanded');
        if (arrow) arrow.textContent = '▼';
    } else {
        bookCard.classList.add('expanded');
        if (arrow) arrow.textContent = '▲';

        // Smooth scroll to the expanded card after a brief delay
        setTimeout(() => {
            bookCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    // Find the last space before maxLength to avoid cutting words
    const truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return (lastSpace > 0 ? truncated.substr(0, lastSpace) : truncated) + '...';
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString; // Return original if parsing fails
    }
}

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', function (e) {
    // ESC key closes all expanded cards
    if (e.key === 'Escape') {
        document.querySelectorAll('.book-card.expanded').forEach(card => {
            card.classList.remove('expanded');
            const arrow = card.querySelector('.expand-arrow');
            if (arrow) arrow.textContent = '▼';
        });
    }
});

// ==================== SCROLL TO TOP FUNCTIONALITY ====================
// Add a smooth scroll to top when clicking on the logo/name (if you add one later)
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}