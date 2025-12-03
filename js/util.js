/* ===========================================================
   CLASSE DE CREATION D`UNE DIV
   ----------------------------------------------------------- */
export class Div {
    constructor({ type = 'div', id = '', name = '', container = '', contents = '', classe = '', position = 'inner', caption = '', display = 'block'
    } = {}) { // <= ici, le = {} �vite l?erreur
        this.type = type;
        this.id = id;
        this.name = name;
        this.container = container;
        this.contents = contents;
        this.classe = classe;
        this.position = position;
        this.caption = caption;
        this.display = display
    }

    show() {
        const el = document.createElement(this.type);
        if (this.id) el.id = this.id;
        if (this.name) el.setAttribute('name', this.name);
        if (this.classe) el.className = this.classe;
        if (this.contents) el.innerHTML = this.contents;
        if (this.display) el.style.display = this.display;

        const container = document.querySelector(`#${this.container}`);
        if (!container) {
            console.warn(`? Conteneur "${this.container}" introuvable.`);
            return;
        }

        switch (this.position) {
            case 'inner':
                container.appendChild(el);
                break;
            case 'before':
                container.before(el);
                break;
            case 'after':
                container.after(el);
                break;
            case 'prepend':
                container.prepend(el);
                break;
            default:
                container.appendChild(el);
        }

        if (this.caption) {
            const link = el.querySelector('a');
            if (link) link.dataset.caption = this.caption;
        }
    }
}

/* ===========================================================
   CHARGEMENT DES FICHIERS D?UN R�PERTOIRE
   ----------------------------------------------------------- */
export async function loadFiles(dir) {
    const response = await fetch(dir);
    return await response.text();
}

/* ===========================================================
   ENCODAGE / DECODAGE UTF-8
   ----------------------------------------------------------- */
export const decode_utf8 = (str) => {
    try {
        return decodeURIComponent(str);
    } catch {
        return str;
    }
};

export const encode_utf8 = (str) => encodeURIComponent(str);

/* ===========================================================
   TRI DES DIVS PAR ATTRIBUT
   ----------------------------------------------------------- */
export async function divOrder(tri, sens) {
    const main = document.querySelector("#central");
    if (!main) return;

    const elemTri = tri || getCookie("tri") || "name";
    const elemSens = sens || getCookie("sens") || "down";

    setCookie("tri", elemTri, 3);
    setCookie("sens", elemSens, 3);

    const children = Array.from(main.children);
    children.sort((a, b) => {
        const valA = a.getAttribute(elemTri) || "";
        const valB = b.getAttribute(elemTri) || "";

        const numA = Number(valA);
        const numB = Number(valB);
        const bothNum = !isNaN(numA) && !isNaN(numB);

        if (bothNum) {
            return elemSens === "down" ? numA - numB : numB - numA;
        } else {
            return elemSens === "down"
                ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" })
                : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: "base" });
        }
    });
    children.forEach((el) => main.appendChild(el));

    // --- MAJ des boutons ---
    const triButton = document.querySelector("#boutontri");
    if (triButton) {
        triButton.innerHTML =
            elemTri === "name" ? globalThis.numericButton : globalThis.alphabeticButton;
    }

    const sensButton = document.querySelector("#sens");
    if (sensButton) {
        sensButton.innerHTML =
            elemSens === "down" ? globalThis.arrowUpButton : globalThis.arrowDownButton;
    }

    showClass(elemTri === "name" ? "titreName" : "titreDate");
    hideClass(elemTri === "name" ? "titreDate" : "titreName");
}

/* ===========================================================
   OUTILS D'AFFICHAGE (classes & divs)
   ----------------------------------------------------------- */
export function hideClass(classe) {
    document.querySelectorAll(`.${classe}`).forEach((el) => (el.style.display = "none"));
}

export function showClass(classe) {
    document.querySelectorAll(`.${classe}`).forEach((el) => (el.style.display = "block"));
}

export function toggleClass(classe) {
    document.querySelectorAll(`.${classe}`).forEach((el) => {
        el.style.display = el.style.display === "none" ? "block" : "none";
    });
}

