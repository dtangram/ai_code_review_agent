/// <reference types="vite/client" />

declare module '*.module.scss' {
  const classes: { readonly [className: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { readonly [className: string]: string };
  export default classes;
}
