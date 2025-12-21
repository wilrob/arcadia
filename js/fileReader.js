/*************************************************************
 * fileReader.js
 * Gere la lecture du repertoire photo et le chargement des images
 *************************************************************/
import { t } from './messages.js';
import { config } from './config.js';
import { Div, loadFiles, divOrder, toggleDisplay } from './util.js';

/**
 * Initialise le bouton "retour en haut"
 */
function initScrollToTop() {

  const myButton = document.querySelector('#toTop');
  myButton.innerHTML = `
    <svg class="IconLarge"><use href="./icons/sprite.svg#icon-toTop"></use></svg>
  `;
  if (!myButton) return;

  const toggleButton = () => {
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    myButton.style.display = scrollTop > 800 ? "block" : "none";
  };

  window.addEventListener('scroll', toggleButton, { passive: true });

  myButton.addEventListener('click', () => {
    globalThis.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
}

/**
 * Initialise les boutons de navigation
 * @returns {string} HTML des boutons de navigation
 */
function createNavigationButtons() {
  // Configuration des boutons (evite la repetition)
  const buttons = {
    arrowDown: {
      id: 'arrowDownButton',
      icon: 'arrow-up',
      label: t("firstOnTop")
    },
    arrowUp: {
      id: 'arrowUpButton',
      icon: 'arrow-down',
      label: t("lastOnTop")
    },
    numeric: {
      id: 'numericButton',
      icon: 'alphabetic',
      label: t("orderByDate")
    },
    alphabetic: {
      id: 'alphabeticButton',
      icon: 'calendar',
      label: t("orderByName")
    },
    blog: {
      id: 'buttonBlog',
      icon: 'mosaic',
      label: t("blog")
    },
    mosaic: {
      id: 'buttonMosaic',
      icon: 'blog',
      label: t("mosaic")
    }
  };

  // Stockage global (si necessaire ailleurs)
  Object.entries(buttons).forEach(([key, cfg]) => {
    globalThis[`${key}Button`] = createButton(cfg);
  });

  // Selection des boutons appropries
  const triButton = config.data.tri === 'id' ? globalThis.alphabeticButton : globalThis.numericButton;
  const sensButton = config.data.sens === 'down' ? globalThis.arrowUpButton : globalThis.arrowDownButton;
  const displayButton = config.data.typeAlbum === 'blog' ? globalThis.mosaicButton : globalThis.blogButton;

  return `
    <svg class="IconMedium"><use href="./icons/sprite.svg#icon-album"></use></svg>&nbsp;
    <span id="boutontri">${triButton}</span>&nbsp;&nbsp;
    <span id="sens">${sensButton}</span>&nbsp;&nbsp;
    <span id="boutondisplay">${displayButton}</span>
  `;
}

// Fonction helper pour creer un bouton
const createButton = (config) => `
  <button id="${config.id}" class="hint--bottom${config.id.includes('display') ? '-left' : ''}" aria-label="${config.label}">
    <svg class="IconMedium"><use href="./icons/sprite.svg#icon-${config.icon}"></use></svg>
  </button>`;

/**
 * Charge la liste des albums disponibles
 * @returns {Promise<Map>} Map des albums (nom -> chemin)
 */
async function loadAlbums() {
  const listDir = await loadFiles(config.imageDir);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(listDir, 'text/html');
  const links = Array.from(xmlDoc.querySelectorAll('a')).slice(1);

  const albums = new Map();

  for (const link of links) {
    const name = link.textContent?.trim();

    if (name?.endsWith('/') && !name.startsWith('.')) {
      const clean = name.replace('/', '').trim();
      albums.set(clean, `${config.imageDir}/${clean}`);
    }
  }

  if (albums.size === 0) {
    console.warn("Aucun album trouve dans le dossier", config.imageDir);
  }

  return albums;
}

/**
 * Charge les images d'un album
 * @param {string} albumPath - Chemin de l'album
 * @returns {Promise<string[]>} Liste des chemins d'images
 */
async function loadAlbumImages(albumPath) {
  const listFiles = await loadFiles(albumPath);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(listFiles, 'text/html');
  const links = xmlDoc.querySelectorAll('a');

  const imageExtensions = /\.(gif|jpe?g|png|tiff?)$/i;
  const imageList = [];

  for (const link of links) {
    const href = link.getAttribute('href')?.trim();
    if (href && imageExtensions.test(href)) {
      imageList.push(`${albumPath}/${href}`);
    }
  }

  return imageList;
}

/**
 * Cree le formulaire de selection d'album
 * @param {Map} albums - Map des albums disponibles
 * @returns {string} HTML du formulaire
 */
/*function createAlbumSelector(albums) {
  const options = Array.from(albums.entries())
    .map(([name]) => {
      const selected = name === config.getDir ? 'selected="selected"' : '';
      return `<option value="${name}" ${selected}>${name}</option>`;
    })
    .join('');

  return `
    <form action="${config.index}" method="get" onchange="this.submit()">
      <svg class="IconMedium"><use href="./icons/sprite.svg#icon-dir"></use></svg>
      <select name="dir">${options}</select>
    </form>
  `;
}*/
function createAlbumSelector(albums) {
  const options = Array.from(albums.entries())
    .map(([name]) => {
      const selected = name === config.getDir ? 'data-selected="true"' : '';
      return `
        <button type="submit" name="dir" value="${name}" class="album-option" ${selected}>
          ${name}
        </button>
      `;
    })
    .join('');

  return `
    <div class="album-selector">
      
      <!-- Toggle menu (checkbox hack) -->
      <input type="checkbox" id="toggleMenu" class="menu-toggle" />

      <!-- Icône -->
      <button class="hint--left" aria-label="${t("chooseDir")}">
        <label for="toggleMenu" class="selector-trigger">
            <svg class="IconMedium">
              <use href="./icons/sprite.svg#icon-dir"></use>
            </svg>
        </label>
       </button>

      <!-- Menu -->
      <form action="${config.index}" method="get" class="selector-menu">
        ${options}
      </form>

    </div>
  `;
}


/**
 * Gere les evenements des boutons de navigation
 */
function setupNavDelegation() {
  const navContainer = document.querySelector('#nav1') || document.querySelector('#foundFiles');
  if (!navContainer) {
    console.warn("Aucun conteneur nav trouve pour delegation");
    return;
  }

  const buttonActions = {
    'arrowDownButton': () => divOrder(0, 'down'),
    'arrowUpButton': () => divOrder(0, 'up'),
    'numericButton': () => divOrder('id', 0),
    'alphabeticButton': () => divOrder('name', 0),
    'buttonBlog': () => toggleDisplay('blog'),
    'buttonMosaic': () => toggleDisplay('mosaic')
  };

  navContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    e.preventDefault();
    const action = buttonActions[btn.id];
    if (action) action();
  });
}

