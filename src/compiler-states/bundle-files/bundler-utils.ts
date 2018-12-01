import { FileData } from "../../files";
import { CompilerData } from "../../compiler/compiler-data.model";

export module BundlerUtils {

  export function GetBundleSpecsFromConfig(data: CompilerData): BundleSpec[] {
    return data.files
      .filter((file: FileData) => {
        if (file.type != 'html' && file.type != 'dynamic.html') return false;
        if (!file.data) return false;
        if (!file.data.shaman) return false;
        if (!file.data.shaman.bundles || file.data.shaman.bundles.length == 0) return false;
        return true;
      })
      .map((file: FileData) => {
        let spec: BundleSpec[] = <BundleSpec[]>file.data.shaman.bundles;
        return spec;
      })
      .reduce((a: BundleSpec[], b: BundleSpec[]) => {
        return a.concat(b);
      }, [])
  }

  export function LoadBundleContent(specs: BundleSpec[], type: string, files: FileData[]): FileBundle[] {
    return specs
      .filter(spec => spec.type == type)
      .map((spec: BundleSpec) => {
        let name = `${spec.name}.min.${spec.type}`;
        let bundle: FileBundle = { name: name, files: [] };
        bundle.files = spec.files.map((path: string) => {
          let file = files.find(f => f.name == path);
          if (!file) { throw new Error(`Bundler: File not found - '${path}'`)}
          return file;
        });
        return bundle;
      })
  }
}

export interface FileBundle {
  name: string;
  files: FileData[];
}

export interface BundleSpec {
  name: string;
  type: string;
  files: string[];
}