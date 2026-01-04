# Forge's Atrium - Fine Dining Restaurant Platform

A modern, elegant restaurant booking and menu discovery platform with dark mode support and staff management dashboard.

## Overview

Forge's Atrium is a premium fine dining restaurant website built for Dhaka's most sophisticated dining experience. It features an interactive menu explorer, real-time table reservation system, and a comprehensive staff dashboard for restaurant management.

## Features

- **Dynamic Menu System** - Browse curated menu items with descriptions and pricing
- **Chef's Special Selection** - Featured specialty dishes with elegant card animations
- **Real-time Table Status** - Live availability tracking across all restaurant tables
- **Appointment Booking** - Reserve tables with date/time selection and pre-order dishes
- **Dark/Light Mode** - Toggle between themes with persistent storage
- **Staff Dashboard** - Comprehensive management portal for:
  - Reservation tracking and management
  - Active order monitoring
  - Menu item administration
  - Inventory management
  - Staff scheduling
  - Analytics and reporting
- **Authentication** - Guest and staff user types with secure login
- **Pre-order System** - Select dishes during reservation with quantity management
- **Responsive Design** - Optimized for all device sizes
- **Smooth Animations** - Floating effects, gradient shifts, and animated hero backgrounds

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Tailwind CSS (utility-first), Custom CSS animations
- **Authentication**: Firebase Auth (configurable)
- **Data Management**: Custom Data SDK + Static fallback data
- **Architecture**: Component-based rendering with vanilla JavaScript

## Project Structure

```
project b/
├── index.html          # Main HTML structure and layout
├── style.css          # Complete styling with animations and dark mode
├── script.js        # Application logic and data management
└── README.md          # Project documentation
```

## Key Sections

### Guest View
- Hero section with animated background
- Menu grid with 10+ curated dishes
- Chef's special selection display
- Live table availability
- Reservation form with pre-order options
- Contact information

### Staff Dashboard
- **Reservations** - View and manage all bookings
- **Orders** - Track active orders with status updates
- **Menu** - Add, edit, and remove menu items
- **Inventory** - Stock management for supplies
- **Staff** - Employee scheduling and information
- **Analytics** - Daily revenue and performance metrics

## Getting Started

1. Open `what.html` in a modern web browser
2. Explore the menu and available tables
3. Book a table or pre-order dishes
4. Toggle dark mode with the button in top-right corner
5. Access staff dashboard with admin credentials (demo mode available)

## Configuration

Edit default settings in `script b.js`:

```javascript
const defaultConfig = {
    restaurant_name: "Forge's Atrium",
    tagline: 'Where Elegance Meets Flavor',
    contact_phone: '+880 1234-567890',
    contact_email: 'hello@forgesatrium.com',
    primary_action_color: '#667eea',
    secondary_action_color: '#764ba2'
};
```

## Authentication

### Guest Login (Demo)
- Browse menu and make reservations
- Pre-order dishes with quantity selection
- View table availability

### Staff Login (Demo)
- Username: `admin@yaras.com`
- Password: `admin123`
- Full access to dashboard and management tools

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lightweight vanilla JavaScript (no frameworks)
- CSS-based animations for smooth performance
- Optimized Tailwind CSS for minimal bundle size
- Real-time data updates with responsive UI

## Theme System

- Light/Dark mode toggle with persistent storage
- CSS variables for complete theme customization
- Smooth transitions between modes
- All elements respond to theme changes

## Author

Built by GlitchForge - A student developer creating sophisticated dining solutions.
