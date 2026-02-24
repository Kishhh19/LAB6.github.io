// API Endpoint
const API_URL = 'https://fakestoreapi.com/products';

// DOM Elements
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorText = document.getElementById('error-text');
const tableSection = document.getElementById('tableSection');
const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('modal');

// Store for all products
let productsData = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayProducts();
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});

/**
 * Fetch products from FakeStoreAPI
 */
async function fetchAndDisplayProducts() {
    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        tableSection.style.display = 'none';
        
        // Fetch data from API
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        productsData = await response.json();
        
        // Check if we got data
        if (!Array.isArray(productsData) || productsData.length === 0) {
            throw new Error('No products received from API');
        }
        
        // Populate the table
        populateTable(productsData);
        
        // Hide loading, show table
        loading.style.display = 'none';
        tableSection.style.display = 'block';
        
    } catch (err) {
        // Handle errors
        loading.style.display = 'none';
        error.style.display = 'block';
        errorText.textContent = `Error loading products: ${err.message}. Please try again.`;
        console.error('Fetch Error:', err);
    }
}

/**
 * Populate the products table
 */
function populateTable(products) {
    tableBody.innerHTML = ''; // Clear existing rows
    
    products.forEach((product) => {
        const row = createTableRow(product);
        tableBody.appendChild(row);
    });
}

/**
 * Create a table row for a product
 */
function createTableRow(product) {
    const row = document.createElement('tr');
    row.dataset.productId = product.id;
    
    const rating = product.rating || {};
    const ratingValue = rating.rate ? parseFloat(rating.rate).toFixed(1) : 'N/A';
    const ratingCount = rating.count ? rating.count : 0;
    const stars = generateStars(ratingValue);
    
    row.innerHTML = `
        <td>${product.id}</td>
        <td title="${product.title}" class="clickable-title" onclick="showProductDetails(${product.id})" style="cursor: pointer;">${truncateText(product.title, 40)}</td>
        <td>${capitalize(product.category)}</td>
        <td class="price-display">$${parseFloat(product.price).toFixed(2)}</td>
        <td>
            <span class="rating-stars">${stars}</span>
            <span>${ratingValue}</span>
        </td>
        <td class="image-cell">
            <img src="${product.image}" alt="${product.title}" class="table-product-image" onclick="showProductDetails(${product.id})" style="cursor: pointer;">
        </td>
    `;
    
    return row;
}

/**
 * Filter products based on search input
 */
function filterProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('.products-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach((row) => {
        const title = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent.toLowerCase();
        const price = row.cells[3].textContent.toLowerCase();
        
        const isVisible = title.includes(searchInput) || 
                         category.includes(searchInput) || 
                         price.includes(searchInput);
        
        if (isVisible) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show "no results" message if needed
    showNoResultsMessage(visibleCount === 0 && searchInput !== '');
}

/**
 * Show or hide "no results" message
 */
function showNoResultsMessage(show) {
    let noResultsMsg = document.getElementById('noResultsMessage');
    
    if (show) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('tr');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 30px; color: #9ca3af; font-size: 16; font-weight: 600;">
                    <span style="font-size: 32px; display: block; margin-bottom: 10px;">🔍</span>
                    No products found. Try a different search!
                </td>
            `;
            document.getElementById('tableBody').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}
function showProductDetails(productId) {
    const product = productsData.find(p => p.id === productId);
    
    if (!product) {
        console.error('Product not found');
        return;
    }
    
    // Populate modal with product data
    const rating = product.rating || {};
    const ratingValue = rating.rate ? parseFloat(rating.rate).toFixed(1) : 'N/A';
    const ratingCount = rating.count ? rating.count : 0;
    const stars = generateStars(ratingValue);
    
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalImage').alt = product.title;
    document.getElementById('modalCategory').textContent = capitalize(product.category);
    document.getElementById('modalPrice').textContent = parseFloat(product.price).toFixed(2);
    document.getElementById('modalRating').innerHTML = stars;
    document.getElementById('modalCount').textContent = `(${ratingCount} reviews)`;
    document.getElementById('modalDescription').textContent = product.description;
    
    // Show modal
    openModal();
}

/**
 * Open the modal
 */
function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
}

/**
 * Close the modal
 */
function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto'; // Restore body scroll
}

/**
 * Utility function to truncate text
 */
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Utility function to capitalize text
 */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate star rating display
 */
function generateStars(rating) {
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) return 'N/A';
    
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    
    return stars;
}
