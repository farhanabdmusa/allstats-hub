
export interface User {
    id: number;
    email: string | null;
    sign_up_type: string | undefined;
    user_device: UserDevice[];
}

export interface UserDevice {
    uuid: string;
    last_session: Date;
}