const ALLOWED_LOGIN_DOMAINS = ['knnsyndicate.com', 'mhk.media', 'launchigo.in'] as const

export function isEmailFromAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return (ALLOWED_LOGIN_DOMAINS as readonly string[]).includes(domain)
}

export function getAllowedLoginDomainsLabel(): string {
  return ALLOWED_LOGIN_DOMAINS.map((d) => `@${d}`).join(', ')
}
