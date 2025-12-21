/** Translation messages for the application */
// messages.js

// Detection de la langue du navigateur
const browserLang = navigator.language || navigator.userLanguage;
const userLang = (browserLang.split('-')[0] || 'en').toLowerCase();

// Tableau des messages
const messages = {
  fr: {
    loading: "Chargement de",
    search: "Recherche",
    searchInput: "mots s&eacute;par&eacute;s par un ;",
    showInfo: "Afficher les infos",
    hideInfo: "Masquer les infos",
    tags: "Libell&eacute;s : ",
    orderByDate: "Trier par date",
    orderByName: "Trier par nom",
    lastOnTop: "Du dernier au premier",
    firstOnTop: "Du premier au dernier",
    mosaic: "Mosa&iuml;que",
    blog: "Blog",
    person: "Personne : ",
    persons: "Personnes : ",
    picture: "photo",
    pictures: " photos",
    noDataDevice: "Aucune donn&eacute;e sur l'appareil",
    noAuthor: "Auteur inconnu",
    noDataPhoto: "Aucune donn&eacute;e sur la photo",
    noDataLens: "Aucune donn&eacute;e sur l'objectif",
    deleteImage: "Supprimer cette image",
    home: "Accueil",
    chooseDir: "Choisir un album",
    openAlbum: "Ouvrir l'album",
    editMetadata: "Modifier les m&eacute;tadonn&eacute;es",
    circa: "vers ",
    date: "Date : ",
  },
  en: {
    loading: "Loading ",
    search: "Search",
    searchInput: "words separated by a ;",
    showInfo: "Display info",
    hideInfo: "Hide info",
    tags: "Tags: ",
    orderByDate: "Order by date",
    orderByName: "Order by name",
    lastOnTop: "From the last to the first",
    firstOnTop: "From the first to the last",
    mosaic: "Mosaic",
    blog: "Blog",
    person: "Person: ",
    persons: "Persons: ",
    picture: "picture",
    pictures: " pictures",
    noDataDevice: "No data on device",
    noAuthor: "Author unknown",
    noDataPhoto: "No data on the photo",
    noDataLens: "No data on the lens",
    deleteImage: "Delete this image",
    home: "Home",
    chooseDir: "Choose an album",
    openAlbum: "Open Album",
    editMetadata: "Edit metadata",
    circa: "circa ",
    date: "Date: "
  },
};

// Fonction de traduction (fallback en anglais si cle manquante)
export const t = (key) => (messages[userLang] || messages.en)[key] || key;

// Si tu veux aussi exporter la langue detectee
export { userLang, messages };
