import { html, Html } from "@elysiajs/html"
import type { Task } from "../task"
import { Layout } from "../../../templates/Layout"

export function ListTaskTemplate(tasks: Task[]) {
  return (
    <Layout title={"Liste des tâches"}>
      
      <div>
        <button hx-get="/task/sort/priority" hx-target="#task_list">Trier par Priorite</button>
        <button hx-get="/task/sort/date" hx-target="#task_list">Trier par Date</button>
      </div>
      <div id="task_list">  
        {tasks.map((task) => (
          <ul>
            <li>Tâche : {task.title}</li>
            <li>Description de la tâche : {task.description}</li>
            <li>Créée le : {new Date(task.createdAt).getDate()}/{new Date(task.createdAt).getMonth() + 1}/{new Date(task.createdAt).getFullYear()}</li>
            <li>Importance : {task.priority}</li>
            <li>Statut : {task.status}</li>
          </ul>
        ))}
      </div>
    </Layout>
  )
}
