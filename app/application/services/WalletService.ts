import { InsufficientBalanceError } from "../Errors";
import Player from "@domain/Player";

export default class WalletService {
  private player: Player;

  constructor(player: Player) {
    // Use Player instance to manage balance
    this.player = player; 
  }

  public async getBalance(): Promise<number> {
    return await this.player.getBalance();
  }

  async deposit(amount: number): Promise<boolean> {
    await this.player.addBalance(amount);
    return true;
  }

  async withdraw(amount: number): Promise<boolean> {
    const result = await this.player.deductBalance(amount);
    if (! result.success) {
      throw new InsufficientBalanceError();
    }
    return true;
  }

  async deduct(amount: number): Promise<boolean> {
    return await this.withdraw(amount); 
  }

  async addWinnings(amount: number): Promise<void> {
    await this.player.addBalance(amount);
  }
}