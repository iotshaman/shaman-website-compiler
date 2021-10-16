import { SitemapStream, streamToPromise } from 'sitemap';
import { injectable } from "inversify";
import { IoC, TYPES } from "./composition/app.composition";
import { CompilerDataContext } from "./data/compiler.context";
import { Route, WebsiteConfig } from "./models";

export interface IWebsiteRouter {
  getAllRoutes: () => Promise<Route[]>;
}

@injectable()
export class WebsiteRouter implements IWebsiteRouter {

  private context: CompilerDataContext;
  private config: WebsiteConfig;

  constructor() {
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
    this.config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
  }

  getAllRoutes = (): Promise<Route[]> => {
    let files = this.context.models.files.filter(file => file.route && !file.model.shaman?.private);
    let bundles = this.context.models.bundles.filter(b => !!b.content);
    let routes = files.map(f => new Route(f.routePath, f.content, f.extension, f.model.shaman?.extensionless));
    routes = routes.concat(bundles.map(b => new Route(b.path, b.content, b.type)));
    routes = routes.concat(this.getDynamicRoutes());
    return this.createSitemap(routes);
  }

  private getDynamicRoutes = (): Route[] => {
    let routes = this.context.models.dynamicRoutes.filter(r => !!r.content);
    return routes.map(r => new Route(r.path, r.content, "html"));
  }

  private createSitemap = (routes: Route[]): Promise<Route[]> => {
    let paths = routes.filter(r => r.extension == 'html').map(r => r.path);
    paths = [''].concat(paths.filter(p => p != 'index.html'));
    let links = paths.map(p => ({url: p, changefreq: 'weekly', priority: 0.8}));
    const stream = new SitemapStream(this.config.sitemap);
    links.forEach(link => stream.write(link));
    stream.end();
    return streamToPromise(stream).then(data => {
      let route = new Route('sitemap.xml', data.toString(), 'xml');
      return [route].concat(routes);
    });
  }

}