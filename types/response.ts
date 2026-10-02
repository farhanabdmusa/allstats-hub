/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiResponse = {
    status: boolean;
    message?: string;
    data?: Map<string, any>;
    error?: string;
};
