import { CompilerData } from "./compiler-data.model";

export interface CompilerConfig {
  cwd?: string;
  isProd?: boolean;
  pages?: string[];
  dynamics?: string[];
  partials?: string[];
  scripts?: string[];
  styles?: string[];
  wwwRoot?: string;
  dropHtmlSuffix?: boolean;
  autoWatch?: boolean;
  cacheIntervals?: CacheIntervals;
  handlebarsPlugin?: (handlebars: any, data: CompilerData) => void;
}

export interface CacheIntervals {
    [mimeType: string]: number;
}