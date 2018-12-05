import { injectable } from 'inversify';
import * as Sitemap from 'sitemap';
import { ShamanRouteMap } from './shaman-route.model';
import { CompilerConfig } from '../compiler/compiler-config.model';

export interface ISitemapFactory {
  GenerateSitemap(config: any, routes: ShamanRouteMap): string;
}

@injectable()
export class SitemapFactory implements ISitemapFactory {

  sitemap = Sitemap;

  GenerateSitemap = (config: any, routes: ShamanRouteMap): string => {
    if (!config.cacheTime) config.cacheTime = 600000;
    let sitemap = this.sitemap.createSitemap(config);
    let keys = Object.keys(routes);
    keys.map((key: string) => {
      if (routes[key].mimeType != "text/html") return;
      if (key == '/index' || key == '/index.html') sitemap.add({url: '/'});
      else sitemap.add({url: key});
    });
    return sitemap.toString();
  }

}