/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

declare module 'next/font/google' {
  const Inter: any;
  export { Inter };
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    prefetch: (url: string) => void;
  };
}

declare namespace React {
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
