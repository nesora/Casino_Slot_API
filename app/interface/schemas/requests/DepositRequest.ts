import joi, { Schema } from 'joi';
import { BaseRequest } from './BaseRequest';

class DepositRequest extends BaseRequest {
  get schema(): Record<string, Schema> {
    return {
        amount: joi.number().integer().min(1).required(),
    };
  }

  get defaults(): Record<string, unknown> {
    return {};
  }
  
  get props(): Record<string, unknown> {
    return {
        amount: this.req.body.amount,
    };
  }
}

export default DepositRequest;