/* Creation d'une DIV par image
/* txt : texte de l'image
/* display : block ou none
*/
class Div {
    constructor(type, id, name, container, contents, classe, position) {
        this.type = type;
        this.id = id;
        this.name = name;
        this.container = container
        this.contents = contents;
        this.classe = classe;
        this.position = position;
    }

    show() {
        //console.log(this.id);
        let newDiv = document.createElement(this.type);
        if (typeof this.id !== 'undefined') {
            newDiv.setAttribute("id", this.id);
        }
        if (typeof this.name !== 'undefined') {
            newDiv.setAttribute("name", this.name);
        }
        if (typeof this.classe !== 'undefined') {
            newDiv.setAttribute("class", this.classe);
        }
        newDiv.innerHTML = this.contents;
        let block = document.getElementById(this.container);
        // Insertion du div dans container
        if (this.position == 'inner') {
            block.appendChild(newDiv);
        }
        // Insertion du div avant container
        else if (this.position == 'before') {
            block.before(newDiv);
        }
    }
}

/* Chargement du contenu du repertoire dir contenant les photos
/* Renvoie une page HTML avec un tableau contenant les noms des fichiers
*/
async function loadFiles(dir) {
    const reponse = await fetch(dir);
    const files = await reponse.text();
    return files;
}

async function getFileStats(url) {
    let fileBlob;
    fetch(url).then((res) => {
        fileBlob = res.blob();
        return fileBlob;
    }).then((fileBlob) => {
        // Recupere les donnees dans un tableau type (type[0] = mimetype, type[1] = nb d'octets)
        let type = fileBlob.type.split('/');
        let file = Array();
        file[1] = type[1];
        file[0] = fileBlob.size > 1000000 ? (fileBlob.size / 1000000).toFixed(1) + ' Mo' : (fileBlob.size / 1000).toFixed(1) + ' Ko';
        return file;
    });
}

/* Decode et encode UTF-8
/* convertit les caractere speciaux en caracteres lisibles
*/
function decode_utf8(string) {
    try {
        //If the string is UTF-8, this will work and not throw an error.
        text = decodeURIComponent(string);
        return text;
    } catch (e) {
        //If it isn't, an error will be thrown, and we can assume that we have an ISO string.
        return string;
    }
}

function encode_utf8(string) { 
    return encodeURIComponent(string); 
}

/**
 * Tri les div affichees dans le div, <div id="timestamp" name="photoN">PHOTO</div>)
 * attribute = 'id' => Tri par date
 * attribute = 'name' => Tri par nom
 * sens = 'up' => Du plus ancien au plus recent ou de Z a A
 * sens = 'down' => // Du plus recent au plus ancien ou de A a Z
 */ 
async function divOrder( tri, sens ) {
    if(tri != 0) {
        elemTri = tri;
        setCookie('tri', tri, 3);
    } else {
        elemTri = getCookie('tri');
    }
    if(sens != 0) {
        elemSens = sens;
        setCookie('sens', sens, 3);
    } else {
        getCookie('sens')
    }
    
    var main = document.getElementById('central');
    if(elemSens == 'down') {      // Du plus recent au plus ancien ou de A a Z
        [].map.call(main.children, Object).sort((a, b) => {
            // We call localeCompare to compare a and b naturally.
            return a.getAttribute(elemTri).localeCompare(b.getAttribute(elemTri), undefined, {
                ignorePunctuation: true,
                // We set numeric to true to compare the numerical part of a and b .
                numeric: true,
                // sensitivity is set to 'base' to compare the case and the alphabet.
                sensitivity: 'base'
            })
        }).forEach(function (elem) {
            main.appendChild(elem);
        });
    } else {  // Du plus ancien au plus recent ou de Z a A
        [].map.call(main.children, Object).sort((a, b) => {
            // We call localeCompare to compare a and b naturally.
            return a.getAttribute(elemTri).toLowerCase().localeCompare(b.getAttribute(elemTri).toLowerCase(), undefined, {
                ignorePunctuation: true,
                // We set numeric to true to compare the numerical part of a and b .
                numeric: true,
                // sensitivity is set to 'base' to compare the case and the alphabet.
                sensitivity: 'base'
            })
        }).reverse().forEach(function (elem) {
            main.appendChild(elem);
        });
    }
    
    // Inversion des boutons de tri
    let triButton = document.getElementById('boutontri');
    if (elemTri == 'name') {
        triButton.innerHTML = globalThis.numericButton;
        showClass('titreName');
        hideClass('titreDate');
    } else {
        triButton.innerHTML = globalThis.alphabeticButton;
        showClass('titreDate');
        hideClass('titreName');
    }
    let sensButton = document.getElementById('sens');
    if (elemSens == 'down') {
        sensButton.innerHTML = globalThis.arrowUp;
    } else {
        sensButton.innerHTML = globalThis.arrowDown;
    }
}

// Masque tous les elements contenant la classe 'classe'
function hideClass(classe) {
    document.querySelectorAll('.' + classe).forEach(function (el) {
        el.style.display = 'none';
    });
}
// Affiche tous les elements contenant la classe 'classe'
function showClass(classe) {
    document.querySelectorAll('.' + classe).forEach(function (el) {
        el.style.display = 'block';
    });
}

