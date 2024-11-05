import request from "supertest";
import express from "express";
import SlotController from "../../routes/SlotController";
import SlotGameUseCase from "../../application/use-cases/SlotGameUseCase";
import WalletService from "../../application/services/WalletService";
import Player from "../../domain/Player";
import { createClient } from "redis";

const app = express();
app.use(express.json());
const player = new Player(1000);

const walletService = new WalletService(player);
const slotGameUseCase = new SlotGameUseCase(walletService);
const slotController = new SlotController(slotGameUseCase);

app.post("/play", (req, res) => slotController.play(req, res));
app.post("/sim", (req, res) => slotController.sim(req, res));
app.get("/rtp", (req, res) => slotController.getRTP(req, res));

let redisClient: any;

describe("SlotController Integration Tests", () => {
  beforeAll(async () => {
    redisClient = createClient();
    redisClient.on("error", (err: any) =>
      console.error("Redis Client Error", err)
    );
    await redisClient.connect();
  });

  // There is strange issue with Redis memory
  // It does not clear everytime the balance or set it to 1000
  // So thats why trying to flush /set and timeout
  beforeEach(async () => {
    await redisClient.flushDb();
    await redisClient.set('player:balance', '1000');
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterEach(async () => {
    await redisClient.flushDb();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  it("should play the game and return the result", async () => {
    const response = await request(app).post("/play").send({ bet: 50 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("matrix");
    expect(response.body).toHaveProperty("winnings");
  });

  it("should return insufficient balance error on play", async () => {
    await redisClient.set("player:balance", "0");

    const response = await request(app).post("/play").send({ bet: 50 });
    expect(response.status).toBe(403);
    expect(response.body.error.message).toBe(
      "User dont have insufficient balance !"
    );
  });

  it("should simulate multiple plays and return the result", async () => {
    const response = await request(app)
      .post("/sim")
      .send({ count: 3, bet: 20 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("totalWinnings");
    expect(response.body).toHaveProperty("netResult");
  });

  it("should return RTP value", async () => {
    const response = await request(app).get("/rtp");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("rtp");
  });

  it("should return an error when retrieving RTP fails", async () => {
    jest.spyOn(slotGameUseCase, "getRTP").mockImplementationOnce(() => {
      throw new Error("RTP retrieval error");
    });

    const response = await request(app).get("/rtp");
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe(
      "The server was unable to complete your request. Please try again later."
    );
  });
});
