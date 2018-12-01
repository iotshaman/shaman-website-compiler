"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var route_types_const_1 = require("./route-types.const");
var files_1 = require("../files");
var html_minifier_1 = require("html-minifier");
var Handlebars = require("handlebars");
var ShamanRouter = /** @class */ (function () {
    function ShamanRouter(data) {
        var _this = this;
        this.minifier = html_minifier_1.minify;
        this.handlebars = Handlebars;
        this.utils = files_1.FileUtils;
        this.routes = {};
        this.LoadRoutes = function () {
            _this.routes = _this.data.files
                .filter(function (file) { return route_types_const_1.RouteTypes.indexOf(file.type) > -1; })
                .reduce(function (a, b) {
                var name = "/" + b.name;
                if (b.type == 'html' && _this.data.config.dropHtmlSuffix) {
                    name = _this.utils.RemoveExtension(name, 'html');
                }
                if (b.type == 'html' && _this.data.config.wwwRoot) {
                    name = name.replace(_this.data.config.wwwRoot, '');
                }
                if (!!a[name])
                    throw new Error("Shaman Router: route already exists - " + name);
                var route = _this.CreateRoute(b);
                a[name] = _this.ApplyHeaders(route);
                return a;
            }, {});
        };
        this.Express = function (req, res, next) {
            var routePath = req.url;
            if (routePath.indexOf('?') > -1) {
                routePath = routePath.substring(0, routePath.indexOf('?'));
            }
            else if (routePath.indexOf('#') > -1) {
                routePath = routePath.substring(0, routePath.indexOf('#'));
            }
            if (req.method == "GET" && req.url == '/') {
                if (!_this.data.config.dropHtmlSuffix) {
                    _this.LoadExpressRoute(res, '/index.html');
                    return;
                }
                else {
                    _this.LoadExpressRoute(res, '/index');
                    return;
                }
            }
            else if (req.method == "GET" && _this.routes[routePath] != null) {
                _this.LoadExpressRoute(res, routePath);
                return;
            }
            next();
        };
        this.CreateRoute = function (file) {
            var content = file.contents;
            var options = { collapseWhitespace: true };
            if (_this.data.config.isProd)
                content = _this.minifier(content, options);
            return {
                file: file,
                content: content,
                headers: [],
                mimeType: _this.GetMimeType(file)
            };
        };
        this.GetMimeType = function (file) {
            switch (file.type) {
                case "html":
                case "dynamic.html": return 'text/html';
                case "js":
                case "min.js":
                case "bundle.js": return 'text/javascript';
                case "css":
                case "min.css":
                case "bundle.css": return "text/css";
            }
        };
        this.ApplyHeaders = function (route) {
            _this.ApplyCacheHeaders(route);
            return route;
        };
        this.ApplyCacheHeaders = function (route) {
            var cacheIntervals = _this.data.config.cacheIntervals;
            if (!cacheIntervals)
                cacheIntervals = {};
            var milliseconds = cacheIntervals[route.mimeType];
            if (!milliseconds)
                milliseconds = cacheIntervals['*'];
            if (!milliseconds)
                milliseconds = 1296000000;
            route.headers.push({ header: 'Last-Modified', content: _this.data.endTime.toUTCString() });
            route.headers.push({ header: 'Cache-Control', content: "public, max-age=" + milliseconds });
            route.headers.push({ header: 'Expires', content: new Date(Date.now() + milliseconds).toUTCString() });
        };
        this.LoadExpressRoute = function (res, url) {
            var route = _this.routes[url];
            route.headers.map(function (header) {
                res.header(header.header, header.content);
            });
            res.writeHead(200, { 'Content-Type': route.mimeType });
            res.write(route.content);
            res.end();
        };
        this.LoadDynamicRoute = function (route, view, data) {
            route = "" + (route.substring(0, 1) == '/' ? '' : '/') + route;
            if (_this.routes[route])
                throw new Error("Shaman Router: route already exists - " + route);
            var file = _this.data.files.find(function (f) { return f.name == view; });
            if (!file)
                throw new Error("Shaman Router: could not find dynamic view - " + view);
            var compiler = _this.handlebars.compile(file.contents);
            file.contents = compiler({ compiler: data, model: _this.MergeDynamicModel(file, data) });
            var routeData = _this.CreateRoute(file);
            routeData = _this.ApplyHeaders(routeData);
            _this.routes[route] = routeData;
        };
        this.MergeDynamicModel = function (file, data) {
            var keys = Object.keys(file.data);
            keys.map(function (key) {
                data[key] = file.data[key];
            });
            return data;
        };
        this.data = data;
        this.LoadRoutes();
    }
    return ShamanRouter;
}());
exports.ShamanRouter = ShamanRouter;
//# sourceMappingURL=shaman-router.js.map