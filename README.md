## Shaman Website Compiler - IoT Shaman

![npm badge](https://img.shields.io/npm/v/shaman-website-compiler.svg)

Automatically compiles and minifies your HTML, CSS and Javascript files and generates express routes (Node Js) using simple templating technology, or alternatively output the compiled files to a folder then deploy to you Apache / NGINX server. This package is available via NPM and is intended to abstract complex or lengthy processes like file minification, template engine setup, file caching, and server route generation, so that developers can focus of content generation. 

Since the compiler takes raw templates and raw data, then compiles them before the page is ever requested, server response times are BLAZING fast. Shaman Website Compiler also has options for managing SEO (Search Engine Optimization), making it easier for your website to be found by search engines like Google, Bing, Yahoo, etc.

This project is inspired by projects like Webpack and Angular CLI, which provide similar tooling for the development of web "applicatoins". Since those tools are mostly designed for data-intensive application development, I find them to be unnecessarily bulky for projects like small web "site" development. Shaman Website Compiler aims to provide the power of pre-compilation and file minification, while remaining MUCH smaller in size, and making decisions with web "site" development in mind. 

### Requirements

In order to use this package in your web site project, you will need the following resource(s):

- npm

### Setting up your Workspace

This project has a complimentary starter kit called [Ultimate Node Website](https://github.com/iotshaman/ultimate-node-website). I recommend downloading this project and using it as a starter kit the first time you use this plugin, as it will significantly reduce the amount of time it will take to familiarize yourself with the tools the compiler offers. The README file for [Ultimate Node Website](https://github.com/iotshaman/ultimate-node-website) has a "Quick Start" section that describes how to get it downloaded and running, please refer to this file to setup your workspace, then continue to the next section.

### API

Please refer to the following documentation to learn about the different features / options that are available. If you have any questions or need additional help, please go to [iotshman.com](https://www.iotshaman.com) and reach out to us using our social media options.

#### Configuration

```ts
interface WebsiteConfig {
    cwd: string; // CURRENT WORKING DIRECTORY (ROOT FOLDER)
    partials: string[]; // PARTIAL TEMPLATE FILES (HANDLEBARS PARTIALS)
    pages: string[]; // ARRAY OF GLOB PATTERS TO FIND HTML PAGES
    defaults: WebpageDefaults; // DEFAUT VALUES FOR SEO / PAGE BUILDING
    dynamicPages?: DynamicPage[]; // CONVERT 1 TEMPLATE INTO MULTIPLE ROUTES
    scripts?: string[]; // LOCATION OF JAVASCRIT ASSETS
    styles?: string[]; // LOCATION OF CSS ASSETS
    isProd?: boolean; // SET TO TRUE TO TURN ON MINIFICATION AND CACHING
    outDir?: string; // PROVIDE VALUE IF YOU WANT TO EXPORT COMPILED FILES INSTEAD OF LOADING EXPRESS ROUTES
    wwwRoot?: string; // START FOLDER OF ROUTES (WILL BE REMOVED FROM ROUTE PATHS)
    noHtmlSuffix?: boolean; // SET TO TRUE IF YOU DONT WANT '.html' AT THE END OF YOUR ROUTES
    autoWatch?: boolean; // SET TO TRUE IF YOU WANT ROUTES TO BE REGENERATED WHEN FILES ARE CHANGED
    transformData?: (path: string) => any; // PROVIDE DATA TO SECONDARY COMPILATION STEP (RAW-BLOCKS)
}

interface WebpageDefaults {
    title: string; // WILL BE MAPPED TO TITLE TAG IN HTML HEADER
    description: string; // WILL BE MAPPED TO DESCRIPTION TAG IN HTML HEADER
}

interface interface DynamicPage {
    template: string; // TEMPLATE SOURCE FILE
    routes: string[]; // ROUTES THAT RESOLVE TO THIS TEMPLATE FILE
}
```

#### Template Engine

Shaman Website Compiler has Handlebars templating built-in. Handlebars is a well-supported, time-tested templating engine based built for Javascript; it is very easy to learn and developers can jump right in and learn as they go. Please refer to their [homepage](https://handlebarsjs.com/) to learn more about how it works under the hood.

the compiler adds more tooling on top of the default Handlebars capabilities, making it even faster to get your new content developed. Below is a (working) list of the additional template features that are available:

##### Data-injection

When the compiler has located all HTML files matching the pattern in the config variable "pages", it will look for files with the EXACT same paths that have the extension '.json' instead of '.html'. The compiler will then use the data in each of these files to inject into the corresponding '.html' template file. This allows users to definte templates that compile differently based on variables defined in JSON files.

##### Custom, auto-generated partials

In the starter kit mentioned in the above section 'Setting up your Workspace", the file 'views/index.html' has the following header element:

```html
<head>
    <!-- THE BELOW CODE IS HANDLEBARS SYNTAX FOR A PARTIAL FILE REFERENCE -->
    {{> views/meta-tags/meta-tags.partial.html }}
    <!-- HANDLEBARS SECTIONS STARTING WITH $ DENOTE A BUILT-IN COMPILER DIRECTIVE (SEE GITHUB) -->
    {{> $.tags }}
    {{> $.styles }}
    {{> views/tag-partials/font-awesome.partial.html }}
    {{> $.scripts }}
</head>
```

You should notice the handlebars directives that start with the "$" symbol; these are custom partial files available to developers. These handlebars partials function just like regular handlebars partials and use the injected data (see above sections) to render the output.

**{{ $.tags }}:** Adds SEO-specific meta-tags. In order for this tag to be effective, you will need to include data in each HTML file's corresponding JSON file (see above section "Data-injection"). The SEO tags will look for the following variables in your when compiling (if the variables aren't present it will simply skip over it):

- title - title, og_title, twitter_title meta tags
- description - description / og_desc / twitter_desc meta tags
- og_type - Open Graph Type (for search engines)
- og_url - URL of the web page (for search engines)

**{{ $.styles }}:** Automatically injects the CSS files that were found, based on the glob pattern provided in the config's "styles" property. These styles will be laoded in alphanumeric order, so if your styles need special order you can order them alphanumerically. When in production mode, these styles will bundled into 1 file and minified.

**{{ $.scripts }}:** Automatically injects the javascript files that were found, based on the glob pattern provided in the config's "scripts" property. These scripts will be laoded in alphanumeric order, so if your scripts need special order you can order them alphanumerically. When in production mode, these scripts will bundled into 1 file and minified.

##### Auto compile / caching
When you are running your application server locally you will notice that the command line says "updating express routes" whenever you change an HTML file. This allows you to start your server locally, begin making changes to the files, and be able to view those changes without having to restart the computer. This will only work for HTML files that already existed when the server was started, so if you add any new files you will still need to restart the server.