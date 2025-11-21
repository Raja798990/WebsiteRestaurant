// API Configuration
// Change this URL to match your backend server
const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
const API = {
    // Menu endpoints
    menuCategories: `${API_BASE_URL}/menu/categories`,
    menuItems: `${API_BASE_URL}/menu/items`,

    // Wine endpoints
    wineCategories: `${API_BASE_URL}/wines/categories`,
    wines: `${API_BASE_URL}/wines`,

    // Specials endpoints
    specialsCombos: `${API_BASE_URL}/specials/combos`,
    specialsMains: `${API_BASE_URL}/specials/mains`,
    specialsCustom: `${API_BASE_URL}/specials/custom`,

    // Reservation endpoint
    reservations: `${API_BASE_URL}/reservations`,

    // Contact/Request endpoint
    requests: `${API_BASE_URL}/requests`
};

// Export for use in other modules
window.API_BASE_URL = API_BASE_URL;
window.API = API;
