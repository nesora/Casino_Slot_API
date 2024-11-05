import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private static client: RedisClientType | null = null;

  static async getInstance(): Promise<RedisClientType> {

    if (!RedisClient.client) {
      RedisClient.client = createClient();
      await RedisClient.client.connect().catch((error) => {
        console.error('Failed to connect to Redis:', error);
      });
    }
    return RedisClient.client;
  }

}

export default RedisClient;