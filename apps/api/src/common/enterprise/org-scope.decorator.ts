import { SetMetadata } from '@nestjs/common';

export const ORG_SCOPE_KEY = 'organization_scope';

export interface OrganizationScopeRequirement {
  permission?: string;
}

export const OrganizationScope = (permission?: string) =>
  SetMetadata(ORG_SCOPE_KEY, { permission } satisfies OrganizationScopeRequirement);
