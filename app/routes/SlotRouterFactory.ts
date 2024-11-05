import { Router } from "express";
import SlotController from "./SlotController";

export default class SlotRouterFactory {
  constructor(private readonly slotController: SlotController) {}

  createRouter(): Router {
    const router = Router();

    router.post("/play", this.slotController.play.bind(this.slotController));
    router.post("/sim", this.slotController.sim.bind(this.slotController));
    router.get("/getRTP", this.slotController.getRTP.bind(this.slotController));

    return router;
  }
}