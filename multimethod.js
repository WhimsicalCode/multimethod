"use strict";
/**
 * TypeScript implementation of Clojure's multimethods. Note that this is a simplified implementation
 * that only supports strings as dispatch values and doesn't support hierarchical dispatch.
 * See https://clojure.org/reference/multimethods.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.multimethod = multimethod;
var defaultDispatch = Symbol("defaultDispatch");
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
function multimethod(dispatchFn, defaultMethod) {
    var methods = {};
    var multimethod = (function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var dispatch = dispatchFn.apply(void 0, args);
        var method = (_a = methods[dispatch]) !== null && _a !== void 0 ? _a : methods[defaultDispatch];
        if (method == null)
            throw new Error("No method defined for dispatch ".concat(dispatch));
        return method.apply(void 0, args);
    });
    multimethod.method = function (dispatch, method) {
        methods[dispatch] = method;
        return multimethod;
    };
    if (defaultMethod) {
        methods[defaultDispatch] = defaultMethod;
    }
    return multimethod;
}