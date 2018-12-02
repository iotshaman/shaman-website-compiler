import { CompilerData } from "../compiler/compiler-data.model";
import { RouteTypes } from './route-types.const';
import { FileData, FileUtils } from "../files";
import { ShamanRouteMap, RouteData, HeaderData } from "./shaman-route.model";
import { minify as Minifier } from 'html-minifier';
import * as Handlebars from 'handlebars';

export class ShamanRouter {

  minifier: any = Minifier;
  handlebars: any = Handlebars;
  private data: CompilerData;
  private utils = FileUtils;
  public routes: ShamanRouteMap = {};

  constructor(data: CompilerData) {
    this.LoadRoutes(data);
  }

  public LoadRoutes = (data: CompilerData) => {
    this.data = data;
    this.routes = this.data.files
      .filter(file => RouteTypes.indexOf(file.type) > -1)
      .reduce((a: ShamanRouteMap, b: FileData) => {
        let name = `/${b.name}`;
        if (b.type == 'html' && this.data.config.dropHtmlSuffix) {
          name = this.utils.RemoveExtension(name, 'html');
        }
        if (b.type == 'html' && this.data.config.wwwRoot) {
          name = name.replace(this.data.config.wwwRoot, '');
        }
        if (!!a[name]) throw new Error(`Shaman Router: route already exists - ${name}`)
        let route: RouteData = this.CreateRoute(b);
        a[name] = this.ApplyHeaders(route);
        return a;
      }, {})
    if (this.data.config.dynamicRoutePlugin) this.data.config.dynamicRoutePlugin(this);
  }

  public Express = (req, res, next) => {
    let routePath = req.url;
    if (routePath.indexOf('?') > -1) {
      routePath = routePath.substring(0, routePath.indexOf('?'));
    }
    else if (routePath.indexOf('#') > -1) {
      routePath = routePath.substring(0, routePath.indexOf('#'));
    }
    if (req.method == "GET" && req.url == '/') {
      if (!this.data.config.dropHtmlSuffix) {
        this.LoadExpressRoute(res, '/index.html'); return;
      } else {
        this.LoadExpressRoute(res, '/index'); return;
      }
    } else if (req.method == "GET" && this.routes[routePath] != null) {
      this.LoadExpressRoute(res, routePath); return;
    } 
    next();
  }

  private CreateRoute = (file: FileData): RouteData => {
    let content = file.contents;
    let options = { collapseWhitespace: true };
    if (this.data.config.isProd) content = this.minifier(content, options);
    return {
      file: file,
      content: content,
      headers: [],
      mimeType: this.GetMimeType(file)
    }
  }

  private GetMimeType = (file: FileData): string => {
    switch(file.type) {
      case "html": case "dynamic.html": return 'text/html';
      case "js": case "min.js": case "bundle.js": return 'text/javascript';
      case "css": case "min.css": case "bundle.css": return "text/css";
    }
  }

  private ApplyHeaders = (route: RouteData): RouteData => {
    this.ApplyCacheHeaders(route);
    return route;
  }

  private ApplyCacheHeaders = (route: RouteData) => {
    let cacheIntervals = this.data.config.cacheIntervals;
    if (!cacheIntervals) cacheIntervals = {};
    let milliseconds = cacheIntervals[route.mimeType];
    if (!milliseconds) milliseconds = cacheIntervals['*'];
    if (!milliseconds) milliseconds = 1296000000;
    route.headers.push({ header: 'Last-Modified', content: this.data.endTime.toUTCString() });
    route.headers.push({ header: 'Cache-Control', content: `public, max-age=${milliseconds}`});
    route.headers.push({ header: 'Expires', content: new Date(Date.now() + milliseconds).toUTCString() });
  }

  private LoadExpressRoute = (res, url) => {
    let route = this.routes[url];
    route.headers.map((header: HeaderData) => {
      res.header(header.header, header.content);
    });
    res.writeHead(200, {'Content-Type': route.mimeType});
    res.write(route.content);
    res.end();
  }

  public LoadDynamicRoute = (route: string, view: string, data: any) => {
    route = `${route.substring(0, 1) == '/' ? '' : '/'}${route}`;
    if (this.routes[route]) throw new Error(`Shaman Router: route already exists - ${route}`);
    let file = this.data.files.find(f => f.name == view);
    if (!file) throw new Error(`Shaman Router: could not find dynamic view - ${view}`);    
    let compiler = this.handlebars.compile(file.contents);
    file.contents = compiler({ compiler: data, model: this.MergeDynamicModel(file, data) });
    let routeData: RouteData = this.CreateRoute(file);
    routeData = this.ApplyHeaders(routeData);
    this.routes[route] = routeData;
  }

  private MergeDynamicModel = (file: FileData, data: any) => {
    let keys = Object.keys(file.data);
    keys.map((key: string) => {
      data[key] = file.data[key];
    });
    return data;
  }

}