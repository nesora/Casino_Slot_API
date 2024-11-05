import joi, { Schema } from 'joi';
import { BaseRequest } from './BaseRequest';

class SimRequest extends BaseRequest {
  get schema(): Record<string, Schema> {
    return {
        count: joi.number().integer().min(1).required(),
        bet: joi.number().integer().min(1).required(),
    };
  }

  get defaults(): Record<string, unknown> {
    return {};
  }
  
  get props(): Record<string, unknown> {
    return {
        count: this.req.body.count,
        bet: this.req.body.bet,
    };
  }
}

export default SimRequest;