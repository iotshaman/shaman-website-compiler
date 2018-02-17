const tags: string[] = [
    `<title>${ifElse('title', 'title', '$.defaults.title')}</title>`,
    `${metaTag('description')}`,
    `${openGraph('og:title', 'og_title')}`
]

export function GetMetaTagsTemplate() {
    return tags.reduce((a, b) => {
        return `${a}${!a ? '' : '\r\n'}${b}`
    }, '');   
}

function truthy(condition, val) {
    return `{{#if ${condition}}}{{ ${val} }}{{/if}}`;
}

function ifElse(condition, a, b) {
    return `{{#if ${condition}}}{{ ${a} }}{{else}}{{ ${b} }}{{/if}}`;
}

function metaTag(name) {
    var defaultVal = `$.defaults.${name}` 
    return `<meta name="${name}" content="${ifElse(name, name, defaultVal)}">`;
}

function openGraph(prop, val) {
    return `<meta property="${prop}" content="${truthy(val, val)}">`;
}