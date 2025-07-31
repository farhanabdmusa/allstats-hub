/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const createApiResponse = ({ status, data, message, statusCode = 200 }: {
    status: boolean;
    data?: Map<string, any>;
    message?: string;
    statusCode?: number;
}) => {
    return NextResponse.json({
        status,
        data,
        message,
    }, {
        status: statusCode
    });
}

export default createApiResponse;