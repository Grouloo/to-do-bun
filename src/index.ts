import { API } from "./API"
import { PersonsAPI } from "./namespaces/persons/persons-api"

const PORT = Bun.env.PORT || "3000";

API.new().use(PersonsAPI).listen(PORT)
