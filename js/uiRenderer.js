/**********************************
 * uiRenderer.js
 * AFFICHAGE DE CHAQUE PHOTO
 *********************************/
import { t } from './messages.js';
import { config } from './config.js';
import { Div, decode_utf8, divOrder, copyImagesToTrash, editExif, htmlDecode } from './util.js';

export async function renderGallery(photoData, search) {
  photoData.forEach(({ imageName, url, meta }) => {
    if (!meta) return;

    // Construction de la div photo
    const contents = buildPhotoHTML(imageName, url, meta, search);

    if (!contents) return;

    const timeStamp = meta.date ? new Date(meta.date).getTime() : 0;

    const myDiv = new Div({
      type: 'div',
      id: timeStamp,
      name: imageName,
      container: 'central',
      contents,
      classe: config.typeAlbum === 'mosaic' ? 'divPhotoMini' : 'divPhoto',
      position: 'inner',
      caption: buildExifCaption(imageName, meta),
    });

    myDiv.show();
    // Affiche le nombre de resultat trouves
    //config.divResult.innerHTML = `${counter} ${counter > 1 ? 'photos' : 'photo'}`;
  });
  // Affiche la page finale
  finalizeDisplay();
  // Gestion des fichiers a supprimer
  copyImagesToTrash();
  // Gestion de l'edition des EXIF
  editExif();
  // Gère le click sur les tags et la recherche
  tagsManage();
  tagsDelete();
  searchInputManage();
  if (config.data.search) {
      applyUrlSearch(config.data.search);
  }
  updateImagesVisibility();
}
/********** GESTION DES TAGS **************/
// Gère les tags entrés dans l'url (search=tag1;tag2)
function applyUrlSearch(urlSearch) {
    const input = document.getElementById('searchText');
    if (!input) return;

    // Pré-remplit l'input
    input.value = urlSearch;

    // Ajoute automatiquement les tags
    addTagToSearch(urlSearch);
}

// Petite fonction utilitaire debounce
function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}

// Gestion du champ de recherche
function searchInputManage() {
  const input = document.getElementById('searchText');
  const tagsContainer = document.getElementById('searchTags');

  const performSearch = () => {

    tagsContainer.innerHTML = ""; // supprime UNIQUEMENT les tags auto
    const searchText = decode_utf8(input.value.trim().toLowerCase());

    // Reset compteur si champ vide
    if (searchText === "") {
      updateImagesVisibility();
      displayNumberPhotos(0);
      return;
    }

    const words = searchText
      .split(config.separator)
      .map(w => w.trim())
      .filter(Boolean);

    // Ajout des tags
    words.forEach(word => {
      if (tagsContainer.querySelector(`.tagDelete[title="${word}"]`)) return;

      const span = document.createElement("span");
      span.className = "searchText";
      span.innerHTML = `<a href="#" class="tagDelete" title="${word}">&#9447; ${word}</a>`;
      tagsContainer.appendChild(span);
    });

    updateImagesVisibility(); // met aussi à jour displayNumberPhotos
  };

  const debouncedSearch = debounce(performSearch, 200);
  input.addEventListener('input', debouncedSearch);
}

// Vérifie que la recherche est contenue dans titre, description ou tags
function matchSearch(search, titre, description, tags) {
  // 1. Séparer les tags de recherche
  const searchTags = search
    .toLowerCase()
    .split(config.separator)
    .map(s => s.trim())
    .filter(Boolean);  // enlève les vides
  // 2. Regrouper les champs où chercher
  const fields = [
    titre?.toLowerCase() || "",
    description?.toLowerCase() || "",
    tags?.toLowerCase() || ""
  ];
  // 3. Vérifier que chaque tag figure dans au moins un champ
  return searchTags.every(tag =>
    fields.some(field => field.includes(tag))
  );
}

// Gestion du click sur les tags
function tagsManage() {
  document.addEventListener('click', function (e) {
    if (!e.target.matches('.tag a')) return;

    e.preventDefault();
    const titleValue = e.target.getAttribute('title').toLowerCase();

    // déjà présent ?
    if (document.querySelector(`.tagDelete[title="${titleValue}"]`)) {
      return;
    }

    addTagToSearch(titleValue);

    document.getElementById('searchText').value = '';
  });
}

