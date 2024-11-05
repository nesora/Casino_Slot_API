import joi, { Schema } from 'joi';
import { BaseRequest } from './BaseRequest';

class PlayRequest extends BaseRequest {
  get schema(): Record<string, Schema> {
    return {
        bet: joi.number().integer().min(1).required(),
    };
  }

  get defaults(): Record<string, unknown> {
    return {};
  }
  
  get props(): Record<string, unknown> {
    return {
        bet: this.req.body.bet,
    };
  }
}

export default PlayRequest;