// Masque l'element id
function hideDiv(id) {
    document.getElementById(id).style.display = 'none'; 
}
// Affiche l'element id
function showDiv(id) {
    document.getElementById(id).style.display = 'block'; 
}

// Inverse la visibilite de tous les elements contenant la classe 'classe'
function toggleClass(classe) {
    document.querySelectorAll('.' + classe).forEach(function (el) {
        if (el.style.display == 'none') {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

// Inverse la visibilite de la publication d'une div
function togglePublication(div) {
    document.querySelectorAll('.publication').forEach(function (elem) {
        // On masque toutes les div infos sauf celui selectionne
        if (elem.id != div) {
            elem.style.display = 'none';
        }
    });
    let el = document.getElementById(div);
    if (el.style.display == 'none') {
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

// Remplace un classe par une autre
function replaceClass(class1, class2) {
    document.querySelectorAll('.' + class1).forEach(function (elem) {
        elem.classList.replace(class1, class2);
    });
}

// Afficher / masquer une div
function toggleDisplay(type) {
    // Remplacer boutons
    let displayButton = document.getElementById('boutondisplay');
    if (type == 'mosaic') {
        displayButton.innerHTML = globalThis.blogButton;
        replaceClass('divPhoto', 'divPhotoMini');
        replaceClass('photo', 'photoMini');
        replaceClass('divImageBlog', 'divImageMosaic');
        hideClass('tagBlog');
        showClass('tagMosaic');
        // Enregistrement cookie
        setCookie('album', 'mosaic', 3);
    } else {
        displayButton.innerHTML = globalThis.mosaicButton;
        replaceClass('divPhotoMini', 'divPhoto');
        replaceClass('photoMini', 'photo');
        replaceClass('divImageMosaic', 'divImageBlog');
        hideClass('tagMosaic');
        showClass('tagBlog')
        // Enregistrement cookie
        setCookie('album', 'blog', 3);
    }
}

// Remplacer boutons
//let triButton = document.getElementById('boutontri');

// Toggle pour afficher/masquer le detail de la photo
function switchInfo(i) {
    document.querySelectorAll('.info').forEach(function (elem) {
        // On masque toutes les icones infos sauf celui selectionne
        if (elem.id != 'info' + i) {
            elem.setAttribute("src", "icons/information.png");
        }
    });

    // Change l'icone information de gris en bleu
    let img = document.getElementById('info' + i);
    if (img.getAttribute("src") == "icons/information.png") {
        img.setAttribute("src", "icons/information-on.png");
        img.setAttribute("title", "Masquer les infos");
    } else {
        img.setAttribute("src", "icons/information.png");
        img.setAttribute("title", "Afficher les infos");
    }
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) {
            res = val.substring(name.length);
        }
    })
    return res
}

function getLocation(n) {
    if (lat[n]) {
        let divLoc = document.getElementById('loc' + n);
        let url = "https://api.geoapify.com/v1/geocode/reverse?lat=" + lat[n] + "&lon=" + lon[n] + "&lang=fr&format=json&apiKey=6c4bc9a27ab14576a0aeec77af80f1aa";
        let request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send();

        if (request.responseText !== null) {
            let result = JSON.parse(request.responseText);
            //console.log(result.results[0])
            let city = typeof result.results[0].city !== 'undefined' ? result.results[0].city : '';
            let county = typeof result.results[0].state !== 'undefined' ? ', ' + result.results[0].state : '';
            let country = typeof result.results[0].country !== 'undefined' ? ' (' + result.results[0].country + ')' : '';
            divLoc.innerHTML = city + county + country;
        }
    }
}

// On initialise une carte dans chaque div photo
function displayMap(n) {
    // Div de la map
    let divMap = document.getElementById('map' + n);
 
    if(divMap) {
        // Calcul de la hauteur de la map pour qu'elle atteigne le bas de page
        let divDetail = document.getElementById('loc' + n);
        // Objet avec les dimensions de divDetail
        var domRect = divDetail.getBoundingClientRect();
        // Différence entre la taille de la fenêtre et le bas de divDetail
        var spaceBelow = window.innerHeight - domRect.bottom;
        console.log(domRect.bottom)
        // Hauteur de la div Map = spaceBelow - 15px (5 en haut et 10 en bas)
        let mapHeight = spaceBelow - 45;

        divMap.setAttribute('style', 'height: ' + mapHeight + 'px');

        var Icon = L.icon({
            iconUrl: 'icons/marker.png',
            iconSize: [32, 32], // size of the icon
            iconAnchor: [5, 31], // point of the icon which will correspond to marker's location
        });

        if (lat[n]) {
            // Detruit la map si elle exite deja
            var container = L.DomUtil.get('map' + n);
            if (container != null) {
                container._leaflet_id = null;
            }

            // Cree la map
            let map = L.map('map' + n).setView([lat[n], lon[n]], 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 20,
            }).addTo(map);

            L.marker([lat[n], lon[n]], { icon: Icon }).addTo(map);
        }
    }
}

  