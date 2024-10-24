/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R, T = {}> {
    toBe(expected: any): R;
    toEqual(expected: any): R;
    toHaveLength(expected: number): R;
    toContain(expected: string): R;
    toThrow(expected?: string | Error): R;
    toBeInTheDocument(): R;
    toHaveStyle(expected: any): R;
    toHaveClass(expected: string): R;
  }

  interface Expect {
    <T = any>(actual: T): Matchers<void, T> & {
      rejects: {
        toThrow(expected?: string | Error): Promise<void>;
      };
    };
  }
}

declare module 'expect' {
  interface Matchers<R, T = {}> extends jest.Matchers<R, T> {}
}

declare module '@jest/expect' {
  interface Matchers<R, T = {}> extends jest.Matchers<R, T> {}
}

export {};
