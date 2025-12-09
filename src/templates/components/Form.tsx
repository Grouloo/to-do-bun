import {
  match,
  union,
  type InferUnion,
  Failed,
  type Loading,
  Done,
  Pending,
  type AsyncResult,
} from "shulk"
import { Html, html } from "@elysiajs/html"
import type { Context } from "../../API"
import { BadRequest } from "../../types/HTTPErrors"
import { ObjectFlatMap, ObjectMap } from "../../utils"

export const Field = union<{
  Text: {
    label: string
    defaultValue?: string
    required: boolean
  }
  TextArea: {
    label: string
    defaultValue?: string
    required: boolean
  }
  Number: {
    label: string
    defaultValue?: number
    required: boolean
    unit?: string
  }
  DateTime: {
    label: string
    defaultValue?: string
    required: boolean
  }
  Select: {
    label: string
    options: Record<string, string>
    defaultValue?: string
    required: boolean
  }
}>()

export type FieldType = InferUnion<typeof Field>

export type FormDefinition<T extends object> = {
  [x in keyof T]-?: T[x] extends string
    ? FieldType["Text" | "Select"]
    : T[x] extends number
    ? FieldType["Number"]
    : T[x] extends Date
    ? FieldType["DateTime"]
    : FieldType["any"]
}

export async function onSubmit<T extends object, O>(
  cxt: Context,
  formDefinition: FormDefinition<T>,
  handler: (input: T) => AsyncResult<Error, O>,
): Promise<Loading<Error, O>> {
  if (cxt.request.method === "POST") {
    let formData

    try {
      formData = await cxt.request.formData()
    } catch (e) {
      return Failed(new BadRequest("Mauvais format d'entrée"))
    }

    try {
      const input = ObjectFlatMap(formDefinition, (name, field: FieldType["any"]) => {
        const value = formData.get(name) as string

        if (field.required === true && (value === "" || value === null)) {
          throw new BadRequest(`Le champ ${field.label} n'est pas rempli.`)
        } else {
          return {
            [name]: match(field)
              .returnType<string | number | boolean>()
              .case({
                Number: () => parseFloat(value),
                _otherwise: () => value,
              }),
          }
        }
      })

      const result = await handler(input as T)

      return result.toLoading()
    } catch (e) {
      return Failed(e as Error)
    }
  } else {
    return Pending()
  }
}

interface Props<T extends object> {
  method: "GET" | "POST"
  definition: FormDefinition<T>
  submitLabel?: string
}

export function Form<T extends Object>(props: Props<T>) {
  const { method, definition } = props

  return (
    <form method={method}>
      {Object.entries(definition).map(([name, field]) =>
        match(field as FieldType["any"]).case({
          Text: (field) => (
            <div class="field">
              <label for={name}>{field.label}</label>
              <br />
              <input
                type="text"
                autocomplete="off"
                name={name}
                id={name}
                required={field.required}
                placeholder={field.label}
                value={field.defaultValue || ""}
              ></input>
            </div>
          ),
          TextArea: (field) => (
            <div class="field">
              <label for={name}>{field.label}</label>
              <br />
              <textarea
                name={name}
                id={name}
                required={field.required}
                placeholder={field.label}
              >
                {field.defaultValue || ""}
              </textarea>
            </div>
          ),
          Number: (field) => (
            <div className="field">
              <label for={name}>{field.label}</label>
              <br />
              <input
                type="number"
                step="any"
                autocomplete="off"
                name={name}
                id={name}
                required={field.required}
                placeholder={field.label}
                value={field.defaultValue?.toString() || ""}
              ></input>
              {field.unit}
            </div>
          ),
          DateTime: (field) => (
            <div class="field">
              <label for={name}>{field.label}</label>
              <br />
              <input
                type="datetime-local"
                name={name}
                id={name}
                required={field.required}
                placeholder={field.label}
                value={field.defaultValue || ""}
              ></input>
            </div>
          ),
          Select: (field) => (
            <div class="field">
              <label for={name}>{field.label}</label>
              <br />
              <select name={name} id={name} required={field.required}>
                <option value="">{"---"}</option>
                {Object.entries(field.options).map(([key, txt]) => (
                  <option value={key} selected={field.defaultValue === key}>
                    {txt}
                  </option>
                ))}
              </select>
            </div>
          ),
        }),
      )}

      <button
        type="submit"
        className="success shadow button"
        style={{ height: "54px", width: "100%" }}
      >
        {props.submitLabel || "Envoyer"}
      </button>
    </form>
  )
}
