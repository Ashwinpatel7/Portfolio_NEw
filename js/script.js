// ==================== ON PAGE LOAD ====================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("current-year").textContent = new Date().getFullYear(); // Update footer year
    loadQuotes();       // Load quotes from books.json
    loadProjects();     // Load projects from projects.json
    typeWriterName();   // Start name animation
});

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
    const name = "Ashwin Patel";
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
        container.innerHTML = '<div class="loading-quotes">Loading books...</div>';

        const response = await fetch("./assets/books.json");
        if (!response.ok) throw new Error("Failed to fetch quotes from books.json");

        const data = await response.json();

        // Handle both single book object and array of books
        const books = Array.isArray(data) ? data : [data];

        if (!books || books.length === 0) {
            container.innerHTML = "<p>No books found in books.json file.</p>";
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
        <img src="${book.coverImage || './assets/placeholder-book.jpg'}" alt="${book.bookName || book.book || 'Unknown Title'}" class="book-image" onerror="this.src='https://via.placeholder.com/150x200/cccccc/666666?text=Book+Cover'">
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
          ${book.dateOfCompletion ? `<span class="meta-item">
            <div class="meta-icon">✅</div>
            <div class="meta-label">Completed on</div>
            <div class="meta-value">${formatDate(book.dateOfCompletion)}</div>
          </span>` : ''}
          ${book.genre ? `<span class="meta-item">
            <div class="meta-icon">📚</div>
            <div class="meta-label">Genre</div>
            <div class="meta-value">${book.genre}</div>
          </span>` : ''}
          ${book.amazonLink ? `<span class="meta-item">
            <a href="${book.amazonLink}" target="_blank" rel="noopener noreferrer" class="amazon-link">
              <div class="meta-icon">🛒</div>
              <div class="meta-label">Buy on Amazon</div>
            </a>
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
        console.error("Error loading books:", error);
        container.innerHTML = `
      <div class="error-message">
        <p>❌ Failed to load books from books.json. Please check if the file exists in the assets folder.</p>
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

// ==================== LOAD PROJECTS ====================
async function loadProjects() {
    const container = document.getElementById("achievements-container");
    if (!container) return;

    try {
        container.innerHTML = '<div class="timeline"><div class="loading-achievements">Loading projects...</div></div>';

        const response = await fetch("./assets/projects.json");
        if (!response.ok) throw new Error("Failed to fetch projects");

        const projects = await response.json();

        if (!projects || projects.length === 0) {
            container.innerHTML = '<div class="error-achievements">No projects found.</div>';
            return;
        }

        const timelineHTML = `
            <div class="timeline">
                ${projects.map((project, index) => `
                    <div class="achievement-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="achievement-content">
                            <div class="achievement-header">
                                <div class="achievement-icon">${project.icon || '💻'}</div>
                                <div class="achievement-title-section">
                                    <h3 class="achievement-title">${project.title}</h3>
                                    <div class="project-tech">${project.technologies.join(' • ')}</div>
                                </div>
                            </div>
                            
                            <p class="achievement-description">${project.description}</p>
                            
                            <div class="achievement-footer">
                                <span class="achievement-category">${project.category}</span>
                                <div class="project-links">
                                    ${project.liveLink && project.liveLink !== '#' ? `
                                        <a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="achievement-proof">
                                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                <polyline points="15,3 21,3 21,9"/>
                                                <line x1="10" y1="14" x2="21" y2="3"/>
                                            </svg>
                                            Live Demo
                                        </a>
                                    ` : ''}
                                    ${project.githubLink && project.githubLink !== '#' ? `
                                        <a href="${project.githubLink}" target="_blank" rel="noopener noreferrer" class="achievement-proof">
                                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                            </svg>
                                            GitHub
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = timelineHTML;

    } catch (error) {
        console.error("Error loading projects:", error);
        container.innerHTML = `
            <div class="error-achievements">
                <p>❌ Failed to load projects. Please check if projects.json exists in the assets folder.</p>
                <button onclick="loadProjects()" class="btn" style="margin-top: 15px;">Retry</button>
            </div>
        `;
    }
}



