import { parse } from 'content-type';
import mimeTypes from 'mime-types';

export function mime(contentType: string) {
  return parse(contentType).type;
}

export function mimeExtension(contentType: string) {
  try {
    return mimeTypes.extension(mime(contentType));
  } catch (e) {
    return false;
  }
}
