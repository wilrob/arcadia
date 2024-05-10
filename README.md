# arcadia
This photo album in plain javascript allows you to display the contents of photo folders.<br />
It uses <a href="https://github.com/MikeKovarik/exifr">exifr</a> to display the metadata contained in each photo.
As well as <a href="https://fancyapps.com/fancybox/">fancybox</a> for displaying photos in original format.<br />
Photos are displayed in blog or mosaic format.

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
<li>a drop-down menu <button><img src="icons/dossier.png" width="16" /></button> to choose the album to display</li>
<li>a button to sort photos alphabetically <button><img src="icons/alpha.png" width="16" /></button> or by date <img src="icons/calendar.png" width="16" /></li>
<li>a button to reverse the display direction of photos <img src="icons/arrowDown.png" width="16" /> (A to Z and from the most recent to the oldest) or <img src="icons/arrowUp.png" width="16" /> (Z to A or from the oldest to the most recent)</li>
<li>a button to choose the type of display <img src="icons/icon-blog.png" width="16" /> blog or <img src="icons/thumbnail-icon-18.jpg.png" width="16" /> mosaic</li>
<li>a search field <img src="icons/search.png" width="16" /> for tags contained in photos</li>
</ul>

### Blog
In this mode, each photo is displayed with the title, description and tags contained in the photo (Exif or XMP metadata).

### Mosaic
In this mode, photos are displayed in mosaic thumbnails without information.

### Metadata
An icon &#9432; at the left bottom of each photo allows you to display additional information contained in the photo:
<ul>
    <li>title and description</li>
    <li>author, file name, date</li>
    <li>credit and rights</li>
    <li>camera brand and model</li>
    <li>photo width x height, size, mimeType (jpeg, png, etc.)</li>
    <li>ISO, focal, aperture, speed</li>
    <li>a map (OpenStreeMaps) if latitude and longitude are defined</li>
    <li>tags and persons</li>
</ul>

Metadata can be added or edited using tools such as Photoshop or <a href="https://exiftool.org/gui/" target="_blank">exiftool</a>

### Fancybox display
By clicking on the photo, you display it in the original format. You can view the album in horizontal mode.
