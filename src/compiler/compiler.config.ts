export interface CompilerConfig {
    cwd: string;
    pages?: string[];
    partials?: string[];
    dynamicPages?: DynamicPage[];
    defaults?: WebpageDefaults;
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
    outDir?: string;
    wwwRoot?: string;
    noHtmlSuffix?: boolean;
    autoWatch?: boolean;
    transformData?: (path: string) => any;
}

export interface WebpageDefaults {
    title: string;
    description: string;
}

export interface DynamicPage {
    template: string;
    routes: string[];
}