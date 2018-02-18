export class WebsiteConfig {
    cwd: string;
    partials: string[];
    pages: string[];
    defaults: WebpageDefaults;
    scripts?: string[];
    styles?: string[];
}

export interface WebpageDefaults {
    title: string;
    description: string;
}