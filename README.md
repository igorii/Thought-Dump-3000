Website
=======

This is the repository for Tim Thornton's personal website. It is built with Node.js using Express and MongoDB, with some sprinkles of D3 and jQuery.

The CMS involves authoring articles in Markdown. Once published, the article's markdown source is added to the database, as well as the rendered html to avoid rendering on every page hit.

Editing an article will serve the original markdown, and update the rendered once published.

Only the Blog entries are persisted in MongoDB, the Projects and other pages are static views.
