import { FileData } from "../files";

export interface ShamanRouteMap {
  [route: string]: RouteData;
}

export interface RouteData {
  path: string;
  file: FileData;
  content: string;
  headers: HeaderData[];
  mimeType: string;
}

export interface HeaderData {
  header: string;
  content: string;
}