/*
 * Product Spotlight Block
 * Displays a featured product with enhanced visual presentation
 * Integrates with Adobe Commerce drop-ins for cart functionality
 */

// Dropin Tools
import { events } from '@dropins/tools/event-bus.js';
import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';

// Dropin Components
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';

// Cart Dropin
import * as cartApi from '@dropins/storefront-cart/api.js';

// Wishlist Dropin
import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';
import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';

// Block-level utilities
import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPlaceholders, rootLink } from '../../scripts/commerce.js';

// Initializers
import '../../scripts/initializers/cart.js';
import '../../scripts/initializers/wishlist.js';

/**
 * Fetches product data from Adobe Commerce GraphQL API
 * @param {string} sku - Product SKU
 * @returns {Promise<Object>} Product data
 */
async function fetchProductData(sku) {
  const endpoint = getConfigValue('commerce-core-endpoint');
  const headers = getConfigValue('headers');

  const query = `
    query getProduct($sku: String!) {
      products(skus: [$sku]) {
        sku
        name
        ... on SimpleProductView {
          id
          name
          price {
            final {
              amount {
                currency
                value
              }
            }
          }
          images {
            url
          }
        }
        urlKey
        images {
          url
        }
        shortDescription
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers?.cs || {},
      },
      body: JSON.stringify({
        query,
        variables: { sku },
      }),
    });

    const data = await response.json();
    return data.data?.products?.[0] || null;
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
}

/**
 * Creates the product image element
 * @param {Object} product - Product data
 * @param {Element} container - Container element
 */
function createProductImage(product, container) {
  const imageContainer = document.createElement('div');
  imageContainer.className = 'spotlight__image-container';

  if (product.images?.[0]?.url) {
    const img = document.createElement('img');
    img.src = product.images[0].url;
    img.alt = product.images[0].label || product.name;
    img.className = 'spotlight__image';
    imageContainer.appendChild(img);
  } else {
    // Fallback placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'spotlight__image-placeholder';
    placeholder.textContent = 'No Image Available';
    imageContainer.appendChild(placeholder);
  }

  container.appendChild(imageContainer);
}

/**
 * Creates the product information section
 * @param {Object} product - Product data
 * @param {Object} labels - Placeholder labels
 * @param {Element} container - Container element
 */
function createProductInfo(product, labels, container) {
  const infoContainer = document.createElement('div');
  infoContainer.className = 'spotlight__info';

  // Product name
  const name = document.createElement('h2');
  name.className = 'spotlight__name';
  name.textContent = product.name;
  infoContainer.appendChild(name);

  // Product price
  const priceContainer = document.createElement('div');
  priceContainer.className = 'spotlight__price-container';

  const price = document.createElement('span');
  price.className = 'spotlight__price';
  const priceData = product.price_range?.minimum_price;
  if (priceData) {
    const { currency } = priceData.final_price;
    const finalPrice = priceData.final_price.value;
    const regularPrice = priceData.regular_price.value;

    price.textContent = `${currency} ${finalPrice.toFixed(2)}`;

    // Show discount if applicable
    if (finalPrice < regularPrice) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'spotlight__price-original';
      originalPrice.textContent = `${currency} ${regularPrice.toFixed(2)}`;
      priceContainer.appendChild(originalPrice);
    }
  }
  priceContainer.appendChild(price);
  infoContainer.appendChild(priceContainer);

  // Product description
  if (product.short_description?.html) {
    const description = document.createElement('div');
    description.className = 'spotlight__description';
    description.innerHTML = product.short_description.html;
    infoContainer.appendChild(description);
  }

  // Action buttons container
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'spotlight__actions';

  // Add to cart button
  const addToCartContainer = document.createElement('div');
  addToCartContainer.className = 'spotlight__add-to-cart';

  UI.render(Button, {
    children: labels.Global?.AddProductToCart || 'Add to Cart',
    icon: Icon({ source: 'Cart' }),
    onClick: () => {
      cartApi.addProductsToCart([
        { sku: product.sku, quantity: 1 },
      ]);

      // Show success feedback
      const successMessage = document.createElement('div');
      successMessage.className = 'spotlight__success-message';
      successMessage.textContent = 'Added to cart!';
      addToCartContainer.appendChild(successMessage);

      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    },
    variant: 'primary',
    size: 'large',
  })(addToCartContainer);

  actionsContainer.appendChild(addToCartContainer);

  // View product button
  const viewProductContainer = document.createElement('div');
  viewProductContainer.className = 'spotlight__view-product';

  UI.render(Button, {
    children: labels.Global?.ViewProduct || 'View Details',
    href: rootLink(`/products/${product.url_key}/${product.sku}`),
    variant: 'secondary',
    size: 'large',
  })(viewProductContainer);

  actionsContainer.appendChild(viewProductContainer);

  // Wishlist toggle
  const wishlistContainer = document.createElement('div');
  wishlistContainer.className = 'spotlight__wishlist';

  wishlistRender.render(WishlistToggle, {
    product: {
      sku: product.sku,
      name: product.name,
      price: product.price_range?.minimum_price?.final_price,
      image: product.media_gallery?.[0],
    },
  })(wishlistContainer);

  actionsContainer.appendChild(wishlistContainer);
  infoContainer.appendChild(actionsContainer);
  container.appendChild(infoContainer);
}

/**
 * Main decoration function for the product spotlight block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Get labels for internationalization
  const labels = await fetchPlaceholders();

  // Read block configuration
  const config = readBlockConfig(block);
  const {
    sku,
    title = 'Featured Product',
    theme = 'default',
  } = config;

  // Validate required configuration
  if (!sku) {
    block.innerHTML = '<p class="spotlight__error">Product SKU is required</p>';
    return;
  }

  // Add theme class
  block.classList.add(`spotlight--${theme}`);

  // Show loading state
  block.innerHTML = '<div class="spotlight__loading">Loading product...</div>';

  try {
    // Fetch product data
    const product = await fetchProductData(sku);

    if (!product) {
      block.innerHTML = '<p class="spotlight__error">Product not found</p>';
      return;
    }

    // Clear loading state and create the spotlight structure
    block.innerHTML = '';

    // Create main container
    const container = document.createElement('div');
    container.className = 'spotlight__container';

    // Add title if provided
    if (title && title !== 'Featured Product') {
      const titleElement = document.createElement('h2');
      titleElement.className = 'spotlight__title';
      titleElement.textContent = title;
      container.appendChild(titleElement);
    }

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'spotlight__content';

    // Create product image
    createProductImage(product, contentWrapper);

    // Create product information
    createProductInfo(product, labels, contentWrapper);

    container.appendChild(contentWrapper);
    block.appendChild(container);

    // Publish analytics event
    events.emit('product-spotlight/loaded', {
      sku: product.sku,
      name: product.name,
      price: product.price_range?.minimum_price?.final_price?.value,
    });
  } catch (error) {
    console.error('Error in product spotlight block:', error);
    block.innerHTML = '<p class="spotlight__error">Error loading product</p>';
  }
}
