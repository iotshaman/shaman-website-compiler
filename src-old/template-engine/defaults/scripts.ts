export function GetScriptsTemplate() {
    var scriptLink = '<script src="{{this}}" type="text/javascript"></script>';
    return `{{#each $.scripts}}\r\n${scriptLink}\r\n{{/each}}`;
}