// Affiche le tags cliqué sous forme de bouton delete tag
function addTagToSearch(tag) {
  if (!tag) return;

  const container = document.getElementById('searchTags');
  if (!container) return;

  // éviter doublons
  if (document.querySelector(`.tagDelete[title="${tag}"]`)) return;

  const span = document.createElement('span');
  span.className = 'searchText';
  span.innerHTML = `<a href="#" class="tagDelete" title="${tag}">&#9447; ${tag}</a>`;

  container.append(span);

  updateImagesVisibility();
}

// Suppression d'un tag cliqué
function tagsDelete() {
  document.addEventListener('click', e => {
    if (!e.target.matches('.tagDelete')) return;

    e.preventDefault();
    e.target.closest('.searchText').remove();
    updateImagesVisibility();
  });
}

function getActiveTags() {
  return [...document.querySelectorAll('.tagDelete')]
    .map(el => el.getAttribute('title').toLowerCase());
}

// Mise à jour de l'affichage des photos
function updateImagesVisibility() {
  const activeTags = getActiveTags();
  const items = document.querySelectorAll('.divImageBlog');
  let imageCounter = 0;

  const noFilter = activeTags.length === 0;
  const searchString = activeTags.join(config.separator).toLowerCase();

  items.forEach(item => {

    const anchor = item.querySelector('a.modal-photo');
    if (!anchor) return;

    const dataTags = (item.getAttribute('data-tags') || "").toLowerCase();
    const raw = anchor.getAttribute("data-caption") || "";

    // 1. Nettoyage minimal HTML
    const decoded = raw
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .toLowerCase();

    // 2. Extraction titre et description par regex très simple
    const titreMatch = decoded.match(/<div id="titre"[^>]*>(.*?)<\/div>/s);
    const descriptionMatch = decoded.match(/<div id="description"[^>]*>(.*?)<\/div>/s);

    const titre = titreMatch ? titreMatch[1].trim() : "";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";

    // 3. Aucun tag actif ? on affiche tout
    if (noFilter) {
      item.parentElement.style.display = "block";
      anchor.setAttribute("data-fancybox", "central");
      imageCounter++;
      return;
    }

    // 4. Matching
    const isMatch = matchSearch(searchString, titre, description, dataTags);

    if (isMatch) {
      item.parentElement.style.display = "block";
      // ajoute data-fancybox pour prise en compte dans Fancybox
      anchor.setAttribute("data-fancybox", "central");
      // Incrémente le nb d'images affichées
      imageCounter++;
    } else {
      item.parentElement.style.display = "none";
      anchor.removeAttribute("data-fancybox");
    }
  });
  // Affiche le nombre d'images trouvées
  displayNumberPhotos(imageCounter);
}

// Affiche le nb de photos dans 'resultat'
function displayNumberPhotos(nbPhotos) {
  const resultat = document.getElementById('resultat');
  if (resultat) {
    resultat.innerHTML = `${nbPhotos} ${
    nbPhotos > 1 
      ? `${t('pictures')}`
      : `${t('picture')}`
  }`;  }
}

/****************************************************************************************** */

