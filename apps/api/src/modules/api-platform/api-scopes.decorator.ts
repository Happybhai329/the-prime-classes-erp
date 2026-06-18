import { SetMetadata } from '@nestjs/common';
import { API_SCOPES_KEY } from './api-platform.constants';

export const ApiScopes = (...scopes: string[]) =>
  SetMetadata(API_SCOPES_KEY, scopes);
