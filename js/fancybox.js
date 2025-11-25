/**
 * * Affichage plein écran/slide Fancybox
*/
export async function displayFancybox() {
    Fancybox.bind('[data-fancybox]', {
        Carousel: {
            Zoomable: {
                Panzoom: {
                    // Options de zoom et panoramique
                    clickAction: "toggleCover",
                    // Zoom maximum (2x) si image plus petite que le conteneur
                    maxScale: 2,
                    // Déplacement dans l'image avec la souris
                    panMode: "mousemove",
                    // Marge de déplacement
                    mouseMoveFactor: 1.1,
                },
            },
            // Options des miniatures verticales
            Thumbs: {
                type: "classic",
                Carousel: {
                    vertical: true,
                    center: (ref) => {
                        return ref.getTotalSlideDim() > ref.getViewportDim();
                    },
                },
            },
            Toolbar: {
                items: {
                    // Bouton pour afficher les meta-data
                    exif: {
                        tpl: '<button class="f-button"><svg><use href="./icons/sprite.svg#icon-exif"></use></svg></button>',
                        click: () => {
                            const exif = document.getElementsByClassName('data-caption')[0];
                            if (exif) {
                                // Toogle de 'data-caption' et masquage de la carte
                                exif.style.display = exif.style.display === 'block' ? 'none' : 'block';
                                // Masquage des tags, personnes et maps
                                const tag = document.getElementById('tag');
                                if (tag) {
                                    tag.style.display = 'none';
                                }
                                const personne = document.getElementById('personne');
                                if (personne) {
                                    personne.style.display = 'none';
                                }
                                const mapModal = document.getElementById('map-modal');
                                if (mapModal) {
                                    document.getElementById('map-modal').style.display = 'none';
                                }
                            }
                        },
                    },
                },
                display: {
                    /*middle: [
                        "zoomIn",
                        "zoomOut",
                        "toggle1to1",
                        "rotateCCW",
                        "rotateCW",
                        "flipX",
                        "flipY",
                    ],*/
                    right: [
                        "autoplay",
                        "toggleFull",
                        "toggle1to1",
                        "exif",
                        "fullscreen",
                        "thumbs",
                        "close"
                    ],
                },
            }
        }
    });
}