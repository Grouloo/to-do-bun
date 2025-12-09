import { Layout } from "./Layout"
import { Html, html } from "@elysiajs/html"

export function ErrorTemplate(error: Error) {
  return (
    <Layout title="Erreur">
      <p>{error.message}</p>
    </Layout>
  )
}
