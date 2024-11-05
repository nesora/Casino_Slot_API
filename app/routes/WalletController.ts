import { Request, Response, NextFunction } from "express";
import WalletService from "@application/services/WalletService";
import API from "@infrastructure/api/API";
import { APIErrors } from "@infrastructure/api/APIErrors";
import { InsufficientBalanceError } from "@application/Errors";
import DepositRequest from "@interface/schemas/requests/DepositRequest";
import RequestDataValidator from "@interface/schemas/requests/RequestDataValidator";
import WithdrawRequest from "@interface/schemas/requests/WithdrawRequest";

type DepositInput = {
  amount: number;
};

type WithdrawInput = {
  amount: number;
};

export default class WalletController {
  private readonly requestDataValidator = new RequestDataValidator();

  constructor(private readonly walletService: WalletService) {}

  async deposit(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = this.requestDataValidator.extract<DepositInput>(
        DepositRequest,
        req
      );

      if (!validatedData.valid) {
        return API.sendValidationError(res, validatedData.errors);
      }

      const { amount } = req.body;

      const result = await this.walletService.deposit(amount);
      res.json(result);
    } catch (err) {
      return API.sendError(res, APIErrors.INTERNAL_SERVER_ERROR);
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = this.requestDataValidator.extract<WithdrawInput>(
        WithdrawRequest,
        req
      );

      if (!validatedData.valid) {
        return API.sendValidationError(res, validatedData.errors);
      }

      const { amount } = req.body;
      const result = await this.walletService.withdraw(amount);
      res.json(result);
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return API.sendError(res, APIErrors.INSUFFICIENT_BALANCE);
      }

      return API.sendError(res, APIErrors.INTERNAL_SERVER_ERROR);
    }
  }

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const balance = await this.walletService.getBalance();
      res.json({ balance });
    } catch (err) {
      return API.sendError(res, APIErrors.INTERNAL_SERVER_ERROR);
    }
  }
}
