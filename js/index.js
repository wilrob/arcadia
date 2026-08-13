document.addEventListener('DOMContentLoaded', () => {
  // Div de la page index
  const central = document.querySelector("#central");
  const head = document.querySelector("#hautdepage");

  // Page d'accueil par defaut
  const home = "./bio/home.html";

  // On reupere les parameres de l'url
  const params = new URLSearchParams(document.location.search);
  const name = params.get("name");

  // Liens HOME et ALBUM
  const entete = `
    <a id="home" href="index.html" class="hint--bottom" aria-label="Accueil">
      <svg class="IconLarge">
        <use href="./icons/sprite.svg#icon-home"></use>
      </svg>
    </a>
    <a id="lien-album" href="album.html?dir=${name}" class="hint--bottom-right" aria-label="Ouvrir l'album">
      <svg class="IconLarge">
        <use href="./icons/sprite.svg#icon-album" fill="#7a1b1b"></use>
      </svg>
    </a>`;

  // Si parametre name dans l'url, on affiche la page html (dans dossier bio) 
  // et on ajoute l'en-tete avec les icones home et album
  if (name) {
    // Chargement de la page de bio
    getHtmlPage(central, `./bio/${name}.html`, () => {
      head.innerHTML = entete;
    });

    // Sinon on remplit la div avec la page home.html
  } else {
    // Chargement de la page home.html
    getHtmlPage(central, home, () => {
      document.querySelectorAll('.artiste').forEach(lien => {
        lien.addEventListener('mouseover', event => {
          const name = event.currentTarget.dataset.name;
          traiterAlbums(name);
        });
        //lien.addEventListener('mouseout', imageClear);
      });
    });
  }
});

// Charge la page html demandee
function getHtmlPage(div, page, callback) {
  var txtFile = new XMLHttpRequest();
  txtFile.open("GET", `${page}`, true);
  txtFile.overrideMimeType('text/xml; charset=iso-8859-15');
  txtFile.onreadystatechange = function () {
    if (txtFile.readyState === 4 && txtFile.status === 200) {
      div.innerHTML = txtFile.responseText;
      if (callback) callback();  // <--- appeler le callback apres chargement
    }
  }
  txtFile.send(null);
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
// Choisir un album aléatoire parmi les dossiers présents dans "albums/"
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
      console.warn("Aucun album trouve dans le dossier", baseURL);
    }
    // Choisir un album aléatoire parmi les albums disponibles
    const albumChoisi = choisirAleatoirement(Array.from(albums.keys()), 1)[0];
    traiterAlbums(albumChoisi);
  } catch (err) {
    console.error("Erreur lors du chargement des albums :", err);
  }
}

// Fonction pour traiter les albums et afficher les images
async function traiterAlbums(dossier) {
  const url = `${baseURL}${dossier}/`;
  const nomArtiste = dossier.replace(/%20/g, ' ').trim();
  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const liens = doc.querySelectorAll('a');

    const images = [];
    for (let i = 0; i < liens.length; i++) {
      const nom = liens[i].textContent.trim().toLowerCase();
      if (extensionsAutorisees.some(ext => nom.endsWith(ext))) {
        images.push(nom);
        //console.log(nom)
      }
    }

    // Vérifier qu'il y a au moins 4 images
    if (images.length < 4) {
      console.warn(`Pas assez d'images dans ${dossier}`);
      return;
    }

    const choisies = choisirAleatoirement(images, 4);

    // On construit les URLs completes
    const chemins = choisies.map(img => `${baseURL}${dossier}/${img}`);
    document.querySelector("#nom_artiste").textContent = nomArtiste;

    // Afficher les images avec ton systeme existant
    imageDisplay(chemins);
  } catch (err) {
    console.error("Erreur :", err);
  }

// Au survol de la table d'images, on affiche un tooltip indiquant "Ouvrir l'album de [nom de l'artiste]" avec la classe CSS "hint--bottom" (de la librairie hint.css) si un nom d'artiste est present et que les images sont affichees dans la table
  document.querySelector("#image").addEventListener("mouseover", () => {
    if (document.querySelector("#nom_artiste").textContent && document.querySelector("#image-1").src) {
      const tooltip = `Ouvrir l'album de ${document.querySelector("#nom_artiste").textContent}`;
      document.querySelector("#image").setAttribute("aria-label", tooltip);
      document.querySelector("#image").classList.add("hint--bottom");
    }
  });

  // Clic sur la table d'images pour ouvrir l'album complet si un nom d'artiste est present et que les images sont affichees dans la table
  document.querySelector("#image").addEventListener("click", () => {
    if (document.querySelector("#nom_artiste").textContent && document.querySelector("#image-1").src) {
      window.location.href = `album.html?dir=${dossier}`;
    } else {
      console.warn("Aucun album a afficher ou nom d'artiste manquant");
    } 
    });
}

// === AFFICHAGE / EFFACEMENT ===
// Fonction pour afficher les images dans la table
function imageDisplay(images) {
  const container = document.querySelector("#image");
  
  //console.log(images[0])
  document.querySelector("#image-1").src = images[0];
  document.querySelector("#image-2").src = images[1];
  document.querySelector("#image-3").src = images[2];
  document.querySelector("#image-4").src = images[3];

  container.style.display = "block";
  container.style.cursor = "pointer";

  // Appliquer le fade-in (classe CSS)
  requestAnimationFrame(() => container.classList.add("show"));
}
