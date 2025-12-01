# arcadia
This photo album in plain javascript allows you to display the contents of your photo folders as well as the metadata contained in each photo, using exifr<br />
Photos can be displayed as a blog or thumbnail mosaic.
<br /><br />
<!--Try it yourself - <a href="http://arcadia.lbpu3811.odns.fr" target="_blank">demo</a>-->
<br />
## Installation
Copy all the directories and files on your server location.
Then place one or more folders containing photos in the <code>albums</code> directory.

### Settings
You can add an background image in the <code>styles/images</code> directory. Modify the css file 'styles/styles.css': --background-image: url("images/your_image.jpg");.<br />
<br />
By default, the title is the name of the directory selected. If you want to display a fixed title, set the variable setFixedTtitle to 1 in 'js/config.js'.
<br />
<code>
/** SETTINGS  */
// Title
const fixedTitle = 'my_title';
// Enable/Disable fixed title. Set to 0 to use the photo directory name as title
const setFixedTitle = 0 // Set to 1 if you want to display the fixedTitle
// photos directory
const imageDir = 'albums';
// index page
const index = 'album.html';
</code>

## Use
The top right menu contains the following:
<ul>
<li>a drop-down menu to choose the album to display</li>
<li>a button to sort photos alphabetically or by date</li>
<li>a button to reverse the order of photos (A->Z or most recent to oldest) or (Z->A or oldest to most recent)</li>
<li>a button to switch the display mode blog or mosaic</li>
<li>a search field to manually select one or more tags</li>
</ul>

### Blog
In this mode, each photo is displayed with the title, description and tags from the photo metadata.

### Mosaic
In this mode, photos are displayed in mosaic thumbnails.

### Metadata
For each photo, an information panel displays the metadata:
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
Clicking on a photo will display it in the fancybox interface.

## Credits
I used the awesome EXIF reading library <b><a href="https://github.com/MikeKovarik/exifr">exifr</a></b> to read photo metadata.<br />
As well as the very nice interface <b><a href="https://fancyapps.com/fancybox/">fancybox</a></b> to display the photos in their original format.

## Contributing

Contributions are welcome. Suggestions, bug, etc.<br />
