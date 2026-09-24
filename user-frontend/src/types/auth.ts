export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  is_active: boolean;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export type AuthSuccessPayload = {
  user: AuthUser;
};
