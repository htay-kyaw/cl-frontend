'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { IoCamera, IoCashOutline, IoCheckmarkCircle, IoClose, IoCopyOutline, IoDownloadOutline, IoImageOutline } from 'react-icons/io5';
import { uploadPaymentScreenshot } from '@/app/actions/checkout';
import { useT } from '@/components/Providers';
import { compressImage, downloadUrl } from '@/lib/image';

const label = 'mb-2 text-[13px] font-semibold uppercase tracking-wide text-text-secondary';

export default function PaymentSection({ zone, banks, method, onMethod, screenshotUrl, onScreenshot, onUploading }) {
  const t = useT();
  const both = zone.accepts_cod && zone.accepts_screenshot;

  const options = [
    zone.accepts_cod && { value: 'cod', Icon: IoCashOutline, title: t('cod'), sub: t('cod_sub') },
    zone.accepts_screenshot && { value: 'screenshot', Icon: IoImageOutline, title: t('bank_transfer'), sub: t('bank_transfer_sub') },
  ].filter(Boolean);

  return (
    <section>
      <p className={label}>{t('payment_method')}</p>

      <div role="radiogroup" aria-label={t('payment_method')} className="flex flex-col gap-2">
        {options.map(({ value, Icon, title, sub }) => {
          const active = method === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!both}
              onClick={() => onMethod(value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left ${active ? 'border-primary bg-primary-light/40' : 'border-border bg-card'}`}
            >
              <Icon size={20} className="shrink-0 text-primary" />
              <span className="flex-1">
                <span className="block font-medium">{title}</span>
                <span className="block text-xs text-text-secondary">{sub}</span>
              </span>
              {both && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? 'border-primary' : 'border-border'}`}>
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {method === 'screenshot' && (
        <div className="mt-4 flex flex-col gap-4">
          {banks.length > 0 && <BankList banks={banks} />}
          <ScreenshotUpload url={screenshotUrl} onUrl={onScreenshot} onUploading={onUploading} />
        </div>
      )}
    </section>
  );
}

// Bank chips; tapping one shows holder, account number (copy) and QR (download)
function BankList({ banks }) {
  const t = useT();
  const dialogRef = useRef(null);
  const [bank, setBank] = useState(null);
  const [copied, setCopied] = useState(false);

  const open = (b) => { setBank(b); setCopied(false); dialogRef.current?.showModal(); };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bank.account_number);
      setCopied(true);
    } catch { /* clipboard blocked — the number is still visible to copy by hand */ }
  };

  return (
    <div>
      <p className={label}>{t('transfer_to')}</p>
      <div className="flex flex-wrap gap-2">
        {banks.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => open(b)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card py-2 pl-2 pr-4 hover:border-primary"
          >
            {b.bank_type?.image && (
              <Image src={b.bank_type.image} alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
            )}
            <span className="text-sm font-semibold uppercase">{b.bank_type?.name}</span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClick={e => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-background p-5 text-text backdrop:bg-black/60"
      >
        {bank && (
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {bank.bank_type?.image && <Image src={bank.bank_type.image} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />}
                <span className="text-lg font-bold uppercase">{bank.bank_type?.name}</span>
              </div>
              <button type="button" onClick={() => dialogRef.current.close()} aria-label={t('close')} className="p-1">
                <IoClose size={22} />
              </button>
            </div>

            <p className="text-xs text-text-secondary">{t('account_holder')}</p>
            <p className="mb-3 font-semibold">{bank.holder_name}</p>

            <p className="text-xs text-text-secondary">{t('account_number')}</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-lg font-bold tracking-wider">{bank.account_number}</p>
              <button type="button" onClick={copy} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary">
                {copied ? <IoCheckmarkCircle size={18} /> : <IoCopyOutline size={18} />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>

            {bank.qr_code && (
              <>
                <div className="relative mx-auto mt-4 aspect-square w-full max-w-64 overflow-hidden rounded-xl bg-white">
                  <Image src={bank.qr_code} alt={t('qr_code')} fill sizes="256px" className="object-contain" />
                </div>
                <a
                  href={downloadUrl(bank.qr_code)}
                  download
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary"
                >
                  <IoDownloadOutline size={18} /> {t('save_qr')}
                </a>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}

// Pick (camera or gallery on phones) → compress → upload via Server Action
function ScreenshotUpload({ url, onUrl, onUploading }) {
  const t = useT();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;

    setError(null);
    setBusy(true);
    onUploading(true);
    onUrl(null);
    setPreview(URL.createObjectURL(file));

    try {
      const form = new FormData();
      form.append('image', await compressImage(file));
      const result = await uploadPaymentScreenshot(form);
      if (result.ok) {
        onUrl(result.url);
      } else {
        setError(result.message);
        setPreview(null);
      }
    } catch {
      setError(t('upload_failed'));
      setPreview(null);
    } finally {
      setBusy(false);
      onUploading(false);
    }
  };

  return (
    <div>
      <p className={label}>{t('screenshot')}</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative flex min-h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface p-4 text-sm"
      >
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <span className="relative flex flex-col items-center gap-1.5">
          {busy ? (
            <>
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="font-medium">{t('uploading')}</span>
            </>
          ) : url ? (
            <>
              <IoCheckmarkCircle size={30} className="text-success" />
              <span className="font-semibold text-success">{t('uploaded_tap_change')}</span>
            </>
          ) : (
            <>
              <IoCamera size={36} className="text-text-secondary" />
              <span className="font-medium">{t('upload_screenshot')}</span>
              <span className="text-xs text-text-secondary">{t('camera_or_gallery')}</span>
            </>
          )}
        </span>
      </button>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
