import { html, Html } from "@elysiajs/html"
import type { Person } from "../person"
import { Layout } from "../../../templates/Layout"

export function ListPersonsTemplate(persons: Person[]) {
  return (
    <Layout title={"Liste des personnes"}>
      {persons.map((person) => (
        <ul>
          <li>Nom : {person.firstname + " " + person.lastname}</li>
          <li>Âge : {person.age}</li>
          <li>Email : {person.email}</li>
        </ul>
      ))}
    </Layout>
  )
}
