import { describe, expect, it } from "vitest";
import { multimethod } from ".";

describe("multimethod", () => {
  it("should create a multimethod without a default method", () => {
    const mm = multimethod((dispatch: string) => dispatch);
    expect(mm).toBeDefined();
    expect(() => mm("foo")).toThrowError("No method defined for dispatch foo");
  });

  it("should create a multimethod with a default method", () => {
    const mm = multimethod(
      (dispatch: string) => dispatch,
      (dispatch) => `default ${dispatch}`,
    );
    expect(mm).toBeDefined();
    expect(mm("foo")).toBe("default foo");
  });

  it("should add a method to a multimethod", () => {
    const mm = multimethod((dispatch: string) => dispatch).method("foo", (dispatch) => dispatch);
    expect(mm("foo")).toBe("foo");
    expect(() => mm("bar")).toThrowError("No method defined for dispatch bar");
  });
});
