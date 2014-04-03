XYZ
=======

XYZ is a simple blog application with one goal: no hassle. This goal is realized both in the simplicity of creating content, but also in setting up the application.

XYZ uses *Node.js* on the backend, with MongoDB for persistence of blog posts and drafts. At the high level, an MVC approach is taken, using *mongoose* as the database interface to create a clean approach that approximates the Active Record design pattern. Views are implemented using templates in *Embedded JavaScript*.


## Setup and run

    git clone https://github.com/igorii/XYZ
    cd XYZ
    npm install

At this point, XYZ is installed and ready to run, but before we go ahead with that, the configuration should be set up to reflect your blog.

Edit config.json with the appropriate information.

    "user"        : Set your login username
    "pass"        : Set your login password
    "secret"      : Set a unique string for securing sessions
    "port"        : Set the port your server should listen on (default 3000)
    "dbport"      : Set the port that the mongod instance is listening on (default 27017)
    "db"          : Set the database name within the mongod instance to use (default "blog")
    "website"     : Specify the domain of the website
    "fullname"    : Specify your full name for RSS and templates
    "description" : Specify a description of the blog for RSS

Great, now go ahead and start the engines!

    # start mongod instance
    npm start

## Blogging

This is why this exists. XYZ tries to stay out of your way as much as possible. To do this, a very small feature set is available, but it just works.

Simply login, create a new post, write your post in markdown, then save it or publish it. When publishing, the post will save an html render in the database to avoid render costs on every page hit.

That's it.

Of course, posts and drafts can be editted/updated at any time.


## Todo

There is still much to do to provide a better experience.

* The authoring page needs some stylistic design love
* Ideally, there should be an easy way for a user to add static pages (about, etc) without having to write html

