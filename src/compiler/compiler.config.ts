export interface CompilerConfig {
    cwd: string;
    defaults?: WebpageDefaults;
    pages?: string[];
    partials?: string[];
    dynamicPages?: DynamicPage[];
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
    outDir?: string;
    wwwRoot?: string;
    noHtmlSuffix?: boolean;
    autoWatch?: boolean;
    transformModels?: (path: string, data: any) => any;
}

export interface WebpageDefaults {
    title: string;
    description: string;
}

export interface DynamicPage {
    template: string;
    routes: string[];
}