# Draw.io GitHub Integration

![Diagram](http://alderg.github.io/drawio-github/diagram.png)

<a href="http://alderg.github.io/drawio-github/edit-diagram.html?repo=drawio-github&path=diagram.png" target="_blank">Edit</a> | <a href="https://www.draw.io/?url=http%3A%2F%2Falderg.github.io%2Fdrawio-github%2Fdiagram.png" target="_blank">Edit As New</a>

<a href="http://alderg.github.io/drawio-github/edit-diagram.html" target="_blank">edit-diagram.html</a> does the I/O with GitHub and uses draw.io in embed mode for the editing. The page supports the following URL parameters: user, pass, repo, path, ref and action=open (the Edit link above is an example). Using action=open, links for immediate diagram editing in GitHub can be created (requires user and pass parameters). You can also use files on GitHub as templates in draw.io via the url parameter (see Edit As New above).

![Self-editing Diagram](http://alderg.github.io/drawio-github/self-editing.svg)

<a href="http://www.alderg.com/drawio-github/self-editing.svg" target="_blank">self-editing.svg</a> is an SVG file with an embedded PNG. (SVG should only be used if foreignObjects are supported.) This combines an image format (eg. for <img src="...") with scripting for the editing roundtrip. (Click on the link, not the image to enable roundtrip editing.)

Supported file formats: .png, .svg, .html and .xml (default)
