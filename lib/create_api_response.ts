/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const createApiResponse = ({ status, data, zodError, message, statusCode = 200 }: {
    status: boolean;
    data?: any;
    zodError?: any;
    message?: string;
    statusCode?: number;
}) => {
    return NextResponse.json({
        status,
        data,
        message,
        zodError
    }, {
        status: statusCode
    });
}

export default createApiResponse;