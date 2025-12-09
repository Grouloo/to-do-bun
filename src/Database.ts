import { Err, match, Ok, type AsyncResult, type Result } from "shulk"
import { ObjectMap } from "./utils"
import { NotFound } from "./types/HTTPErrors"
import { Database } from "bun:sqlite"

const hasher = new Bun.CryptoHasher("sha256")
const hash = (str: string) => hasher.update(str).digest("base64")

const DB_SCHEMA = import.meta.env.DB_SCHEMA

type TableDefinition<T extends object> = {
  table: string
  primaryKey: keyof T
  schema: {
    [x in keyof T]-?: T[x] extends number
      ? { type: "number" }
      : T[x] extends string
      ? { type: "text" } | { type: "relation"; table: string; foreignKey: string }
      : T[x] extends boolean
      ? { type: "boolean" }
      : { type: "unknown" }
  }
  oneToOne?: {
    [x in keyof T]?: TableDefinition<T>
  }
  geometry?: (keyof T)[]
}

interface Table<T extends object> {
  select: (...fields: (keyof T)[]) => Select<T>
  read: (key: string) => AsyncResult<NotFound | Error, T>
  insert: (obj: T) => AsyncResult<Error, T>
  update: (obj: T) => AsyncResult<Error, T>
  delete: (id: string) => AsyncResult<Error, {}>
}

type TableConstructor<T extends object> = (db: Database) => Table<T>

export function Table<T extends object>(
  definition: TableDefinition<T>,
): TableConstructor<T> {
  return (db: Database) => ({
    select: (...fields: (keyof T)[]) => new Select(db, definition, fields),

    read: async (key: string): AsyncResult<NotFound | Error, T> => {
      const result = await new Select(db, definition, [])
        .where(definition.primaryKey, "=", key)
        .limit(1)
        .run()

      return result
        .map((rows) => rows[0])
        .flatMap(
          (maybeRow): Result<NotFound, T> =>
            maybeRow !== undefined ? Ok(maybeRow) : Err(new NotFound()),
        )
    },

    insert: async (obj: T): AsyncResult<Error, T> => {
      try {
        await db
          .query(
            `INSERT INTO ${definition.table} VALUES (${Object.keys(definition.schema)
              .map(() => "?")
              .join(",")});`,
          )
          .run(...Object.keys(definition.schema).map((key) => obj[key as keyof object]))

        return Ok(obj)
      } catch (e) {
        return Err(e as Error)
      }
    },

    update: async (obj: T): AsyncResult<Error, T> => {
      try {
        await db
          .query(
            `UPDATE ${definition.table} SET ${Object.keys(definition.schema)
              .map((key) => key + "=" + "?")
              .join(",")} WHERE ${definition.primaryKey as string} = '${
              obj[definition.primaryKey]
            }';`,
          )
          .run(...Object.keys(definition.schema).map((key) => obj[key as keyof object]))

        return Ok(obj)
      } catch (e) {
        return Err(e as Error)
      }
    },

    delete: async (id: string): AsyncResult<Error, {}> => {
      try {
        await db
          .query(
            `DELETE FROM ${definition.table} WHERE ${
              definition.primaryKey as string
            } = '${id}';`,
          )
          .run()

        return Ok({})
      } catch (e) {
        return Err(e as Error)
      }
    },
  })
}

type Operator = "=" | ">" | ">=" | "<" | "<=" | "LIKE"
type Condition<T> = {
  field: keyof T
  op: Operator
  value: unknown
  or: []
}

class Join {}

class Select<T extends object> {
  protected selectedFields: (keyof T)[]
  protected useDistinct: boolean = false
  protected conditions: Condition<T>[] = []
  protected groupby: (keyof T)[] = []
  protected orders: { field: keyof T; sort: "ASC" | "DESC" }[] = []
  protected limitValue?: number
  protected offsetValue: number = 0

  constructor(
    protected db: Database,
    protected def: TableDefinition<T>,
    selectedField: (keyof T)[],
  ) {
    this.selectedFields = selectedField
  }

  join<S extends object>(table: TableConstructor<S>) {
    return this
  }

  distinct() {
    this.useDistinct = true
    return this
  }

  where(field: keyof T, op: Operator, value: unknown) {
    this.conditions.push({ field, op, value, or: [] })
    return this
  }

