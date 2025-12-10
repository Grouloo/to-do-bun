import { API } from "./API"
import { PersonsAPI } from "./namespaces/persons/persons-api"
import { TaskAPI } from "./namespaces/task/tasks-api";

const PORT = Bun.env.PORT || "3000";

API.new().use(PersonsAPI).listen(PORT)
API.new().use(TaskAPI).listen(PORT)