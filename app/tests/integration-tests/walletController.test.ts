import request from "supertest";
import express from "express";
import WalletController from "../../routes/WalletController";
import WalletService from "../../application/services/WalletService";
import Player from "../../domain/Player";
import { createClient } from "redis";

const app = express();
app.use(express.json());

const player = new Player(1000);
const walletService = new WalletService(player);
const walletController = new WalletController(walletService);

app.post("/wallet/deposit", (req, res) => walletController.deposit(req, res));
app.post("/wallet/withdraw", (req, res) => walletController.withdraw(req, res));
app.get("/wallet/balance", (req, res) => walletController.getBalance(req, res));

let redisClient: any;

describe("WalletController Integration Tests", () => {
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
    await redisClient.set("player:balance", "1000");
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterEach(async () => {
    await redisClient.flushDb();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  it("should deposit an amount and return the new balance", async () => {
    const response = await request(app)
      .post("/wallet/deposit")
      .send({ amount: 500 });

    expect(response.status).toBe(200);

    const balanceResponse = await request(app).get("/wallet/balance");
    expect(balanceResponse.body.balance).toEqual(1500);
  });

  it("should withdraw an amount and return the new balance", async () => {
    const response = await request(app)
      .post("/wallet/withdraw")
      .send({ amount: 300 });

    expect(response.status).toBe(200);

    const balanceResponse = await request(app).get("/wallet/balance");
    expect(balanceResponse.body.balance).toEqual(700);
  });

  it("should return an insufficient balance error on excessive withdrawal", async () => {
    const response = await request(app)
      .post("/wallet/withdraw")
      .send({ amount: 2000 });

    expect(response.status).toBe(403);
    expect(response.body.error.message).toBe(
      "User dont have insufficient balance !"
    );
  });

  it("should get the current balance", async () => {
    const response = await request(app).get("/wallet/balance");

    expect(response.status).toBe(200);
    expect(response.body.balance).toEqual(1000);
  });
});
