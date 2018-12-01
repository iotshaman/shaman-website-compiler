import { IOC, IOC_TYPES, Configure as IOC_CONFIGURE } from '../inversify';
import { Compiler } from './compiler';
import { CompilerConfig } from './compiler-config.model';

export function CompilerFactory(config: CompilerConfig): Compiler {
  IOC_CONFIGURE();
  let compiler = new Compiler();
  compiler.Configure(config);
  return compiler;
}