// Crée data-caption a integrer dans le lien de la photo
function buildExifCaption(imageName, meta) {
  const {
    titre = '', description = '', createur = '', credit = '',
    date = '', copyright = '', modele = '', materiel = '',
    iso = '', fNumber = '', vitesse = '', focale35 = '',
    largeur = '', hauteur = '', latitude = '', longitude = '', size = '', personne = '', tag = '', label = ''
  } = meta;


  let dateFR = date
    ? new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // Si la date est le 1er janvier, on n'affiche que l'annee
  const newDate = dateFR.split(' ');
  if (newDate[0] === '1' && newDate[1] === 'janvier') {
    dateFR = newDate[2];
    // Si l'attribut XMP 'label' = 'circa, on affiche 'vers ' devant l'annee (ex: vers 1900)
    if (label === 'circa') {
      dateFR = `${t("circa")} ${dateFR}`;
    }
  }

  /** Creation de l'attribut data-caption contenant les infos EXIF */
  const WidthxHeight = largeur && hauteur ? `${largeur}x${hauteur}` : '';
  const copy = copyright ? `${copyright}` : '';
  return `
    <div class="modal-caption">
      <div class="title-caption">
        <div id="titre" class="caption-title">${titre}</div>
        <div id="description" class="caption-description">${htmlDecode(description)}</div>
      </div>
      <div class="data-caption">
        ${(createur || dateFR) ? `
          <div class="caption-meta">
            ${createur ? `
            <span id="auteur" style="color:rgba(115,182,245)" >
              <svg class="Icon"><use href="./icons/sprite.svg#icon-user" fill="rgba(115,182,245)"></use></svg>&nbsp;${createur}
            </span>
            ` : ``}
            ${dateFR ? `
            <span id="dateFR" date="${date}">
              <svg class="Icon"><use href="./icons/sprite.svg#icon-calendar"></use></svg>&nbsp;${dateFR}
            </span>
            ${label ? `<span id="label" style="display:none;">circa</span>` : ``}
            ` : ``}
          </div>` : ``}
          <div class="caption-exif">
            <div id="fichier"><svg class="Icon"><use href="./icons/sprite.svg#icon-file"></use></svg>&nbsp;${imageName}</div>
          </div>
          ${copy || credit ? `
          <div class="caption-exif">
            ${copy ? `<div id="copyright"><svg class="Icon"><use href="./icons/sprite.svg#icon-copy"></use></svg>${copy}</div>` : ``}
            ${credit ? `<div id="credit">${credit}</div>` : ``}
          </div>` : ``}
          ${WidthxHeight || size ? `
          <div class="caption-exif">
            <span id="format"><svg class="Icon"><use href="./icons/sprite.svg#icon-photo"></use></svg>&nbsp;
            ${WidthxHeight ? `<span id="dimensions">${WidthxHeight}</span>&nbsp;-&nbsp;` : ``}
            ${size ? `<span id="size">${size}</span>` : ``}
            </span>
          </div>` : ``}
            ${modele || materiel || iso || focale35 || fNumber || vitesse ? `
          <div class="caption-exif">
            ${modele || materiel ? `<div><span id="materiel"><svg class="Icon"><use href="./icons/sprite.svg#icon-camera"></use></svg>&nbsp;${materiel}</span>&nbsp;&nbsp;&nbsp;<span id="modele">${modele}</span></div>` : ``}
            ${iso ? `<span id="iso"><svg class="Icon"><use href="./icons/sprite.svg#icon-iso"></use></svg>&nbsp;${iso}</span>&nbsp;&nbsp;&nbsp;` : ``}
            ${focale35 ? `<span id="focale"><svg class="Icon"><use href="./icons/sprite.svg#icon-focal"></use></svg>&nbsp;${focale35}&nbsp;mm</span>&nbsp;&nbsp;&nbsp;` : ``}
            ${fNumber ? `<span id="fnumber"><svg class="Icon"><use href="./icons/sprite.svg#icon-aperture"></use></svg>&nbsp;&#x192;${fNumber}</span>&nbsp;&nbsp;&nbsp;` : ``}
            ${vitesse ? `<span id="vitesse"><svg class="Icon"><use href="./icons/sprite.svg#icon-speed"></use></svg>&nbsp;${vitesse}&nbsp;s</span>&nbsp;&nbsp;&nbsp;` : ``}
          </div>` : ``}
          ${tag ? `
          <div class="caption-exif" id="tag"><svg class="Icon"><use href="./icons/sprite.svg#icon-tag"></use></svg>&nbsp;${tag}</div>` : ``}
          ${personne ? `
          <div class="caption-exif" id="personne"><svg class="Icon"><use href="./icons/sprite.svg#icon-user"></use></svg>&nbsp;${personne}</div>` : ``}
          ${latitude && longitude ? `
          <div class="caption-exif">
            <div id="map-modal" class="map-modal" data-lat="${latitude}" data-lon="${longitude}"></div>
            <div class="loc"></div>
          </div>` : ``}
      </div>
  </div>`;
}

