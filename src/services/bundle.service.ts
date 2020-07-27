import { injectable } from 'inversify';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig } from "../models/website-config";
import { CompilerDataContext } from '../data/compiler.context';
import { Bundle } from '../models/bundle';

export interface IBundleService {
  updateBundleContent: () => Promise<void>;
}

@injectable()
export class BundleService implements IBundleService {

  private config: WebsiteConfig;
  private context: CompilerDataContext;

  constructor() {
    this.config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
  }

  updateBundleContent = (): Promise<void> => {
    this.context.models.bundles.filter(b => !b.content)
      .map(bundle => this.getBundleContent(bundle))
      .forEach(bundle => this.saveBundleContent(bundle));
    return this.context.saveChanges();
  }

  private getBundleContent = (bundle: Bundle): Bundle => {
    bundle.content = this.context.models.files
      .filter(file => bundle.files.includes(file.name))
      .reduce((a, b) => `${a}${b.content}`, '');
    return bundle;
  }

  private saveBundleContent = (bundle: Bundle): void => {
    this.context.models.bundles.update(bundle.name, b => {
      b.content = bundle.content;
      return b;
    });
  }

}