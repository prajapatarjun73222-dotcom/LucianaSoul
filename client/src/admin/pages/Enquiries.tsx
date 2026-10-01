import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useFetch } from '../../lib/useFetch';
import { ENQUIRY_TYPE_LABELS } from '../../lib/labels';
import { whatsappLink } from '../../lib/whatsapp';
import type { Enquiry, Paged } from '../../types';
import TextTabs from '../../components/TextTabs';
import { PageHeader, dangerBtn, inputCls, smallBtn, useToast } from '../ui';

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export default function Enquiries() {
  const toast = useToast();
  const [status, setStatus] = useState('all');
  const { data, loading, reload } = useFetch<Paged<Enquiry> & { unread: number }>(
    `/admin/enquiries?limit=100${status === 'all' ? '' : `&status=${status}`}`,
  );
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => setNotes(selected?.notes ?? ''), [selected]);

  async function update(e: Enquiry, body: Partial<Pick<Enquiry, 'status' | 'notes'>>) {
    try {
      const updated = await api<Enquiry>(`/admin/enquiries/${e._id}`, { method: 'PUT', body });
      setSelected(updated);
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function open(e: Enquiry) {
    setSelected(e);
    if (e.status === 'new') await update(e, { status: 'read' });
  }

  async function remove(e: Enquiry) {
    if (!confirm('Delete this enquiry permanently?')) return;
    await api(`/admin/enquiries/${e._id}`, { method: 'DELETE' });
    setSelected(null);
    reload();
  }

  const tabs = [{ key: 'all', label: 'All' }, ...STATUSES.map((s) => ({ key: s, label: s === 'new' ? `New (${data?.unread ?? 0})` : s }))];

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Every enquiry sent from the website is saved here, whether or not email notifications are configured." />
      <TextTabs tabs={tabs} active={status} onChange={setStatus} className="mb-6" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          {loading && !data ? (
            <div className="skeleton h-64" />
          ) : !data?.items.length ? (
            <p className="py-16 text-center text-deep">No enquiries.</p>
          ) : (
            <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
              {data.items.map((e) => (
                <li key={e._id}>
                  <button
                    type="button"
                    onClick={() => open(e)}
                    className={`block w-full px-3 py-3 text-left transition-colors ${selected?._id === e._id ? 'bg-sand' : 'hover:bg-sand/60'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`truncate ${e.status === 'new' ? 'font-semibold' : ''}`}>{e.name}</p>
                      <span className="shrink-0 text-xs text-taupe">{new Date(e.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-taupe">
                      {ENQUIRY_TYPE_LABELS[e.type]} · {e.status}
                    </p>
                    <p className="mt-1 truncate text-sm text-deep">{e.productName || e.designIdea || e.message}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {selected ? (
            <article className="border border-taupe/30 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="label text-taupe">{ENQUIRY_TYPE_LABELS[selected.type]}</p>
                  <h2 className="mt-2 font-serif text-3xl">{selected.name}</h2>
                  <p className="mt-1 text-xs text-taupe">
                    {new Date(selected.createdAt).toLocaleString('en-GB')} · Email notification {selected.emailNotified ? 'sent' : 'not sent'}
                  </p>
                </div>
                <select
                  className={`${inputCls} w-36`}
                  value={selected.status}
                  onChange={(ev) => update(selected, { status: ev.target.value as Enquiry['status'] })}
                  aria-label="Status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
                <dt className="text-taupe">Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="underline">
                    {selected.email}
                  </a>
                </dd>
                {selected.phone && (
                  <>
                    <dt className="text-taupe">Phone</dt>
                    <dd>
                      <a href={`tel:${selected.phone}`} className="underline">
                        {selected.phone}
                      </a>
                    </dd>
                  </>
                )}
                {selected.preferredContact && (
                  <>
                    <dt className="text-taupe">Preferred contact</dt>
                    <dd className="capitalize">{selected.preferredContact}</dd>
                  </>
                )}
                {selected.productName && (
                  <>
                    <dt className="text-taupe">Piece</dt>
                    <dd>{selected.productName}</dd>
                  </>
                )}
                {selected.designIdea && (
                  <>
                    <dt className="text-taupe">Design idea</dt>
                    <dd className="whitespace-pre-line">{selected.designIdea}</dd>
                  </>
                )}
                {selected.measurements && (
                  <>
                    <dt className="text-taupe">Measurements / notes</dt>
                    <dd className="whitespace-pre-line">{selected.measurements}</dd>
                  </>
                )}
                {selected.referenceImageUrl && (
                  <>
                    <dt className="text-taupe">Reference image</dt>
                    <dd>
                      <a href={selected.referenceImageUrl} target="_blank" rel="noopener noreferrer" className="break-all underline">
                        {selected.referenceImageUrl}
                      </a>
                    </dd>
                  </>
                )}
                {selected.message && (
                  <>
                    <dt className="text-taupe">Message</dt>
                    <dd className="whitespace-pre-line">{selected.message}</dd>
                  </>
                )}
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <a href={`mailto:${selected.email}?subject=${encodeURIComponent('Your LucianaSoul enquiry')}`} className={smallBtn}>
                  Reply by email
                </a>
                {selected.phone && (
                  <a href={whatsappLink(selected.phone, `Hi ${selected.name}, thank you for your enquiry to LucianaSoul.`)} target="_blank" rel="noopener noreferrer" className={smallBtn}>
                    Reply on WhatsApp
                  </a>
                )}
                <button type="button" className={dangerBtn} onClick={() => remove(selected)}>
                  Delete
                </button>
              </div>

              <label className="mt-6 block">
                <span className="field-label">Internal notes</span>
                <textarea rows={3} className={inputCls} value={notes} onChange={(ev) => setNotes(ev.target.value)} />
              </label>
              <button type="button" className={`${smallBtn} mt-2`} onClick={() => update(selected, { notes })}>
                Save notes
              </button>
            </article>
          ) : (
            <div className="flex h-64 items-center justify-center border border-dashed border-taupe/50 text-sm text-taupe">Select an enquiry</div>
          )}
        </div>
      </div>
    </>
  );
}
