/***********************************************
 * exifParser.js
 * EXTRACTION DES META-DONNEES DE CHAQUE PHOTO
 **********************************************/
import { config } from './config.js';
import { t } from './messages.js';

/**
 * Limiteur de parallelisme pour eviter de surcharger le processeur
 * Execute les tâches par paquet de "limit"
 */
async function runLimited(tasks, limit = 5) {
    const results = [];
    let index = 0;

    return new Promise((resolve) => {
        let active = 0;

        function next() {
            // Fin quand toutes les tâches sont lancees ET terminees
            if (index === tasks.length && active === 0) {
                resolve(results);
                return;
            }

            // Lance les tâches tant qu'il reste de la place
            while (active < limit && index < tasks.length) {
                const current = index++;
                const task = tasks[current];
                active++;

                task()
                    .then(result => { results[current] = result; })
                    .catch(err => { results[current] = { error: err }; })
                    .finally(() => {
                        active--;
                        next(); // Quand une tâche finit ? on en lance une autre
                    });
            }
        }

        next();
    });
}

/**
 * Extraction EXIF pour l'ensemble des photos
 * Utilise runLimited pour eviter de saturer le navigateur
 */
export async function extractExif(photoArray) {
    // Affiche le nombre de photo dans l'animation de chargement
    config.progressText.textContent =
        `${t("loading")} ${photoArray.length} ${t("pictures")}`

    // Lance l'extraction exif par paquet de 5
    const tasks = photoArray.map(url => () => extractSingleExif(url));
    return runLimited(tasks, 5);  // 5 en parallele (reglable)
}

/**
 * Traitement d'une seule photo :
 * - fetch unique
 * - extraction EXIF depuis le Blob
 * - simplification des champs EXIF
 */
async function extractSingleExif(imageUrl) {
    const imageName = imageUrl.split("/").pop();

    // Afichage du nom de la photo en chargement
    /*config.progressText.textContent =
        `${t("loading")} ${imageName})`;*/

    try {
        // 1 seul fetch
        const response = await fetch(imageUrl);
        const fileBlob = await response.blob();

        const mimeType = fileBlob.type.split('/')[1] || "";
        const size =
            fileBlob.size > 1_000_000
                ? `${(fileBlob.size / 1_000_000).toFixed(1)} Mo`
                : `${(fileBlob.size / 1_000).toFixed(1)} Ko`;

        // Extraction EXIF directement depuis le Blob
        const exifTag = await exifr.parse(fileBlob, { xmp: true }) || {};

        //const get = (obj, key, def = '') => obj[key] ?? obj[key]?.value ?? def;

        const meta = {
            name: imageName,
            url: imageUrl,
            mimeType: mimeType,
            size: size,
            label: exifTag.Label || '',
            materiel: exifTag.Make || '',
            modele: exifTag.Model || '',
            largeur: exifTag.ExifImageWidth || '',
            hauteur: exifTag.ExifImageHeight || '',
            latitude: exifTag.latitude || null,
            longitude: exifTag.longitude || null,
            description: exifTag.ImageDescription || exifTag.description?.value || exifTag.description || '',
            titre: exifTag.title?.value || exifTag.title || '',
            credit: exifTag.Credit || '',
            copyright: exifTag.rights?.value || '',
            createur: exifTag.creator || exifTag.Artist || '',
            date: exifTag.CreateDate || exifTag.DateTimeOriginal || '',
            tag: Array.isArray(exifTag.subject)
                ? exifTag.subject.join(config.separator)
                : exifTag.subject || '',
            personne: Array.isArray(exifTag.PersonInImage)
                ? exifTag.PersonInImage.join(config.separator)
                : exifTag.PersonInImage || '',
            fNumber: exifTag.FNumber ? `${exifTag.FNumber}` : '',
            iso: exifTag.ISO || '',
            vitesse: exifTag.ExposureTime ? `1/${Math.round(1 / exifTag.ExposureTime)}` : '',
            focale35: exifTag.FocalLengthIn35mmFormat ? `${exifTag.FocalLengthIn35mmFormat}` : '',
        };

        return { imageName, url: imageUrl, meta };

    } catch (error) {
        console.error(`Erreur lecture EXIF pour ${imageUrl}:`, error);
        return { imageName, url: imageUrl, meta: null, error };
    }
}