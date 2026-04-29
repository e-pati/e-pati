import { Role } from '@prisma/client';

export type TokenSubjectType = 'owner' | 'veterinarian';

export type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
  type: TokenSubjectType;
  clinicId?: string;
};
