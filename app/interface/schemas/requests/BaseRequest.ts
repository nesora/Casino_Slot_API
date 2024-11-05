import { Request } from 'express';
import Joi from 'joi';
import { ValidationError } from '@infrastructure/api/ValidationErrors';

export abstract class BaseRequest {
  constructor(
    public readonly req: Request & Record<string, any>,
  ) {}

  abstract get defaults(): Record<string, any>;

  abstract get schema(): Joi.SchemaLike;

  abstract get props(): Record<string, any>;

  get infrastructuralProps(): Record<string, any> {
    return {};
  }

  get infrastructuralPropsSchema(): Joi.SchemaMap {
    return {};
  }

  /**
   * Returns an object containing errors mapping for errors that
   * are occurring for individual fields.
   */
  get errorsOverrides(): Record<string, Record<string, ValidationError>> {
    return {};
  }

  /**
   * Returns an object containing errors mapping for errors that
   * occur in schema root.
   */
  get rootErrorsOverrides(): Record<string, ValidationError> {
    return {};
  }
}

export default (): typeof BaseRequest => BaseRequest;