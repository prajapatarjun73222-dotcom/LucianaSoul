import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { useFetch } from '../../lib/useFetch';
import {
  HOMEPAGE_SLOTS,
  type AdminUser,
  type DeveloperLead,
  type DeveloperSettings,
  type HomepageSlot,
  type Media,
  type Milestone,
  type Paged,
} from '../../types';
import { DEFAULT_ABOUT_TEXT, DEFAULT_MILESTONES } from '../../lib/aboutContent';
import { DEV_SERVICE_LABELS, formatDate } from '../../lib/labels';
import TextTabs from '../../components/TextTabs';
import MediaPicker from '../MediaPicker';
import MediaThumb from '../MediaThumb';
import { useAuth } from '../auth';
import { Field, PageHeader, Toggle, inputCls, smallBtn, dangerBtn, useToast } from '../ui';

interface AdminSettings {
  homepage: Record<HomepageSlot, string[]>;
  about: Record<'designer' | 'philosophy' | 'upcycling' | 'bespoke' | 'london', string> & {
    designerMedia?: string | null;
    milestones?: Milestone[];
  };
  sustainabilityText: string;
  contact: { phone: string; whatsapp: string; email: string; addressLines: string[]; instagram: string; googleMapsUrl: string };
  seo: { title: string; description: string; ogImage: string };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    notifyTo: string;
    notifyEnquiries: boolean;
    hasPassword?: boolean;
  };
  smtpConfigured: boolean;
  developer: DeveloperSettings;
}

const SLOT_INFO: Record<HomepageSlot, { label: string; hint: string }> = {
  hero: { label: 'Hero', hint: 'First item is the large hero image or video.' },
  featuredCollection: { label: 'Featured collection', hint: 'First item is used as the full-width editorial image; all are used if no pieces are featured.' },
  instagram: { label: 'Instagram section', hint: 'Up to 6 items for "From the LucianaSoul studio".' },
  sustainability: { label: 'Sustainability section', hint: 'Two images of fabrics, garments and details.' },
  bespoke: { label: 'Bespoke section', hint: 'Used on the homepage bespoke block and the Bespoke page.' },
  footerGallery: { label: 'Footer gallery', hint: 'Up to 6 small images above the footer.' },
};

