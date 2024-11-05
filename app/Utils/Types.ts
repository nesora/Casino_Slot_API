import { inspect } from 'util';
import lodash from 'lodash';

export function createTypeError(expectedType: string, receivedInput: unknown): TypeError {
  return new TypeError(`Expected: ${expectedType}, received: ${inspect(receivedInput)}`);
}

export type PlainObject = Record<string, unknown>;
export function isPlainObject(input: unknown): input is PlainObject {
  return lodash.isPlainObject(input);
}

export function makePlainObject(input: unknown): PlainObject {
  if (!isPlainObject(input)) {
    throw createTypeError('PlainObject', input);
  }

  return input;
}
