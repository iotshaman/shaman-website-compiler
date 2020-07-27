import { Container } from "inversify";
import { TYPES } from "../composition/app.composition";
import { CompilerDataContext } from "./compiler.context";

export function CreateDataContext(IoC: Container): Promise<CompilerDataContext> {
  let context = new CompilerDataContext(null);
  return context.initialize().then(_ => {
    IoC.bind<CompilerDataContext>(TYPES.CompilerDataContext).toConstantValue(context);
    return context;
  });
}