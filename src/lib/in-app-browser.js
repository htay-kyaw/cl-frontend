// Google blocks sign-in inside apps' built-in browsers ("Error 403: disallowed_useragent"),
// e.g. when a shopper taps our link in Telegram. Spot them so we can send the shopper to
// Chrome/Safari instead of showing a button that can't work.
const APPS = [
  ['Telegram',  /Telegram/i],
  ['Messenger', /\bFB_IAB\/MESSENGER|\bMessengerForiOS|\bFBAN\/Messenger/i],
  ['Facebook',  /\bFBAN|\bFBAV|\bFB_IAB/i],
  ['Instagram', /Instagram/i],
  ['Viber',     /Viber/i],
  ['LINE',      /\bLine\//i],
  ['TikTok',    /musical_ly|BytedanceWebview|TikTok/i],
  ['WeChat',    /MicroMessenger/i],
];

export function detectInAppBrowser(userAgent = '') {
  const os = /android/i.test(userAgent) ? 'android' : /iphone|ipad|ipod/i.test(userAgent) ? 'ios' : 'other';

  const app = APPS.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? null;

  // Unnamed apps: Android WebViews carry "; wv)", iOS WebViews lack the "Safari/" token
  // (real Safari, Chrome, Firefox and Edge on iOS all include it).
  const webView = (os === 'android' && /; wv\)/.test(userAgent))
    || (os === 'ios' && /AppleWebKit/i.test(userAgent) && !/Safari\//i.test(userAgent));

  return { inApp: Boolean(app) || webView, app, os };
}
