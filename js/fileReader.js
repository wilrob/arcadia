/*************************************************************
 * fileReader.js
 * Gère la lecture du répertoire photo et le chargement des images
 *************************************************************/
import { t } from './messages.js';
import { config } from './config.js';
import { Div, loadFiles, divOrder, toggleDisplay } from './util.js';

/**
 * Initialise le bouton "retour en haut"
 */
function initScrollToTop() {

  const myButton = document.getElementById('toTop');
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
  // Configuration des boutons (évite la répétition)
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

  // Fonction helper pour créer un bouton
  const createButton = (config) => `
    <button id="${config.id}" class="hint--bottom${config.id.includes('display') ? '-left' : ''}" aria-label="${config.label}">
      <svg class="IconMedium"><use href="./icons/sprite.svg#icon-${config.icon}"></use></svg>
    </button>`;

  // Stockage global (si nécessaire ailleurs)
  Object.entries(buttons).forEach(([key, cfg]) => {
    globalThis[`${key}Button`] = createButton(cfg);
  });

  // Sélection des boutons appropriés
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

/**
 * Charge la liste des albums disponibles
 * @returns {Promise<Map>} Map des albums (nom -> chemin)
 */
async function loadAlbums() {
  const listDir = await loadFiles(config.imageDir);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(listDir, 'text/html');
  const links = Array.from(xmlDoc.getElementsByTagName('a')).slice(1);

  const albums = new Map();

  for (const link of links) {
    const name = link.textContent?.trim();

    if (name?.endsWith('/') && !name.startsWith('.')) {
      const clean = name.replace('/', '').trim();
      albums.set(clean, `${config.imageDir}/${clean}`);
    }
  }

  if (albums.size === 0) {
    console.warn("Aucun album trouvé dans le dossier", config.imageDir);
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
  const links = xmlDoc.getElementsByTagName('a');

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
 * Crée le formulaire de sélection d'album
 * @param {Map} albums - Map des albums disponibles
 * @returns {string} HTML du formulaire
 */
function createAlbumSelector(albums) {
  const options = Array.from(albums.entries())
    .map(([name, path]) => {
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
}

/**
 * Gère les événements des boutons de navigation
 */
function setupNavDelegation() {
  const navContainer = document.getElementById('nav1') || document.getElementById('foundFiles');
  if (!navContainer) {
    console.warn("Aucun conteneur nav trouvé pour délégation");
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
 * Point d'entrée principal : lecture du répertoire photo
 * @returns {Promise<Object>} Informations sur les images chargées
 */
export async function readPhotoDirectory() {
  try {
    // Initialisation
    initScrollToTop();
    config.progressText.innerHTML = t('loading');

    // Lien home
    document.getElementById('link').innerHTML = `
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
    new Div({
      type: 'p',
      id: 'search',
      container: 'foundFiles',
      contents: `
        <form name="recherche" action="#" method="GET">
          <svg class="IconMedium"><use href="./icons/sprite.svg#icon-search"></use></svg>
          <input id="searchText" name="search" placeholder="${t("searchInput")}" value="" size=25" required />
        </form>`,
      classe: 'menu',
      position: 'before',
    }).show();

    // Chargement des albums
    const albums = await loadAlbums();
    if (albums.size === 0) {
      return { images: [], search: config.data.search, nbFiles: 0 };
    }

    // Sélecteur d'albums
    const dirForm = createAlbumSelector(albums);
    new Div({
      type: 'p',
      id: 'directory',
      container: 'nav1',
      contents: dirForm,
      classe: 'menu',
      position: 'before',
    }).show();

    // Sélection de l'album
    const albumPath = config.data.dir !== '' ? config.data.dir : albums.values().next().value;

    // Chargement des images
    const imageList = await loadAlbumImages(albumPath);

    // Affichage du nombre d'images
    const dirElem = document.getElementById('directory');
    if (dirElem) {
      dirElem.append(`${imageList.length}` > 1 ? `${imageList.length} ${t('pictures')}` : `${imageList.length} ${t('picture')}`);
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