  groupBy(...fields: (keyof T)[]) {
    fields.forEach((field) => this.groupby.push(field))
    return this
  }

  orderBy(field: keyof T, sort: "ASC" | "DESC") {
    this.orders.push({ field, sort })
    return this
  }

  limit(limit: number) {
    this.limitValue = limit
    return this
  }

  offset(offset: number) {
    this.offsetValue = offset
    return this
  }

  protected makeCondition(condition: Condition<T>, i: number) {
    const field = String(condition.field)

    return `${field} ${condition.op} $${i + 1}`
  }

  protected prepareConditionsAndParams() {
    const conditions =
      this.conditions.length > 0
        ? `WHERE ${this.conditions.map(this.makeCondition).join(" AND ")}`
        : ""

    const params = this.conditions.flatMap((condition) =>
      match(condition.op).case({
        _otherwise: () => [condition.value],
      }),
    ) as string[]

    return { conditions, params }
  }

  async run(): AsyncResult<Error, T[]> {
    const db = this.db

    const { conditions, params } = this.prepareConditionsAndParams()

    const tableName = this.def.table

    const fieldsToSelect =
      this.selectedFields.length > 0 ? this.selectedFields.join(", ") : "*"

    const fields = this.def.geometry
      ? fieldsToSelect +
        ", " +
        this.def.geometry
          ?.map(
            (field) => `postgis.ST_AsGeoJSON(${field as string}) AS ${field as string}`,
          )
          .join(", ")
      : fieldsToSelect

    const groupby = this.groupby.length > 0 ? "GROUP BY " + this.groupby.join(", ") : ""

    const sortings =
      this.orders.length > 0
        ? `ORDER BY ${this.orders.map(
            (order) => `${order.field as string} ${order.sort}`,
          )}`
        : ``

    const joints = this.def.oneToOne
      ? Object.entries(this.def.oneToOne)
          .filter(([, value]) => value !== undefined)
          .map(
            ([prop, subdef]) =>
              // @ts-ignore
              `LEFT JOIN "${DB_SCHEMA}".${subdef.table} ON ${this.def.table}.${prop}=${subdef.table}.${subdef.primaryKey}`,
          )
          .join(" ")
      : ``

    const limit = this.limitValue ? `LIMIT ${this.limitValue}` : ``
    const offset = this.offsetValue ? `OFFSET ${this.offsetValue}` : ``

    const q = `SELECT ${fields} FROM ${tableName} ${joints} ${conditions} ${groupby} ${sortings} ${limit} ${offset};`

    const queryHash = hash(q + "-" + params.toString())
    try {
      const response = await db.query(q).all(...params)

      const parsedResponse = response

      if (!import.meta.env.PRODUCTION) {
        //    console.debug(parsedResponse[0])
      }

      return Ok(parsedResponse as T[])
    } catch (e: any) {
      if (e.message.includes("no such table")) {
        const newError = new Error(e.message + "\n Create with: " + this.generateSchema())
        console.error(newError)
        return Err(newError)
      } else {
        console.error(e)
        return Err(e as Error)
      }
    }
  }

  async count(): AsyncResult<Error, number> {
    const db = this.db

    const { conditions, params } = this.prepareConditionsAndParams()

    const q = `SELECT COUNT(*) FROM "${DB_SCHEMA}".${this.def.table} ${conditions};`

    const queryHash = hash(q + "-" + params.toString())

    try {
      const response = await db.query(q).all(...params)

      // @ts-expect-error
      const parsedResponse = parseInt(response[0].count)

      return Ok(parsedResponse)
    } catch (e) {
      return Err(e as Error)
    }
  }

  protected generateSchema() {
    const schema = Object.entries(this.def.schema)
      .map(([field, def]) => {
        const type = match((def as any).type).case({
          boolean: () => "BOOLEAN",
          number: () => "NUMERIC",
          text: () => "TEXT",
          "one-to-one": (def) => {
            return `TEXT REFERENCES ${def.table}(${def.identifier})`
          },
          array: () => "JSONB",
          json: () => "JSONB",
          date: () => "timestampz",
          _otherwise: () => "",
        })

        return `${field} ${type} ${field === this.def.primaryKey ? "PRIMARY KEY" : ""}`
      })
      .join(",")

    return `CREATE TABLE ${this.def.table} (${schema})`
  }
}

export type t_Select<T extends object> = Select<T>
