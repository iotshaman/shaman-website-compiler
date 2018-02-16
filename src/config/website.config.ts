export class WebsiteConfig {
    cwd: string;
    partials: string[];
    pages: string[];
    defaults: WebpageDefaults;
}

export interface WebpageDefaults {
    title: string;
    description: string;
}