// 全局类型声明
declare module 'minimatch' {
  function minimatch(path: string, pattern: string, options?: any): boolean;
  export = minimatch;
}

// 声明其他可能缺失的类型
declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
} 