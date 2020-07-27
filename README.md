## Shaman Website Compiler - IoT Shaman

![npm badge](https://img.shields.io/npm/v/shaman-website-compiler.svg) ![Build Status](https://travis-ci.org/iotshaman/shaman-website-compiler.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/iotshaman/shaman-website-compiler/badge.svg?branch=master)](https://coveralls.io/github/iotshaman/shaman-website-compiler?branch=master)

### Build high quality websites with minimal effort. Just start designing!

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

## Application Configuration

Application configuration is managed in the "factory.json" file, in your project's root folder. While you can technically store this configuration anywhere, by using "factory.json" as your configuraiton file you will be able to leverage other tooling (coming soon). 

```ts
export interface IWebsiteConfig {
  root?: string;
  logLevel?: string;
  production?: boolean;
  pages?: string[];
  partials?: string[];
  helpers?: string[];
  scripts?: string[];
  styles?: string[];
  assets?: string[];
  output?: string;
  serve?: boolean;
  sitemap?: {
    hostname: string;
  };
  adapter?: {
    module?: string;
    name: string;
    configuration: any;
  };
}
```

Configuration settings are entirely optional, and each property has a default value. The below grid gives some additional default to help you configure your website:

|Property|Type|Default|Description|
|---|---|---|---|
|root|string|"./src"|Path (relative or absolute) to your source files.
|logLevel|string|"info"|Set log level ("error", "warn", "info", "debug", "silly").
|production|boolean|false|When true, files will be minified. When false, a development server will be started.
|pages|string[]|["\*\*/\*.html", "!\*\*/\*.partial.html"]|Glob pattern to locate HTML files.
|partials|string[]|["\*\*/\*.partial.html"]|Glob pattern to locate handlebars "partial" files (see ""Handlebars Partials").
|helpers|string[]|["\*\*/\*.helper.js"]|Glob pattern to locate handlerbars "helpers" (see "Handlebars Helpers").
|scripts|string[]|["\*\*/\*.js", "!\*\*/\*.helper.js"]|Glob pattern to find javascript files.
|styles|string[]|["\*\*/\*.css"]|Glob pattern to find css files.
assets|string[]|See "Building Asset Files"|Glob pattern to find asset files.
|output|string|null|Folder path (relative or absolute) to output compiled files.
|serve|boolean|true|Turn off development server when not in production.
|sitemap|custom|default|See "Sitemap Generation"
|adapter|custom|default|See "Database Adapters"

## Templating Engine

The Shaman Website Compiler comes with [handlebars](https://handlebarsjs.com/) templating engine built-in. Handlebars is a feature-rich, fast, easy-to-use and reliable templating engine, allowing you to separate the logic of your website from the layout. For guidance on how to write handlebars templates, please [handlebars](https://handlebarsjs.com/) (click here). 

### Handlebars Helpers

The default method of adding custom handlebars helpers to your website is to create a file with the extension ".helper.js" in your project's source folder (default "./src"); this can be configured in your factory.json file. Below is a sample helper file:

```js
handlebars.registerHelper('date', function(date, format) {
  if (!format) format = 'MMMM Do YYYY';
  return moment(date).format(format);  
});
```

Each helper file has access to 2 global objects (handlers.js and moment.js), and should call handlebars.registerHelper().

### Handlebars Partials

The default method of adding "partial" html files is to create a file with the extension ".partial.html" in your projects source folder (default "./src"); this can be configured in your factory.json file. Below is an example partial file:

```html
<!-- filename: title.partial.html -->
<title>{{model.title}}</title>
```

To use the partial file in an HTML page, simply reference its path, relative to the projects source folder, like so:

```html
<head>
  {{> title.partial.html}}
</head>
```

## File Models

Every HTML page may have an optional JSON file, called the "file model", that can configure the HTML page. To add a file model to an HTML page, simply create a file with the same name, but a ".json" extension instead of ".html". The file model can hold any custom properties you want to be available in your template; this data can then be accessed by using the "model" property in your template variable. For example:

**sample.json**
```js
{
  "foo": "bar"
}
```

**sample.html**
```html
<div>
  {{model.foo}}
</div>
```

The file model can also contain compiler variables, which allow you to configure certain compiler behaviors. To configure compiler behavior, create a property in your file model with the name "shaman". Below is the interface for the compiler configuration:

```js
export interface IFileModelConfig {
  dynamic?: { path: string, name: string };
  query?: QueryModel[];
  bundles?: Bundle[];
}
```

### Dynamic File Configuration

A dynamic file allows you to use 1 template to create multiple pages. To create a dynamic file template, first create an HTML page with your core template, then add a file model. Next, in your file model's "shaman.dynamic" property, add an object that contains a "path" and a "name" property

- **path:** URL path for the fie (for example, "blog/").
- **name:** The name of the property in your query results that represents the name of the file (see "Database Queries").
 
Finally, add a query (see "Database Queries") to your file model's "shaman.query" array, and set the "dynamic" property on the query to "true".

### Database Queries

Your file model can define as many queries as you would like. This requires you to have configured a database adapter (see "Database Adapters"), and to have an existing storage solution, like a [json-repo](https://www.npmjs.com/package/json-repo) or Mongo DB. Once you have configured your database adapter, you can create queries. Below is the interface for queries (please not, each query adapter has different requirements for how to use these properties):

```ts
export interface IQueryModel {
  name: string;
  path: string;
  dynamic?: boolean;
  args?: any[] | {};
  limit?: number;
  sort?: { key: string, descending?: boolean };
}
```

For example, here is a json-repo query (see "Database Adapters -> Json Repo") to fetch the last 10 newest blogs, and the HTML code to display it:

**sample.json**
```js
{
  "shaman": {
    "query": [{
      "name": "recentBlogs",
      "path": "blogs",
      "args": ["*"],
      "limit": 10,
      "sort": { "key": "date", "descending": true }
    }]
  }
}
```

**sample.html**
```html
{{#each query.recentBlogs}}
  <h2>{{this.title}}</h2>
  <small>By {{this.author}}, {{this.date}}</small>
  <br />
  <p>{{this.description}}</p>
{{/each}}
```

### Bundles

One way to significantly improve your SEO score is to reduce the amount of different files that need to be loaded for your page to be rendered. A common strategy to accomplish this is to bundle similar files into a singular file. To configure a bundle for your HTML page, use your file model's "shaman.bundles" array. Below is the interface for the bundle configuration:

```ts
export interface IBundle {
  name: string;
  type: string;
  files: string[];
|
```

- **name:** The name of the bundle, for you to reference in your HTML page.
- **type:** Either "js" for javascript bundles, or "css" for CSS bundles.
- **files:** List of file paths, relative to your project's source folder.

For example, if you wanted to bundle 2 CSS files that are specific to your "sample.html" page, you could configure it like so:

**sample.json**
```js
{
  "shaman": {
    "bundles": [
      {
        "name": "sample.styles.bundle",
        "type": "css",
        "files": [
          "styles/index.css",
          "styles/card.css"
        ]
      }
    ]
  }
}
```

**sample.html**
```html
<head>
  {{{bundles model.shaman.bundles}}}
</head>
```

**Note:** When in development mode (factory.json "production = false") your bundles will be generated, but will actually create individual links for each style sheet; this is to help with debugging using developer tools in your browser of choice.