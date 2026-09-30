// Only allow same-site relative paths in ?next= to avoid open redirects
export function safeRedirect(next, fallback = '/') {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
