import RedisClient from '../redisClient';

class Player {
  private redisClient;
  private balanceKey = 'player:balance';

  constructor(initialBalance: number = 1000) {
    this.redisClient = RedisClient.getInstance();

    // Await the initialization to ensure the balance is set before proceeding
    this.initializeBalance(initialBalance)
      .catch((error) => {
        console.error('Failed to initialize balance:', error);
      });
  }

  private async initializeBalance(initialBalance: number) {

    const client = await this.redisClient;

    const balance = await client.get(this.balanceKey);

    if (balance === null) {
      // Set the initial balance if it doesn't exist
      await client.set(this.balanceKey, initialBalance.toString());
    }
  }

  async getBalance(): Promise<number> {

    const client = await this.redisClient;

    const balance = await client.get(this.balanceKey);

    return balance ? parseFloat(balance) : 0;
  }

  async addBalance(amount: number): Promise<number> {

    const client = await this.redisClient;

    const newBalance = await client.incrByFloat(this.balanceKey, amount);

    return parseFloat(newBalance);
  }

  async deductBalance(amount: number): Promise<{ success: boolean; balance: number }> {

    const currentBalance = await this.getBalance();

    if (currentBalance >= amount) {

      const newBalance = await this.addBalance(-amount);

      return { success: true, balance: newBalance };
    } else {
      return { success: false, balance: currentBalance };
    }
  }

  // For debug purposes, after the project is started it will reset the balance of the player 
  async resetBalance(initialBalance: number = 1000) {

    const client = await this.redisClient;

    await client.set(this.balanceKey, initialBalance.toString());
  }
}

export default Player;