
export interface User {
    id: number;
    uuid: string;
    email: string | null;
    last_session: Date;
    sign_up_type_relation: {
        name: string;
    } | null;
}