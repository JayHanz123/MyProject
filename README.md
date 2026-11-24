# agriStore Ghana

A browser-based warehouse booking platform for Ghanaian farmers and warehouse owners.

**Live demo:** https://jayhanz-jh.github.io/warehouse/

## Overview

agriStore Ghana helps farmers discover verified warehouses, request storage bookings, and track booking status. Warehouse owners can review incoming requests and manage farmer information through a dedicated dashboard.

## Features

- Browse and search warehouses across Ghana
- Filter by region, price, capacity, and rating
- Save favorite warehouses
- Compare multiple warehouses
- Create farmer or warehouse-owner accounts
- Request and track storage bookings
- View booking statuses: pending, confirmed, stored, released, or cancelled
- Warehouse-owner booking management
- Administrator dashboard
- Profile and password management

## Demo Accounts

The application stores demo data in the browser. User accounts and bookings depend on the app's local storage state.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/jayhanz-jh/warehouse.git
   cd warehouse
   ```

2. Serve the directory with a local web server:

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser.

## Project Files

- `index.html` — application structure and views
- `style.css` — layout, components, responsive styling, and themes
- `app.js` — application data, interactions, authentication, dashboards, and booking logic
- `README.md` — project documentation

## Technologies

- HTML5
- CSS3
- JavaScript
- Font Awesome
- Google Fonts

## Hosting

This project is hosted with GitHub Pages at:

https://jayhanz-jh.github.io/warehouse/

## License

No license has been added to this repository yet.
