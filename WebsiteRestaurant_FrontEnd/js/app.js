// ==================== DOM Ready ====================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    loadMenuPreview();
    loadSpecialsPreview();
});

// ==================== Navigation ====================
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(26, 26, 46, 1)';
            } else {
                navbar.style.backgroundColor = 'rgba(26, 26, 46, 0.95)';
            }
        }
    });
}

// ==================== API Helper Functions ====================
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function postAPI(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// ==================== Menu Preview (Home Page) ====================
async function loadMenuPreview() {
    const container = document.getElementById('menu-categories');
    if (!container) return;

    try {
        const data = await fetchAPI(API.menuCategories);

        if (data && data.length > 0) {
            container.innerHTML = data.slice(0, 4).map(category => `
                <div class="category-card">
                    <h3>${escapeHtml(category.name)}</h3>
                    <p>${category.items ? category.items.length : 0} items</p>
                    ${category.note ? `<p class="menu-note">${escapeHtml(category.note)}</p>` : ''}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Menu coming soon...</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Unable to load menu. Please try again later.</p>';
    }
}

// ==================== Specials Preview (Home Page) ====================
async function loadSpecialsPreview() {
    const container = document.getElementById('specials-grid');
    if (!container) return;

    try {
        const [combos, mains] = await Promise.all([
            fetchAPI(API.specialsCombos),
            fetchAPI(API.specialsMains)
        ]);

        let html = '';

        if (combos && combos.length > 0) {
            combos.slice(0, 2).forEach(item => {
                html += `
                    <div class="special-card">
                        <h4>${escapeHtml(item.name)}</h4>
                        <p class="special-price">${formatPrice(item.entreePrice)} / ${formatPrice(item.fullPrice)}</p>
                    </div>
                `;
            });
        }

        if (mains && mains.length > 0) {
            mains.slice(0, 2).forEach(item => {
                html += `
                    <div class="special-card">
                        <h4>${escapeHtml(item.name)}</h4>
                        <p class="special-price">${formatPrice(item.price)}</p>
                    </div>
                `;
            });
        }

        if (html) {
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No specials available today.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Unable to load specials. Please try again later.</p>';
    }
}

// ==================== Full Menu Page ====================
async function loadFullMenu() {
    const container = document.getElementById('full-menu');
    if (!container) return;

    try {
        const data = await fetchAPI(API.menuCategories);

        if (data && data.length > 0) {
            container.innerHTML = data.map(category => `
                <div class="menu-section">
                    <h3>${escapeHtml(category.name)}</h3>
                    ${category.note ? `<p class="menu-note">${escapeHtml(category.note)}</p>` : ''}
                    <div class="menu-items">
                        ${category.items && category.items.length > 0
                            ? category.items.filter(item => item.available).map(item => `
                                <div class="menu-item">
                                    <span class="menu-item-name">${escapeHtml(item.name)}</span>
                                    <span class="menu-item-price">${formatPrice(item.price)}</span>
                                </div>
                            `).join('')
                            : '<p>No items available</p>'
                        }
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Menu coming soon...</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Unable to load menu. Please try again later.</p>';
    }
}

// ==================== Wine List Page ====================
async function loadWineList() {
    const container = document.getElementById('wine-list');
    if (!container) return;

    try {
        const data = await fetchAPI(API.wineCategories);

        if (data && data.length > 0) {
            container.innerHTML = data.map(category => `
                <div class="wine-category">
                    <h3>${escapeHtml(category.name)}</h3>
                    <table class="wine-table">
                        <thead>
                            <tr>
                                <th>Wine</th>
                                ${category.nameEn === 'house'
                                    ? '<th>Glass</th><th>25cl</th><th>50cl</th><th>1L</th>'
                                    : '<th>37.5cl</th><th>75cl</th>'
                                }
                            </tr>
                        </thead>
                        <tbody>
                            ${category.wines && category.wines.length > 0
                                ? category.wines.filter(wine => wine.available).map(wine => `
                                    <tr>
                                        <td>
                                            ${escapeHtml(wine.name)}
                                            ${wine.country ? `<br><span class="wine-country">${escapeHtml(wine.country)}</span>` : ''}
                                        </td>
                                        ${category.nameEn === 'house'
                                            ? `<td>${wine.glassPrice ? formatPrice(wine.glassPrice) : '-'}</td>
                                               <td>${wine.pitcher25cl ? formatPrice(wine.pitcher25cl) : '-'}</td>
                                               <td>${wine.pitcher50cl ? formatPrice(wine.pitcher50cl) : '-'}</td>
                                               <td>${wine.pitcher1l ? formatPrice(wine.pitcher1l) : '-'}</td>`
                                            : `<td>${wine.halfBottle ? formatPrice(wine.halfBottle) : '-'}</td>
                                               <td>${wine.fullBottle ? formatPrice(wine.fullBottle) : '-'}</td>`
                                        }
                                    </tr>
                                `).join('')
                                : '<tr><td colspan="5">No wines available</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Wine list coming soon...</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Unable to load wine list. Please try again later.</p>';
    }
}

// ==================== Specials Page ====================
async function loadAllSpecials() {
    const container = document.getElementById('all-specials');
    if (!container) return;

    try {
        const [combos, mains, custom] = await Promise.all([
            fetchAPI(API.specialsCombos),
            fetchAPI(API.specialsMains),
            fetchAPI(API.specialsCustom)
        ]);

        let html = '';

        // Combo Specials
        if (combos && combos.length > 0) {
            html += `
                <div class="specials-section">
                    <h3>Menu Combos</h3>
                    <div class="specials-grid">
                        ${combos.filter(item => item.available).map(item => `
                            <div class="special-card">
                                <h4>${escapeHtml(item.name)}</h4>
                                <p>Entree: ${formatPrice(item.entreePrice)}</p>
                                <p>Full Menu: ${formatPrice(item.fullPrice)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Main Specials
        if (mains && mains.length > 0) {
            html += `
                <div class="specials-section">
                    <h3>Main Dishes</h3>
                    <div class="specials-grid">
                        ${mains.filter(item => item.available).map(item => `
                            <div class="special-card">
                                <h4>${escapeHtml(item.name)}</h4>
                                <p class="special-price">${formatPrice(item.price)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Custom Specials
        if (custom && custom.length > 0) {
            html += `
                <div class="specials-section">
                    <h3>Chef's Specials</h3>
                    <div class="specials-grid">
                        ${custom.filter(item => item.available).map(item => `
                            <div class="special-card">
                                <h4>${escapeHtml(item.name)}</h4>
                                ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
                                <p class="special-price">${formatPrice(item.price)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (html) {
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No specials available today. Check back soon!</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Unable to load specials. Please try again later.</p>';
    }
}

// ==================== Reservation Form ====================
async function submitReservation(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('reservation-message');

    // Get form data
    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        reservationDate: form.date.value,
        reservationTime: form.time.value,
        adults: parseInt(form.adults.value) || 1,
        children: parseInt(form.children.value) || 0,
        specialRemarks: form.remarks.value.trim()
    };

    // Disable button while submitting
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    messageDiv.innerHTML = '';

    try {
        const result = await postAPI(API.reservations, formData);

        if (result && result.id) {
            messageDiv.innerHTML = `
                <div class="message message-success">
                    Thank you! Your reservation has been submitted successfully.
                    We will confirm your booking shortly.
                </div>
            `;
            form.reset();
        } else if (result && result.error) {
            messageDiv.innerHTML = `
                <div class="message message-error">
                    ${escapeHtml(result.error)}
                </div>
            `;
        } else {
            throw new Error('Unknown error');
        }
    } catch (error) {
        messageDiv.innerHTML = `
            <div class="message message-error">
                Sorry, there was an error submitting your reservation. Please try again or call us directly.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reserve Now';
    }
}

// ==================== Contact Form ====================
async function submitContact(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('contact-message');

    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim() || null,
        message: form.message.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    messageDiv.innerHTML = '';

    try {
        const result = await postAPI(API.requests, formData);

        if (result && result.id) {
            messageDiv.innerHTML = `
                <div class="message message-success">
                    Thank you for your message! We will get back to you soon.
                </div>
            `;
            form.reset();
        } else if (result && result.error) {
            messageDiv.innerHTML = `
                <div class="message message-error">
                    ${escapeHtml(result.error)}
                </div>
            `;
        } else {
            throw new Error('Unknown error');
        }
    } catch (error) {
        messageDiv.innerHTML = `
            <div class="message message-error">
                Sorry, there was an error sending your message. Please try again later.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
}

// ==================== Utility Functions ====================
function formatPrice(price) {
    const num = parseFloat(price);
    return isNaN(num) ? '-' : `€${num.toFixed(2)}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set minimum date for reservation to today
function setMinDate() {
    const dateInput = document.getElementById('reservation-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

// Initialize date input on reservation page
if (document.getElementById('reservation-date')) {
    setMinDate();
}
