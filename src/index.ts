import { API } from "./API"
import { PersonsAPI } from "./namespaces/persons/persons-api"

const PORT = import.meta.env.PORT as string

API.new().use(PersonsAPI).listen(PORT)
