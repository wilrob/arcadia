/**
 * FONCTION D'AFFICHAGE DES FICHIERS PHOTOS
 * Liste les fichiers � afficher
 * 
 * data : objet (dir, tri, search, typeAlbum)
 * dirImage : r�pertoire des photos
 * img : objet image
 * lastImage : num�ro du dernier fichier �  afficher
 * nbImage : nombre total de fichiers
 * imageList : tableau des fichiers � afficher
*/
async function loadImg(data) {
    let dir = data.dir;
    let search = data.search;
    let typeAlbum = data.typeAlbum;
    /**
     * Lecture du dir images
     * On r�cup�re la liste des fichiers avec loadXMLDoc
     * Le r�sultat est plac� dans 'contents'
    */
    var dirImage = dir + "/";
    // Liste les fichiers de dirImage
    await loadFiles(dirImage).then((contents) => {
        //let contents = xmlhttp.responseText;
        /**
         * On parse le contenu de 'contents' (page HTML avec tableau)
         * La 1ere ligne du tableau (th) contient les titres
         * Les lignes suivantes contiennent les noms des fichiers et leurs infos
        */
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(contents, "text/html");

        // Tableau des noms de fichiers (dans balise <a>)
        let img = xmlDoc.getElementsByTagName("a");
        /**
         * R�cup�ration des fichiers images du dossier
        */
        let imageList = new Array();
        for (item of img) {
            // Chargement et affichage des photos
            // Nom du fichier image dans href de la balise <a>
            let image = item.getAttribute("href");

            // Suppression espace au d�but du nom
            //imgName = image.replace(/\s+/g, "");
            if (image.substring(0, 1) == ' ') {
                imgName = image.substring(1);
            } else {
                imgName = image;
            }

            // On v�rifie que c'est un fichier image
            let imageReg = /\.(gif|jpg|jpeg|tiff|png)$/i;

            if (imageReg.test(imgName) == true) {
                imageList.push(imgName);
            }
        };
        // Nb totale d'images dans le r�pertoire
        let nbImages = imageList.length;
        document.getElementById('directory').append(nbImages + ' photos');
        // Nom de la derni�re image utilis�e pour lancer le tri � la fin du traitement
        let lastImage = imageList[nbImages - 1];

        //Initialisation du pourcentage de chargement
        document.getElementById('pourcent').max = nbImages;

        /**
         * Affichage des fichiers contenu dans le tableau imageList
        */
        imageList.forEach((imgName, i) => {
            /**
             * Chargement des photos, lecture XMP et affichage DIV
             * dirImage : r�pertoire deu fichier
             * img : objet image
             * i : num�ro du fichier
             * 
             * Lis le fichier EXIF de la photo
             * et cr�e un div contenant la photo
             * et ses infos
             * VARIABLES
             * dirImage : r�pertoires des images
             * imgName : nom du fichier photo
             * imageUrl : adresse de l'image
             * photo : ligne HTML d'affichage de la photo
             * display : block ou none (none par d�faut)
            */
            let imageUrl = dirImage + imgName;

            // Poids de la photo en Mo ou Go
            let fileBlob = Object();
            fetch(imageUrl).then((res) => {
                fileBlob = res.blob();
                return fileBlob;
            }).then((fileBlob) => {
                // type = 'image/jpeg'
                let type = fileBlob.type.split('/');
                let mimeType = type[1];
                // size en octet
                let size = fileBlob.size > 1000000 ? (fileBlob.size / 1000000).toFixed(1) + ' Mo' : (fileBlob.size / 1000).toFixed(1) + ' Ko';

                /**
                 * EXIFR lit les metadata (EXIF, IDF, XMP, etc.) contenues dans la photo.  
                 * materiel : exifTag.Make
                 * modele : exifTag.Model
                 * largeur : exifTag.ExifImageWidth
                 * hauteur :  exifTag.ExifImageHeight
                 * mimeType : extension fichier (jpeg, png)
                 * latitude : exifTag.GPSLatitude
                 * longitude : exifTag.GPSLongitude
                 * description : exifTag.ImageDescription
                 * F number : exifTag.FNumber;
                 * ISO : exifTag.ISO
                 * Vitesse : exifTag.ExposureTime
                 * Focale �qu. 35mm : exifTag.FocalLengthIn35mmFilm
                 * description : exifTag.description
                 * titre : exifTag.title
                 * credit : exifTag.Credit
                 * copyright : exifTag.rights
                 * createur : exifTag.creator
                 * date : exifTag.CreateDate
                 * tag : exifTag.subject
                 * personne : exifTag.PersonInImage
                */
                exifr.parse(imageUrl, { xmp: true }).then(exifTag => {
                    let emptyTag = null;
                    if (typeof exifTag == 'undefined') {
                        exifTag = {};
                        emptyTag = 'Aucune donn&eacute;e sur la photo<br />';
                    }
                    // Donn�es EXIF photos
                    let WidthxHeight = typeof exifTag.ExifImageHeight !== 'undefined' && typeof exifTag.ExifImageWidth !== 'undefined' ? exifTag.ExifImageWidth + ' &times ' + exifTag.ExifImageHeight + '&nbsp;&nbsp;&nbsp;&nbsp;' : '';
                    let FNumber = typeof exifTag.FNumber !== 'undefined' ? '&#x192;' + exifTag.FNumber + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : '';
                    let ISO = typeof exifTag.ISO !== 'undefined' ? 'ISO ' + exifTag.ISO + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : '';
                    let vitesse = typeof exifTag.ExposureTime !== 'undefined' ? '1/' + parseInt(1 / exifTag.ExposureTime) + ' s' : '';
                    let focale = typeof exifTag.FocalLengthIn35mmFormat !== 'undefined' ? exifTag.FocalLengthIn35mmFormat + ' mm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : '';

                    // Donn�e objectif
                    let objectif = ISO != '' || FNumber != '' || vitesse != '' || focale != '' ? ISO + focale + FNumber + vitesse : 'Aucune donn&eacute;e sur l\'objectif';

                    // Donn�es GPS
                    lat[i] = typeof exifTag.latitude !== 'undefined' ? parseFloat(exifTag.latitude, 6) : null;
                    lon[i] = typeof exifTag.longitude !== 'undefined' ? parseFloat(exifTag.longitude, 6) : null;

                    // Visibilit� de l'image par d�faut
                    let display = 'none';

                    /**
                     * DESCRIPTION : description de la photo
                     * Element exif : description
                    */
                    let description;
                    if (typeof exifTag.description?.value !== "undefined") {
                        description = decode_utf8(exifTag.description.value);
                        description = description.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }

                    /**
                     * CREDIT : droits et copyright
                     * Element exif : credit et copyright
                    */
                    let credit = typeof exifTag.Credit !== "undefined" ? decode_utf8(exifTag.Credit) : '';
                    let copy = typeof exifTag.rights?.value !== "undefined" ? '&copy;' + decode_utf8(exifTag.rights.value) + ' - ' : '';
                    let droits = copy + credit;

                    /**
                     * MATERIEL : marque et mod�le
                     * Element exif : Make & Midel
                    */
                    let camera = typeof exifTag.Make != "undefined" ? exifTag.Make : null;
                    let model = typeof exifTag.Model != "undefined" ? exifTag.Model : null;
                    let materiel = camera || model ? camera + ' ' + model : 'Aucune donn&eacute;e sur l\'appareil';

                    /** 
                     * TITRE = titre de la photo
                     * Element exif : title + description
                    */
                    let titre = '';
                    if (typeof exifTag.title?.value !== "undefined") {
                        titre = '<div class="titre">' + decode_utf8(exifTag.title.value) + '</div>';
                    }
                    titre += description ? '<div class="desc">' + description + '</div>' : '';

                    /**
                     * CREATEUR = cr�ateur de la photo
                     * Element exif : creator ou Artist
                    */
                    let createur;
                    let artist = typeof exifTag.creator !== "undefined" ? decode_utf8(exifTag.creator) : 'Auteur inconnu';

                    // Display si tag ok
                    if (artist && (artist == search || search == 'all')) {
                        display = 'block';
                        createur = '<span><img src="icons/utilisateur.png" style="vertical-align: bottom" height="20" /> ' + decode_utf8(artist) + '</span>';
                    }

                    /**
                     * DATE = date de cr�ation
                     * Element exif : CreateDate
                    */
                    let dateFR = '';
                    let timeStamp = 0;
                    const options = {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    };
                    if (typeof exifTag.CreateDate !== "undefined") {
                        let myDate = new Date(exifTag.CreateDate).toLocaleDateString('fr', options);
                        let myHour = new Date(exifTag.CreateDate).toLocaleTimeString('fr');
                        dateFR = myDate + ' ' + myHour;

                        /* TIMESTAMP from Date
                        */
                        let imgDate = new Date(exifTag.CreateDate);
                        timeStamp = imgDate.getTime();
                    }

                    /**
                     *  TAGS = keywords de la photo
                     *  Element exif : subject
                    */
                    // Tableau contenant les tags et les personnes
                    let tagAndPersonArray = new Array();

                    // Ligne HTML des libell�s
                    // Titre des libell�s
                    let titreLabel = 'LibellÃ© : ';
                    let libelles = '';
                    if (typeof exifTag.subject !== "undefined") {
                        if (exifTag.subject.constructor !== Array) {
                            subjectTag = exifTag.subject.split(',');
                        } else {
                            subjectTag = exifTag.subject;
                        }
                        // Tags subjectTag dans tagArray
                        let tagArray = new Array();
                        subjectTag.forEach((element) => tagArray.push(element));
                        // Tri de tagArray par ordre alphab�tique, insensible � la casse
                        tagArray.sort((a, b) => {
                            if (a.toLowerCase() > b.toLowerCase()) {
                                return 1;
                            } else {
                                return -1;
                            }
                        });

                        // tag = HTML tag link
                        let tag = '';
                        tagArray.forEach((item) => {
                            // On range le tag dans le tableau tag + personnes
                            let spaceItem = item.replaceAll(' ', '_');
                            tagAndPersonArray.push(spaceItem);
                            // On cr�e la ligne HTML de tag
                            if (tag != '') {
                                tag += '<span style="color: #d34d1d">, </span>';
                                titreLabel = 'Libell&eacute;s : '
                            }
                            tag += '<a href="' + index + '?tag=' + item + '">' + decode_utf8(item) + '</a>';
                        });
                        libelles = '<p class="tag">' + titreLabel + tag + '</p>';
                    }

                    /**
                     * PERSONNES = personnes de la photo
                     * Element exif : PersonInImage
                    */
                    // Ligne HTML des personnes
                    // Titre des personnes
                    let titreSujet = 'Sujet : ';
                    let personnes = '';
                    if (typeof exifTag.PersonInImage !== "undefined") {
                        let personTag = exifTag.PersonInImage;

                        let perArray = new Array();
                        // On v�rifie si l'objet est un texte ou un tableau
                        if (!Array.isArray(personTag)) {
                            // Si texte, on l'ajoute au tableau
                            perArray.push(personTag);
                        } else {
                            perArray = personTag;
                        }
                        // Tags perArray dans personArray
                        let personArray = [];
                        perArray.forEach((element) => personArray.push(element));

                        // Tri de personArray par ordre alphabÃ©tique
                        personArray.sort();
                        let person = '';
                        personArray.forEach((item) => {
                            // On range la personne dans le tableau tag + personnes
                            spaceItem = item.replaceAll(' ', '_');
                            tagAndPersonArray.push(spaceItem);
                            if (person != '') {
                                person += '<span style="color: #d34d1d">, </span>';
                                titreSujet = 'Sujets : ';
                            }
                            // On cr�e la ligne HTML de personnes
                            person += '<a href="' + index + '?tag=' + item + '">' + decode_utf8(item) + '</a>';
                        });
                        personnes = '<p class="tag">' + titreSujet + person + '</p>';
                    }

                    /**
                     * Comparaison de la recherche avec le tableau des Tags + Personnes
                     */
                    // On cr�e un tableau avec les diff�rents mots de la recherche (search)
                    let tagArray = search.split(' ');

                    let nbOccurence = 0;
                    // Pour chaque �l�m�nt du tableau des personnes et des tags
                    tagAndPersonArray.forEach((item) => {
                        // Pour chaque mot de la recherche
                        tagArray.forEach((tagItem) => {
                            // On v�rifie l'�quivalence
                            if (tagItem.toLowerCase() == item.toLowerCase()) {
                                nbOccurence++;
                            }
                        });
                        // Si le nombre de tag+personne de la photo correspond au nombre de recherche, on affiche la photo
                        if (nbOccurence >= tagArray.length) {
                            display = 'block';
                        }
                    });

                    // Si pas de TAG, on affiche la photo
                    if (search == 'all') {
                        display = 'block';
                    }

                    // Si recherche Tag OK ou Tag = 'all', on affiche le DIV de la photo
                    if (display == 'block') {
                        // Gestion des classes Blog ou Mosaic
                        if (typeAlbum == 'blog') {
                            classPhoto = 'photo';
                            classDivImage = 'divImageBlog';
                            classDivPhoto = 'divPhoto';
                        } else if (typeAlbum == 'mosaic') {
                            classPhoto = 'photoMini';
                            classDivImage = 'divImageMosaic';
                            classDivPhoto = 'divPhotoMini';
                        }
                        // Image HTML
                        //let classPhoto = typeAlbum == 'blog' ? 'photo' : 'photoMini';
                        let photo = '<a href="' + imageUrl + '" data-fancybox="gallery"><img id="img' + i + '" alt="' + imgName + '" class="' + classPhoto + '" src="' + imageUrl + '" /></a>';
                        // Initialisation valeur du div pour affichage de la carte initMap
                        let iconInfo = '<div onclick="togglePublication(\'publication' + i + '\'); switchInfo(' + i + '); displayMap(' + i + ');getLocation(' + i + ');"><img class="info" id="info' + i + '" title="Afficher les infos" src="icons/information.png" width="16" /></div>';
                        photo += iconInfo;

                        /**  Cadre Information Photo
                         *  <div class="dataXMP">
                         *      <div class="detail" id="detail99">
                         *          <div class="cadre">Auteur, fichier, date, copyright</div>
                         *          <div class="cadre">Donn�es appareil photo</div>
                         *          <div class="cadre">Localisation</div>
                         *          <div class="cadre">Carte</div>
                         *      </div>
                         *      <div class="tagMosaic">Libell�s et personnes</div>
                         *  </div>
                         */
                        let details = '<div class="dataXMP">';
                        details += '<div class="detail" id="detail' + i + '">';
                        details += '<div class="cadre">';
                        details += createur ? createur + '<br />' : '';
                        details += decode_utf8(imgName);
                        details += dateFR != '' ? ' - ' + dateFR + '<br />' : '<br />';
                        details += emptyTag ? emptyTag : '';
                        details += droits != '' ? droits + '<br />' : '';
                        details += '</div>';
                        details += '<div class="cadre">';
                        details += materiel + '<br />';
                        details += WidthxHeight + size + '<span class="mimeType">' + mimeType.toUpperCase() + '</span>';
                        details += '<div class="objectif">' + objectif + '</div>';
                        details += '</div>';
                        details += lat[i] ? '<div id="loc' + i + '" class="cadre"></div>' : '';
                        details += '</div>';
                        details += lat[i] ? '<div id="map' + i + '" class="map"></div>' : '';
                        details += '</div>';
                        // Tag en version mosaique
                        details += '<div class="tagMosaic">' + libelles + personnes + '</div>';

                        // Infos affich�es en version blog (nom fichier ou date en fonction du tri alphabetique ou date)
                        let infos = '<div class="plusinfo"><div class="titreName">' + decode_utf8(imgName) + '</div><div class="titreDate">' + dateFR + '</div></div>';

                        // Affichage des infos de la photo
                        // Bouton de fermeture
                        let closeButton = '<a class="closeInfos" onclick="togglePublication(\'publication' + i + '\'); switchInfo(' + i + ')"><img src="icons/close-red.png" width="16" /></a>';
                        publication = '<div id="publication' + i + '" class="publication" style="display: none;">' + closeButton + '<div class="cadre">' + titre + '</div>' + details + '</div>';
                        // Tag en version Blog sous la photo
                        publication += '<div class="tagBlog">' + libelles + personnes + '</div>';

                        // On cr�e la DIV contenant la photo avec la class Blog ou Mosaic
                        let newImage = '<div class="' + classDivImage + '">' + photo + titre + infos + '</div>';
                        let contents = newImage + publication;

                        // Cr�ation du bloc Photo
                        myDiv = new Div();
                        myDiv.name = 'photo' + i;
                        myDiv.id = timeStamp;
                        myDiv.type = 'div';
                        myDiv.container = 'central';
                        myDiv.contents = contents;
                        myDiv.classe = classDivPhoto;
                        myDiv.position = 'inner';
                        myDiv.show();

                        // Nb de fichiers affich�s dans <span id="resultat">
                        let divResult = document.getElementById("resultat");
                        // Si le r�sultat est un texte, on met le compteur � 0, puis on l'incr�mente
                        let resultat = isNaN(divResult.innerHTML) ? 0 : parseInt(divResult.innerHTML);
                        resultat++;
                        // On renvoie le r�sultat
                        divResult.innerHTML = resultat;

                        // Pourcentage de chargement
                        let percent = document.getElementById('pourcent');
                        let percentMax = percent.max;
                        let percentValue = parseInt(100/percentMax*resultat);
                        percent.innerText = percentValue + "%";

                    }
                    // Si on est arriv� � la derni�re image, on trie les photos
                    if (imgName == lastImage) {
                        let attribute = data.tri == 'numeric' ? 'id' : 'name';
                        tri('central', attribute);

                        // Masque les dic tagMosaic ou tagBlog en fonction de l'affichage
                        if (typeAlbum == 'blog') {
                            hideClass('tagMosaic');
                        } else if (typeAlbum == 'mosaic') {
                            hideClass('tagBlog');
                        }
                        // On supprime la barre de progression
                        let body = document.getElementsByTagName('body')[0];
                        // On supprime l'animation d'attente
                        body.className = body.className.replace(/loading/, '');
                        hideDiv('pourcent');
                    }
                }).catch(err => console.error(imgName, err));
            });
        });
        /* Fin Affichage des fichiers
        /**********************************************************************************************/
    });
} /* FIN function loadImg */
