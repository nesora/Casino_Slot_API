export const ERROR_TYPES = {
    FIELD_VALUE_REQUIRED:   'any.required',
    FIELD_VALUE_INVALID:    'any.invalid',
    NUMBER_MAX_VALUE:       'number.max',
    NUMBER_POSITIVE:        'number.positive',
    NUMBER_INTEGER:         'number.integer',
    STRING_LENGTH:          'string.length',
    NOT_AMONG_VALID_VALUES: 'any.only',

  };
  
  const ERROR_DESCRIPTORS = {
    [ERROR_TYPES.FIELD_VALUE_REQUIRED]:   { code: 2000, message: 'Field is required.' },
    [ERROR_TYPES.FIELD_VALUE_INVALID]:    { code: 2001, message: 'Field value is invalid.' },
    [ERROR_TYPES.NOT_AMONG_VALID_VALUES]: { code: 3011, message: 'Value not among list of possible values.' },
    [ERROR_TYPES.NUMBER_POSITIVE]:        { code: 2017, message: 'Field value must be positive number.' },
    [ERROR_TYPES.NUMBER_INTEGER]:         { code: 2020, message: 'Number must be an integer.' },
    [ERROR_TYPES.NUMBER_MAX_VALUE]:       { code: 2021, message: 'Field value must be with maximal value.' },
  };
  
  interface ValidationError {
    code: number;
    message: string;
    field?: string;
  }
  
  const ValidationErrorsExports = {
    TYPES:       ERROR_TYPES,
    DESCRIPTORS: ERROR_DESCRIPTORS,
  };
  
  export default (): typeof ValidationErrorsExports => ValidationErrorsExports;
  export {
    ERROR_TYPES as TYPES,
    ERROR_DESCRIPTORS as DESCRIPTORS,
    ValidationError,
  };
  