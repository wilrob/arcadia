const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const folderPath = './photos'; // Chemin vers ton dossier de photos

// Crée un serveur HTTP
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const filePath = path.join(__dirname, parsedUrl.pathname);

    // Si la requête est pour la liste des fichiers
    if (parsedUrl.pathname === '/list') {
        // Lire le contenu du dossier 'photos'
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                res.statusCode = 500;
                res.end('Erreur lors de la lecture du dossier');
                return;
            }

            // Filtrer les fichiers pour ne garder que les images
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif';
            });

            // Envoyer la liste des images
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(imageFiles));
        });
    } else {
        // Servir les fichiers statiques (images et autres)
        fs.exists(filePath, exists => {
            if (exists) {
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.statusCode = 404;
                res.end('Fichier non trouvé');
            }
        });
    }
}).listen(8080, () => {
    console.log('Serveur en écoute sur http://localhost:8080');
});
