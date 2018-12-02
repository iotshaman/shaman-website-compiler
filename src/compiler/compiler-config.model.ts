import { CompilerData } from "./compiler-data.model";
import { ShamanRouter } from "../router/shaman-router";

export interface CompilerConfig {
  cwd?: string;
  isProd?: boolean;
  pages?: string[];
  dynamics?: string[];
  partials?: string[];
  scripts?: string[];
  styles?: string[];
  minify?: boolean;
  htmlRoot?: string;
  outputFolder?: string;
  dropHtmlSuffix?: boolean;
  autoWatch?: boolean;
  cacheIntervals?: CacheIntervals;
  handlebarsPlugin?: (handlebars: any, data: CompilerData) => void;
  dynamicRoutePlugin?: (router: ShamanRouter) => void;
}

export interface CacheIntervals {
    [mimeType: string]: number;
}