export function GetStylesTemplate() {
    var styleLink = '<link href="{{this}}" rel="stylesheet" type="text/css">';
    return `{{#each $.styles}}\r\n${styleLink}\r\n{{/each}}`;
}

