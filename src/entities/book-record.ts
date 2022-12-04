import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "book-record" })
export class BookRecord {
  @PrimaryKey()
  _id!: string;

  @Property()
  url!: string;

  @Property({ default: [] })
  users?: string[];

  constructor(record: { id: string; url: string; users?: string[] }) {
    this._id = record.id;
    this.url = record.url;
    this.users = record.users;
  }
}
