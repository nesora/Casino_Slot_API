import { Request } from "express";
import { Random, MersenneTwister19937 } from "random-js";
import WalletService from "../services/WalletService";
import { InsufficientBalanceError } from "../Errors";

const engine = MersenneTwister19937.autoSeed();
const random = new Random(engine);

export default class SlotGameUseCase {
  private symbols = ["A", "S", "D", "Q", "E"];
  private matrixSize = 3;
  private totalBets = 0;
  private totalWinnings = 0;

  constructor(private readonly walletService: WalletService) {}

  public async play(bet: number): Promise<{ matrix: string[][]; winnings: number }> {
    
    // Check if the player has enough balance
    const hasEnoughBalance = await this.walletService.deduct(bet);

    if (! hasEnoughBalance) {
        throw new InsufficientBalanceError();
    }

    // Call the generate slot matrix method
    const matrix = this.generateSlotMatrix();

    // Call the calculateWinning method
    const winnings = this.calculateWinnings(matrix, bet);

    // Update total bets and total winnings
    this.totalBets += bet;
    this.totalWinnings += winnings;

    // Add winnings back to the wallet
    await this.walletService.addWinnings(winnings);

    // Return the matrix and potential winnings
    return { matrix, winnings };
}

  public async sim(req: Request): Promise<{ totalWinnings: number; netResult: number }> {
    const { count, bet } = req.body;
    let totalWinnings = 0;

    // Iterate the number of times, the player want to bet on
    for (let i = 0; i < count; i++) {

      // Directly pass bet
      const result = await this.play(bet);
      totalWinnings += result.winnings;
    }

    const netResult = totalWinnings - bet * count;

    return { totalWinnings, netResult };
  }

  public getRTP(): number {
    if (this.totalBets === 0) {
        // Avoid division by zero
        return 0; 
    }
    return (this.totalWinnings / this.totalBets) * 100;
}

  private generateSlotMatrix(): string[][] {
    const matrix: string[][] = [];
    for (let i = 0; i < this.matrixSize; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.matrixSize; j++) {
        const symbol = this.symbols[random.integer(0, this.symbols.length - 1)];
        row.push(symbol);
      }
      matrix.push(row);
    }
    return matrix;
  }

  // At the moment the multiply count of the winnings are hardcoded
  private calculateWinnings(matrix: string[][], bet: number): number {
    let winnings = 0;

    // Check for matching symbols in rows
    for (const row of matrix) {
      if (row.every((symbol) => symbol === row[0])) {
        winnings += 5 * bet;
      }
    }
    return winnings;
  }
}
