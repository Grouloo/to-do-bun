import type { Context } from "react"
import { API } from "../../API"
import { Field, onSubmit, type FormDefinition } from "../../templates/components/Form"
import { ErrorTemplate } from "../../templates/Error"
import { ObjectFlatMap } from "../../utils"
import { Priority, Status, TaskTable, type Task } from "./task"
import { ListTaskTemplate } from "./templates/list-tasks"
import { None, type Loading } from "shulk"
import { createUUID } from "../../types/uuid"
import { AddTask } from "./templates/add-task"


export const TaskAPI = API.new()

TaskAPI.path("/task", async (cxt) => {
  const fetchAllTaskResult = await TaskTable(cxt.db).select().run()

  return fetchAllTaskResult.map(ListTaskTemplate).mapErr(ErrorTemplate).val
})

type AddTaskForm = {
  title : string
  description : string
  priority : Priority
  status : Status
}

TaskAPI.path("/task/actions/add", async (cxt) => {
  const ADD_TASK_FORM: FormDefinition<AddTaskForm> = {
    title: Field.Text({ label: "Nom de tâche", required: true }),
    description: Field.Text({ label: "Description de la tâche", required: true }),
    priority: Field.Select({
      label: "Priorité",
      required: true,
      options: ObjectFlatMap(Priority, (_, value) => ({ value: value })),
    }),    
    status: Field.Select({
      label: "Statut",
      required: true,
      options: ObjectFlatMap(Status, (_, value) => ({ value: value })),
    }),
  }

  const formResult = await onSubmit(cxt, ADD_TASK_FORM, (input) => {
    const newTask: Task = {
        id: createUUID(),
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        createdAt: ""
    }

    return TaskTable(cxt.db).insert(newTask)
  })

  return AddTask({ formDefinition: ADD_TASK_FORM, formResult })
})


