# Clojure-like multimethods for JavaScript/TypeScript

This is a simplified implementation of [Clojure's multimethods](https://clojure.org/reference/multimethods) that only 
supports strings as dispatch values and doesn't support hierarchical dispatch. 

Typical usage for multimethods is [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection). For 
example if you are building a whiteboarding app like [Whimsical](https://whimsical.com), you'll have bunch of different
object types on canvas such as shape, image, text, etc.

Multimethods allow you to define a generic method signature, for example `drawObject` and then add implementation for 
each object type elsewhere in the codebase. The key is that the code that defines and uses the multimethod doesn't need 
to know about the different object types.

If you come from OOP background, this is similar to defining an abstract method in a base class and then implementing 
it in subclasses. The difference is that multimethods work on pure data, not classes and unlike with classes, 
implementation may change dynamically if the object data changes (f.e. shape type is changed from `rectangle` to 
`ellipse`).
    
## Installation

Either copy [multimethod.ts](./multimethod.ts) to your project (it's only 40 lines of code) or install it from npm:

```bash
npm install @whimsical-code/multimethod
```

## Example usage

```ts
import { multimethod } from "@whimsical-code/multimethod";

interface Shape {
  type: "rectangle" | "ellipse";
  width: number;
  height: number;
}

const shapeArea = multimethod(
  (shape: Shape) => shape.type // dispatch function that should return a string
);

shapeArea.method("rectangle", (shape) => shape.width * shape.height);
shapeArea.method("ellipse", (shape) => Math.PI * shape.width * shape.height / 4);

shapeArea({ type: "rectangle", width: 2, height: 4 }); // 8
shapeArea({ type: "ellipse", width: 2, height: 4 }); // 6.28319
```

If there's no method implementation defined for a given dispatch value, by default the multimethod invocation will throw 
an error. Alternatively you can provide the default method implementation that will be invoked whenever there is no 
implementation for a dispatch value:

```ts
const echo = multimethod(
  (value: string) => value,
  (value: string) => `default method invoked for ${value}` // default method implementation
)
.method("foo", (_) => "foo") // method implementations can also be chained
.method("bar", (_) => "bar");

echo("foo"); // foo
echo("bar"); // bar
echo("baz"); // default method invoked for baz
```

## Typescript usage

To get a fully typed multimethod signature you have two options:

1. Define multimetod with a default method implementation. In this case the multimethod type can be fully inferred:
    ```ts
    // echo is inferred as (string) => string
    const echo = multimethod(
      (value: string) => value,
      (value: string) => `default method invoked for ${value}` // default method implementation
    );
    ```

2. Explicitly type the multimethod:
    ```ts
    // <array of method argument types, dispatch value type, method return type>
    // Explicit typing is neccessary because it's not possible to infer return value in this form.
    const echo = multimethod<[string], string, string>(
      (value: string) => value,
    );
    ```


## Caveats

In a larger codebase you'll typically want to have multimethod implementations in separate source files from the
definition. If you are using a JavaScript bundler with tree-shaking (such as Rollup/Vite), you'll need to make sure that
all the files that implement multimethods actually get evaluated. 

If you have files that only implement multimethods, you'll want to import them in the main entry file and make sure 
those files are marked as having side effects. Here's example for Vite:

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: {
        moduleSideEffects: ['some-file-that-implements-multimethods.ts'],
      },
    }
  }
});
```  