/* ===========================================================
   INFOS / BOUTONS
   ----------------------------------------------------------- */
/**
 * Permet de basculer entre les modes MOSAIC et BLOG
 * @param {string} type - "mosaic" ou "blog"
 */
export async function toggleDisplay(type) {
    if (photoObserver) {
        photoObserver.disconnect();
        photoObserver = null;
    }
    const displayButton = document.querySelector("#boutondisplay");
    const trash = document.querySelectorAll(".trash");
    if (!displayButton) return;
    if (type === "mosaic") {
        displayButton.innerHTML = globalThis.blogButton;
        replaceClass("divPhoto", "divPhotoMini");
        replaceClass("photo", "photoMini");
        replaceClass("divImageBlog", "divImageMosaic");
        hideClass("tagBlog");
        initMosaicHoverObserver();
        trash.forEach(element => {
            element.style.display = "none";
        });

    } else {
        displayButton.innerHTML = globalThis.mosaicButton;
        replaceClass("divPhotoMini", "divPhoto");
        replaceClass("photoMini", "photo");
        replaceClass("divImageMosaic", "divImageBlog");
        showClass("tagBlog");
        initBlogObserver();
        trash.forEach(element => {
            element.style.display = "block";
        });
    }
}

/* ===========================================================
   GEOLOCALISATION
   ----------------------------------------------------------- */
/**
 * R�cup�re la localisation (ville, pays) � partir des coordonn�es lat/lon
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export async function getLocation(lat, lon) {
    if (!lat) return;

    const divLoc = document.querySelectorAll(".loc");
    if (!divLoc) return;
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&lang=fr&format=json&apiKey=6c4bc9a27ab14576a0aeec77af80f1aa`;
    const request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();

    if (request.responseText) {
        const result = JSON.parse(request.responseText);
        const info = result.results?.[0] || {};
        const city = info.city || "";
        const state = info.state ? ", " + info.state : "";
        const country = info.country ? " (" + info.country + ")" : "";
        divLoc.forEach(location => {
            //console.log(location)
            location.innerHTML = `<svg class="Icon"><use href="./icons/sprite.svg#icon-place"></use></svg>&nbsp;${city} ${state} ${country}`;
        });
    }
}

/* ===========================================================
   COPIE ET SUPPRESSION D'IMAGES
   ----------------------------------------------------------- */
// Gestion fichiers � supprimer
export function copyImagesToTrash() {
    const trash = document.querySelectorAll('.trash');
    if (trash) {
        trash.forEach(el => {
            el.addEventListener('click', () => {
                deleteImage(el.id);
            });
        });
    }
}



function deleteImage(img) {
    if (!document.querySelector('#poubelle')) {
        const poubelle = document.createElement('div');
        poubelle.id = 'poubelle';
        const poubelleContent = `
            <a id="closeInfos"><svg class="Icon"><use href="./icons/sprite.svg#icon-close"></use></svg></a>
            <div id="textTrash" class="cadre"></div>`;
        poubelle.innerHTML = poubelleContent;
        // Ajoute le modal au document
        document.body.appendChild(poubelle);
    }

    const newImg = img.replace('trash-', ' ');
    const trashText = document.querySelector("#textTrash");
    if (trashText) {
        let texte = trashText.textContent;
        if (texte.includes(newImg)) return; // �vite les doublons
        trashText.textContent += newImg;
    }

    const hideTrash = document.querySelector('#closeInfos');
    if (hideTrash) {
        hideTrash.addEventListener('click', () => {
            poubelle.remove();
        });
    }

    if (trashText) {
        trashText.addEventListener('click', () => {
            if (poubelle) {
                copyToClipBoard("textTrash");
                // Efface le modal
                poubelle.remove();
            }

        });
    }
}

function copyToClipBoard(id) {
    const text = document.querySelector(`#${id}`)?.innerHTML || "";
    navigator.clipboard.writeText(text);
    alert("Suppress command (copied to clip board)\n\n" + text);
}