// Cree le bloc photo HTML
function buildPhotoHTML(imageName, url, meta, search, dataFancybox) {
  const titre = decode_utf8(meta.titre) || '';
  const description = decode_utf8(meta.description) || '';
  const tag = meta.tag || '';
  const personne = meta.personne || '';
  const dateFR = meta.date
    ? new Date(meta.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // Appelle la fonction de creation de ligne d'etiquettes (#...)
  const tagBlock = buildTagsBlock(tag, search);
  // Appelle la fonction de creation de ligne de sujets (#...)
  const personsBlock = buildPersonsBlock(personne, search);

  // Cree la photo avec son lien Fancybox
  const photo = `
    <a href="${url}" ${dataFancybox} class="modal-photo">
      <img id="${imageName}" alt="${imageName}" class="photo" src="${url}" />
    </a>
  `;

  // Cree le bloc titre + description
  const infos = `
  <div class="trait-horiz"></div>
    <div class="plusinfo">
      <div class="titreName">${decode_utf8(imageName)}</div>
      <div class="titreDate">${dateFR || ''}</div>
    </div>
  `;

  // Cree le lien pour supprimer la photo
  const iconTrash = `
    <div id="trash-${decode_utf8(imageName)}" class="trash hint--left" aria-label="${t("deleteImage")}">
      <svg class="Icon"><use href="./icons/sprite.svg#icon-trash"></use></svg>
    </div>
  `;

  // Cree le lien pour editer les donnees EXIF
  const iconEdit = `
    <div id="edit-${decode_utf8(imageName)}" class="editExif hint--right" aria-label="${t("editMetadata")}">
      <svg class="Icon"><use href="./icons/sprite.svg#icon-edit"></use></svg>
    </div>
  `;

  // Affiche l'ensemble photo + titre, description, infos (tags) + supprimer + editer
  return `
    <div class="divImageBlog" data-tags="${tag};${personne}">${photo}
        <div class="titre">${titre}</div>
        <div class="desc">${htmlDecode(description)}</div>
        ${infos}${iconTrash}${iconEdit}
    </div>
  ${(tagBlock !== '' || personsBlock !== '') ? `<div class="tagBlog">${tagBlock}${personsBlock}</div>` : ``}
  `;
}

// Cree la ligne de Tags
function buildTagsBlock(tagString, search) {
  if (!tagString) return '';
  //const oldTag = search !== 'all' ? config.separator + search : '';
  const tags = tagString.split(config.separator).sort((a, b) => a.localeCompare(b, 'fr'));
  //console.log(search);
  const searchTags = search.split(';').filter(Boolean);
  const links = tags.map(tg => {
    const decoded = decode_utf8(tg);
    // Si tg est deja dans la liste des tags de 'search'
    if (searchTags.includes(tg)) {
      // On retourne juste du texte non cliquable
      return `#${decoded}`;
    }
    // Sinon on garde le lien cliquable
    return `<a title="${tg}" href="#">#${decoded}</a>`;
  }).join(' ');
  return `<p class="tag"><svg class="Icon"><use href="./icons/sprite.svg#icon-tag"></use></svg>&nbsp;${links}</p>`;
}

//Cree la ligne de personnes
function buildPersonsBlock(personString, search) {
  if (!personString) return '';

  //const oldTag = search !== 'all' ? config.separator + search : '';
  const persons = personString.split(config.separator).sort();

  const links = persons.map(p =>
    `<a title="${p}" href="#">#${decode_utf8(p)}</a>`
  ).join(' ');

  return `<p class="tag"><svg class="Icon"><use href="./icons/sprite.svg#icon-person"></use></svg>&nbsp;${links}</p>`;
}

// Tri les photos en fonction des boutons tri et sens
function finalizeDisplay() {
  try {
    divOrder(config.data.tri, config.data.sens);
  } catch (e) {
    console.warn("Erreur tri/affichage classes :", e);
  }
  // Masque l'icone de chargement
  config.loader.style.display = 'none';
}