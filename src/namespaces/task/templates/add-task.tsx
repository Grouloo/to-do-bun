import { html, Html } from "@elysiajs/html"
import type { Task } from "../task"
import { Layout } from "../../../templates/Layout"
import { Form, type FormDefinition } from "../../../templates/components/Form"
import type { Loading } from "shulk"

type Props = {
  formDefinition: FormDefinition<any>
  formResult: Loading<Error, Task>
}

export function AddTask(props: Props) {
  return (
    <Layout title={"Ajouter une tâche"}>
      {props.formResult._state === "Done" && <p>Nouvelle tâche ajoutée</p>}
      {props.formResult._state === "Failed" && (
        <p>Erreur : {props.formResult.val.message}</p>
      )}

      <Form method="POST" definition={props.formDefinition} />
    </Layout>
  )
}
