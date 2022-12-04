export interface Message {
  _id: string
  pattern: string
  reaction: Reaction[]
  delete_after: number
}

export interface Reaction {
  type: "file" | "string" | "reaction"
  source: string
  delete_after?: number
  weight?: number
}