export class WebsiteConfig {
    cwd: string;
    partials: string[];
    pages: string[];
    defaults: WebpageDefaults;
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
    express?: boolean;
}

export interface WebpageDefaults {
    title: string;
    description: string;
}

export interface FileContents {
    name: string;
    contents: string;
}