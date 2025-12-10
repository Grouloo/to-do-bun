import { html, Html } from "@elysiajs/html"
import type { Task } from "../task"
import { Layout } from "../../../templates/Layout"

export function ListTaskTemplate(tasks: Task[]) {
  return (
    <Layout title={"Liste des tâches"}>
      {tasks.map((task) => (
        <ul>
          <li>Tâche : {task.title}</li>
          <li>Description de la tâche : {task.description}</li>
          <li>Créée le : {new Date(task.createdAt).getDate()}/{new Date(task.createdAt).getMonth() + 1}/{new Date(task.createdAt).getFullYear()}</li>
          <li>Importance : {task.priority}</li>
          <li>Statut : {task.status}</li>
        </ul>
      ))}
    </Layout>
  )
}
