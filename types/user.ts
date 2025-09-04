export type CreateUserPayload = {
    uuid: string;
    email?: string;
    manufacturer?: string;
    device_model?: string;
    os?: string;
    os_version?: string;
    is_virtual?: boolean;
    last_ip?: string;
    sign_up_type?: number;
};

export interface User {
    id: number;
    uuid: string;
    email: string | null;
    last_session: Date;
    sign_up_type_relation: {
        name: string;
    } | null;
}