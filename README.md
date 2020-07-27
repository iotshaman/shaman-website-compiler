## Shaman Website Compiler - IoT Shaman

![npm badge](https://img.shields.io/npm/v/shaman-website-compiler.svg) ![Build Status](https://travis-ci.org/iotshaman/shaman-website-compiler.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/iotshaman/shaman-website-compiler/badge.svg?branch=master)](https://coveralls.io/github/iotshaman/shaman-website-compiler?branch=master)

### Build high-quality websites with minimal effort. Just start designing!

Build high-quality websites that are SEO-friendly and blazing fast, without all the annoying configuration, minfication, bundling, etc. With Shaman Website Compiler you get all of these features, and more, with a simple configuration file. Some of the features include

- Javascript file minifcation
- CSS file minification
- HTML file minification
- HTML Templating (with easy-to-configure models)
- XML Sitemap generator
- Built-in database connectivity
- File bundling (to reduce http requests)
- Dynamic route generation
- Much more!

### Requirements
- Node JS

### Quick Start

To get started, we first need to create a Node JS project and install our dependencies. Create a folder to store your website code, then open a terminal window for that folder.

```sh
npm init
npm install shaman-website-compiler --save
```

#### Configuring the Website Compiler

The website compiler requires a configuration file to operate properly, so the first thing we need to do is generate this file. Create a file in your project folder called 'factory.json' and add the following text:

```js
{
  "production": false,
  "output": "./dist"
}
```

Once we have a configration file, we need a javascript file to import the Shaman Website Compiler and kick off the build. Create a file in your project folder called 'index.js' and add the following code:

```js
let WebsiteFactory = require('shaman-website-compiler').WebsiteFactory;

// Configuring compiler
let config = require('./factory.json');
let website = WebsiteFactory(config);

// Building sample website
website.build().then(routes => {
  // do something (optional)
}).catch(ex => {
  console.log(`Compiler error: ${ex}`);
})
```

Finally, we need to configure this as our start script in the package.json file. Open 'package.json' and update the scripts object to look like this:

```js
{
  ...
  "scripts": {
    "start": "node index.js"
  }
  ...
}
```

#### Configuring your Website

In your website project folder, create a new folder called "src" and add 2 files "index.html" and "index.json" Once you have added these files, your project's folder structure should look like:

```
my-website
|___ src/
    |-- index.html
    |-- index.json
|-- factory.json
|-- index.js
|-- package.json
```

Now we need to setup the "file model" for our home page. Open the "src/index.json" file and add the following text:

```js
{
  "title": "My Awesome Website"
}
```

Then, open the "src/index.html" page and add the following text:

```html
<html>
  <head>
    <title>{{model.title}}</title>
  </head>
  <body>
    Hello World!
  </body>
</html>
```

Notice the text that says "{{model.title}}"? This is a template variable, when the compiler runs it will look into the "file model" that corresponds to your HTML page, which in the event of "index.html" is "index.json". When the compiler renders this template, it will remove everything in between the two braces and inject the variable "title" (found in your file model), resulting in the following HTML:

```html
<html>
  <head>
    <title>My Awesome Website</title>
  </head>
  <body>
    Hello World!
  </body>
</html>
```

Finally, open a terminal for your project folder and type "npm start". After some output, you should notice that a new folder "dist" was created. Also, the terminal should say "Development server listening on port: 3000"; open a web-browser (Google Chrome, Firefox, Edge) and navigate to "http://localhost:3000", you should see your website content!

Congratulations, you are now up and running with your awesome new website! This is really just the tip of the iceberg that is Shaman Website Compiler, so keep reading below to see how to configure the rest of your website, including javascript files, css files, asset files (images, videos, etc.), and much more. 