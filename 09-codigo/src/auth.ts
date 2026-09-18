import type { IncomingMessage } from 'node:http';

export type RuntimeRole = 'admin' | 'operator' | 'reviewer' | 'publisher' | 'viewer';

export interface RuntimePrincipal {
  id: string;
  role: RuntimeRole;
  ownerId: string;
}

export interface RuntimeAuthConfig {
  tokens: Record<string, RuntimePrincipal>;
}

export interface AuthFailure {
  status: 401 | 403;
  error: 'missing_credential' | 'invalid_credential' | 'forbidden';
  detail: string;
}

export type AuthDecision = { ok: true; principal: RuntimePrincipal } | { ok: false; failure: AuthFailure };

const ROLE_RANK: Record<RuntimeRole, number> = {
  viewer: 10,
  operator: 20,
  reviewer: 30,
  publisher: 30,
  admin: 100,
};

function envPrincipal(tokenName: string, id: string, role: RuntimeRole): [string, RuntimePrincipal] | null {
  const token = process.env[tokenName];
  if (!token) return null;
  return [token, { id, role, ownerId: id }];
}

export function authConfigFromEnv(): RuntimeAuthConfig {
  const entries = [
    envPrincipal('AUTHORITY_ADMIN_TOKEN', 'runtime-admin', 'admin'),
    envPrincipal('AUTHORITY_OPERATOR_TOKEN', 'runtime-operator', 'operator'),
    envPrincipal('AUTHORITY_REVIEWER_TOKEN', 'runtime-reviewer', 'reviewer'),
    envPrincipal('AUTHORITY_PUBLISHER_TOKEN', 'runtime-publisher', 'publisher'),
    envPrincipal('AUTHORITY_VIEWER_TOKEN', 'runtime-viewer', 'viewer'),
  ].filter((entry): entry is [string, RuntimePrincipal] => entry !== null);
  return { tokens: Object.fromEntries(entries) };
}

export function authConfigForTests(principals: RuntimePrincipal[]): { config: RuntimeAuthConfig; tokens: Record<string, string> } {
  const tokens: Record<string, string> = {};
  const tokenMap: RuntimeAuthConfig['tokens'] = {};
  for (const principal of principals) {
    const token = `test-token-${principal.id}`;
    tokens[principal.id] = token;
    tokenMap[token] = principal;
  }
  return { config: { tokens: tokenMap }, tokens };
}

export function bearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || null;
}

export function authenticate(req: IncomingMessage, config: RuntimeAuthConfig): AuthDecision {
  const token = bearerToken(req);
  if (!token) {
    return { ok: false, failure: { status: 401, error: 'missing_credential', detail: 'Authorization: Bearer credential is required.' } };
  }
  const principal = config.tokens[token];
  if (!principal) {
    return { ok: false, failure: { status: 401, error: 'invalid_credential', detail: 'Credential is absent from local runtime auth configuration.' } };
  }
  return { ok: true, principal };
}

export function hasAnyRole(principal: RuntimePrincipal, roles: RuntimeRole[]): boolean {
  return roles.some((role) => principal.role === role) || roles.some((role) => ROLE_RANK[principal.role] >= ROLE_RANK[role] && principal.role === 'admin');
}

export function requireRoles(principal: RuntimePrincipal, roles: RuntimeRole[]): AuthFailure | null {
  if (principal.role === 'admin') return null;
  if (roles.includes(principal.role)) return null;
  if (roles.includes('viewer') && ROLE_RANK[principal.role] >= ROLE_RANK.viewer) return null;
  if (roles.includes('operator') && ROLE_RANK[principal.role] >= ROLE_RANK.operator && principal.role !== 'viewer') return null;
  return { status: 403, error: 'forbidden', detail: `Role ${principal.role} cannot perform this operation.` };
}

export function assertOwnership(principal: RuntimePrincipal, resource: { ownerId?: string } | undefined): AuthFailure | null {
  if (!resource || principal.role === 'admin') return null;
  if (!resource.ownerId || resource.ownerId === principal.ownerId) return null;
  return { status: 403, error: 'forbidden', detail: 'Resource belongs to another owner.' };
}

export function stampOwner<T extends object>(principal: RuntimePrincipal, value: T): T & { ownerId: string; createdBy: string } {
  return { ...value, ownerId: principal.ownerId, createdBy: principal.id };
}
