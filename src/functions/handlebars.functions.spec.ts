import 'mocha';
import { expect } from 'chai';
import { Bundle } from '../models';
import { CreateBundleTags, CreateMinifiedBundleTags } from './handlebars.functions';

describe('HandlebarsFunctions', () => {

  it('CreateBundleTags should create tags for css files in bundle', () => {
    let bundle1 = new Bundle({name: 'a', type: 'css', files: ['a.css'], path: 'a.css'});
    let bundle2 = new Bundle({name: 'b', type: 'css', files: ['b.css'], path: 'b.css'});
    let result = CreateBundleTags([bundle1, bundle2]);
    let bundle1String = '<link rel="stylesheet" type="text/css" href="/a.css">';
    let bundle2String = '<link rel="stylesheet" type="text/css" href="/b.css">';
    expect(result).to.equal(`${bundle1String}\r\n${bundle2String}`);
  });

  it('CreateBundleTags should create tags for files in bundle', () => {
    let bundle1 = new Bundle({name: 'a', type: 'js', files: ['a.js'], path: 'a.js'});
    let bundle2 = new Bundle({name: 'b', type: 'js', files: ['b.js'], path: 'b.js'});
    let result = CreateBundleTags([bundle1, bundle2]);
    let bundle1String = '<script type="text/javascript" src="/a.js"></script>';
    let bundle2String = '<script type="text/javascript" src="/b.js"></script>';
    expect(result).to.equal(`${bundle1String}\r\n${bundle2String}`);
  });

  it('CreateMinifiedBundleTags should create minified css bundle tag', () => {
    let bundle1 = new Bundle({name: 'a', type: 'css', files: ['a.css'], path: 'a.css'});
    let bundle2 = new Bundle({name: 'b', type: 'css', files: ['b.css'], path: 'b.css'});
    let result = CreateMinifiedBundleTags([bundle1, bundle2]);
    let bundle1String = '<link rel="stylesheet" type="text/css" href="/a.min.css">';
    let bundle2String = '<link rel="stylesheet" type="text/css" href="/b.min.css">';
    expect(result).to.equal(`${bundle1String}\r\n${bundle2String}`);
  });

  it('CreateMinifiedBundleTags should create minified js bundle tag', () => {
    let bundle1 = new Bundle({name: 'a', type: 'js', files: ['a.js'], path: 'a.js'});
    let bundle2 = new Bundle({name: 'b', type: 'js', files: ['b.js'], path: 'b.js'});
    let result = CreateMinifiedBundleTags([bundle1, bundle2]);
    let bundle1String = '<script type="text/javascript" src="/a.min.js"></script>';
    let bundle2String = '<script type="text/javascript" src="/b.min.js"></script>';
    expect(result).to.equal(`${bundle1String}\r\n${bundle2String}`);
  });
  
});