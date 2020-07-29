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

Application configuration is managed in the "factory.json" file, in your project's root folder. While you can technically store this configuration anywhere, by using "factory.json" as your configuration file you will be able to leverage other tooling (coming soon). 

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
|`root`|string|"./src"|Path (relative or absolute) to your source files. This is refered to in this document as the source folder.
|`logLevel`|string|"info"|Set log level ("error", "warn", "info", "debug", "silly").
|`production`|boolean|false|When true, files will be minified and bundles injected. When false, a development server will be started and bundles will be expanded, when injected.
|`pages`|string[]|["\*\*/\*.html", "!\*\*/\*.partial.html"]|Glob pattern to locate HTML files.
|`partials`|string[]|["\*\*/\*.partial.html"]|Glob pattern to locate handlebars "partial" files (see ""Handlebars Partials").
|`helpers`|string[]|["\*\*/\*.helper.js"]|Glob pattern to locate handlerbars "helpers" (see "Handlebars Helpers").
|`scripts`|string[]|["\*\*/\*.js", "!\*\*/\*.helper.js"]|Glob pattern to find javascript files.
|`styles`|string[]|["\*\*/\*.css"]|Glob pattern to find css files.
|`assets`|string[]|See "Building Asset Files"|Glob pattern to find asset files.
|`output`|string|null|Folder path (relative or absolute) to output compiled files.
|`serve`|boolean|true|Turn off development server when not in production.
|`sitemap`|custom|default|See "Sitemap Generation"
|`adapter`|custom|default|See "Database Adapters"

## Templating Engine

The Shaman Website Compiler comes with [handlebars](https://handlebarsjs.com/) templating engine built-in. Handlebars is a feature-rich, fast, easy-to-use and reliable templating engine, allowing you to separate the logic of your website from the layout. For guidance on how to write handlebars templates, please [click here](https://handlebarsjs.com/). 

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

- **path:** URL path for the file (for example, "blog/").
- **name:** The name of the property in your query results that represents your URL (filename). For example, if you have a query that returns blog objects, and each blog object has a property called "routeUrl", you could use this for the "name" property. When the compiler runs, each blog item would create a new HTML page with the URL (filename) matching the value in "routeUrl". 
 
Finally, add a query (see "Database Queries") to your file model's "shaman.query" array, and set the "dynamic" property on the query to "true".

### Database Queries

Your file model can define as many queries as you would like. This requires you to have configured a database adapter (see "Database Adapters"), and to have an existing storage solution, like a [json-repo](https://www.npmjs.com/package/json-repo) or Mongo DB. Once you have configured your database adapter, you can create queries. Below is the interface for queries (please note, each query adapter has different requirements for how to use these properties):

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

**Note:** When you set the "dynamic" variable to 'true', you are telling the compiler that this query should create a unique page for each object the query returns; use this in conjunction with the "shaman.dynamic" property to use 1 template to create multiple pages.

### Bundles

One way to significantly improve your SEO score is to reduce the amount of different files that need to be loaded for your page to be rendered. A common strategy to accomplish this is to bundle similar files into a single file. To configure a bundle for your HTML page, use your file model's "shaman.bundles" array. Below is the interface for the bundle configuration:

```ts
export interface IBundle {
  name: string;
  type: string;
  files: string[];
}
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

**Note:** To access another file model's bundle, the Shaman Website Compiler has a special handlers helpers:

```html
<head>
  {{{style 'name-of-exported-bundle.css'}}}
  {{{script 'name-of-exported-bundle.js'}}}
</head>
```

## Database Adapters

If you are simply developing a static website, you probably have no need for a database. However, for more sophisticated, dynamic websites, you will typically need something to store persistent data. The Shaman Website Compiler takes an agnostic approach to persistent storage, using the concept of a *database adapter* to abstract database communication. Instead of having to worry about writing code to connect to and manage your database, you can simply configure a database adapter in your 'factory.json' file and configure your queries in individual file models. 

There are 3 built-in database adapters (json-repo, http, and mongo-db) which you can use with minimal configuration. If these built-in adapters do not cover all of your requirements, or you need to use a persistence solution not already built-in, you can create your own implementation of a database adapter and configure it with ease. 

Each database adapter implements the below interface; to add your own custom adapter, simply create an implementation of the interface.

```ts
export interface IQueryAdapter {
  openConnection: () => Promise<void>;
  run: (query: IQueryModel) => Promise<any[]>;
}
```

### Configuring an Adapter

In order to use queries in your file models, you will need to configure your data adapter. The 'factory.json' file has an 'adapter' property that accepts the below interface:

```ts
export interface IAdapterConfig {
  module?: string;
  name: string;
  configuration: any;
}
```

- **module:** Name of installed node module (or path to a local js file) that contains your exported implementation of IQueryAdapter. This defaults to "shaman-website-compiler".
- **name:** The name of the exported implementation of IQueryAdapter. For example, "JsonRepoAdapter".
- **configuration:** Adapter-specific configuration (connection strings, timeouts, etc). Each adapter has its own configuration interface.

### Json Repository Adapter

The json repo adapter allows you to use a local JSON file as your data source, and can be used to create dynamic pages, without having to connect to any external databases. When configuring the json repo adatper in your 'factory.json' file, use the *name* value of "JsonRepoAdapter". 

The json repo adapter takes a configuration object with the below interface:

```ts
interface JsonRepoAdapterConfig {
  dataPath: string;
  models: string[];
}
```

- **dataPath:** Path (relative or absolute) to your persistent JSON file.
- **models:** A list containing the names of the objects to store. For example, a website that showcases blogs and products would have 2 models, 'blogs' and 'products'.
 
To create a json-repo database file, simply add a JSON file anywhere on your computer (preferably in your project folder) and follow the below interface (using the blog / product example from above):

```js
{
  "blogs": [
    {
      "key": "blog1.html",
      "value": {
        "name": "blog1.html",
        "title": "Test Blog",
        "description": "A sample blog entry in json-repo database",
        "content": "This is where you would put the blog content..."
      }
    }
  ],
  "products": [
    {
      "key": "My Awesome Product",
      "value": {
        "name": "My Awesome Product",
        "price": 100.00,
        "description": "Sample description for my awesome product"
      }
    }
  ]
}
```

Notice each model has an array of objects, each stored in a key-value pair. For more information on the json-repo databse, [click here](https://www.iotshaman.com/blog/content/how-to-use-json-repo-as-a-light-weight-database-alternative)

To configure queries for a json-repo database, use the IQueryModel interface and follow the below implementation guidelines:

- **name:** This is the name you will use in your HTML template to refer to this query's result set.
- **path:** The name of the model you are querying
- **args:** Takes 1-2 arguments. If you provide "*" it will return all objects. If you wish to filter these objects by a property, pass the name of the property in the first argument, then the expected value as the second argument. For example, to filter blogs to only the ones where the property "tag" equals "technology", your "args" property would look like `["tag","technology"]`.
- **limit:** Only returns the top *n* elements from the result set. This should be used in conjunction with "sort".
- **sort:** Sorts the result set, based on a "key" (name of property). Use the "descending" property if you want to reverse the order.

### Http Adapter

The HTTP adapter allows you to make HTTP requests to fulfil query requests. If you have an existing RESTful API and want to use this data to populate your website, this is the adapter for your. When configuring the HTTP adatper in your 'factory.json' file, use the *name* value of "HttpAdapter". 

The HTTP adapter takes a configuration object with the below interface:

```ts
interface HttpAdapterConfig {
  apiBaseUri: string;
}
```

To configure queries for a RESTful API, use the IQueryModel interface and follow the below implementation guidelines:

- **name:** This is the name you will use in your HTML template to refer to this query's result set.
- **path:** URL that you wish to query (should be a GET endpoint). For example, if you setup your adapter with the "apiBaseUri" value of "https://mywebsite.com/", and setup a query with the "path" value of "blogs/technology", the query would send a GET request to "https://mywebsite.com/blogs/technology".
- **args:** Not used in HTTP adapter queries.
- **limit:** Only returns the top *n* elements from the result set. This should be used in conjunction with "sort".
- **sort:** Sorts the result set, based on a "key" (name of property). Use the "descending" property if you want to reverse the order.

### Mongo Adapter

The mongo adapter allows you to query a mongo database. If you have an existing Mongo DB database and want to use this data to populate your website, this is the adapter for your. When configuring the mongo adatper in your 'factory.json' file, use the *name* value of "MongoAdapter".

The mongo adapter takes a configuration object with the below interface:

```ts
interface MongoAdapterConfig {
  mongoUri: string;
  options: any;
}
```

- **mongoUri:** The URI to connect your Mongo DB instance.
- **options:** Connection options for Mongo DB. For a full list of options, [click here](http://mongodb.github.io/node-mongodb-native/3.5/reference/connecting/connection-settings/).

To configure queries for a Mongo DB database, use the IQueryModel interface and follow the below implementation guidelines:

- **name:** This is the name you will use in your HTML template to refer to this query's result set.
- **path:** The name of the mongo "collection".
- **args:** This argument takes a mongo query object, represented in JSON, which will be passed to the "collection.find" mongo request. For example, to find all blogs with the "tag" value of "technology", you could use `{"tag": "technology"}`.
- **limit:** Only returns the top *n* elements from the result set. This should be used in conjunction with "sort".
- **sort:** Sorts the result set, based on a "key" (name of property). Use the "descending" property if you want to reverse the order.

## Sitemap Generation

Every time you build your website the compiler will gather all URLs for your website and generate a sitemap. By default, the sitemap generator will use "http://localhost:3000" as the hostname; however, you can configure this in your 'factory.json' file. Below is the interface for sitemap configuration:

```ts
export interface ISitemapConfig {
  hostname: string;
}
```

## Building Asset Files

Every website has files that dont fall into the category of source code; these files are often called *assets*. For example, almost every website will have images of some kind, and probably a 'robots.txt' file. The 'factory.json' configuration file provides a property, "assets", that allows you to specify what kinds of asset files should be included in the build output. By default, the following files are included:

- PNG
- SVG
- JPG / JPEG
- ICO
- TXT

To change this, simply provide an array of glob patterns to the "assets" property in your 'factory.json' file. For example, to include all "mp4" and "png" asset files, you would use the following value: `["**/*.mp4","**/*.png"]`.
