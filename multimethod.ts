/**
 * TypeScript implementation of Clojure's multimethods. Note that this is a simplified implementation
 * that only supports strings as dispatch values and doesn't support hierarchical dispatch.
 * See https://clojure.org/reference/multimethods.
 */

const defaultDispatch = Symbol("defaultDispatch");

export type Method<Args extends unknown[], Return> = (...args: Args) => Return;

type Methods<Args extends unknown[], Dispatch extends string, Return> = Record<
  Dispatch | typeof defaultDispatch,
  Method<Args, Return>
>;

export interface Multimethod<Args extends unknown[], Dispatch extends string, Return> {
  (...args: Args): Return;
  method: (dispatch: Dispatch, method: Method<Args, Return>) => Multimethod<Args, Dispatch, Return>;
}

/**
 * Creates a multimethod with given dispatch function and optional default method implementation.
 * @param dispatchFn - Function that returns a dispatch value (must be a string)
 * @param defaultMethod - Optional default method implementation that will be invoked if no method is defined for a
 *                        given dispatch value. If no default method provided, the multimethod invocation will throw
 *                        an error if no method is defined for a given dispatch value.
 * @returns - Multimethod instance. It can be invoked directly as function. You can add method implementations for
 *            for different dispatch values with `method` method.
 *
 * @example
 * ```ts
 * interface Shape {
 *   type: "rectangle" | "ellipse";
 *   width: number;
 *   height: number;
 * }
 *
 * const shapeArea = multimethod(
 *   (shape: Shape) => shape.type,
 *   (shape: Shape) => shape.width * shape.height,
 * );
 *
 * shapeArea.method("ellipse", (shape) => Math.PI * shape.width * shape.height / 4);
 *
 * shapeArea({ type: "rectangle", width: 2, height: 4 }); // 8 - this invokes the default method
 * shapeArea({ type: "ellipse", width: 2, height: 4 }); // 6.28319
 * ```
 */
export function multimethod<Args extends unknown[], Dispatch extends string, Return>(
  dispatchFn: (...args: Args) => Dispatch,
  defaultMethod?: Method<Args, Return>,
) {
  const methods = {} as Methods<Args, Dispatch, Return>;
  const multimethod = ((...args: Args) => {
    const dispatch = dispatchFn(...args);
    const method = methods[dispatch] ?? methods[defaultDispatch];
    if (method == null) throw new Error(`No method defined for dispatch ${dispatch}`);
    return method(...args);
  }) as Multimethod<Args, Dispatch, Return>;
  multimethod.method = (dispatch, method) => {
    methods[dispatch] = method;
    return multimethod;
  };
  if (defaultMethod) {
    methods[defaultDispatch] = defaultMethod;
  }
  return multimethod;
}
