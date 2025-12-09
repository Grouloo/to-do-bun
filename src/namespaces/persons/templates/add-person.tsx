import { html, Html } from "@elysiajs/html"
import type { Person } from "../person"
import { Layout } from "../../../templates/Layout"
import { Form, type FormDefinition } from "../../../templates/components/Form"
import type { Loading } from "shulk"

type Props = {
  formDefinition: FormDefinition<any>
  formResult: Loading<Error, Person>
}

export function AddPerson(props: Props) {
  return (
    <Layout title={"Ajouter une personne"}>
      {props.formResult._state === "Done" && <p>Nouvelle personne enregistrée</p>}
      {props.formResult._state === "Failed" && (
        <p>Erreur : {props.formResult.val.message}</p>
      )}

      <Form method="POST" definition={props.formDefinition} />
    </Layout>
  )
}
