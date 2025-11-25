/***********************************************
 * exifParser.js
 * EXTRACTION DES META-DONNEES DE CHAQUE PHOTO
 **********************************************/
import { config } from './config.js';
import { t } from './messages.js';

export async function extractExif(photoArray) {
    return Promise.all(photoArray.map(async (imageUrl) => {
        config.progressText.textContent = `${t("loading")} ${photoArray.length} ${t("pictures")}`;
        try {
            const { mimeType, size, exifTag } = await loadPhotoMetadata(imageUrl);
            const imageName = imageUrl.split("/").pop();
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
            console.log(meta.description);
            // Renvoi des resultats dans main.js
            return { imageName, url: imageUrl, meta };
        } catch (error) {
            console.error(`Erreur lecture EXIF pour ${imgName}:`, error);
            return { imageName, url: imageUrl, meta: null, error };
        }
    }));
}

/**
 * Lecture sécurisée des métadonnées EXIF/XMP/GPS
 * Retourne un objet vide {} si aucune donnée n'est trouvée ou en cas d'erreur
 */
async function safeParseExif(imageUrl) {
    try {
        const exifData = await exifr.parse(imageUrl, { xmp: true});
        //console.log(imageUrl, exifData);
        return exifData || {};
    } catch (err) {
        console.warn("Aucune métadonnée trouvée pour :", imageUrl, err);
        return {};
    }
}

/**
 * Récupère toutes les informations d'une photo (blob + métadonnées)
 * Retourne un objet { mimeType, size, exifTag }
 */
async function loadPhotoMetadata(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const fileBlob = await response.blob();

        const type = fileBlob.type.split('/');
        const mimeType = type[1];
        const size = fileBlob.size > 1000000
            ? `${(fileBlob.size / 1000000).toFixed(1)} Mo`
            : `${(fileBlob.size / 1000).toFixed(1)} Ko`;

        const exifTag = await safeParseExif(imageUrl);
        return { mimeType, size, exifTag };
    } catch (err) {
        console.error("Erreur lors du chargement de l'image :", imageUrl, err);
        return { mimeType: '', size: '', exifTag: {} };
    }
}
