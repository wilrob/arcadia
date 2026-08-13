
/* Recuperation parametre GET dans l'URL
*/
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

/** SETTINGS  */
// WARNING: These are default values. Don't change the following settings unless you know what you're doing.

// Fixed title for the album page, if setFixedTitle is true
const fixedTitle = 'Fixed Title of My Photo Album'; // Set your fixed title here
// Set to true if you want to display the fixedTitle, otherwise the title will be based on the 'dir' parameter in the URL
const setFixedTitle = false; // Set to true if you want to display the fixedTitle
// Default directory where the albums are stored
const imageDir = 'albums';
// Default album page name
const index = 'album.html';
// Separator for multiple search terms (#tag or text in XMP comments) in the 'search' parameter of the BLOG view.
const separator = ';';


// display the result in the div with id 'resultat'
const divResult = document.querySelector('#resultat');
// Loader
const loader = document.querySelector('#loader');
const progressText = document.querySelector('#progressText');

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(name) {
    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="));
    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function syncParamWithCookie(key, defaultValue = '', days = 3) {
    const urlVal = urlParams.get(key);
    if (urlVal) {
        setCookie(key, urlVal, days);
        return urlVal;
    }
    const cookieVal = getCookie(key);
    if (cookieVal && cookieVal !== 'undefined') {
        return cookieVal;
    }
    if (defaultValue) {
        setCookie(key, defaultValue, days);
    }
    return defaultValue;
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

// Synchronisation des parametres URL / cookies
let getDir = syncParamWithCookie('dir', '');
if (getDir) {
    data.dir = imageDir + '/' + getDir;
}

data.tri = syncParamWithCookie('tri', data.tri);
data.sens = syncParamWithCookie('sens', data.sens);

// Title
let setTitle = document.querySelector('#hautdepage');

if (setTitle) {
    const titleLink = document.createElement('a');
    if (setFixedTitle) {
        // Title: fixed title defined in User Settings
        titleLink.href = index;
        titleLink.textContent = fixedTitle;
    } else if (getDir && getDir.trim() !== '') {
        titleLink.href = `index.html?name=${encodeURIComponent(getDir.trim())}`;
        titleLink.textContent = getDir;
    } else {
        titleLink.href = index;
        titleLink.textContent = fixedTitle;
    }
    setTitle.textContent = '';
    setTitle.appendChild(titleLink);
}

// Recuperation parametre URL 'search'
if (urlParams.get('search')) {
    // On remplace les espaces entourant le separateur par le separateur
    const regex = new RegExp(`\\s*${separator}\\s*`, 'g');
    let search = urlParams.get('search').replaceAll(regex, separator);
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