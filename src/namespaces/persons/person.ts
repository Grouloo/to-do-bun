import type { UUID } from "../../types/uuid"
import { Table } from "../../Database"

export type Person = {
  id: UUID
  firstname: string
  lastname: string
  email: string
  age: number
  gender: Gender
  emailValidated: boolean
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  UNKNOWN = "unknown",
}

export const PersonTable = Table<Person>({
  table: "persons",
  primaryKey: "id",
  schema: {
    id: {
      type: "text",
    },
    firstname: {
      type: "text",
    },
    lastname: {
      type: "text",
    },
    email: {
      type: "text",
    },
    age: {
      type: "number",
    },
    gender: {
      type: "text",
    },
    emailValidated: {
      type: "boolean",
    },
  },
})
