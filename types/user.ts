export interface User {
  id: number;
  email_pst: string | null;
  email_apple: string | null;
  email_google: string | null;
  user_device: UserDevice[];
}

export interface UserDevice {
  uuid: string;
  last_session: Date;
  sign_in_type?: string | null;
}
