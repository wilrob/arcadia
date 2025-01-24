# arcadia
This photo album in plain javascript allows you to display the contents of your photo folders as well as the metadata contained in each photo<br />
Photos can be displayed as a blog or thumbnail mosaic.
<br /><br />
Try it yourself - <a href="http://arcadia.lbpu3811.odns.fr" target="_blank">demo</a>
<br />
## Installation
Copy all the directories and files on your server location.
Then place one or more folders containing photos in the <code>albums</code> directory.

### Settings
By default, the title is the name of the directory selected. If you want to display a fixed title, set the variable setFixedTtitle to 1.
<br />
There is already a background image by default.<br />
To change the background image, simply place a new image in the <code>styles/images</code> directory, then modify the following lines in index.html: <br />
<code>
/** USERS SETTINGS  */
// Fixed Title
const fixedTitle = 'MY TITLE';
const setFixedTitle = 0 // Set to 1 if you want to display the fixedTitle
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
In each display mode, by clicking on &#9432; at the left bottom of each photo, you will display an information panel with photo metadata, such as:
<ul>
    <li>title and description</li>
    <li>tags and persons</li>
    <li>author, file name, date</li>
    <li>credit and rights</li>
    <li>equipment and model</li>
    <li>photo width x height, size, mimeType (jpeg, png, etc.)</li>
    <li>ISO, focal, aperture, speed</li>
    <li>location & map (OpenStreeMaps)</li>
</ul>

Metadata can be added or edited using tools such as Photoshop or <a href="https://exiftool.org/gui/" target="_blank">exiftool</a>.

### Fancybox display
Click on a photo to view it in its original format.

## Credits
I used the awesome EXIF reading library <b><a href="https://github.com/MikeKovarik/exifr">exifr</a></b> to read photo metadata.<br />
As well as the very nice interface <b><a href="https://fancyapps.com/fancybox/">fancybox</a></b> to display the photos in their original format.

## Contributing

Contributions are welcome. Suggestions, bug, etc.<br />

The next step is to edit the XMP information online. If anyone knows how to save an xmp file to a photo, I'm really interested. THANKS.