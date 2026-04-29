import { Request } from 'express';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

export type AuthenticatedRequest = Request & {
  user: CurrentUserPayload;
};
