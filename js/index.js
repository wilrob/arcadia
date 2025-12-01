document.addEventListener('DOMContentLoaded', () => {
  // Div de la page index
  const central = document.getElementById("central");
  const head = document.getElementById("hautdepage");

  // Page d'accueil par d√©faut
  const home = "home.html";

  // On reupere les parameres de l'url
  const params = new URLSearchParams(document.location.search);
  const name = params.get("name");

  // Si pas page d'accueil, on ajoute l'en-tete
  if (name) {
    getHtmlPage(central, `./bio/${name}.html`);
    const entete = `<div id="home"><a href="index.html" class="hint--right" aria-label="Accueil"><svg class="IconLarge"><use href="./icons/sprite.svg#icon-home"></use></svg></a></div>
        <div id="lien-album"><a href="./album.html?dir=${name}" class="hint--bottom-right" aria-label="Ouvrir l'album"><svg class="IconLarge"><use href="./icons/sprite.svg#icon-album" fill="#7a1b1b"></use></svg></a></div>`;
    head.innerHTML = entete;
    // On rempli la div avec le fichier pass√© dans l'url
  } else {
    getHtmlPage(central, home);
  }
});

function getHtmlPage(div, page) {
  var txtFile = new XMLHttpRequest();
  txtFile.open("GET", `${page}`, true);
  txtFile.overrideMimeType('text/xml; charset=iso-8859-15');
  txtFile.onreadystatechange = function () {
    if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
      if (txtFile.status === 200) {  // Makes sure it's found the file. 
        //console.log(txtFile.responseText)
        div.innerHTML = txtFile.responseText;
      }
    }
  }
  txtFile.send(null);
}

//=====================Affichage des photos avec mouse over ============
// === CONFIGURATION ===
const baseURL = "albums/"; // ‡ adapter ‡ ton serveur
const extensionsAutorisees = [".jpg", ".jpeg", ".png", ".webp"];

// === UTILITAIRE ===
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
async function traiterAlbums(dossier) {
  const url = `${baseURL}${dossier}/`;

  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const liens = doc.getElementsByTagName("a");

    const images = [];
    for (let i = 0; i < liens.length; i++) {
      const nom = liens[i].textContent.trim().toLowerCase();
      if (extensionsAutorisees.some(ext => nom.endsWith(ext))) {
        images.push(nom);
        //console.log(nom)
      }
    }

    if (images.length < 4) {
      console.warn(`?? Pas assez d?images dans ${dossier}`);
      return;
    }

    const choisies = choisirAleatoirement(images, 4);

    // On construit les URLs complËtes
    const chemins = choisies.map(img => `${baseURL}${dossier}/${img}`);

    // Afficher les images avec ton systËme existant
    image_display(chemins);
  } catch (err) {
    console.error("Erreur :", err);
  }
}

// === AFFICHAGE / EFFACEMENT ===
function image_display(images) {
  const container = document.getElementById("image");
  //console.log(images[0])
  document.getElementById("image-1").src = images[0];
  document.getElementById("image-2").src = images[1];
  document.getElementById("image-3").src = images[2];
  document.getElementById("image-4").src = images[3];

  container.style.display = "block";

  // Appliquer le fade-in (classe CSS)
  requestAnimationFrame(() => container.classList.add("show"));
}

function image_clear() {
  const container = document.getElementById("image");
  container.classList.remove("show");
  container.style.display = "none";
}