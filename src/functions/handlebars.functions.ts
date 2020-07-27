import { Bundle } from "../models/bundle";

export function CreateBundleTags(bundles: Bundle[]) {
  return bundles
    .map((bundle) => {
      if (bundle.type == 'css') {
        return bundle.files.map(file => CreateStyle(file));
      } else {
        return bundle.files.map(file => CreateScript(file));
      }
    })
    .reduce((a, b) => {
      return a.concat(b);
    }, [])
    .reduce((a, b) => {
      return `${a}${a == '' ? '' : '\r\n'}${b}`
    }, '');
}

export function CreateMinifiedBundleTags(bundles: Bundle[]) {
  return bundles
    .map((bundle) => {
      if (bundle.type == 'css') {
        return `${CreateStyle(`${bundle.name}.min.css`)}`;
      } else {
        return `${CreateScript(`${bundle.name}.min.js`)}`;
      }
    })
    .reduce((a, b) => {
      return `${a}${a == '' ? '' : '\r\n'}${b}`
    }, '');
}

export function CreateStyle(path: string) {
  return `<link rel="stylesheet" type="text/css" href="/${path}">`
}

export function CreateScript(path: string) {
  return `<script type="text/javascript" src="/${path}"></script>`
}