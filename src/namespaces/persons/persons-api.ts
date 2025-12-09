import type { Context } from "react"
import { API } from "../../API"
import { Field, onSubmit, type FormDefinition } from "../../templates/components/Form"
import { ErrorTemplate } from "../../templates/Error"
import { ObjectFlatMap } from "../../utils"
import { Gender, PersonTable, type Person } from "./person"
import { ListPersonsTemplate } from "./templates/list-persons"
import { None } from "shulk"
import { createUUID } from "../../types/uuid"
import { AddPerson } from "./templates/add-person"

export const PersonsAPI = API.new()

PersonsAPI.path("/persons", async (cxt) => {
  const fetchAllPersonsResult = await PersonTable(cxt.db).select().run()

  return fetchAllPersonsResult.map(ListPersonsTemplate).mapErr(ErrorTemplate).val
})

type AddPersonForm = {
  firstname: string
  lastname: string
  age: number
  email: string
  gender: Gender
}

PersonsAPI.path("/persons/actions/add", async (cxt) => {
  const ADD_PERSON_FORM: FormDefinition<AddPersonForm> = {
    firstname: Field.Text({ label: "Prénom", required: true }),
    lastname: Field.Text({ label: "Nom", required: true }),
    age: Field.Number({ label: "Âge", required: true }),
    email: Field.Text({ label: "Email", required: true }),
    gender: Field.Select({
      label: "Genre",
      required: true,
      options: ObjectFlatMap(Gender, (_, value) => ({ value: value })),
    }),
  }

  const formResult = await onSubmit(cxt, ADD_PERSON_FORM, (input) => {
    const newPerson: Person = {
      id: createUUID(),
      firstname: input.firstname,
      lastname: input.lastname,
      age: input.age,
      email: input.email,
      gender: input.gender,
      emailValidated: false,
    }

    return PersonTable(cxt.db).insert(newPerson)
  })

  return AddPerson({ formDefinition: ADD_PERSON_FORM, formResult })
})

PersonsAPI.path("/persons/:id/actions/validate-email", async (cxt) => {
  const { id } = cxt.params

  const readPersonResult = await PersonTable(cxt.db).read(id as string)

  const updatePersonResult = await readPersonResult
    .map((person) => ({ ...person, emailValidated: true }))
    .flatMapAsync((person) => PersonTable(cxt.db).update(person))
})