/**
 * Point d'entree principal : lecture du repertoire photo
 * @returns {Promise<Object>} Informations sur les images chargees
 */
export async function readPhotoDirectory() {
  try {
    // Affiche le bouton haut de page
    initScrollToTop();
    // Affiche le logo de chargement
    config.progressText.innerHTML = t('loading');

    // Lien home
    document.querySelector('#link').innerHTML = `
      <div id="home">
        <a href="index.html" class="hint--right" aria-label="${t('home')}">
          <svg class="IconLarge"><use href="./icons/sprite.svg#icon-home"></use></svg>
        </a>
      </div>`;

    // Navigation
    const navLink = createNavigationButtons();
    new Div({
      type: 'p',
      id: 'nav1',
      container: 'foundFiles',
      contents: navLink,
      classe: 'menu',
      position: 'before',
    }).show();

    setupNavDelegation();

    // Formulaire de recherche
    const searchField = `
    <div class="search-wrapper">
      <!-- Icône cliquable = label qui cible l?input -->
      <label for="searchText" class="hint--bottom" aria-label="${t('search')}">
        <svg class="IconMedium searchButton">
          <use href="./icons/sprite.svg#icon-search"></use>
        </svg>
      </label>

      <!-- Formulaire -->
      <form name="recherche" action="#" method="get" class="search-box">
        <input
          id="searchText"
          name="search"
          placeholder="${t('searchInput')}"
          required>
      </form>
    </div>`;

    new Div({
      type: 'p',
      id: 'search',
      container: 'foundFiles',
      contents: searchField,
      classe: 'menu',
      position: 'before',
    }).show();

    // Chargement des albums
    const albums = await loadAlbums();
    if (albums.size === 0) {
      return { images: [], search: config.data.search, nbFiles: 0 };
    }

    // Selecteur d'albums
    const dirForm = createAlbumSelector(albums);
    new Div({
      type: 'p',
      id: 'directory',
      container: 'nav1',
      contents: dirForm,
      classe: 'menu',
      position: 'before',
    }).show();

    // Selection de l'album
    const albumPath = config.data.dir !== '' ? config.data.dir : albums.values().next().value;

    // Chargement des images
    const imageList = await loadAlbumImages(albumPath);

    // Affichage du nombre d'images
    const dirElem = document.querySelector('#directory');
    if (dirElem) {
      const dir = config.data.dir.replace(`${config.imageDir}/`,``);
      const newDiv = document.createElement('span');
      newDiv.innerHTML = `<b>${dir}</b>`;
      dirElem.appendChild(newDiv);
    }

    return {
      images: imageList,
      search: config.data.search,
      nbFiles: imageList.length
    };

  } catch (err) {
    console.error("Erreur dans readPhotoDirectory:", err);
    throw err;
  }
}
