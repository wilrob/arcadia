# Arcadia 📷

> A modern, lightweight, 100% client-side web photo album built in Vanilla JavaScript to display your photo galleries and explore embedded metadata (EXIF, IPTC, XMP, GPS).

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-e34f26.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572b6.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**Arcadia** is a databaseless web application that dynamically reads the content of your image folders and extracts all embedded metadata directly inside the browser.

---

## ✨ Features

### 🎨 Display Modes
* **Blog Mode**: Narrative presentation of each photo with its title, description, keywords/tags, and geolocation.
* **Mosaic Mode**: Dynamic, responsive thumbnail grid for a quick visual overview.
* **Lightbox Viewer (Fancybox)**: High-resolution full-screen inspection with touch gestures and zoom support.

### 📊 EXIF / IPTC / XMP Metadata Inspection
Clicking the information button (ⓘ) at the bottom of any photo opens a detailed modal panel displaying:
* **General Information**: Title, description, author, copyright/rights, file name, capture date and time.
* **Keywords & People**: IPTC tags and tagged people in the image.
* **Technical Specifications**: Dimensions, file size, MIME type, camera model, lens, aperture (f-number), shutter speed, ISO sensitivity, focal length.
* **Interactive Geolocation**: GPS coordinate extraction with interactive OpenStreetMap integration.

### 🔍 Search, Sorting & Navigation
* **Keyword Filtering**: Multi-keyword tag search using a configurable separator (default `;`).
* **Dynamic Sorting**: Alphabetical or date-based sorting (newest/oldest) in ascending or descending order.
* **Album Selector**: Dynamic folder detection for switching albums easily.
* **Persistence**: Remembers preferences (album, sort settings, view mode) via URL parameters and cookies.

---

## ⚙️ Installation & Deployment

### 1. Prerequisites
Arcadia runs on any web server (Apache, Nginx, LiteSpeed, Caddy, Node.js static server, IIS, GitHub Pages, etc.) capable of serving static files.
* **No database** (MySQL, PostgreSQL, etc.) required.
* **No server-side language** (PHP, Python, Node.js) required for client rendering.

### 2. Installation
1. Download or clone the repository to your web server:
   ```bash
   git clone https://github.com/your-username/arcadia.git
   cd arcadia
   ```
2. Place your image folders inside the `albums/` directory:
   ```text
   albums/
   ├── Album_Name_1/
   │   ├── photo1.jpg
   │   └── photo2.jpg
   └── Album_Name_2/
       ├── image1.webp
       └── image2.png
   ```

---

## 🔧 Configuration (`js/config.js`)

Global settings are configured inside `js/config.js`:

```javascript
/** SETTINGS  */
// Fixed album title
const fixedTitle = "Fixed title for my photo album";
const setFixedTitle = false; // Set to true to force displaying fixedTitle

// Photos directory
const imageDir = "albums";

// Default index page
const index = "album.html";

// Tag search separator
const separator = ";";
```

---

## 📁 Project Structure

```text
arcadia/
├── index.html            # Landing / Home page
├── album.html            # Main gallery view
├── gallery.html          # Alternative gallery view
├── README.md             # Project documentation
├── albums/               # Directory containing image folders
├── styles/               # CSS stylesheets (index, album, gallery, fancybox, hint)
└── js/                   # JavaScript ES modules
    ├── config.js         # Global configuration & URL/cookies handler
    ├── index.js          # Home page controller
    ├── main.js           # Core gallery rendering logic
    ├── uiRenderer.js     # DOM renderer & EXIF metadata modal builder
    ├── fileReader.js     # File reading utilities
    ├── exifr.full.umd.js # EXIF/IPTC/XMP parser
    └── fancybox.umd.js   # Lightbox viewer library
```

---

## 📚 Credits & Libraries

* **[exifr](https://github.com/MikeKovarik/exifr)** - Fast photo metadata parser (EXIF, IPTC, XMP, GPS).
* **[Fancybox](https://fancyapps.com/fancybox/)** - Responsive lightbox viewer.
* **[Hint.css](https://kushagra.dev/lab/hint/)** - Pure CSS tooltips.
* **[OpenStreetMap](https://www.openstreetmap.org/)** - Interactive mapping engine.

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome via GitHub Issues and Pull Requests!

---

## 📄 License

This project is open-source and released under the MIT License. Feel free to use, modify, and distribute it.
