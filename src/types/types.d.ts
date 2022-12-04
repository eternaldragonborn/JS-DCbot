declare global {
  namespace NodeJS {
    interface ProcessEnv {
      "APP-TOKEN": string;
      "BOT-TOKEN": string;
      "SQL-HOST": string;
      "SQL-DB": string;
      "SQL-USER": string;
      "SQL-PWD": string;
      "MONGO-URI": string;
      "MONGO-PWD": string;
      "REDIS-HOST": string;
      "REDIS-PWD"?: string;
    }
  }
}

export {};
