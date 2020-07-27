import 'mocha';
import { expect } from 'chai';
import { FileData } from '../models';
import { 
  ReduceFileData, 
  GetFileExtension, 
  GetJsonExtensionFromHtml,
  ChangeExtension,
  GetFileMimeType
} from './file.functions';

describe('FileFunctions', () => {

  it('ReduceFileData should return flattened array', () => {
    let array = [
      [new FileData("a.txt", "./a.txt")], 
      [new FileData("b.txt", "./b.txt")]
    ];
    let result = ReduceFileData(array);
    expect(result.length).to.equal(2);
  });

  it('GetFileExtension should return blank if no file extension', () => {
    let result = GetFileExtension('test');
    expect(result).to.equal('');
  });

  it('GetFileExtension should return html', () => {
    let result = GetFileExtension('test.html');
    expect(result).to.equal('html');
  });

  it('GetJsonExtensionFromHtml should change extension to .json', () => {
    let result = GetJsonExtensionFromHtml('test.html');
    expect(result).to.equal('test.json');
  });

  it('ChangeExtension should change extension to .json', () => {
    let result = ChangeExtension('test.html', 'html', 'json');
    expect(result).to.equal('test.json');
  });

  let mimeTypes = [
    { ext: 'png', mime: 'image/png' },
    { ext: 'jpg', mime: 'image/jpeg' },
    { ext: 'jpeg', mime: 'image/jpeg' },
    { ext: 'svg', mime: 'image/svg+xml' },
    { ext: 'json', mime: 'application/json' },
    { ext: 'xml', mime: 'application/xml' },
    { ext: 'ico', mime: 'image/ico' },
    { ext: 'na', mime: 'text/plain'}
  ];
  mimeTypes.forEach(x => {
    it(`GetFileMimeType should return valid mime type (${x.ext})`, () => {
      expect(GetFileMimeType(x.ext)).to.equal(x.mime);
    });
  })

});