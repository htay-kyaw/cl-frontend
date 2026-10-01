// Dates are shown in Myanmar time regardless of where the server runs
export function formatDate(iso, locale, withTime = false) {
  return new Intl.DateTimeFormat(locale === 'my' ? 'my-MM' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime && { hour: 'numeric', minute: '2-digit' }),
    timeZone: 'Asia/Yangon',
  }).format(new Date(iso));
}
