export function GetScriptsTemplate() {
    var scriptLink = '<script src="{{this}}" type="text/javascript"></script>';
    return `\r\n{{#each $.scripts}}\r\n${scriptLink}\r\n{{/each}}`;
}

