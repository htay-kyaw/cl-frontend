'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { saveName } from '@/app/actions/auth';
import { useT } from '@/components/Providers';

export default function NameEditor({ name }) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await saveName(prev, formData);
    if (result.ok) setEditing(false);
    return result;
  }, null);

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <p className="font-medium">{name}</p>
        <button type="button" onClick={() => setEditing(true)} aria-label={t('edit_profile')} className="p-1 text-primary">
          <IoPencilOutline size={18} />
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          name="name"
          defaultValue={name}
          required
          maxLength={255}
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[15px] outline-none focus:border-primary"
        />
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3.5 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? '...' : t('save')}
        </button>
      </div>
      {state && !state.ok && <p className="text-sm text-danger">{state.message}</p>}
    </form>
  );
}
