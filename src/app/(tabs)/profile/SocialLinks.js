import { FaFacebook, FaTelegramPlane, FaTiktok } from 'react-icons/fa';

// Shop's social accounts (Telegram opens the shop's account @Eichittt)
const SOCIAL = [
  { Icon: FaFacebook,      color: '#1877F2', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100063777256523' },
  { Icon: FaTelegramPlane, color: '#26A5E4', label: 'Telegram', url: 'https://t.me/Eichittt' },
  { Icon: FaTiktok,        color: '#010101', label: 'TikTok',   url: 'https://www.tiktok.com/@eichitdistribution' },
];

export default function SocialLinks() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">Contact &amp; Follow Us</p>
      <div className="flex gap-2.5">
        {SOCIAL.map(({ Icon, color, label, url }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: color }}
            className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-white hover:opacity-90"
          >
            <Icon size={22} />
            <span className="text-[11px] font-semibold">{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
