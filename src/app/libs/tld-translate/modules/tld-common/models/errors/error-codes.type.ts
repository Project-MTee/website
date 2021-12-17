import { ErrorCode } from "./error-codes.enum";

export type ErrorCodesType = {
    [key in keyof typeof ErrorCode]?: string;
};