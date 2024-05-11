# arcadia
This photo album in plain javascript allows you to display the contents of photo folders.<br />
It uses <a href="https://github.com/MikeKovarik/exifr">exifr</a> to display the metadata contained in each photo.
As well as <a href="https://fancyapps.com/fancybox/">fancybox</a> for displaying photos in original format.<br />
Photos are displayed in blog or mosaic format.
<br /><br />
Try it yourself - <a href="http://arcadia.lbpu3811.odns.fr" target="_blank">demo</a>
<br />
## Installation
Copy all the directories and files on your server location.
Then place one or more folders containing photos in the <code>albums</code> directory.

### Settings
There is already a background image and a title configured by default.<br />
To change the title and the background image, simply place a new image in the <code>styles/images</code> directory, then modify the following lines in index.html: <br />
<code>
/** USERS SETTINGS  */
// Title
const topTitle = 'MY TITLE';
// Background image
const bgImage = 'styles/images/MY_BACKGROUND_IMAGE.jpg'
</code>

## Use
The top right menu contains the following:
<ul>
<li>a drop-down menu <img src="icons/dossier.jpg" width="16" /> to choose the album to display</li>
<li>a button to sort photos alphabetically <img src="icons/alpha.jpg" width="16" /> or by date <img src="icons/calendar.jpg" width="16" /></li>
<li>a button to reverse the order of photos <img src="icons/arrowDown.jpg" width="16" /> (A->Z or most recent to oldest) or <img src="icons/arrowUp.jpg" width="16" /> (Z->A or oldest to most recent)</li>
<li>a button to switch the display mode <img src="icons/icon-blog.jpg" width="16" /> blog or <img src="icons/thumbnail-icon-18.jpg" width="16" /> mosaic</li>
<li>a search field <img src="icons/search.jpg" width="16" /> to manually select one or more tags</li>
</ul>

### Blog
In this mode, each photo is displayed with the title, description and tags from the photo metadata.

### Mosaic
In this mode, photos are displayed in mosaic thumbnails.

### Metadata
In the two modes above, an icon &#9432; at the left bottom of each photo allows you to display information from photo metadata, such as:
<ul>
    <li>title and description</li>
    <li>tags and persons</li>
    <li>author, file name, date</li>
    <li>credit and rights</li>
    <li>equipment and model</li>
    <li>photo width x height, size, mimeType (jpeg, png, etc.)</li>
    <li>ISO, focal, aperture, speed</li>
    <li>a map (OpenStreeMaps)</li>
</ul>

Metadata can be added or edited using tools such as Photoshop or <a href="https://exiftool.org/gui/" target="_blank">exiftool</a>

### Fancybox display
By clicking on the photo, you enlarge the photo at its original format.
