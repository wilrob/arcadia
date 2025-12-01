
/* Recuperation parametre GET dans l'URL
*/
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

/** SETTINGS  */
// Title
const fixedTitle = 'Titre fixe de mon album photo';
const setFixedTitle = 0 // Set to 1 if you want to display the fixedTitle
// photos directory
const imageDir = 'albums';
// index page
const index = 'album.html';
// Search text separator
const separator = ';';
// Affichage résultat nb photos trouvées
const divResult = document.getElementById("resultat");
// Loader
const loader = document.getElementById('loader');
const progressText = document.getElementById('progressText');

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

/** data : Object contenant :
   * le dossier d'image (dir)
   * le champ de recherche (search)
   * le choix du tri : numerique (id) ou alphabetique (name)
   * sens du tri : de A a Z ou du plus recent au plus ancien (down), inversement (up)
   * le type d'affichage (blog ou mosaic)
  **/

let data = {
    dir: '',
    search: '',
    tri: 'id',
    sens: 'down',
    typeAlbum: 'blog'
};

// Recuperation parametre URL 'dir'
let getDir = '';
if (urlParams.get('dir')) {
    getDir = urlParams.get('dir');
    setCookie('dir', getDir, 3);
    data.dir = imageDir + '/' + getDir;
} else if (getCookie('dir') && typeof getCookie('dir') !== 'undefined' /*&& dirOK == 1*/) {
    getDir = getCookie('dir');
    data.dir = imageDir + '/' + getDir;
}


// Recuperation parametre URL 'tri' (numérique ou alphabétique)
if (getCookie('tri')) {
    data.tri = getCookie('tri');
} else {
    setCookie('tri', data.tri, 3);
}

// Recuperation parametre URL 'sens' (up ou down)
if (getCookie('sens')) {
    data.sens = getCookie('sens');
} else {
    setCookie('sens', data.sens, 3);
}

// Title
let setTitle = document.getElementById('hautdepage');
if (setFixedTitle == 1) {
    // Tile: fixed title defined in User Settings
    setTitle.innerHTML = `<a href="${index}">${fixedTitle}</a>`;
} else {
    // Title: photo directory's name
    setTitle.innerHTML = `<a href="${index}">${getDir}</a>`;
}

// Recuperation parametre URL 'search'
if (urlParams.get('search')) {
    // On remplace les espaces entourant le separateur par le separateur 
    const regex = new RegExp(`\\s*${separator}\\s*`, 'g');
    search = urlParams.get('search').replaceAll(regex, separator);
    // Supprime les espaces en debut et fin et les espaces multiples
    search = search.replace(/^\s+|\s+$|\s+(?=\s)/g, '');
    search = search.trim();
    data.search = search;
}


export const config = {
    fixedTitle: fixedTitle,
    setFixedTitle: setFixedTitle,
    imageDir: imageDir,
    index: index,
    separator: separator,
    divResult: divResult,
    loader: loader,
    progressText: progressText,
    data: data,
    getDir: getDir,
}