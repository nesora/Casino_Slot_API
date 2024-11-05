import { Response } from 'express';
import { APIError, APIErrors } from './APIErrors';
import { ValidationError } from './ValidationErrors';

class API {
  static sendError(res: Response, error: APIError, validationErrors?: Array<ValidationError> | ValidationError): void {
    const body = {
        data: null,
        error: validationErrors
            ? Array.isArray(validationErrors)
                ? this.processValidationErrors(error, validationErrors)
                : this.processValidationErrors(error, { [validationErrors.field as string]: validationErrors })
            : error,
    };

    res.status(error.status).send(body);
}

  static sendData<DataType = unknown>(res: Response, data: DataType): void {
    res.send({
      data: data,
      error: null,
    });
  }

  static sendAccepted(res: Response): void {
    res.status(202).send();
  }

  static sendValidationError(response: Response, errors: Array<ValidationError>): void {
    const apiError = APIErrors.INVALID_PARAMETERS;

    response.status(apiError.status).send({
      data: null,
      error: {
        ...apiError,
        validationErrors: errors,
      },
    });
  }

  private static processValidationErrors(apiError: APIError, validationErrorObject: Array<ValidationError> | Record<string, ValidationError>) {
    let validationErrors: Array<ValidationError> = [];

    if (Array.isArray(validationErrorObject)) {
        // If it's an array, just assign it directly
        validationErrors = validationErrorObject;
    } else {
        // If it's an object, iterate over its fields
        for (const field in validationErrorObject) {
            if (validationErrorObject.hasOwnProperty(field)) {
                const error = validationErrorObject[field];

                // Ensure that error is of type ValidationError
                if (this.isValidationError(error)) {
                    validationErrors.push(error);
                }
            }
        }
    }

    return {
        ...apiError,
        validationErrors: validationErrors.length > 0 ? validationErrors : null,
    };
}

// Type guard to check if the error is of type ValidationError
private static isValidationError(error: any): error is ValidationError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
}
}

export default API;
