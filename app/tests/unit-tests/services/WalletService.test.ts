import WalletService from "../../../application/services/WalletService";
import { InsufficientBalanceError } from "../../../application/Errors";
import Player from "../../../domain/Player";

jest.mock("../../../domain/Player");

describe("WalletService", () => {
  let walletService: WalletService;
  let playerMock: jest.Mocked<Player>;

  beforeEach(() => {
    // Create a mocked Player
    playerMock = new Player(3000) as jest.Mocked<Player>; 

    // Initialize WalletService with the mocked Player
    walletService = new WalletService(playerMock); 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return the correct initial balance", async () => {
    // Mock the player's getBalance method to return 3000
    playerMock.getBalance.mockResolvedValue(3000);

    // Fetch the initial balance
    const balance = await walletService.getBalance();
    expect(balance).toBe(3000); // Check that the initial balance is 3000
  });

  // Test for depositing money
  test("should increase the balance when deposit is made", async () => {

    // Mock the player's getBalance method to return 3000 initially
    playerMock.getBalance.mockResolvedValue(3000);

    // Mock the player's addBalance method to actually update the balance correctly
    playerMock.addBalance = jest
      .fn()
      .mockImplementation(async (amount: number) => {
        // Simulate adding the amount to the current balance and return the new balance
        const currentBalance = await playerMock.getBalance();

        // Simulate the new balance after deposit
        const newBalance = currentBalance + amount;

        // Update the mock to return the new balance
        playerMock.getBalance.mockResolvedValue(newBalance);
        return newBalance;
      });

    // Initialize WalletService with the mocked player
    walletService = new WalletService(playerMock);

    // Perform the deposit
    await walletService.deposit(500);

    // Fetch the updated balance
    const balance2 = await walletService.getBalance();
    expect(balance2).toBe(3500);
  });

  // Test for successful withdrawal
  test("should decrease the balance when withdrawal is successful", async () => {
    // Mock the player's getBalance method to return 3000 initially
    playerMock.getBalance.mockResolvedValue(3000);

    // Mock the player's deductBalance method to actually update the balance correctly
    playerMock.deductBalance = jest
      .fn()
      .mockImplementation(async (amount: number) => {
        const currentBalance = await playerMock.getBalance();
        const newBalance = currentBalance - amount;

        playerMock.getBalance.mockResolvedValue(newBalance);

        return { success: true, balance: newBalance };
      });

    // Initialize WalletService with the mocked player
    walletService = new WalletService(playerMock);

    // Perform the withdrawal
    const result = await walletService.withdraw(1000);
    expect(result).toBe(true);

    // Fetch the updated balance
    const balance2 = await walletService.getBalance()
    expect(balance2).toBe(2000);
  });

  // Test for insufficient balance when withdrawing
  test("should throw InsufficientBalanceError when trying to withdraw more than balance", async () => {

    // Mock the current balance
    playerMock.getBalance.mockResolvedValue(3000);

    // Mock to simulate insufficient balance
    playerMock.deductBalance.mockResolvedValue({
      success: false,
      balance: 3000,
    });

    await expect(walletService.withdraw(4000)).rejects.toThrow(
      InsufficientBalanceError
    );
  });

  // Test for the deduct method
  test("should successfully deduct amount using the deduct method", async () => {
    // Mock the player's getBalance method to return the current balance of 3000
    playerMock.getBalance.mockResolvedValue(3000);

    // Mock the player's deductBalance method to update the balance correctly
    playerMock.deductBalance = jest
      .fn()
      .mockImplementation(async (amount: number) => {
        // Get the current balance
        const currentBalance = await playerMock.getBalance();

        // Calculate new balance after deduction
        const newBalance = currentBalance - amount;

        // Update mock to return new balance
        playerMock.getBalance.mockResolvedValue(newBalance);
        return { success: true, balance: newBalance };
      });

    // Initialize WalletService with the mocked player
    walletService = new WalletService(playerMock);

    // Perform the deduction
    const result = await walletService.deduct(500);
    expect(result).toBe(true);

    // Fetch the updated balance after deduction
    const balance = await walletService.getBalance();
    expect(balance).toBe(2500);
  });

  // Test for insufficient balance when using the deduct method
  test("should throw InsufficientBalanceError when trying to deduct more than balance", async () => {
    // Mock the current balance
    playerMock.getBalance.mockResolvedValue(3000);

    // Mock to simulate insufficient balance
    playerMock.deductBalance.mockResolvedValue({
      success: false,
      balance: 3000,
    });

    await expect(walletService.deduct(4000)).rejects.toThrow(
      InsufficientBalanceError
    );
  });

  // Test for adding winnings
  test("should increase the balance when adding winnings", async () => {
    // Mock the player's getBalance method to return an initial balance
    playerMock.getBalance.mockResolvedValue(3000);

    // Mock the player's addBalance method to reflect the new balance after adding winnings
    playerMock.addBalance = jest
      .fn()
      .mockImplementation(async (amount: number) => {
        const currentBalance = await playerMock.getBalance();
        const newBalance = currentBalance + amount;
        playerMock.getBalance.mockResolvedValue(newBalance);
        return newBalance;
      });

    // Initialize WalletService with the mocked player
    walletService = new WalletService(playerMock);

    // Add winnings
    await walletService.addWinnings(1000);

    // Fetch the updated balance after adding winnings
    const updatedBalance = await walletService.getBalance();

    expect(updatedBalance).toBe(4000);
  });
});
