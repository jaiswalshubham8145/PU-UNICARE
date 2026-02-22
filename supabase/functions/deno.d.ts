declare namespace Deno {
    export const env: {
        get(key: string): string | undefined;
    };
    export function serve(handler: (req: Request) => Promise<Response> | Response): void;
    export function serve(options: any, handler: (req: Request) => Promise<Response> | Response): void;
}
