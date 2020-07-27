import "reflect-metadata";
import { Container, decorate, injectable } from "inversify";
import { ILogger, Logger } from '../logger';
import { WebsiteConfig } from "../models/website-config";
import { WebsiteCompiler } from "../website-compiler";
import { IWebsiteRouter, WebsiteRouter } from "../website-router";
import { IEventService, EventService } from "../services/event.service";
import { IEventHandler } from "../events/event-handler";
import { IGlobService, GlobService } from "../services/glob.service";
import { CompilerDataContext } from "../data/compiler.context";
import { RepositoryContext } from "json-repo";
import { IFileImportService, FileImportService } from "../services/file-import.service";
import { IHandlebarsService, HandlebarsService } from "../services/handlebars.service";
import { AddTextHandler } from "../events/add-text.handler";
import { AddModelHandler } from "../events/add-model.handler";
import { JavascriptContentHandler } from "../events/javascript-content.handler";
import { CssContentHandler } from "../events/css-content.handler";
import { ProcessModelHandler } from "../events/process-model.handler";
import { HtmlContentHandler } from "../events/html-content.handler";
import { IBundleService, BundleService } from "../services/bundle.service";
import { IQueryAdapter } from "../adapters/query.adapter";
import { IWebsiteServer, WebsiteServer } from "../website-server";
import { RequireAdapter } from "../functions/adapter.functions";

export const IoC = new Container();

export const TYPES = {
  Logger: "Logger",
  WebsiteConfig: "WebsiteConfig",
  WebsiteCompiler: "WebsiteCompiler",
  WebsiteRouter: "WebsiteRouter",
  WebsiteServer: "WebsiteServer",
  CompilerEvents: "CompilerEvents",
  CompilerEventHandler: "CompilerEventHandler",
  CompilerDataContext: "CompilerDataContext",
  GlobService: "GlobService",
  FileImportService: "FileImportService",
  HandlebarsService: "HandlebarsService",
  BundleService: "BundleService",
  QueryAdapter: "QueryAdapter"
};

export function Configure(config: WebsiteConfig) {
  ConfigureCompilerDataContext(config);
  ConfigureServices(config);
  ConfigureEventHandlers();  
  ConfigureQueryAdapter(config);
}

function ConfigureCompilerDataContext(config: WebsiteConfig) {
  decorate(injectable, RepositoryContext);
  IoC.bind<ILogger>(TYPES.Logger).toConstantValue(new Logger(config.logLevel));
}

function ConfigureServices(config: WebsiteConfig) {
  IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(config);
  IoC.bind<WebsiteCompiler>(TYPES.WebsiteCompiler).to(WebsiteCompiler);
  IoC.bind<IWebsiteRouter>(TYPES.WebsiteRouter).to(WebsiteRouter);
  IoC.bind<IWebsiteServer>(TYPES.WebsiteServer).to(WebsiteServer);
  IoC.bind<IEventService>(TYPES.CompilerEvents)
    .to(EventService).inSingletonScope();
  IoC.bind<CompilerDataContext>(TYPES.CompilerDataContext)
    .toConstantValue(new CompilerDataContext());
  IoC.bind<IGlobService>(TYPES.GlobService).to(GlobService);
  IoC.bind<IFileImportService>(TYPES.FileImportService).to(FileImportService);
  IoC.bind<IHandlebarsService>(TYPES.HandlebarsService).toConstantValue(new HandlebarsService());
  IoC.bind<IBundleService>(TYPES.BundleService).to(BundleService);
}

function ConfigureEventHandlers() {
  IoC.bind<IEventHandler>(TYPES.CompilerEventHandler).to(AddTextHandler);
  IoC.bind<IEventHandler>(TYPES.CompilerEventHandler).to(AddModelHandler);
  IoC.bind<IEventHandler>(TYPES.CompilerEventHandler).to(JavascriptContentHandler);
  IoC.bind<IEventHandler>(TYPES.CompilerEventHandler).to(CssContentHandler);
  IoC.bind<IEventHandler>(TYPES.CompilerEventHandler).to(ProcessModelHandler);
  IoC.bind<IEventHandler>(TYPES.CompilerEventHandler).to(HtmlContentHandler);
}

function ConfigureQueryAdapter(config: WebsiteConfig) {
  let adapter = RequireAdapter(config.adapter);
  IoC.bind<IQueryAdapter>(TYPES.QueryAdapter).toConstantValue(adapter);
}