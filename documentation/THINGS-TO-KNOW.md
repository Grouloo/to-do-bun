# Things to know

## Error handling

This is a TypeScript project, but there is something people may not realise about TypeScript, even when they work with it: error handling is terrible in this language.

In fact, it is so bad that the default way to handle errors — the try/catch clause — should be considered as a code smell.

Here is the problem with Typescript's try/catch clause: you not only get all the disavantages from this statement in other languages (slowing down the process speed), but you also do not get the security you get in other languages.

In Java, you know from a function's signature that it can throw an exception of a specific type. In Typescript, there is no way to add this information to the signature at all.

In Java, when you call a fallible function, the compiler forces you to handle the possible exception: either by adding the exception type in the signature, or by adding a `try/catch`. In Typescript the compiler doesn't force you to handle the error, it can just go up until it crashes your program without having you warned.

Default error handling in Typescript is basically putting `try/catch` everywhere and hope for the best, because you don't actually know what is going on.

So, what we do in this project is that we use a `Result` monad, which is a special type that can contains either a value or an error.

So, when we declare a fallible function in our code, instead of having a signature like `function fallibleFunction(): string` that makes us none the wiser, we have an explicit signature that tells us that the function can return an error `function fallibleFunction(): Result<Error, string>`

And then, when we will call the function, we will actually be forced by the compiler to handle the error.

Example:

```ts
import { Result, Ok, Err } from "shulk"

function divide(dividend: number, divisor: number): Result<Error, number> {
  if (divisor == 0) {
    return Err(new Error("Cannot divide by 0!"))
  } else {
    return Ok(dividend / divisor)
  }
}

divide(10, 2)
  .map((value) => console.log("10 / 2 = " + value)) // <-- Handles success case
  .mapErr((error) => console.error(err)) // <-- Handles failure case

const divisionResult = divide(6, 3).val // <-- Will be of type 'Error | number'
```

[Result monad documentation](https://shulk.org/docs/result/)

## DB relations

Example:

```ts
interface Person {
  id: UUID
  name: string
  age: number
}

const PersonTable = Table<Person>({
  table: "persons",
  primaryKey: "id",
  schema: {
    id: { type: "text" },
    name: { type: "text" },
    age: { type: "number" },
  },
})
```

## Templating

For the Hypertext representations of the resources, we are using JSX components.

**Remember this:** JSX templates _are not_ React components. They don't actually manage frontend state, they are converted to HTML code directly on the server, you cannot access any frontend feature from them.

JSX template example:

```tsx
interface Props {
  firstname: string
}

export function MyTemplate(props: Props) {
  const { firstname } = props

  return <div>Hello, {firstname}!</div>
}
```
