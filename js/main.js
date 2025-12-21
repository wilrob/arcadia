import { initPhotoObservers } from './util.js';
import { readPhotoDirectory } from './fileReader.js';
import { extractExif } from './exifParser.js';
import { config } from './config.js';
import { renderGallery } from './uiRenderer.js';
import { displayFancybox } from './fancybox.js';

async function init() {
    try {
        /**
         * fileReaders.js
         * Lecture des dossiers photos dans 'albums'
         *  */
        const { search, images, nbFiles } = await readPhotoDirectory();
        /**
         * exifParser.js
         * Extraction des meta-donnees de chaque photo
         *  */
        const metaData = await extractExif(images);
        /** uiRenderer.js
         * Affichage des photos
         *  */
        renderGallery(metaData, search, nbFiles);

    } catch (err) {
        console.error(err);
        config.progressText.textContent = "Erreur de chargement.";
    }

    /** fancybox.js
     * Initialisation de Fancybox apres affichage complet
     *  */
    displayFancybox();

    /**
     * fonction dans util.js
     * Initialisation des observers apres affichage complet
     *  */
    initPhotoObservers(config.data.typeAlbum);
}
document.addEventListener('DOMContentLoaded', init);