/* Edition des m�tadonn�es via le modal */
export function editExif() {
    const trash = document.querySelectorAll('.editExif');
    if (trash) {
        trash.forEach(el => {
            el.addEventListener('click', () => {
                openEditMetadataModal(el.id);
            });
        });
    }
}

/* Edite les m�tadonn�es d'une image */
function openEditMetadataModal(imgId) {
    const img = document.querySelector(`#${imgId}`.replace('edit-', ''));
    const parentLink = img.closest('a');

    // R�cup�re le contenu de l'attribut data-caption
    const captionHTML = parentLink ? parentLink.getAttribute('data-caption') : '';
    if (captionHTML) {
        const data = parseCaptionHTML(captionHTML);
        //console.log(data);
        // Cr�e le modal
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        // Conversion dimensions en tableau W x H
        const dimensions = data.dimensions ? data.dimensions.split('x') : ['', ''];
        // Conversion date en format UTC
        const dateUTC = data.dateFR ? data.dateFR.dateUTC.toISOString().split('T')[0] : null;
        // Latitude et longitude
        const lat = data["map-modal"] ? data["map-modal"].lat : ``;
        const lon = data["map-modal"] ? data["map-modal"].lon : ``;
        // Contenu du modal
        modal.innerHTML = `
        <div class="edit-modal-content">
        <span class="close-edit-modal">&times;</span>
        <h2>&Eacute;diter les m&eacute;tadonn&eacute;es</h2>
        <form id="edit-metadata-form">
            <div class="form-group">
                <label for="edit-title">Titre</label>
                <input type="text" id="edit-title"value="${data.titre ? escapeQuote(data.titre) : ``}">
            </div>
            <div class="form-group">
                <label for="edit-description">Description</label>
                <textarea id="edit-description" rows="3">${data.description ? escapeQuote(data.description) : ``}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-auteur">Auteur</label>
                <input type="text" id="edit-auteur"value="${data.auteur ? escapeQuote(data.auteur) : ``}">
            </div>
            <div class="form-group">
                <label for="edit-rights">Droits</label>
                <input type="text" id="edit-rights"value="${data.copyright ? escapeQuote(data.copyright) : ``}">
            </div>
           <div class="form-group">
                <label for="edit-credit">Cr&eacute;dit</label>
                <input type="text" id="edit-credit"value="${data.credit ? escapeQuote(data.credit) : ``}">
            </div>
            <div class="form-group">
                <label for="edit-date">Date</label>
                <input type="date" id="edit-date" value="${dateUTC}"> <input type="checkbox" id="edit-label" ${data.label === 'circa' ? 'checked' : ''}> <label for="edit-label">circa</label>
            </div>
            <div class="form-group">
                <label for="edit-size">Largeur, hauteur</label>
                <input type="number" id="edit-width"  style="width:5em;" value="${dimensions[0] ? dimensions[0] : ``}">&nbsp;x&nbsp;
                <input type="number" id="edit-height" style="width:5em;" value="${dimensions[1] ? dimensions[1] : ``}">  
            </div>
            <div class="form-group">
                <label for="edit-size">Latitude, longitude</label>
                <input type="text" id="edit-lat" style="width:12em;" value="${lat}">&nbsp;,&nbsp; 
                <input type="text" id="edit-lon" style="width:12em;" value="${lon}">  
            </div>  
            <div class="form-group">
                <label for="edit-tags">Tags</label>
                <input type="text" id="edit-tags"value="${data.tag ? data.tag : ``}">
            </div>
            <div class="form-group">
                <label for="edit-personnes">Personnes</label>
                <input type="text" id="edit-personnes"value="${data.personne ? data.personne : ``}">
            </div>
            <button type="submit">Enregistrer</button>
            </form>
        </div>
        `;
        // Fonction d'�chappement des guillemets doubles
        function escapeQuote(str) {
            return String(str).replace(/"/g, '&quot;');
        }
        // Ajoute le modal au document
        document.body.appendChild(modal);
        // Ferme le modal
        const closeBtn = modal.querySelector('.close-edit-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // G�re la soumission du formulaire
        const form = modal.querySelector('#edit-metadata-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log(modal.querySelector('#edit-title').value);
            const newTitle = modal.querySelector('#edit-title').value;
            const newDescription = modal.querySelector('#edit-description').value;
            const newDate = modal.querySelector('#edit-date').value.replace(/-/g, ':') + ' 12:00:00';
            const newLabel = modal.querySelector('#edit-label').checked ? '"circa"' : '';
            const newAuteur = modal.querySelector('#edit-auteur').value;
            const newRights = modal.querySelector('#edit-rights').value;
            const newCredit = modal.querySelector('#edit-credit').value;
            const newWidth = modal.querySelector('#edit-width').value;
            const newHeight = modal.querySelector('#edit-height').value;
            const newLat = modal.querySelector('#edit-lat').value;
            const newLon = modal.querySelector('#edit-lon').value;
            const newTags = modal.querySelector('#edit-tags').value;
            const newPersonnes = modal.querySelector('#edit-personnes').value;
            // G�n�re la commande exiftool
            const exifCopy =
                `exiftool ` +
                `-Creator=${escapeShell(newAuteur)} ` +
                `-Description=${escapeShell(newDescription)} ` +
                `-Rights=${escapeShell(newRights)} ` +
                `-Credit=${escapeShell(newCredit)} ` +
                `-Subject=${escapeShell(newTags)} ` +
                `-PersonInImage=${escapeShell(newPersonnes)} ` +
                `-Title=${escapeShell(newTitle)} ` +
                `-ExifImageWidth=${escapeShell(newWidth)} ` +
                `-ExifImageHeight=${escapeShell(newHeight)} ` +
                `-CreateDate=${escapeShell(newDate)} ` +
                `-Label=${escapeShell(newLabel)} ` +
                `-GPSLatitude=${escapeShell(newLat)} ` +
                `-GPSLongitude=${escapeShell(newLon)} ` +
                `${escapeShell(data.fichier)}`;
            // Copie dans le presse-papier
            navigator.clipboard.writeText(exifCopy);
            alert("Exiftool command (copied to clip board)\n\n" + exifCopy);
            // Efface le modal
            modal.remove();
        });
    }
}

// Fonction d'�chappement des aopostrophes pour shell
function escapeShell(str) {
    return `'${String(str).replace(/'/g, `'\"'\"'`)}'`;
}

/**
 * Active la d�tection quand une photo est centr�e � l'�cran
 * Affiche les infos correspondantes (ex: publicationX)
 */
// Initialise les �v�nements hover pour le mode BLOG

// --- OBSERVER D'IMAGE --- //
let photoObserver = null;

export async function initPhotoObservers(typeAlbum) {
    // Attendre que toutes les images soient charg�es
    const photos = Array.from(document.querySelectorAll('.photo, .photoMini'));
    await Promise.all(
        photos.map(img =>
            img.complete ? Promise.resolve() :
                new Promise(res => (img.onload = img.onerror = res))
        )
    );

    // Stopper l'observer pr�c�dent s'il existe
    if (photoObserver) {
        photoObserver.disconnect();
        photoObserver = null;
    }

    // Initialisation selon le mode
    if (typeAlbum === 'blog') {
        initBlogObserver();
    } else if (typeAlbum === 'mosaic') {
        initMosaicHoverObserver();
    }
}

// --- Mode BLOG : Observer bas� sur l'intersection ---
function initBlogObserver() {
    const options = {
        root: null,
        threshold: 0.6
    };

    photoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                //console.log("Photo visible :", img.id);
                displayMetaData(img)
            }
        });
    }, options);

    document.querySelectorAll('.photo').forEach(img => {
        photoObserver.observe(img);
    });
}

