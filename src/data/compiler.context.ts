import { injectable, decorate } from 'inversify';
import { RepositoryContext, Repository } from 'json-repo';
import { FileData } from '../models';
import { Bundle } from '../models/bundle';
import { DynamicRoute } from '../models/dynamic-route';

decorate(injectable(), RepositoryContext)
@injectable()
export class CompilerDataContext extends RepositoryContext {
  models = {
    files: new Repository<FileData>(),
    assets: new Repository<FileData>(),
    bundles: new Repository<Bundle>(),
    dynamicRoutes: new Repository<DynamicRoute>()
  }
}