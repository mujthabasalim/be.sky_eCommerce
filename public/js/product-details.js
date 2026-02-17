document.addEventListener('DOMContentLoaded', function() {
  // --- Stock & Size Selection Logic ---

  // Function to update stock display based on selected size
  function updateStock(stock) {
    const stockDisplay = document.getElementById('stock-display');
    if (stock < 10 && stock > 0) {
      stockDisplay.innerHTML = `<span class="text-danger">Only ${stock} left</span>`;
    } else if (stock >= 10) {
      stockDisplay.innerHTML = `<span class="text-success">Available Qty:</span> ${stock}`;
    } else {
      stockDisplay.innerHTML = `<span class="text-danger">Out of Stock</span>`;
    }
  }

  // Initially focus on the first size button and set its stock display
  const firstSizeBtn = document.querySelector(".size-btn.active");
  if (firstSizeBtn) {
    updateStock(firstSizeBtn.getAttribute("data-stock"));
  }

  // Add click event listeners to each size button
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach(button => {
    button.addEventListener("click", function() {
      // Get stock value from the clicked button
      const stock = this.getAttribute("data-stock");

      // Update the stock display
      updateStock(stock);

      // Remove 'active' class from all buttons and add it to the clicked one
      sizeButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // --- Quantity Selector Logic ---

  const maxCount = 3;

  document.body.addEventListener('click', async function(event) {
    const target = event.target;
    // Check if the clicked element is a quantity button (increment or decrement)
    if (target.classList.contains('increment-btn') || target.classList.contains('decrement-btn')) {
      const quantityInput = target.parentElement.querySelector('.quantity-input');
      if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        const maxError = document.getElementById('maxError');
        let newQuantity = currentValue;

        if (target.classList.contains('increment-btn')) {
          newQuantity = currentValue + 1;
        } else if (target.classList.contains('decrement-btn') && currentValue > 1) {
          newQuantity = currentValue - 1;
        }

        if (newQuantity > maxCount) {
          maxError.innerHTML = 'Quantity limit reached.';
          setTimeout(() => {
            maxError.innerHTML = ''
          }, 5000);
          return;
        }

        quantityInput.value = newQuantity;
      }
    }
  });


  // --- Add to Cart Logic ---

  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async function() {
      // These values need to be available in the DOM or passed differently if not using EJS template vars directly in JS file.
      // Since this is an external JS file, we can't use <%= product._id %> directly here unless we read it from the DOM.
      // Best practice: Add data attributes to the button or a wrapper element.
      
      const productElement = document.getElementById('product-data'); // We will add this ID to a wrapper or hidden input
      const productId = addToCartBtn.dataset.productId;
      const variantId = addToCartBtn.dataset.variantId;
      
      const selectedSizeBtn = document.querySelector(".size-btn.active");
      const selectedSize = selectedSizeBtn ? selectedSizeBtn.dataset.size : null;
      const quantityInput = document.getElementById('quantity-input');
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

      if (!selectedSize) {
        createToast('Please select a size.', 'error');
        return;
      }

      const cartData = {
        productId,
        variantId,
        size: selectedSize,
        quantity,
      };

      try {
        const response = await fetch('/protected/cart/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(cartData),
        });

        if (response.status === 401) {
          window.location.href = '/auth/login';
          return;
        }

        const result = await response.json();

        if (response.ok && result.success) {
          createToast('Cart updated successfully!', 'success');
          // Assuming updateCartItemCount is a global function defined in header or common JS
          if (typeof updateCartItemCount === 'function') {
            updateCartItemCount();
          }
        } else {
          createToast(result.message || 'An error occurred while updating the cart.', 'error');
        }
      } catch (error) {
        console.error('Error managing cart:', error);
        createToast('Error managing cart.', 'error');
      }
    });
  }

  // --- Wishlist Logic ---

  document.querySelectorAll('.btn-wishlist').forEach(heartIcon => {
    heartIcon.addEventListener('click', async function() {
      const productId = this.dataset.productId;
      const isInWishlist = this.dataset.inWishlist === 'true';

      try {
        const response = await fetch(`/protected/wishlist/${isInWishlist ? 'remove' : 'add'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId
          })
        });
        const result = await response.json();

        if (result.success) {
          this.dataset.inWishlist = isInWishlist ? 'false' : 'true';

          if (isInWishlist) {
            this.classList.remove('btn-dark');
            this.classList.add('btn-outline-dark');
          } else {
            this.classList.remove('btn-outline-dark');
            this.classList.add('btn-dark');
          }
        } else {
          createToast(result.message, 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        createToast('Failed to update wishlist.', 'error');
      }
    });
  });
});

// --- Image Gallery Logic (Global Functions) ---

function updateMainImage(encodedUrl) {
  const mainImage = document.getElementById('mainImage');
  const decodedUrl = decodeURIComponent(encodedUrl);
  mainImage.src = '/public/uploads/' + decodedUrl;
}

function zoomImage(event) {
  const mainImage = document.getElementById('mainImage');
  const rect = mainImage.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  mainImage.classList.add('zoomed');

  const xPercent = (x / mainImage.width) * 50;
  const yPercent = (y / mainImage.height) * 50;
  mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}

function resetZoom() {
  const mainImage = document.getElementById('mainImage');
  mainImage.classList.remove('zoomed');
  mainImage.style.transformOrigin = 'center center';
}
