import { t } from './messages.js';
/**
 * Récupère automatiquement la liste des dossiers d'albums présents dans le répertoire "albums/"
 * et affiche chaque album sous forme de lien vers la page album.html avec le paramètre dir.
 */
async function chargerListeAlbums() {
  // Récupère le conteneur où les albums seront affichés
  const container = document.getElementById('albums-container');
  if (!container) return;

  // Variable pour compter le nombre d'albums et générer des IDs uniques
  let albumCount = 0;

  // Récupère la liste des albums depuis le serveur
  try {
    const response = await fetch('albums/');
    if (!response.ok) {
      throw new Error(`Error recovering albums folder (${response.status})`);
    }
    // Récupère le texte HTML de la réponse
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));

    // Utilise un Set pour éviter les doublons
    const albums = new Set();

    // Parcourt tous les liens pour extraire les noms des dossiers d'albums
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim() || '';

      // Exclure les liens du serveur web (tri, parent directory, etc.)
      if (href.startsWith('?') || href.startsWith('/') || href === '../' || text === 'Parent Directory' || text === '..') {
        continue;
      }

      // Vérifie si le lien est un dossier (se termine par '/') et n'est pas un dossier caché (ne commence pas par '.')
      let folderName = '';
      if (text.endsWith('/') && !text.startsWith('.')) {
        folderName = text.slice(0, -1).trim();
      } else if (href.endsWith('/') && !href.startsWith('.')) {
        folderName = href.slice(0, -1).trim();
      }

      // Ajoute le nom du dossier à l'ensemble des albums si c'est un dossier valide
      if (folderName && folderName !== '..' && !folderName.startsWith('.')) {
        albums.add(decodeURIComponent(folderName));
      }
    }

    // Si aucun album n'est trouvé, affiche un message d'erreur
    if (albums.size === 0) {
      container.innerHTML = `<p class="no-albums">${t("noAlbums")}</p>`;
      return;
    }

    // Trie les albums par ordre alphabétique en utilisant la locale française pour un tri correct des accents
    const albumArray = Array.from(albums).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

    // map -> async, et on utilise Promise.all pour attendre tous les résultats
    const listItems = await Promise.all(albumArray.map(async albumName => {
      const albumUrl = `album.html?dir=${encodeURIComponent(albumName)}`;
      const dataName = albumUrl.split('?dir=')[1] || '';

      // Prépare le chemin du dossier de l'album pour récupérer les images et la date de dernière modification
      const folderPath = `albums/${albumName}/`;

      // Variables pour stocker la date de dernière modification et le nombre d'images
      let lastModified = '';
      let imageCount = 0;

      // Récupère la liste des images dans le dossier de l'album
      try {
        const folderResponse = await fetch(folderPath);
        if (folderResponse.ok) {
          const folderHtml = await folderResponse.text();
          const folderDoc = parser.parseFromString(folderHtml, 'text/html');
          const imageLinks = Array.from(folderDoc.querySelectorAll('a')).filter(link => {
            const name = link.textContent?.trim() || '';
            return extensionsAutorisees.some(ext => name.endsWith(ext));
          });
          // Compte le nombre d'images dans l'album
          imageCount = imageLinks.length;

          // Récupère la date de dernière modification de la première image si elle existe
          if (imageLinks.length > 0) {
            const firstImageName = imageLinks[0].textContent.trim();
            try {
              const imageResponse = await fetch(`${folderPath}${firstImageName}`, { method: 'HEAD' });
              if (imageResponse.ok) {
                lastModified = imageResponse.headers.get('Last-Modified') || '';
              }
            } catch (error) {
              console.warn(`Could not retrieve last modified date for image in album "${albumName}":`, error);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not retrieve folder data for album "${albumName}":`, error);
      }

      // Incrémente le compteur d'albums pour générer un ID unique
      albumCount++;

      // Génère le code HTML pour chaque album avec les informations récupérées
      return `
      <li class="album-card">
        <a href="${albumUrl}" id="album-${albumCount}" aria-label="${t("viewPhoto")}${albumName}" data-name="${dataName}" class="artiste album-link hint--right" title="${albumName}">
          <svg class="IconLarge" aria-hidden="true">
            <use href="./icons/sprite.svg#icon-album"></use>
          </svg>
          <span class="album-name">${albumName}</span>
        </a>
        <span class="album-info"><br />${new Date(lastModified).toLocaleDateString('fr-FR')} - ${imageCount} image${imageCount > 1 ? 's' : ''}</span>
      </li>
    `;
    })).then(items => items.join(''));

    // Affiche la liste des albums dans le conteneur
    container.innerHTML = `<ul class="albums-grid">${listItems}</ul>`;

  } catch (error) {
    console.error('Error when loading the list of albums :', error);
    container.innerHTML = ` <p class="error">${t("errorLoadingAlbum")}</p>`;
  }
}

// Appeler displayOnMouseOver() après le chargement de la liste des albums pour ajouter les événements de survol
document.addEventListener('DOMContentLoaded', () => {
  chargerListeAlbums().then(() => {
    displayOnMouseOver();
  });
});

// Au survol d'un lien d'album, on affiche les images de l'album correspondant
// et on met en pause le défilement automatique
function displayOnMouseOver() {
  document.querySelectorAll('.artiste').forEach(lien => {
    lien.addEventListener('mouseover', event => {
      console.log("Mouseover on album link:", event.currentTarget.dataset.name);
      const name = event.currentTarget.dataset.name;

      // Met en pause le défilement automatique tant que la souris est sur un lien
      stopCarousel();

      traiterAlbums(name);
    });

    // Relance le défilement automatique quand la souris quitte le lien
    lien.addEventListener('mouseleave', () => {
      startCarousel();
    });
  });
}


//=====================Affichage des photos avec mouseover ============
// === CONFIGURATION ===
const baseURL = "albums/"; // Dossier contenant les albums photo
const extensionsAutorisees = [".jpg", ".jpeg", ".png", ".webp"]; // Extensions d'images autorisees

// === UTILITAIRE ===
// Fonction pour choisir n elements aleatoires dans un tableau
function choisirAleatoirement(tab, n) {
  const result = [];
  const copy = [...tab];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

// === PRINCIPAL ===
// Affiche les albums en rotation automatique : le premier au chargement,
// puis le suivant toutes les 3 secondes, en boucle
let albumsListe = [];
let currentAlbumIndex = 0;
let carouselInterval = null;
let currentDisplayedAlbum = null;

chargerAlbums();

async function chargerAlbums() {
  try {
    const response = await fetch(baseURL);
    const listDir = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(listDir, 'text/html');
    const links = Array.from(xmlDoc.querySelectorAll('a')).slice(1);

    const albums = new Map();

    for (const link of links) {
      const name = link.textContent?.trim();
      if (name?.endsWith('/') && !name.startsWith('.')) {
        const clean = name.replace('/', '').trim();
        albums.set(clean, clean);
      }
    }

    if (albums.size === 0) {
      console.warn("No albums found in the folder", baseURL);
      return;
    }

    // On trie les albums pour avoir un ordre stable et prévisible
    albumsListe = Array.from(albums.keys()).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    currentAlbumIndex = 0;

    // Met en place les événements une seule fois (mouseover/click), avant de démarrer la rotation
    setupImageEvents();

    // Affiche immédiatement le premier album
    traiterAlbums(albumsListe[currentAlbumIndex]);

    // Démarre le défilement automatique
    startCarousel();

  } catch (err) {
    console.error("Error when loading albums :", err);
  }
}

// Démarre (ou redémarre) le défilement automatique des albums
function startCarousel() {
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    currentAlbumIndex = (currentAlbumIndex + 1) % albumsListe.length;
    traiterAlbums(albumsListe[currentAlbumIndex]);
  }, 3000);
}

// Met en pause le défilement automatique des albums
function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

// Fonction pour traiter un album et afficher ses images
async function traiterAlbums(dossier) {
  const url = `${baseURL}${dossier}/`;
  console.log("Processing album:", url);
  const nomArtiste = dossier.replace(/%20/g, ' ').trim();
  currentDisplayedAlbum = dossier;
  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const liens = doc.querySelectorAll('a');

    const images = [];
    for (let i = 0; i < liens.length; i++) {
      const nom = liens[i].textContent.trim();
      if (extensionsAutorisees.some(ext => nom.endsWith(ext))) {
        images.push(nom);
      }
    }

    // Vérifier qu'il y a au moins 4 images
    if (images.length < 4) {
      console.warn(`Not enough images in the folder ${dossier}`);
      return;
    }

    const choisies = choisirAleatoirement(images, 4);

    // On construit les URLs completes
    const chemins = choisies.map(img => `${baseURL}${dossier}/${img}`);
    document.querySelector("#nom_artiste").textContent = nomArtiste;

    // Afficher les images avec ton systeme existant
    imageDisplay(chemins);
  } catch (err) {
    console.error("Error :", err);
  }
}

// Met en place une seule fois les événements mouseover/mouseleave/click sur la table d'images
function setupImageEvents() {
  const imageContainer = document.querySelector("#image");

  // Au survol du bloc d'images, on affiche un tooltip et on met en pause le défilement
  imageContainer.addEventListener("mouseover", () => {
    if (document.querySelector("#nom_artiste").textContent && document.querySelector("#image-1").src) {
      const tooltip = `${t("viewPhoto")}${document.querySelector("#nom_artiste").textContent}`;
      imageContainer.setAttribute("aria-label", tooltip);
      imageContainer.classList.add("hint--bottom");
    }

    stopCarousel();
  });

  // Quand la souris quitte le bloc d'images, on relance le défilement
  imageContainer.addEventListener("mouseleave", () => {
    startCarousel();
  });

  // Clic sur la table d'images pour ouvrir l'album complet
  imageContainer.addEventListener("click", () => {
    if (document.querySelector("#nom_artiste").textContent && document.querySelector("#image-1").src) {
      window.location.href = `album.html?dir=${currentDisplayedAlbum}`;
    } else {
      console.warn("Aucun album a afficher ou nom d'artiste manquant");
    }
  });
}

// === AFFICHAGE / EFFACEMENT ===
// Fonction pour afficher les images dans la table, avec un fade-out puis fade-in
function imageDisplay(images) {
  const container = document.querySelector("#image");

  // Fade-out
  container.classList.remove("show");

  // On attend la fin du fade-out avant de changer les images et de refaire le fade-in
  //setTimeout(() => {
  document.querySelector("#image-1").src = images[0];
  document.querySelector("#image-2").src = images[1];
  document.querySelector("#image-3").src = images[2];
  document.querySelector("#image-4").src = images[3];

  container.classList.add("show");

  container.style.display = "block";
  container.style.cursor = "pointer";

  //}, 500); // Ajustez cette valeur pour qu'elle corresponde à la durée de votre transition CSS (transition: opacity Xs)
}