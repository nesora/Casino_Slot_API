import { Router } from "express";
import WalletController from "./WalletController";

export default class WalletRouterFactory {
  constructor(private readonly walletController: WalletController) {}

  createRouter(): Router {
    const router = Router();

    router.post("/wallet/deposit", this.walletController.deposit.bind(this.walletController));
    router.post("/wallet/withdraw", this.walletController.withdraw.bind(this.walletController));
    router.get("/wallet/balance", this.walletController.getBalance.bind(this.walletController));

    return router;
  }
}