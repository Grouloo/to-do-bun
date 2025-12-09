import { html, Html } from "@elysiajs/html"

type Props = {
  title: string
  children: any
}

export function Layout(props: Props) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />

        <title>{props.title}</title>
      </head>

      <body>
        <h1>{props.title}</h1>

        <main>{props.children}</main>

        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script src="//unpkg.com/alpinejs" defer></script>
      </body>
    </html>
  )
}