const ABOUT_FIELDS = [
  ['designer', 'The Designer'],
  ['philosophy', 'The Philosophy'],
  ['upcycling', 'Up-cycling'],
  ['bespoke', 'Bespoke Design'],
  ['london', 'London'],
] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('homepage');
  const { data, reload } = useFetch<AdminSettings>('/admin/settings');
  const [s, setS] = useState<AdminSettings | null>(null);
  const [mediaById, setMediaById] = useState<Map<string, Media>>(new Map());
  const [pickerSlot, setPickerSlot] = useState<HomepageSlot | 'designerMedia' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);
  useEffect(() => {
    api<Paged<Media>>('/media?limit=200').then((res) => setMediaById(new Map(res.items.map((m) => [m._id, m]))));
  }, [pickerSlot]);

  const tabs = [
    { key: 'homepage', label: 'Homepage media' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact & SEO' },
    { key: 'email', label: 'Email (SMTP)' },
    { key: 'developer', label: 'Developer contact' },
    ...(user?.role === 'developer' ? [{ key: 'users', label: 'Admin users' }] : []),
    { key: 'account', label: 'My account' },
  ];

  async function save(section: Partial<AdminSettings>) {
    setSaving(true);
    try {
      await api('/admin/settings', { method: 'PUT', body: section });
      toast('Settings saved');
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!s) return <div className="skeleton h-96" />;

  const saveBtn = (onClick: () => void, label = 'Save') => (
    <button type="button" disabled={saving} onClick={onClick} className="btn-primary mt-6 px-6 py-3">
      {saving ? 'Saving...' : label}
    </button>
  );

  return (
    <>
      <PageHeader title="Settings" />
      <TextTabs tabs={tabs} active={tab} onChange={setTab} className="mb-8" />

      {tab === 'homepage' && (
        <div className="space-y-8">
          {HOMEPAGE_SLOTS.map((slot) => {
            const ids = s.homepage?.[slot] ?? [];
            return (
              <section key={slot} className="border border-taupe/30 p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl">{SLOT_INFO[slot].label}</h2>
                    <p className="text-xs text-taupe">{SLOT_INFO[slot].hint}</p>
                  </div>
                  <button type="button" className={smallBtn} onClick={() => setPickerSlot(slot)}>
                    Choose media
                  </button>
                </div>
                {ids.length === 0 ? (
                  <p className="text-sm text-taupe">Nothing selected.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {ids.map((id, i) => {
                      const m = mediaById.get(id);
                      return m ? (
                        <div key={id} className="relative">
                          <MediaThumb media={m} />
                          <span className="absolute bottom-1 right-1 bg-ink px-1.5 text-xs text-cream">{i + 1}</span>
                        </div>
                      ) : (
                        <div key={id} className="skeleton aspect-square" />
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
          <MediaPicker
            open={pickerSlot !== null && pickerSlot !== 'designerMedia'}
            onClose={() => setPickerSlot(null)}
            initial={pickerSlot && pickerSlot !== 'designerMedia' ? s.homepage?.[pickerSlot] ?? [] : []}
            title={pickerSlot && pickerSlot !== 'designerMedia' ? `Media for: ${SLOT_INFO[pickerSlot].label}` : ''}
            onSelect={(items) => {
              if (!pickerSlot || pickerSlot === 'designerMedia') return;
              const homepage = { ...s.homepage, [pickerSlot]: items.map((m) => m._id) };
              setS({ ...s, homepage });
              save({ homepage });
            }}
          />
        </div>
      )}

      {tab === 'about' && (
        <div className="max-w-3xl space-y-5">
          <p className="bg-sand p-4 text-sm leading-relaxed text-deep">
            Write in LucianaSoul's own words. Sections left empty show the built-in story text (shown faded in each box); if there is
            no built-in text, the section is hidden. Please only include real information: no invented awards, clients, statistics or
            certifications.
          </p>
          {ABOUT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label} hint="Separate paragraphs with a blank line.">
              <textarea
                rows={5}
                className={inputCls}
                placeholder={DEFAULT_ABOUT_TEXT[key]}
                value={s.about?.[key] ?? ''}
                onChange={(e) => setS({ ...s, about: { ...s.about, [key]: e.target.value } })}
              />
            </Field>
          ))}
          <MilestonesEditor
            items={s.about?.milestones ?? []}
            onChange={(milestones) => setS({ ...s, about: { ...s.about, milestones } })}
          />
          <div>
            <span className="field-label">Designer portrait (About page hero and homepage "Meet the designer")</span>
            <div className="flex items-center gap-4">
              <div className="w-28">
                {s.about?.designerMedia && mediaById.get(s.about.designerMedia) ? (
                  <MediaThumb media={mediaById.get(s.about.designerMedia)!} ratio="4/5" />
                ) : (
                  <div className="aspect-[4/5] bg-sand" />
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className={smallBtn} onClick={() => setPickerSlot('designerMedia')}>
                  Choose
                </button>
                {s.about?.designerMedia && (
                  <button type="button" className={smallBtn} onClick={() => setS({ ...s, about: { ...s.about, designerMedia: null } })}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <Field label="Homepage sustainability text" hint="Shown in the 'Fashion with a second story' section. Avoid unsupported environmental claims.">
            <textarea rows={4} className={inputCls} value={s.sustainabilityText ?? ''} onChange={(e) => setS({ ...s, sustainabilityText: e.target.value })} />
          </Field>
          {saveBtn(() => save({ about: s.about, sustainabilityText: s.sustainabilityText }))}
          <MediaPicker
            open={pickerSlot === 'designerMedia'}
            multiple={false}
            onClose={() => setPickerSlot(null)}
            initial={s.about?.designerMedia ? [s.about.designerMedia] : []}
            title="Designer portrait"
            onSelect={(items) => setS({ ...s, about: { ...s.about, designerMedia: items[0]?._id ?? null } })}
          />
        </div>
      )}

      {tab === 'contact' && (
        <div className="max-w-3xl space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone (displayed)">
              <input className={inputCls} value={s.contact.phone} onChange={(e) => setS({ ...s, contact: { ...s.contact, phone: e.target.value } })} />
            </Field>
            <Field label="WhatsApp number" hint="Digits only with country code, e.g. 447454720895">
              <input className={inputCls} value={s.contact.whatsapp} onChange={(e) => setS({ ...s, contact: { ...s.contact, whatsapp: e.target.value.replace(/\D/g, '') } })} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={s.contact.email} onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })} />
            </Field>
            <Field label="Instagram handle" hint="Without the @">
              <input className={inputCls} value={s.contact.instagram} onChange={(e) => setS({ ...s, contact: { ...s.contact, instagram: e.target.value.replace(/^@/, '') } })} />
            </Field>
          </div>
          <Field label="Address" hint="One line per row">
            <textarea
              rows={3}
              className={inputCls}
              value={s.contact.addressLines.join('\n')}
              onChange={(e) => setS({ ...s, contact: { ...s.contact, addressLines: e.target.value.split('\n') } })}
            />
          </Field>
          <Field label="Google Maps link (optional)" hint="Link to the Google Business Profile.">
            <input type="url" className={inputCls} value={s.contact.googleMapsUrl ?? ''} onChange={(e) => setS({ ...s, contact: { ...s.contact, googleMapsUrl: e.target.value } })} />
          </Field>
          <h2 className="pt-6 font-serif text-2xl">Search & sharing</h2>
          <Field label="Homepage title">
            <input className={inputCls} value={s.seo.title} onChange={(e) => setS({ ...s, seo: { ...s.seo, title: e.target.value } })} />
          </Field>
          <Field label="Homepage description">
            <textarea rows={3} className={inputCls} value={s.seo.description} onChange={(e) => setS({ ...s, seo: { ...s.seo, description: e.target.value } })} />
          </Field>
          <Field label="Default social sharing image URL (optional)">
            <input type="url" className={inputCls} value={s.seo.ogImage ?? ''} onChange={(e) => setS({ ...s, seo: { ...s.seo, ogImage: e.target.value } })} />
          </Field>
          {saveBtn(() =>
            save({ contact: { ...s.contact, addressLines: s.contact.addressLines.map((l) => l.trim()).filter(Boolean) }, seo: s.seo }),
          )}
        </div>
      )}

      {tab === 'email' && <SmtpTab s={s} setS={setS} save={save} saving={saving} />}
      {tab === 'developer' && <DeveloperTab s={s} setS={setS} save={save} saving={saving} />}
      {tab === 'users' && user?.role === 'developer' && <UsersTab />}
      {tab === 'account' && <AccountTab />}
    </>
  );
}

function SmtpTab({
  s,
  setS,
  save,
  saving,
}: {
  s: AdminSettings;
  setS: (v: AdminSettings) => void;
  save: (v: Partial<AdminSettings>) => Promise<void>;
  saving: boolean;
}) {
  const toast = useToast();
  const [testing, setTesting] = useState(false);
  const smtp = s.smtp;
  const setSmtp = (patch: Partial<AdminSettings['smtp']>) => setS({ ...s, smtp: { ...smtp, ...patch } });

  async function test() {
    setTesting(true);
    try {
      await api('/admin/settings/test-email', { method: 'POST' });
      toast(`Test email sent to ${smtp.notifyTo || 'the notification address'}`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <p className={`p-4 text-sm ${s.smtpConfigured ? 'bg-sand text-deep' : 'border border-taupe/50 text-deep'}`}>
        {!s.smtpConfigured
          ? 'Email is not set up. Enquiries are still saved in Admin, Enquiries. Fill in host, username and password to turn emails on.'
          : smtp.notifyEnquiries
            ? `Email is set up. Every new enquiry is emailed to Luciana at ${smtp.notifyTo || 'her contact email'}.`
            : 'Email is set up, but new-enquiry emails are switched OFF. Enquiries are still saved in Admin, Enquiries.'}
      </p>
      <Toggle
        checked={smtp.notifyEnquiries}
        onChange={(notifyEnquiries) => {
          setSmtp({ notifyEnquiries });
          save({ smtp: { notifyEnquiries } as AdminSettings['smtp'] });
        }}
        label="Email Luciana when a new enquiry arrives"
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="SMTP host" className="sm:col-span-2" hint="Gmail: smtp.gmail.com">
          <input className={inputCls} value={smtp.host} onChange={(e) => setSmtp({ host: e.target.value })} />
        </Field>
        <Field label="Port" hint="587 (TLS) or 465 (SSL)">
          <input type="number" className={inputCls} value={smtp.port} onChange={(e) => setSmtp({ port: Number(e.target.value) })} />
        </Field>
        <Field label="Username">
          <input className={inputCls} value={smtp.user} autoComplete="off" onChange={(e) => setSmtp({ user: e.target.value })} />
        </Field>
        <Field label="Password" hint={smtp.hasPassword ? 'Saved. Leave empty to keep it.' : 'For Gmail, use an App Password.'}>
          <input type="password" className={inputCls} value={smtp.pass} autoComplete="new-password" onChange={(e) => setSmtp({ pass: e.target.value })} />
        </Field>
        <div className="flex items-end pb-3">
          <Toggle checked={smtp.secure} onChange={(v) => setSmtp({ secure: v })} label="Use SSL (port 465)" />
        </div>
        <Field label="From address (optional)" className="sm:col-span-2" hint='e.g. "LucianaSoul Website <you@gmail.com>"'>
          <input className={inputCls} value={smtp.from} onChange={(e) => setSmtp({ from: e.target.value })} />
        </Field>
        <Field label="Luciana's email for new enquiries" hint="Every new enquiry is emailed here.">
          <input type="email" className={inputCls} value={smtp.notifyTo} onChange={(e) => setSmtp({ notifyTo: e.target.value })} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          className="btn-primary px-6 py-3"
          onClick={() => {
            const { hasPassword: _h, ...rest } = smtp;
            save({ smtp: rest });
          }}
        >
          {saving ? 'Saving...' : 'Save email settings'}
        </button>
        <button type="button" disabled={testing || !s.smtpConfigured} className="btn-outline px-6 py-3" onClick={test}>
          {testing ? 'Sending...' : 'Send test email'}
        </button>
        {s.smtpConfigured && (
          <button
            type="button"
            className={dangerBtn}
            onClick={() => save({ smtp: { ...smtp, host: '', user: '', pass: '' } as AdminSettings['smtp'] }).then(() => setSmtp({ host: '', user: '' }))}
          >
            Turn off emails
          </button>
        )}
      </div>
    </div>
  );
}

function MilestonesEditor({ items, onChange }: { items: Milestone[]; onChange: (items: Milestone[]) => void }) {
  const update = (i: number, patch: Partial<Milestone>) => onChange(items.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <section className="border border-taupe/30 p-5">
      <h2 className="font-serif text-2xl">Milestones</h2>
      <p className="mt-1 text-xs text-taupe">
        The "Not just clothes. A cause." timeline on the About page. While this list is empty, the built-in milestones are shown.
      </p>
      {items.length === 0 ? (
        <button type="button" className={`${smallBtn} mt-4`} onClick={() => onChange(DEFAULT_MILESTONES.map((m) => ({ ...m })))}>
          Edit the built-in milestones
        </button>
      ) : (
        <ol className="mt-4 space-y-4">
          {items.map((m, i) => (
            <li key={i} className="grid gap-3 border-t border-taupe/30 pt-4 sm:grid-cols-[10rem_1fr]">
              <input
                className={inputCls}
                placeholder="Date, e.g. July 2019"
                value={m.date}
                onChange={(e) => update(i, { date: e.target.value })}
              />
              <textarea rows={2} className={inputCls} placeholder="What happened" value={m.text} onChange={(e) => update(i, { text: e.target.value })} />
              <div className="flex gap-2 sm:col-start-2">
                <button type="button" className={smallBtn} disabled={i === 0} onClick={() => move(i, -1)}>
                  Up
                </button>
                <button type="button" className={smallBtn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  Down
                </button>
                <button type="button" className={dangerBtn} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <button type="button" className={`${smallBtn} mt-4 ${items.length === 0 ? 'ml-2' : ''}`} onClick={() => onChange([...items, { date: '', text: '' }])}>
        Add milestone
      </button>
    </section>
  );
}

function DeveloperTab({
  s,
  setS,
  save,
  saving,
}: {
  s: AdminSettings;
  setS: (v: AdminSettings) => void;
  save: (v: Partial<AdminSettings>) => Promise<void>;
  saving: boolean;
}) {
  const toast = useToast();
  const dev = s.developer;
  const setDev = (patch: Partial<DeveloperSettings>) => setS({ ...s, developer: { ...dev, ...patch } });
  const { data: leads, reload } = useFetch<{ items: DeveloperLead[]; unread: number }>('/admin/developer-leads');

  async function setStatus(id: string, status: DeveloperLead['status']) {
    try {
      await api(`/admin/developer-leads/${id}`, { method: 'PUT', body: { status } });
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this lead?')) return;
    await api(`/admin/developer-leads/${id}`, { method: 'DELETE' });
    toast('Lead deleted');
    reload();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <p className={`p-4 text-sm ${dev.enabled ? 'bg-sand text-deep' : 'border border-taupe/50 text-deep'}`}>
        {dev.enabled
          ? 'Developer contact is ON. The footer shows a "Website by" credit linking to the /web-development page.'
          : 'Developer contact is OFF. The footer credit and the /web-development page are hidden from visitors.'}
      </p>
      <Toggle
        checked={dev.enabled}
        onChange={(enabled) => {
          setDev({ enabled });
          save({ developer: { ...dev, enabled } });
        }}
        label="Show developer contact on website"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Developer name">
          <input className={inputCls} value={dev.name} onChange={(e) => setDev({ name: e.target.value })} />
        </Field>
        <Field label="Email" hint="Leads are emailed here (uses the SMTP settings).">
          <input type="email" className={inputCls} value={dev.email} onChange={(e) => setDev({ email: e.target.value })} />
        </Field>
        <Field label="WhatsApp number" hint="Digits only with country code, e.g. 919876543210">
          <input className={inputCls} value={dev.whatsapp} onChange={(e) => setDev({ whatsapp: e.target.value.replace(/\D/g, '') })} />
        </Field>
        <Field label="Portfolio link (optional)">
          <input type="url" className={inputCls} value={dev.portfolioUrl} onChange={(e) => setDev({ portfolioUrl: e.target.value })} />
        </Field>
      </div>
      <Field label="Page headline">
        <input className={inputCls} value={dev.headline} onChange={(e) => setDev({ headline: e.target.value })} />
      </Field>
      <Field label="Intro text">
        <textarea rows={4} className={inputCls} value={dev.intro} onChange={(e) => setDev({ intro: e.target.value })} />
      </Field>
      <button type="button" disabled={saving} className="btn-primary px-6 py-3" onClick={() => save({ developer: dev })}>
        {saving ? 'Saving...' : 'Save developer contact'}
      </button>

      <h2 className="pt-8 font-serif text-2xl">
        Leads {leads && leads.unread > 0 && <span className="label ml-2 text-taupe">{leads.unread} new</span>}
      </h2>
      {!leads?.items.length ? (
        <p className="text-sm text-taupe">No leads yet.</p>
      ) : (
        <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
          {leads.items.map((l) => (
            <li key={l._id} className="space-y-2 py-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {l.name} <span className="label ml-2 text-taupe">{DEV_SERVICE_LABELS[l.service] ?? l.service}</span>
                  </p>
                  <p className="text-xs text-deep">
                    <a href={`mailto:${l.email}`} className="link-underline">
                      {l.email}
                    </a>
                    {l.whatsapp && (
                      <>
                        {' '}
                        •{' '}
                        <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="link-underline">
                          {l.whatsapp}
                        </a>
                      </>
                    )}{' '}
                    • {formatDate(l.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    className="border border-taupe/50 bg-cream px-2 py-1 text-xs"
                    value={l.status}
                    onChange={(e) => setStatus(l._id, e.target.value as DeveloperLead['status'])}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button type="button" className={dangerBtn} onClick={() => remove(l._id)}>
                    Delete
                  </button>
                </div>
              </div>
              {l.message && <p className="whitespace-pre-wrap text-deep">{l.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UsersTab() {
  const toast = useToast();
  const { data, reload } = useFetch<AdminUser[]>('/admin/users');
  const owner = data?.find((u) => u.role === 'owner');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    try {
      await api('/admin/users/owner', {
        method: 'PUT',
        body: { email: String(form.get('email')), name: String(form.get('name')), password: String(form.get('password')) },
      });
      toast(owner ? 'Owner account updated' : 'Owner account created');
      el.reset();
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function removeOwner() {
    if (!confirm('Remove the owner account? They will no longer be able to sign in.')) return;
    await api('/admin/users/owner', { method: 'DELETE' });
    toast('Owner account removed');
    reload();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
        {data?.map((u) => (
          <li key={u._id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium">{u.name || u.email}</p>
              <p className="text-xs text-deep">{u.email}</p>
            </div>
            <span className="label text-taupe">{u.role}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit} className="space-y-4 border border-taupe/30 p-5">
        <h2 className="font-serif text-2xl">{owner ? 'Update owner account' : 'Create owner account'}</h2>
        <p className="text-xs text-deep">There is one owner account. Saving here sets its email and password; share these with the owner.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" className={inputCls} defaultValue={owner?.name} />
          </Field>
          <Field label="Email *">
            <input name="email" type="email" required className={inputCls} defaultValue={owner?.email} />
          </Field>
          <Field label="Password *" hint="At least 8 characters" className="sm:col-span-2">
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          </Field>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary px-6 py-3">
            {owner ? 'Update owner' : 'Create owner'}
          </button>
          {owner && (
            <button type="button" className={dangerBtn} onClick={removeOwner}>
              Remove owner
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function AccountTab() {
  const toast = useToast();
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    try {
      await api('/auth/password', {
        method: 'PUT',
        body: { currentPassword: String(form.get('current')), newPassword: String(form.get('next')) },
      });
      toast('Password changed');
      el.reset();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }
  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <Field label="Current password">
        <input name="current" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      <Field label="New password" hint="At least 8 characters">
        <input name="next" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
      </Field>
      <button type="submit" className="btn-primary px-6 py-3">
        Change password
      </button>
    </form>
  );
}
