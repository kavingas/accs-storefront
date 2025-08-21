# Product Spotlight Block

A sophisticated block for showcasing featured products with enhanced visual presentation and full Adobe Commerce integration.

## Overview

The Product Spotlight block creates an eye-catching product display that fetches live product data from Adobe Commerce, includes interactive shopping features, and provides a premium user experience with multiple styling themes.

## Features

- 🛒 **Live Product Data**: Fetches real-time product information via GraphQL
- 🛍️ **Add to Cart**: Integrated Adobe Commerce cart functionality
- ❤️ **Wishlist Integration**: Save products for later
- 📱 **Responsive Design**: Mobile-first, works on all screen sizes
- 🎨 **Multiple Themes**: Default, minimal, and dark styling options
- 📊 **Analytics**: Built-in event tracking
- ♿ **Accessibility**: Screen reader friendly with high contrast support
- 🚀 **Performance**: Optimized loading with error handling

## Usage

### For Content Authors

Create a table in your document with the following structure:

```
Product Spotlight
sku | 24-MB01
title | Featured Product of the Week
theme | default
```

### Configuration Options

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `sku` | String | ✅ Required | - | Product SKU from Adobe Commerce |
| `title` | String | ❌ Optional | "Featured Product" | Custom heading for the spotlight |
| `theme` | String | ❌ Optional | "default" | Visual theme: `default`, `minimal`, `dark` |

### Examples

#### Basic Usage
```
Product Spotlight
sku | 24-MB01
```

#### With Custom Title
```
Product Spotlight
sku | 24-MB01
title | Staff Pick of the Week
```

#### Dark Theme
```
Product Spotlight
sku | 24-MB05
title | Premium Collection
theme | dark
```

## Themes

### Default Theme
- Elevated card design with shadow
- Hover animations and transitions
- Standard Adobe Commerce colors

### Minimal Theme  
- Clean, borderless design
- Subtle hover effects
- Lighter visual weight

### Dark Theme
- Dark background for premium feel
- Light text and accents
- Perfect for luxury products

## Technical Implementation

### GraphQL Integration
The block fetches comprehensive product data including:
- Basic product information (name, SKU, price)
- Product images and media gallery
- Short descriptions
- Pricing with discount detection
- Configurable product variants

### Dependencies
- `@dropins/tools/event-bus.js` - Event system
- `@dropins/tools/components.js` - UI components
- `@dropins/storefront-cart/api.js` - Cart functionality
- `@dropins/storefront-wishlist/` - Wishlist features

### Performance Features
- Lazy loading of product data
- Optimized image delivery
- Progressive enhancement
- Error boundary handling

## Styling

The block uses Adobe Commerce design tokens for consistent styling:

```css
/* Key CSS Classes */
.product-spotlight              /* Main container */
.spotlight__container          /* Inner wrapper */
.spotlight__content           /* Grid layout */
.spotlight__image-container   /* Product image */
.spotlight__info             /* Product details */
.spotlight__actions          /* Button container */
```

### Responsive Breakpoints
- **Desktop**: 2-column grid layout
- **Tablet** (≤768px): Single column, adjusted spacing
- **Mobile** (≤480px): Compact layout, smaller text

## Analytics Events

The block emits analytics events for tracking:

```javascript
events.emit('product-spotlight/loaded', {
  sku: product.sku,
  name: product.name,
  price: product.price_range?.minimum_price?.final_price?.value
});
```

## Error Handling

- **Missing SKU**: Shows configuration error
- **Product Not Found**: Displays "Product not found" message
- **API Errors**: Graceful fallback with error message
- **Network Issues**: Loading state with timeout

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast mode compatibility
- Reduced motion preferences respected

## Browser Support

- Modern browsers with ES6+ support
- Progressive enhancement for older browsers
- Graceful degradation without JavaScript

## Development

### File Structure
```
blocks/product-spotlight/
├── product-spotlight.js    # Main block logic
├── product-spotlight.css   # Styling
└── README.md              # Documentation
```

### Local Development
1. Ensure Adobe Commerce backend is configured
2. Update product SKUs in examples to match your catalog
3. Test with `aem up` local development server

### Customization
The block can be extended with:
- Additional product data fields
- Custom styling themes
- Enhanced analytics tracking
- Integration with other Adobe Commerce features

## Troubleshooting

### Common Issues

**Block shows "Product not found"**
- Verify the SKU exists in your Adobe Commerce catalog
- Check that the product is enabled and in stock
- Confirm GraphQL endpoint configuration

**Styling issues**
- Ensure CSS file is loaded properly
- Check for CSS conflicts with existing styles
- Verify design token CSS variables are available

**Cart integration not working**
- Confirm cart initializer is loaded
- Check Adobe Commerce API permissions
- Verify product is eligible for purchase

### Debug Mode
Enable console logging to troubleshoot:
```javascript
// In browser console
localStorage.setItem('debug', 'product-spotlight');
```

## License

Copyright 2025 Adobe. Licensed under the Apache License, Version 2.0.
