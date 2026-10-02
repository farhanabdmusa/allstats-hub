export interface UserAdmin {
  id: number;
  uuid: string;
  email: string;
  name: string;
  is_admin: boolean;
  last_signin_at: Date | null;
  admin_updated_by: string | null;
  admin_updated_at: Date | null;
  created_at: Date;
}
