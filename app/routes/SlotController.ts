import { NextFunction, Request, Response } from "express";
import SlotGameUseCase from "@application/use-cases/SlotGameUseCase";
import {
  InsufficientBalanceError,
  RetrievingRTPError,
} from "@application/Errors";
import API from "@infrastructure/api/API";
import { APIErrors } from "@infrastructure/api/APIErrors";
import PlayRequest from "@interface/schemas/requests/PlayRequest";
import SimRequest from "@interface/schemas/requests/SimRequest";
import RequestDataValidator from "@interface/schemas/requests/RequestDataValidator";

type PlayInput = {
  bet: number;
};

type SimInput = {
  count: number;
  bet: number;
};

class SlotController {
  private readonly requestDataValidator = new RequestDataValidator();

  constructor(private readonly slotGameUseCase: SlotGameUseCase) {}

  async play(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = this.requestDataValidator.extract<PlayInput>(
        PlayRequest,
        req
      );

      if (!validatedData.valid) {
        return API.sendValidationError(res, validatedData.errors);
      }

      const { bet } = req.body;

      const result = await this.slotGameUseCase.play(bet);
      res.json(result);
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return API.sendError(res, APIErrors.INSUFFICIENT_BALANCE);
      }

      return API.sendError(res, APIErrors.INTERNAL_SERVER_ERROR);
    }
  }

  async sim(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = this.requestDataValidator.extract<SimInput>(SimRequest, req);

      if (!validatedData.valid) {
        return API.sendValidationError(res, validatedData.errors);
      }

      const result = await this.slotGameUseCase.sim(req); 

      res.json(result);
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return API.sendError(res, APIErrors.INSUFFICIENT_BALANCE);
      }
      return API.sendError(res, APIErrors.INTERNAL_SERVER_ERROR);
    }
  }

  async getRTP(req: Request, res: Response): Promise<void> {
    try {
      const result = this.slotGameUseCase.getRTP();
      res.json({ rtp: result });
    } catch (error) {
      if (error instanceof RetrievingRTPError) {
        return API.sendError(res, APIErrors.INVALID_RETRIEVING_RTP);
      }
      return API.sendError(res, APIErrors.INTERNAL_SERVER_ERROR);
    }
  }
}

export default SlotController;
