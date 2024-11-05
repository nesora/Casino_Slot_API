import SlotGameUseCase from "../../../application/use-cases/SlotGameUseCase";
import WalletService from "../../../application/services/WalletService";
import { InsufficientBalanceError } from "../../../application/Errors";
import Player from "../../../domain/Player";

jest.mock("../../../application/services/WalletService");
jest.mock("../../../domain/Player");

describe("SlotGameUseCase", () => {
  let slotGame: SlotGameUseCase;
  let walletServiceMock: jest.Mocked<WalletService>;
  let playerMock: jest.Mocked<Player>;

  beforeEach(() => {
    playerMock = new Player(1) as jest.Mocked<Player>;
    walletServiceMock = new WalletService(playerMock) as jest.Mocked<WalletService>;

    walletServiceMock.deduct = jest.fn(async (amount: number) => {
      return true;
    });

    walletServiceMock.addWinnings = jest.fn(async (amount: number) => {});

    slotGame = new SlotGameUseCase(walletServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for the play method with a successful play
  test("should play successfully when the player has enough balance", async () => {
    const bet = 10;

    const result = await slotGame.play(bet);

    expect(walletServiceMock.deduct).toHaveBeenCalledWith(bet);
    expect(result).toHaveProperty("matrix");
    expect(result).toHaveProperty("winnings");
  });

  // Test case for the sim method with multiple plays
  test("should simulate multiple plays and return total winnings and net result", async () => {
    const bet = 5;
    const count = 3;

    // Mock the deduct method to return a resolved promise
    walletServiceMock.deduct.mockResolvedValue(true);

    const request = { body: { count, bet } } as any;

    const result = await slotGame.sim(request);

    expect(walletServiceMock.deduct).toHaveBeenCalledTimes(count);
    expect(walletServiceMock.addWinnings).toHaveBeenCalled();
    
    expect(result).toHaveProperty("totalWinnings");
    expect(result).toHaveProperty("netResult");
});

  // Test case for getRTP when there are no bets
  test("should return 0 RTP when no bets have been placed", () => {
    const rtp = slotGame.getRTP();
    expect(rtp).toBe(0);
  });

  // Test case for getRTP with bets and winnings using the sim
  test("should calculate RTP when bets and winnings exist", async () => {
    const bet = 5;
    const count = 60;

    walletServiceMock.deduct.mockResolvedValue(true);

    const request = { body: { count, bet } } as any;

    await slotGame.sim(request);

    const rtp = slotGame.getRTP();
    expect(rtp).toBeGreaterThan(0);
  });

  // Test case for insufficient balance
  test("should throw InsufficientBalanceError when player does not have enough balance", async () => {
    
     // Set a bet amount greater than the initial balance
    const bet = 5000000;

    // Mock the deduct method to return false to simulate insufficient balance
    walletServiceMock.deduct.mockResolvedValue(false);

    // Check that the play method throws an InsufficientBalanceError
    await expect(slotGame.play(bet)).rejects.toThrow(InsufficientBalanceError);
  });
});