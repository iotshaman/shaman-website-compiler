const tags: string[] = [
    '<title>{{ title }}</title>',
    '<meta name="description" content="{{ description }}">'
]

export function GetMetaTagsTemplate() {
    return tags.reduce((a, b) => {
        return `${a}${!a ? '' : '\r\n'}${b}`
    }, '');   
}