// --- Mode MOSA�QUE : survol souris ---
function initMosaicHoverObserver() {
    const photos = document.querySelectorAll('.photoMini');
    photos.forEach(img => {
        img.addEventListener('mouseenter', () => {
            //console.log("Survol :", img.id);
            displayMetaData(img)
        });
        img.addEventListener('mouseleave', () => {
            // cacher la l�gende
        });
    });
}

export function htmlDecode(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}


/***************************************
 *         FONCTIONS INTERNES 
 * ************************************/

/* ===========================================================
   COOKIES
   ----------------------------------------------------------- */
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(name) {
    return (
        document.cookie
            .split("; ")
            .find((row) => row.startsWith(name + "="))
            ?.split("=")[1] || null
    );
}

/**
 * Remplace une classe par une autre
 * @param {string} class1 - Classe � remplacer
 * @param {string} class2 - Classe de remplacement
 */
export function replaceClass(class1, class2) {
    document.querySelectorAll(`.${class1}`).forEach((el) =>
        el.classList.replace(class1, class2)
    );
}

/* ===========================================================
   AFFICHAGE DES CARTES
   ----------------------------------------------------------- */
/**
 * Affiche ou met � jour une carte Leaflet centr�e sur lat/lon
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
let map = null;
let mapMarker = null;
const photoIcon = L.icon({
    iconUrl: "icons/marker.png",
    iconSize: [32, 32],
    iconAnchor: [5, 31],
});

function displayMap(lat, lon) {
    const divMap = document.querySelector("#map");

    // Si pas de coordonn�es ? cacher la carte
    if (!lat || !lon) {
        divMap.style.display = "none";
        return;
    }
    divMap.style.display = "block";

    // Ajuster la hauteur
    const divDetail = document.querySelector("#location");
    const rect = divDetail?.getBoundingClientRect();
    const mapHeight = rect ? window.innerHeight - rect.bottom - 45 : 300;
    divMap.style.height = `${mapHeight}px`;

    // --- 1) Initialisation de la carte (une seule fois) ---
    if (!map) {
        // Cr�er la carte
        map = L.map("map").setView([lat, lon], 9);

        // Ajouter le fond de carte
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 20,
        }).addTo(map);

        // Cr�er le marker
        mapMarker = L.marker([lat, lon], { icon: photoIcon }).addTo(map);
    }

    // --- 2) Mise � jour de la carte d�j� existante ---
    else {
        map.setView([lat, lon], 9);
        mapMarker.setLatLng([lat, lon]);
        mapMarker.setIcon(photoIcon);
    }

    // R�parer l'affichage si le conteneur a chang� de taille
    setTimeout(() => map.invalidateSize(), 10);
}

/**
 * Parse le contenu HTML de data-caption et retourne un objet avec les donn�es
 * 
 * @param {string} captionHTML - Le contenu HTML de l'attribut data-caption
 * @returns {Object} - Un objet avec les donn�es extraites
 */
