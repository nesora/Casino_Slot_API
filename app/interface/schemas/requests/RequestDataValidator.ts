/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import assert from 'assert';
import { Request } from 'express';
import { pickBy, mapValues } from 'lodash';
import joi from 'joi';
import { TYPES, DESCRIPTORS, ValidationError } from '@infrastructure/api/ValidationErrors';
import { BaseRequest } from '@interface/schemas/requests/BaseRequest';
import { isPlainObject } from '@Utils/Types';

export interface CustomRequest extends Request {
  realIp: string;
  data: any;
}

export type InvalidRequest = {
  valid: false;
  errors: Array<ValidationError>;
};

export type ValidRequest<T> = {
  valid: true;
  data: T;
}

export type ValidatedResponse<T> = InvalidRequest | ValidRequest<T>

export default class RequestDataValidator {
  private validateOptions = {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
  };

  extract<T>(RequestSchema: new (req: Request) => BaseRequest, req: Request): ValidatedResponse<T> {
    const obj = new RequestSchema(req);
    // We're only interested in patching individual field schemas and not root schema, if the one is defined as such.
    const requestSchema = this.isPlainObject(obj.schema)
      // Force validator to stop on first error occurred to preserve backwards compatibility with news API.
      ? mapValues(obj.schema, (fieldDefinition) => (joi.isSchema(fieldDefinition) ? fieldDefinition.options({ abortEarly: true }) : fieldDefinition))
      : obj.schema;
    const schema = Object.assign(requestSchema ?? {}, obj.infrastructuralPropsSchema);
    const data = this.merge(obj.defaults, obj.infrastructuralProps, obj.props);

    const { error, value: processData } = joi.compile(schema).validate(data, this.validateOptions);

    if (error) {
      const errorsOverrides = obj.errorsOverrides;
      const rootErrorsOverrides = obj.rootErrorsOverrides;
      const validationErrors = error.details.map((fieldErrorObj) => {
        const fieldName = fieldErrorObj.path.map((segment) => (typeof segment === 'number' ? '*' : String(segment))).join('.');
        const errorType = fieldErrorObj.type;
        const isRootError = typeof fieldName === 'undefined';

        let errorDescriptor: ValidationError = {
          ...DESCRIPTORS[TYPES.FIELD_VALUE_INVALID],
        };

        if (!isRootError) {
          errorDescriptor.field = fieldName;
        }

        if (errorType in DESCRIPTORS) {
          errorDescriptor = Object.assign(errorDescriptor, DESCRIPTORS[errorType]);
        }

        if (isRootError && errorType in rootErrorsOverrides) {
          errorDescriptor = Object.assign(errorDescriptor, rootErrorsOverrides[errorType]);
        } else if (fieldName in errorsOverrides && errorType in errorsOverrides[fieldName]) {
          errorDescriptor = Object.assign(errorDescriptor, errorsOverrides[fieldName][errorType]);
        }

        this.assertValidErrorDescriptor(errorDescriptor, fieldName);

        return errorDescriptor;
      });

      return {
        valid: false,
        errors: validationErrors,
      };
    }

    return {
      valid: true,
      data: processData,
    };
  }

  validate(data: Record<string, unknown>, RequestSchema: new () => any) {
    const requestSchema = new RequestSchema();
    const { error, value: processedData } = joi.compile(requestSchema.schema).validate(data, this.validateOptions);
    if (error) {
      throw error;
    }

    return processedData;
  }

  private isPlainObject(input: unknown): input is Record<string, unknown> {
    return isPlainObject(input);
  }

  private assertValidErrorDescriptor(descriptor: ValidationError, fieldName: string) {
    const isSchemaRoot = typeof fieldName === 'undefined';
    const invalidDescriptorError = new Error(
      isSchemaRoot
        ? 'Invalid descriptor provided'
        : `Invalid descriptor provided for field '${fieldName}'`,
    );

    assert(typeof descriptor === 'object', invalidDescriptorError);
    assert(typeof descriptor.field === 'string' || isSchemaRoot, invalidDescriptorError);
    assert(typeof descriptor.code === 'number', invalidDescriptorError);
    assert(typeof descriptor.message === 'string', invalidDescriptorError);
  }

  private merge(...objects: Record<string, any>[]) {
    return objects.reduce((acc, curr) => Object.assign(acc, this.stripUndefinedProps(curr)), {});
  }

  private stripUndefinedProps(obj: Record<string, any>) {
    return pickBy(obj, (val) => val !== undefined);
  }
}