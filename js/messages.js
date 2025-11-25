/** Translation messages for the application */
// messages.js

// Détection de la langue du navigateur
const browserLang = navigator.language || navigator.userLanguage;
const userLang = (browserLang.split('-')[0] || 'en').toLowerCase();

// Tableau des messages
const messages = {
  fr: {
    loading: "Chargement de",
    searchInput: "mots s&eacute;par&eacute;s par un ;",
    showInfo: "Afficher les infos",
    hideInfo: "Masquer les infos",
    tags: "Libell&eacute;s : ",
    orderByDate: "Trier par date",
    orderByName: "Trier par nom",
    lastOnTop: "Dernier en haut",
    firstOnTop: "Premier en haut",
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
    openAlbum: "Ouvrir l'album",
    editMetadata: "Modifier les m&eacute;tadonn&eacute;es",
    circa: "vers ",
  },
  en: {
    loading: "Loading ",
    searchInput: "words separated by a ;",
    showInfo: "Display info",
    hideInfo: "Hide info",
    tags: "Tags: ",
    orderByDate: "Order by date",
    orderByName: "Order by name",
    lastOnTop: "Last on top",
    firstOnTop: "First on top",
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
    openAlbum: "Open Album",
    editMetadata: "Edit metadata",
    circa: "ca. ",
  },
};

// Fonction de traduction (fallback en anglais si clé manquante)
export const t = (key) => (messages[userLang] || messages.en)[key] || key;

// Si tu veux aussi exporter la langue détectée
export { userLang, messages };
