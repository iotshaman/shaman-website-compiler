import * as FastGlob from 'fast-glob';
import * as Promise from 'promise';

export function GlobFactory(options): (patterns: string[]) => Promise<any> {
    return (patterns: string[]) => {
        return new Promise((res) => { return FastGlob(patterns, options).then(res); });
    }
}