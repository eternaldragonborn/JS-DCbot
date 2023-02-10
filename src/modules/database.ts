import { MikroORM, RequestContext } from "@mikro-orm/core";
import {
  EntityManager,
  MongoDriver,
  MongoEntityManager,
} from "@mikro-orm/mongodb";
import { RedisClientType } from "@redis/client";
import { createClient } from "redis";

import { BookRecord } from "../entities/book-record";
import { errorLogging, logger } from "./logger";

class Database {
  redis: RedisClientType;
  private mongodb!: MikroORM<MongoDriver>;
  mongoEm!: MongoEntityManager<MongoDriver>;

  constructor() {
    this.redis = createClient({
      url: "redis://" + process.env["REDIS_HOST"],
      password: process.env["REDIS_PASSWD"],
    });
  }

  async init() {
    try {
      await this.redis.connect();

      this.mongodb = await MikroORM.init<MongoDriver>({
        clientUrl: process.env["MONGO_URI"],
        user: "EternalDragonborn",
        password: process.env["MONGO_PWD"],
        entities: [BookRecord],
        dbName: "bot-data",
        type: "mongo",
      });
      this.mongoEm = this.mongodb.em;

      logger.info("database initialized");
    } catch (error: any) {
      errorLogging("failed to initialize database", { reason: error });
    }
  }

  /**
   * @param em ORM entity manager
   * @param cb 要執行的動作
   */
  createContext<T extends EntityManager<any>>(
    em: T,
    cb: (em: T) => Promise<unknown>,
  ) {
    return RequestContext.createAsync(em, () => cb(em));
  }
}

export const db = new Database();
