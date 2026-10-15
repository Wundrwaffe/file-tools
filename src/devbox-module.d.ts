declare module './devbox-module/DevBox' {
  const DevBox: () => JSX.Element;
  export default DevBox;
}

declare module './devbox-module/ToolPage' {
  const ToolPage: () => JSX.Element;
  export default ToolPage;
}

declare module './devbox-module/tools' {
  export const TOOLS: Record<string, {
    title: string;
    seo?: {
      title: string;
      description: string;
    };
    render: () => JSX.Element;
  }>;
}