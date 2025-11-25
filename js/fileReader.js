/*************************************************************
 * fileReader.js
 * Gère la lecture du répertoire photo et le chargement des images
 *************************************************************/
import { t } from './messages.js';
import { config } from './config.js';
import { Div, decode_utf8, loadFiles, divOrder, toggleDisplay } from './util.js';

export async function readPhotoDirectory() {
  //console.log("Lecture du répertoire photo...");

  // When the user scrolls down 800px from the top of the document, show the button
  window.onscroll = function() {
    let myButton = document.getElementById('toTop');
    if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800) {
      myButton.style.display = "block";
    } else {
      myButton.style.display = "none";
    }
  };
  // Remonte en haut de page quand on clique sur le bouton
  let myButton = document.getElementById('toTop');
  myButton.addEventListener('click', () => {
      globalThis.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });

  /*** AFFICHAGE INITIAL ***/
  const progressText = config.progressText;
  progressText.innerHTML = t('loading');


  /*** LIEN HOME ET ALBUM */
  const entete = `<div id="home"><a href="index.html" class="hint--right" aria-label="${t('home')}"><svg class="IconLarge"><use href="./icons/sprite.svg#icon-home"></use></svg></a></div>`;
  document.getElementById('link').innerHTML = entete;

  /*********************************************************************/
  /* Creation des liens de navigation de pages
  /*********************************************************************/
  // Boutons de TRI
  // Parametres globaux utilises aussi dans la fonction 'tri'
  // Fleches de sens de tri (UP/DOWN)
  globalThis.arrowDown = `
  <button id="arrowDownButton" class="hint--bottom" aria-label="${t("firstOnTop")}">
    <svg class="Icon"><use href="./icons/sprite.svg#icon-arrow-up"></use></svg>
  </button>`;
  globalThis.arrowUp = `
  <button id="arrowUpButton" class="hint--bottom" aria-label="${t("lastOnTop")}">
    <svg class="Icon"><use href="./icons/sprite.svg#icon-arrow-down"></use></svg>
  </button>`;
  // Icone DATE ou NOM
  globalThis.numericButton = `
  <button id="numericButton" class="hint--bottom" aria-label="${t("orderByDate")}">
    <svg class="Icon"><use href="./icons/sprite.svg#icon-alphabetic"></use></svg>
  </button>`;
  globalThis.alphabeticButton = `
  <button id="alphabeticButton" class="hint--bottom" aria-label="${t("orderByName")}">
    <svg class="Icon"><use href="./icons/sprite.svg#icon-calendar"></use></svg>
  </button>`;
  // Creation des boutons
  let triButton = config.data.tri == 'id' ? globalThis.alphabeticButton : globalThis.numericButton;
  let sensButton = config.data.sens == 'down' ? globalThis.arrowUp : globalThis.arrowDown;
  // Boutons mosaique ou blog
  globalThis.blogButton = `
  <button id="buttonBlog" class="hint--bottom-left" aria-label="${t("blog")}">
    <svg class="Icon"><use href="./icons/sprite.svg#icon-mosaic"></use></svg>
  </button>`;
  globalThis.mosaicButton = `
  <button id="buttonMosaic" class="hint--bottom-left" aria-label="${t("mosaic")}">
    <svg class="Icon"><use href="./icons/sprite.svg#icon-blog"></use></svg>
  </button>`;
  let displayButton = config.data.typeAlbum == 'blog' ? globalThis.mosaicButton : globalThis.blogButton;

  /*********************************************************************/
  /* Affichage liens de navigation
  /*********************************************************************/
  // Création de la barre de boutons
  const navLink = `
  <svg class="Icon"><use href="./icons/sprite.svg#icon-album"></use></svg>&nbsp;
  <span id="boutontri">${triButton}</span>&nbsp;&nbsp;
  <span id="sens">${sensButton}</span>&nbsp;&nbsp;
  <span id="boutondisplay">${displayButton}</span>  
  `;
  // Création de la div contenant la barre de boutons
  const myLink = new Div({
    type: 'p',
    id: 'nav1',
    container: 'foundFiles',
    contents: navLink,
    classe: 'menu',
    position: 'before',
  });

  myLink.show();
  // Gestion des actions sur le boutons (dans utils.js)
  setupNavDelegation()

  /*** ================================
   *  FORMULAIRE DE RECHERCHE
   *  ================================ ***/
  const searchForm = `
    <form name="recherche" action="${config.index}" method="GET">
      <svg class="Icon"><use href="./icons/sprite.svg#icon-search"></use></svg>
      <input name="search" placeholder="${t("searchInput")}" value="" size="20" required />
      <input type="hidden" name="dir" value="${config.getDir}" />
      <input type="submit" value="OK" />
    </form>
    `;

  // Afficher le résultat de la recherche
  const myResult = new Div({
    type: 'p',
    id: 'search',
    container: 'foundFiles',
    contents: searchForm,
    classe: 'menu',
    position: 'before',
  });
  myResult.show();

  /*********************************************************************/
  /* Affichage des tags de recherches
  /*********************************************************************/
  let searchText = '';
  if (config.data.search != 'all') {
    // Affichage des recherche avec lien de suppression
    const searchArray = config.data.search.split(config.separator);
    searchArray.forEach((item) => {
      // Supprime le tag et recree le search dans l'url sans le tag present
      let newSearchArray = searchArray.filter((it) => it !== item)
      let newSearch = newSearchArray.join(config.separator);
      let searchUrl = newSearch !== '' ? newSearch : 'all';
      // Remplace les _ par un espace
      searchText = decode_utf8(item.replaceAll('_', config.separator));

      const mySearch = new Div({
        type: 'span',
        container: 'resultat',
        contents: `<a href="${config.index}?search=${searchUrl}">&#9447; ${searchText}</a>`,
        classe: 'searchText',
        position: 'before'
      });

      mySearch.show();
    });
  }

  /**
   * LECTURE ET AFFICHAGE DES REPERTOIRES PHOTO
   */
  /*** Étape 1 : Lecture du dossier racine (albums) ***/
  let listDir;
  try {
    listDir = await loadFiles(config.imageDir);
  } catch (err) {
    console.error("Erreur lecture du répertoire :", err);
    throw err;
  }

  const parserDir = new DOMParser();
  const xmlDocDir = parserDir.parseFromString(listDir, 'text/html');
  const rep = xmlDocDir.getElementsByTagName('a');

  // Construction de la liste des répertoires
  const albums = new Map();
  for (let i = 1; i < rep.length; i++) {
    const file = rep[i].childNodes[0].nodeValue;
    const name = file.trim();
    if (name.endsWith('/') && !name.startsWith('.')) {
      const clean = name.replace('/', '').trim();
      albums.set(clean, `${config.imageDir}/${clean}`);
    }
  }

  if (albums.size === 0) {
    console.warn("Aucun album trouvé dans le dossier", config.imageDir);
    return [];
  }

  /*********************************************************************/
  /* Selection des repertoires
  /*********************************************************************/
  // Affichage de la liste des repertoires photos dans albums
  let albumList = '';
  albums.forEach((value, index) => {
    let nomDir = value.replace(`${config.imageDir}/`, '');
    albumList += `<option value="${index}" ${index === config.getDir ? `selected="selected"` : ``
      }>${nomDir}</option>`;
  });


  // Formulaire de sélection d?album
  const dirForm = `
    <form action="${config.index}" method="get" onchange="this.submit()">
      <svg class="Icon"><use href="./icons/sprite.svg#icon-dir"></use></svg>
      <select name="dir">${albumList}</select>
    </form>
    `;

  // Affichage menu deroulant des repertoires
  const myDir = new Div({
    type: 'p',
    id: 'directory',
    container: 'nav1',
    contents: dirForm,
    classe: 'menu',
    position: 'before',
  });
  myDir.show();


  // Sélection du premier album par défaut si par sélectionné
  const albumPath = config.data.dir === '' ? albums.entries().next().value : config.data.dir;
  const albumName = albumPath.replace(`${config.imageDir}/`, '');

  /*** Étape 2 : Lecture du contenu de l?album ***/
  let listFiles;
  try {
    listFiles = await loadFiles(albumPath);
  } catch (err) {
    console.error("Erreur lecture du contenu de l'album :", err);
    throw err;
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(listFiles, 'text/html');
  const links = xmlDoc.getElementsByTagName('a');

  const imageList = [];
  for (let link of links) {
    const href = link.getAttribute('href')?.trim();
    if (/\.(gif|jpg|jpeg|png|tiff)$/i.test(href)) {
      imageList.push(`${albumPath}/${href}`);
    }
  }

  /*** Étape 3 : Affichage infos ***/
  const dirElem = document.getElementById('directory');
  if (dirElem) dirElem.append(imageList.length + t('pictures'));

  /*** Étape 4 : Retour des données dans main.js ***/
  return {
    //album: albumName,
    //dir: albumPath,
    images: imageList,
    search: config.data.search,
    nbFiles: imageList.length
  };
}

// Gestion des boutons du menu dans 'nav1'
function setupNavDelegation() {
  const navContainer = document.getElementById('nav1') || document.getElementById('foundFiles');
  if (!navContainer) {
    console.warn("Aucun conteneur nav trouvé pour délégation");
    return;
  }
  navContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();
    switch (btn.id) {
      case 'arrowDownButton':
        divOrder(0, 'down');
        break;
      case 'arrowUpButton':
        divOrder(0, 'up');
        break;
      case 'numericButton':
        divOrder('id', 0);
        break;
      case 'alphabeticButton':
        divOrder('name', 0);
        break;
      case 'buttonBlog':
        toggleDisplay('blog');
        break;
      case 'buttonMosaic':
        toggleDisplay('mosaic');
        break;
    }
  });
}