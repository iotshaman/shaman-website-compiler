"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BundlerUtils;
(function (BundlerUtils) {
    function GetBundleSpecsFromConfig(data) {
        return data.files
            .filter(function (file) {
            if (file.type != 'html' && file.type != 'dynamic.html')
                return false;
            if (!file.data)
                return false;
            if (!file.data.shaman)
                return false;
            if (!file.data.shaman.bundles || file.data.shaman.bundles.length == 0)
                return false;
            return true;
        })
            .map(function (file) {
            var spec = file.data.shaman.bundles;
            return spec;
        })
            .reduce(function (a, b) {
            return a.concat(b);
        }, []);
    }
    BundlerUtils.GetBundleSpecsFromConfig = GetBundleSpecsFromConfig;
    function LoadBundleContent(specs, type, files) {
        return specs
            .filter(function (spec) { return spec.type == type; })
            .map(function (spec) {
            var name = spec.name + ".min." + spec.type;
            var bundle = { name: name, files: [] };
            bundle.files = spec.files.map(function (path) {
                var file = files.find(function (f) { return f.name == path; });
                if (!file) {
                    throw new Error("Bundler: File not found - '" + path + "'");
                }
                return file;
            });
            return bundle;
        });
    }
    BundlerUtils.LoadBundleContent = LoadBundleContent;
})(BundlerUtils = exports.BundlerUtils || (exports.BundlerUtils = {}));
//# sourceMappingURL=bundler-utils.js.map