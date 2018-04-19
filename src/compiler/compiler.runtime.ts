import { GlobMap, GlobPatterns } from '../glob-data';
import { FileContents } from '../file-contents';

export class CompilerRuntime {
    cwd: string;
    globs: GlobPatterns;
    files: GlobMap;
    contents: FileContents[];
}