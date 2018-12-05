"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var Sitemap = require("sitemap");
var SitemapFactory = /** @class */ (function () {
    function SitemapFactory() {
        var _this = this;
        this.sitemap = Sitemap;
        this.GenerateSitemap = function (config, routes) {
            if (!config.cacheTime)
                config.cacheTime = 600000;
            var sitemap = _this.sitemap.createSitemap(config);
            var keys = Object.keys(routes);
            keys.map(function (key) {
                if (routes[key].mimeType != "text/html")
                    return;
                if (key == '/index' || key == '/index.html')
                    sitemap.add({ url: '/' });
                else
                    sitemap.add({ url: key });
            });
            return sitemap.toString();
        };
    }
    SitemapFactory = __decorate([
        inversify_1.injectable()
    ], SitemapFactory);
    return SitemapFactory;
}());
exports.SitemapFactory = SitemapFactory;
//# sourceMappingURL=sitemap-factory.js.map