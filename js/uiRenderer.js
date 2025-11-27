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
      caption: buildExifCaption(imageName, meta)
    });

    myDiv.show();
    // Affiche le nombre de resultat trouves
    displayResult();
  });
  // Affiche la page finale
  finalizeDisplay();
  // Gestion des fichiers a supprimer
  copyImagesToTrash();
  // Gestion de l'edition des EXIF
  editExif();
  // Gère le click sur les tags
  tagsManage();
  tagsDelete();
}

function tagsManage() {
  const links = document.querySelectorAll('.tag a'); // Sélection de tous les <a>

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const titleValue = link.getAttribute('title');

      // Ajout du tag dans #foundFiles
      const foundFiles = document.getElementById('foundFiles');

      // NE PAS ajouter deux fois le même tag
      if (document.querySelector('.tagDelete[title="' + titleValue + '"]')) {
        return; // déjà présent → stop
      }

      const span = document.createElement('span');
      span.className = 'searchText';
      span.style.cursor = 'pointer';
      span.innerHTML = `<a href="#" class="tagDelete" title="${titleValue}">ⓧ ${titleValue}</a>`;
      foundFiles.append(span);

      updateImagesVisibility();
    });
  });
}

function getActiveTags() {
  return [...document.querySelectorAll('.tagDelete')]
         .map(el => el.getAttribute('title'));
}

function updateImagesVisibility() {
  const activeTags = getActiveTags();
  const images = document.querySelectorAll('.divImageBlog');

  images.forEach(img => {
    const dataTags = img.getAttribute('data-tags');

    // Si aucun tag actif → on montre tout
    if (activeTags.length === 0) {
      img.parentElement.style.display = 'block';
      return;
    }

    // image affichée si elle contient TOUS les tags actifs
    const hasAllTags = activeTags.every(tag => dataTags.includes(tag));

    img.parentElement.style.display = hasAllTags ? 'block' : 'none';
  });
}


function tagsDelete() {
  document.addEventListener('click', function(e) {
    if (e.target.matches('.tagDelete')) {
      e.preventDefault();

      const titleValue = e.target.getAttribute('title');
      console.log("Tag supprimé :", titleValue);

      // Supprime le span parent
      e.target.closest('.searchText').remove();

      // Met à jour l’affichage des images
      updateImagesVisibility();
    }
  });
}


// Cr�e data-caption � int�grer dans le lien de la photo
function buildExifCaption(imageName, meta) {
  const {
    titre = '', description = '', createur = '', credit = '',
    date = '', copyright = '', modele = '', materiel = '',
    iso = '', fNumber = '', vitesse = '', focale35 = '',
    largeur = '', hauteur = '', latitude = '', longitude = '', size = '', personne = '', tag = '', label= ''
  } = meta;
   

  let dateFR = date
    ? new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

    const newDate = dateFR.split(' ');
    if(newDate[0] === '1' && newDate[1] === 'janvier') {
      dateFR = newDate[2];
      if(label === 'circa') {
        dateFR = `${t("circa")} ${dateFR}`;
      }
    }

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
function buildPhotoHTML(imageName, url, meta, search) {
  const titre = decode_utf8(meta.titre) || '';
  const description = decode_utf8(meta.description) || '';
  const tag = meta.tag || '';
  const personne = meta.personne || '';
  const dateFR = meta.date
    ? new Date(meta.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // Filtrage selon la recherche
  if (!matchSearch(search, titre, description, tag, personne)) return null;

  const tagBlock = buildTagsBlock(tag, search);
  const personsBlock = buildPersonsBlock(personne, search);

      function htmlDecode(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}
  const photo = `
    <a href="${url}" data-fancybox="central" class="modal-photo">
      <img id="${imageName}" alt="${imageName}" class="photo" src="${url}" />
    </a>
  `;

  const infos = `
  <div class="trait-horiz"></div>
    <div class="plusinfo">
      <div class="titreName">${decode_utf8(imageName)}</div>
      <div class="titreDate">${dateFR || ''}</div>
    </div>
  `;

  const iconTrash = `
    <div id="trash-${decode_utf8(imageName)}" class="trash hint--left" aria-label="${t("deleteImage")}">
      <svg class="Icon"><use href="./icons/sprite.svg#icon-trash"></use></svg>
    </div>
  `;

  const iconEdit = `
    <div id="edit-${decode_utf8(imageName)}" class="editExif hint--right" aria-label="${t("editMetadata")}">
      <svg class="Icon"><use href="./icons/sprite.svg#icon-edit"></use></svg>
    </div>
  `;

  return `
    <div class="divImageBlog" data-tags="${tag}">${photo}
        <div class="titre">${titre}</div>
        <div class="desc">${htmlDecode(description)}</div>
        ${infos}${iconTrash}${iconEdit}
    </div>
  ${(tagBlock !== '' || personsBlock !== '') ? `<div class="tagBlog">${tagBlock}${personsBlock}</div>` : ``}
  `;
}

// Gestion de la recherche 'search'
function matchSearch(search, titre, description, tag, personne) {
  if (search === 'all') return true;

  const words = search.toLowerCase().split(config.separator);
  const fields = [titre, description, tag, personne].map(s => (s || '').toLowerCase());

  return words.every(word => fields.some(f => f.includes(word)));
}

// Cree la ligne de Tags
function buildTagsBlock(tagString, search) {
  if (!tagString) return '';
  const oldTag = search !== 'all' ? config.separator + search : '';
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
    return `<a title="${tg}" href=${config.index}?search=${tg}${oldTag}">#${decoded}</a>`;
  }).join(' ');
  return `<p class="tag"><svg class="Icon"><use href="./icons/sprite.svg#icon-tag"></use></svg>&nbsp;${links}</p>`;
}

//Cree la ligne de personnes
function buildPersonsBlock(personString, search) {
  if (!personString) return '';

  const oldTag = search !== 'all' ? config.separator + search : '';
  const persons = personString.split(config.separator).sort();

  const links = persons.map(p =>
    `<a href="${config.index}?search=${p}${oldTag}">#${decode_utf8(p)}</a>`
  ).join(' ');

  return `<p class="tag"><svg class="Icon"><use href="./icons/sprite.svg#icon-person"></use></svg>&nbsp;${links}</p>`;
}

// Affiche le nombre de r�sultats trouv�s
function displayResult() {
  let actualCount = parseInt(config.divResult.innerHTML) || 0;
  actualCount++;
  config.divResult.innerHTML = `${actualCount} ${actualCount > 1 ? 'photos' : 'photo'}`;
  //const progressText = document.getElementById('progressText');
  /*if (!config.progressText) return;
  const percent = Math.floor((actualCount / total) * 100);
  config.progressText.textContent = `${t("loading")} ${percent}%`;*/
}

// Tri les photos
function finalizeDisplay() {
  try {
    divOrder(config.data.tri, config.data.sens);
  } catch (e) {
    console.warn("Erreur tri/affichage classes :", e);
  }
  config.loader.style.display = 'none';
}
