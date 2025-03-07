import redisClient from "../utils/redisClient";

class RedisService {
    static async safeCall<T>(operation: Promise<T>, errorMessage = "Redis transaction failed"): Promise<T> {
        try {
            return await operation;
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            throw new Error(errorMessage);  // This will be caught by global error middleware
        }
    }

    // 🔹 Set operations
    static async sAdd(key: string, members: string[] | string): Promise<number> {
      return this.safeCall(redisClient.sAdd(key, members), `Failed to add members to ${key}`);
  }

  static async sMembers(key: string): Promise<string[]> {
      return this.safeCall(redisClient.sMembers(key), `Failed to fetch members of set ${key}`);
  }

  static async sIsMember(key: string, member: string): Promise<boolean> {
      return this.safeCall(redisClient.sIsMember(key, member), `Failed to check if ${member} is in ${key}`);
  }

  static async sRem(key: string, members: string[] | string): Promise<number> {
      return this.safeCall(redisClient.sRem(key, members), `Failed to remove members from ${key}`);
  }

  // 🔹 Hash operations
  static async hSet(key: string, fieldValues: Record<string, string>): Promise<number> {
      return this.safeCall(redisClient.hSet(key, fieldValues), `Failed to set hash fields for ${key}`);
  }

  static async hGetAll(key: string): Promise<Record<string, string>> {
      return this.safeCall(redisClient.hGetAll(key), `Failed to get hash fields for ${key}`);
  }

  static async hDel(key: string, fields: string[]): Promise<number> {
      return this.safeCall(redisClient.hDel(key, fields), `Failed to delete hash fields from ${key}`);
  }

  // 🔹 JSON operations
  static async jsonSet(key: string, path: string, value: any): Promise<string | null> {
      return this.safeCall(redisClient.json.set(key, path, value), `Failed to set JSON data for ${key}`);
  }

  // static async jsonGet(key: string, path: string = "."): Promise<any> {
  //     return this.safeCall(redisClient.json.get(key, path), `Failed to get JSON data from ${key}`);
  // }

  // 🔹 List operations
  static async rPush(key: string, values: string[]): Promise<number> {
      return this.safeCall(redisClient.rPush(key, values), `Failed to push values to list ${key}`);
  }

  static async lRange(key: string, start: number, stop: number): Promise<string[]> {
      return this.safeCall(redisClient.lRange(key, start, stop), `Failed to get list range for ${key}`);
  }

  static async lPop(key: string): Promise<string | null> {
      return this.safeCall(redisClient.lPop(key), `Failed to pop from list ${key}`);
  }

  static async rPop(key: string): Promise<string | null> {
      return this.safeCall(redisClient.rPop(key), `Failed to remove last element from list ${key}`);
  }

  // 🔹 General operations
  static async del(key: string): Promise<number> {
      return this.safeCall(redisClient.del(key), `Failed to delete key ${key}`);
  }

  static async exists(keys: string[]): Promise<number> {
      return this.safeCall(redisClient.exists(keys), `Failed to check existence of keys`);
  }

  static async expire(key: string, seconds: number): Promise<boolean> {
      return this.safeCall(redisClient.expire(key, seconds), `Failed to set expiration for ${key}`);
  }

  static async ttl(key: string): Promise<number> {
      return this.safeCall(redisClient.ttl(key), `Failed to get TTL for ${key}`);
  }

  // 🔹 Multi/Transaction operations
  static async execMulti(transaction: any): Promise<any> {
      return this.safeCall(transaction.exec(), `Redis multi transaction failed`);
  }

}

export default RedisService;