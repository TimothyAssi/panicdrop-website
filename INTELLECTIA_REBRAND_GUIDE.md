# Intellectia.AI Rebrand Implementation Guide

## Overview
This stylesheet applies the modern, dark-themed aesthetic of Intellectia.AI to your existing website without changing any HTML structure, text, or images.

## Visual Style Analysis Summary
The Intellectia.AI website features a sleek, modern design with:
- **Dark theme**: Black background (#000000) with subtle secondary dark areas
- **Bright blue accents**: Primary blue (#00A3FF) for CTAs and highlights
- **Roboto typography**: Clean, professional font family
- **Minimalist layout**: Centered content, generous whitespace
- **Modern UI components**: Rounded buttons, subtle shadows, hover effects
- **Responsive design**: Mobile-first approach with fluid layouts

## Implementation Steps

### 1. Add the Stylesheet
Add this line to the `<head>` section of each page you want to rebrand:

```html
<link rel="stylesheet" href="css/intellectia-rebrand.css">
```

### 2. Order of CSS Files
Make sure this rebrand stylesheet comes **after** your existing CSS files to override them:

```html
<head>
    <!-- Your existing stylesheets -->
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Intellectia rebrand (should be last) -->
    <link rel="stylesheet" href="css/intellectia-rebrand.css">
</head>
```

### 3. Quick Test
To test on a single page first:
1. Open any page in your browser
2. Add `?test=true` to the URL
3. In browser dev tools, add: `<link rel="stylesheet" href="css/intellectia-rebrand.css">`

## Key Features Included

### 🎨 **Color Scheme**
- Primary Background: `#000000` (black)
- Text: `#ffffff` (white) and `#a0a0a0` (secondary)
- Accent: `#00A3FF` (bright blue)
- Cards: `#1a1a1a` (dark gray)

### 🔤 **Typography**
- Font: Roboto (imported from Google Fonts)
- Responsive sizing using `clamp()` functions
- Gradient text effects on main headings

### 🎯 **Components Styled**
- **Headers/Navigation**: Fixed dark header with blur effect
- **Buttons**: Blue primary buttons with hover animations
- **Cards**: Dark cards with blue border hover effects
- **Forms**: Dark theme form inputs with blue focus states
- **Tables**: Dark themed with hover effects
- **Footer**: Consistent dark theme

### 📱 **Responsive Design**
- Mobile-first approach
- Breakpoints at 768px (tablet) and 480px (mobile)
- Collapsible navigation for mobile
- Fluid typography and spacing

### ✨ **Animations**
- Fade-in animations for hero content
- Hover effects on buttons and cards
- Smooth transitions throughout
- Subtle loading states

## Customization Options

### Override Specific Colors
Add this after the rebrand stylesheet:

```css
:root {
    --accent-primary: #YOUR_COLOR;
    --primary-bg: #YOUR_BG_COLOR;
}
```

### Disable Animations
Add this CSS:

```css
*, *::before, *::after {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
}
```

### Adjust Typography
```css
:root {
    --font-family: 'Your Font', sans-serif;
    --font-size-base: 18px; /* Larger base font */
}
```

## Testing Checklist

- [ ] All pages load without CSS conflicts
- [ ] Navigation works properly on mobile
- [ ] Buttons are clickable and styled correctly
- [ ] Forms are usable with dark theme
- [ ] Text is readable (sufficient contrast)
- [ ] Images display properly with new styling
- [ ] Responsive design works on all screen sizes

## Troubleshooting

### Issue: Some elements not styled
**Solution**: The original CSS might have higher specificity. Add `!important` to override:
```css
.your-element {
    color: var(--primary-text) !important;
}
```

### Issue: Mobile menu not working
**Solution**: Add JavaScript for mobile toggle:
```javascript
document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});
```

### Issue: Fonts not loading
**Solution**: Ensure you have internet connection for Google Fonts, or download fonts locally.

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## File Size
- CSS file: ~15KB
- Google Fonts: ~20KB (cached)
- Total impact: ~35KB

The rebrand is now ready to transform your website into a modern, Intellectia.AI-inspired design!