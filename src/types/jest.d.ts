/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveLength(expected: number): R;
      toContain(expected: string): R;
      toThrow(expected?: string | Error): R;
      toBeInTheDocument(): R;
      toHaveStyle(expected: any): R;
      toHaveClass(expected: string): R;
    }
  }
}

declare module 'expect' {
  interface Matchers<R> {
    toBe(expected: any): R;
    toEqual(expected: any): R;
    toHaveLength(expected: number): R;
    toContain(expected: string): R;
    toThrow(expected?: string | Error): R;
    toBeInTheDocument(): R;
    toHaveStyle(expected: any): R;
    toHaveClass(expected: string): R;
  }
}

declare module 'expect/build/matchers' {
  interface Matchers<R> {
    toBe(expected: any): R;
    toEqual(expected: any): R;
    toHaveLength(expected: number): R;
    toContain(expected: string): R;
    toThrow(expected?: string | Error): R;
    toBeInTheDocument(): R;
    toHaveStyle(expected: any): R;
    toHaveClass(expected: string): R;
  }
}

declare function expect<T = any>(actual: T): jest.Matchers<void, T> & {
  rejects: {
    toThrow(expected?: string | Error): Promise<void>;
  };
};

export {};
