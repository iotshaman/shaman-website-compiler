"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function registerHandlebarsHelpers(handlebars) {
    handlebars.registerHelper('raw-block', function (options) {
        return options.fn(this);
    });
    handlebars.registerHelper('equals', function (item1, item2, options) {
        if (item1 == item2) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('isNullOrEmpty', function (item, options) {
        if (!item) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('isNotNullOrEmpty', function (item, options) {
        if (!!item) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('truncate', function (item, length, options) {
        if (!item || !item.length) {
            return '';
        }
        var safeLength = parseInt(length, 10);
        if (safeLength == NaN || item.length <= safeLength) {
            return item;
        }
        return item.substring(0, safeLength);
    });
    handlebars.registerHelper('filter', function (array, prop, expect, options) {
        var rslt = array.filter(function (val) {
            return val[prop] == expect;
        });
        return rslt.map(function (val) {
            return options.fn(val);
        });
    });
    handlebars.registerHelper('share-link', function (type, root, route, desc, options) {
        if (!type || !root || !route) {
            return '';
        }
        var rslt = '#';
        var uriStart = encodeURI("" + root + route);
        var uriSuffix = encodeURI(desc ? desc : '');
        switch (type) {
            case 'twitter': {
                rslt = "https://twitter.com/intent/tweet?url=" + uriStart + "&text=" + uriSuffix;
                break;
            }
            case 'facebook': {
                rslt = "https://www.facebook.com/sharer/sharer.php?u=" + uriStart;
                break;
            }
            case 'google': {
                rslt = "https://plus.google.com/share?url=" + uriStart;
                break;
            }
            case 'pinterest': {
                rslt = "http://pinterest.com/pin/create/button/?url=" + uriStart + "&description=" + uriSuffix;
                break;
            }
        }
        return rslt;
    });
}
exports.registerHandlebarsHelpers = registerHandlebarsHelpers;
//# sourceMappingURL=handlebars.helpers.js.map