function parseCaptionHTML(captionHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(captionHTML, 'text/html');
    const elementsWithId = doc.querySelectorAll('[id]');

    const result = {};

    elementsWithId.forEach(el => {
        const id = el.id;
        // Cas particulier pour la carte
        if (id === 'map-modal') {
            // Cas sp�cial : on r�cup�re latitude et longitude
            result[id] = {
                lat: parseFloat(el.dataset.lat),
                lon: parseFloat(el.dataset.lon)
            };
        } else if (id === 'dateFR') {
            // Cas sp�cial : on r�cup�re le texte de dateFR et la date au format UTC 
            result[id] = {
                dateFR: el.textContent,
                dateUTC: new Date(el.getAttribute('date'))
            }
        } else {
            // Nettoie le texte (supprime espaces multiples)
            result[id] = el.textContent.trim().replace(/\s+/g, ' ');
        }
    });

    return result;
}

/**
 * Affiche les m�tadonn�es extraites de data-caption dans la div publication
 * @param {HTMLImageElement} img - L'�l�ment image dont on veut afficher les m�tadonn�es
 */
function displayMetaData(img) {
    // R�cup�re le <a> parent
    const parentLink = img.closest('a');

    // R�cup�re le contenu de l'attribut data-caption
    const captionHTML = parentLink ? parentLink.getAttribute('data-caption') : '';
    if (captionHTML) {
        const data = parseCaptionHTML(captionHTML);
        //console.log(captionHTML);

        const publication = document.querySelector('#publication');
        const divMap = document.querySelector('#map');
        const buttonBlog = document.querySelector('#buttonBlog');
        const divPublication = `
        <div class="dataXMP">
            <div class="detail">
                ${buttonBlog ? `
                <div class="cadre">
                    ${(data['titre']) ? `
                    <div class="titre">${decode_utf8(data['titre'])}</div>` : ``}
                    ${(data['description']) ? `
                    <div class="desc">${decode_utf8(data['description'])}</div>` : ``}
                ` : ``}
                </div>
                <div class="cadre">
                ${(data['auteur'] || data['dateFR']) ? `
                    <div>
                    ${(data['auteur']) ? `
                        <svg class="Icon"><use href="./icons/sprite.svg#icon-user"></use></svg>&nbsp;${decode_utf8(data['auteur'])}&nbsp;&nbsp;&nbsp;
                    ` : ``}
                    ${(data['dateFR']) ? `
                        <svg class="Icon"><use href="./icons/sprite.svg#icon-calendar"></use></svg>&nbsp;${data['dateFR'].dateFR}
                        ` : ``}
                    </div>
                ` : ``}
                ${(data['fichier']) ? `
                    <div>
                        <svg class="Icon"><use href="./icons/sprite.svg#icon-file"></use></svg>&nbsp;${data['fichier']}
                    </div>
                ` : ``}
                ${(data['copyright']) ? `
                    <div style="padding:2px;">
                        <svg class="Icon"><use href="./icons/sprite.svg#icon-copy"></use></svg>${data['copyright']}
                    </div>
                ` : ``}
                ${(data['credit']) ? `
                    <div>Cr&eacute;dit : ${data['credit']}</div>
                ` : ``}
                </div>

                <div class="cadre">
                ${(data['materiel'] || data['modele']) ? `
                    <div>
                        <svg class="Icon"><use href="./icons/sprite.svg#icon-camera"></use></svg>&nbsp;${data['materiel']}&nbsp;&nbsp;&nbsp;${data['modele']}
                    </div>
                ` : ``}
                ${(data['format']) ? `
                    <div>
                        <svg class="Icon"><use href="./icons/sprite.svg#icon-photo"></use></svg>&nbsp;${data['format']}
                    </div>
                ` : ``}
                ${(data['iso'] || data['focale'] || data['fnumber'] || data['vitesse']) ? `
                    <div class="objectif">
                        ${(data['iso']) ? `
                            <svg class="Icon"><use href="./icons/sprite.svg#icon-iso"></use></svg>&nbsp;${data['iso']}&nbsp;&nbsp;&nbsp;
                        ` : ``} 
                        ${(data['focale']) ? `
                            <svg class="Icon"><use href="./icons/sprite.svg#icon-focal"></use></svg>&nbsp;${data['focale']}&nbsp;&nbsp;&nbsp;
                        ` : ``} 
                        ${(data['fnumber']) ? `
                            <svg class="Icon"><use href="./icons/sprite.svg#icon-aperture"></use></svg>&nbsp;${data['fnumber']}&nbsp;&nbsp;&nbsp;
                        ` : ``} 
                        ${(data['vitesse']) ? `
                            <svg class="Icon"><use href="./icons/sprite.svg#icon-speed"></use></svg>&nbsp;${data['vitesse']}&nbsp;&nbsp;&nbsp;
                        ` : ``} 
                    </div> ` : ``}
                </div>
                ${data['map-modal'] ? `
                    <div class="cadre loc"></div>
                ` : ``}                        
            </div>
        </div>`;

         publication.innerHTML = divPublication;

        if (data['map-modal']) {
            getLocation(data['map-modal'].lat, data['map-modal'].lon);
            divMap.style.display = 'block';
            displayMap(data['map-modal'].lat, data['map-modal'].lon);
        } else {
            divMap.style.display = 'none';          
        }
    }
}
