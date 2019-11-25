import jmespath from 'jmespath';
import xpath from 'xpath';

export type JsonQuery = string;
export type HtmlQuery = string;

export function queryJson(doc: any, query: JsonQuery) {
  jmespath.search(doc, query);
}

export function queryHtml(doc: string, query: HtmlQuery) {
  return xpath.select(query, doc);
}
