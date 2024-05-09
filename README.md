# arcadia
This photo album in plain javascript allows you to display the contents of photo folders.<br />
It uses <a href="https://github.com/MikeKovarik/exifr">exifr</a> to display the metadata contained in each photo.<br />
As well as <a href="https://github.com/fancyapps/fancybox">fancybox</a> for displaying photos in original format.<br />
Photos are displayed in blog or mosaic format.<br /><br />
The first thing to do is to place one or more folders containing photos in the "albums" directory.<br /><br/>
There is already a background image and a title configured by default.<br />
To change the background image, simply place a new image in the <code>styles/images</code> directory, then modify the following line in index.html: <br />
    <code>// Background image
    const bgImage = 'styles/images/image_fond.jpg'</code><br /><br />
To modify the title, simply modify the following line in index.html:<br />
    <code>//Title
    const topTitle = 'Et in arcadia ego';</code><br /><br />

The top right menu contains the following:
<ul>
<li>a drop-down menu to choose the album to display</li>
<li>a button to sort photos alphabetically or by date</li>
<li>a button to reverse the display direction of photos (from A to Z or from the most recent to the oldest)</li>
<li>a button to choose the type of display (blog or mosaic)</li>
<li>a search field for tags contained in photos</li>
</ul>

In blog mode, each photo is displayed with the title, description and tags contained in the photo (Exif or XMP metadata).<br />
An icon (i) allows you to display additional information contained in the photo on the right:
<ul>
<li>camera brand: exifTag.Make</li>
<li>camera model: exifTag.Model</li>
<li>photo width: exifTag.ExifImageWidth</li>
<li>photo height: exifTag.ExifImageHeight</li> <li>mimeType (jpeg, png, etc.)</li>
<li>latitude : exifTag.GPSLatitude</li>
<li>longitude : exifTag.GPSLongitude</li>
<li>description : exifTag.ImageDescription</li>
<li>aperture : exifTag.FNumber</li>
<li>ISO: exifTag.ISO</li>
<li>speed: exifTag.ExposureTime</li>
<li>focal equ. 35mm: exifTag.FocalLengthIn35mmFilm</li>
<li>description: exifTag.description</li>
<li>title: exifTag.title</li>
<li>credit: exifTag.Credit</li>
<li>copyright: exifTag.rights</li>
<li>creator: exifTag.creator</li>
<li>date: exifTag.CreateDate</li>
<li>tags: exifTag.subject</li>
<li>persons: exifTag.PersonInImage</li>
</ul>
In mosaic mode, the tags and persons are displayed in the info panel.<br /><br />
By clicking on a photo, you open the Fancybox script which displays the album horizontally and allows you to see the photos in their original format.
