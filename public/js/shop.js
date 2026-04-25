// Initialize and fetch products based on query parameters
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts({
    page: new URLSearchParams(window.location.search).get('page') || 1,
    sort: new URLSearchParams(window.location.search).get('sort') || '-createdAt',
    });
});

// Function to fetch products
const fetchProducts = async (params = {}) => {
    try {
    const url = new URL('/shop', window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const { products, pagination, wishlist } = await response.json();

    renderProducts(products, wishlist);
    renderPagination(pagination);
    } catch (error) {
    console.error('Error fetching products:', error);
    if (typeof createToast === 'function') {
        createToast('Failed to load products', 'error');
    }
    }
};

// Render products
const renderProducts = (products, wishlist) => {
    const productList = document.getElementById('productsContainer');
    productList.innerHTML = '';
    // token is managed via global variable or data attribute in the view
    // relying on 'token' being defined in the global scope from the view is risky if moved to external file
    // cleaner approach: passing token to this function or checking auth state differently
    // For now, we will check if token exists in a global variable or hidden input
    const token = document.body.dataset.userToken; 

    products.forEach(product => {
    const isInWishlist = wishlist && wishlist.includes(product._id.toString());
    productList.insertAdjacentHTML('beforeend', createProductCard(product, isInWishlist, token));
    });

    initializeWishlistButtons();
};

// Create product card template
const createProductCard = (product, isInWishlist, token) => {
    return `
    <div class="col-6 col-md-3 mb-4">
        <div class="card shadow-sm product-card">
            ${token ? `
                <i class="btn-wishlist bi ${isInWishlist ? 'bi-heart-fill text-danger' : 'bi-heart'}"
                    data-product-id="${product._id}"
                    data-in-wishlist="${isInWishlist ? 'true' : 'false'}"
                    style="cursor: pointer;"></i>
            ` : `
                <a href="/auth/login"><i class="bi bi-heart" style="color: black;"></i></a>
            `}
            <a href="/product/${product._id}/0" class="text-decoration-none text-dark">
                ${product.variants[0].images.length > 0 ? (() => {
                    const img = product.variants[0].images[0];
                    const imgSrc = img.startsWith('http') ? img : `/public/uploads/${img}`;
                    return `<img src="${imgSrc}" class="product-img card-img-top" alt="${product.name}">`;
                })() : ''}
                <div class="card-body">
                    <p class="card-title mb-1"><strong>${product.brand}</strong></p>
                    <p class="card-title mb-0">${product.name} ${product.variants[0].color}</p>
                    <p class="card-text m-0">
                        &#8377;${product.discountedPrice.toFixed(2)}
                        ${product.discountedPrice < product.price ? `
                            <del class="text-secondary ms-2">&#8377;${product.price.toFixed(2)}</del>
                            <span class="text-danger ms-2">
                                (Save ${(100 * (product.price - product.discountedPrice) / product.price).toFixed(0)}%)
                            </span>` : ''}
                    </p>
                </div>
            </a>
        </div>
    </div>
    `;
};

// Initialize wishlist button functionality
const initializeWishlistButtons = () => {
    document.querySelectorAll('.btn-wishlist').forEach(heartIcon => {
    heartIcon.addEventListener('click', async function () {
        const token = document.body.dataset.userToken;
        if (!token) {
        window.location.href = "/auth/login";
        return;
        }

        const productId = this.dataset.productId;
        const isInWishlist = this.dataset.inWishlist === 'true';

        try {
        const response = await fetch(`/protected/wishlist/${isInWishlist ? 'remove' : 'add'}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });
        const result = await response.json();

        if (result.success) {
            this.dataset.inWishlist = isInWishlist ? 'false' : 'true';
            this.classList.toggle('bi-heart-fill');
            this.classList.toggle('bi-heart');
            this.style.color = isInWishlist ? 'black' : 'red';
        } else {
             if (typeof createToast === 'function') createToast(result.message, 'error');
        }
        } catch (error) {
        console.error('Error updating wishlist:', error);
        if (typeof createToast === 'function') createToast('Failed to update wishlist', 'error');
        }
    });
    });
};

// Render pagination
const renderPagination = (pagination) => {
    const paginationContainer = document.getElementById('pagination');
    const paginationResultContainer = document.getElementById('paginationResult');
    paginationContainer.innerHTML = '';

    paginationResultContainer.innerHTML = pagination.total ? `Showing ${pagination.start} to ${pagination.end} of ${pagination.total} results` : "No results found";

    const paginationTemplate = `
    <nav aria-label="Page navigation">
        <ul class="pagination mb-0 d-flex gap-2">
            <li class="page-item">
                <button
                    class="page-link ${pagination.prevPageUrl ? 'bg-dark' : 'bg-light'}"
                    ${pagination.prevPageUrl ? '' : 'disabled'}
                    onclick="fetchProducts({ page: ${pagination.currentPage - 1} })"
                >
                    <span aria-hidden="true">
                        <i class="bx bx-arrow-back ${pagination.prevPageUrl ? 'text-white' : 'text-black'}"></i>
                    </span>
                </button>
            </li>
            <li class="page-item">
                <button
                    class="page-link ${pagination.nextPageUrl ? 'bg-dark' : 'bg-light'}"
                    ${pagination.nextPageUrl ? '' : 'disabled'}
                    onclick="fetchProducts({ page: ${pagination.currentPage + 1} })"
                >
                    <span aria-hidden="true">
                        <i class="bx bx-arrow-back bx-rotate-180 ${pagination.nextPageUrl ? 'text-white' : 'text-black'}"></i>
                    </span>
                </button>
            </li>
        </ul>
    </nav>
    `;
    paginationContainer.insertAdjacentHTML('beforeend', paginationTemplate);
};

// Initialize sorting and filtering
const initializeSortAndFilterListeners = () => {
    const productSortElement = document.getElementById('product-sort');
    const filtersForm = document.getElementById('filtersForm');

    if (productSortElement) {
    productSortElement.addEventListener('change', (e) => {
        handleSortChange(e.target.value);
    });
    }

    if (filtersForm) {
    filtersForm.addEventListener('change', handleFilterChange);
    }
};

// Handle sort and filter changes
const handleSortChange = (sortValue) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('sort', sortValue);
    fetchProducts(Object.fromEntries(urlParams.entries()));
};

const handleFilterChange = () => {
    const formData = new FormData(document.getElementById('filtersForm'));
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
    if (["category", "color", "size"].includes(key)) {
        params.append(key, value);
    }
    });

    fetchProducts(Object.fromEntries(params.entries()));
};

// Initialize listeners
initializeSortAndFilterListeners();
