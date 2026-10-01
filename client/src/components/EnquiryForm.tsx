import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { ENQUIRY_TYPE_LABELS } from '../lib/labels';
import type { EnquiryType } from '../types';
import WhatsAppButton from './WhatsAppButton';
import { waMessages } from '../lib/whatsapp';

interface Props {
  variant?: 'contact' | 'bespoke';
  defaultType?: EnquiryType;
  productId?: string;
  productName?: string;
  submitLabel?: string;
}

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function EnquiryForm({ variant = 'contact', defaultType = 'general', productId, productName, submitLabel }: Props) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const bespoke = variant === 'bespoke';

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? '').trim();
    setState('sending');
    setError('');
    try {
      await api('/enquiries', {
        method: 'POST',
        auth: false,
        body: {
          type: bespoke ? 'bespoke' : get('type') || defaultType,
          name: get('name'),
          email: get('email'),
          phone: get('phone'),
          message: get('message'),
          designIdea: get('designIdea'),
          preferredContact: get('preferredContact') || 'email',
          measurements: get('measurements'),
          referenceImageUrl: get('referenceImageUrl'),
          productId,
          website: get('website'),
        },
      });
      setState('sent');
    } catch (err) {
      setError((err as Error).message);
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="border border-taupe/40 p-8 text-center sm:p-12" role="status">
        <p className="label mb-4 text-taupe">Thank you</p>
        <h3 className="mb-4 font-serif text-3xl uppercase sm:text-4xl">Your enquiry has been sent.</h3>
        <p className="mx-auto max-w-md text-deep">
          LucianaSoul will be in touch soon. For a quicker reply, you are welcome to continue the conversation on WhatsApp.
        </p>
        <WhatsAppButton
          className="mt-8"
          message={bespoke ? waMessages.bespoke : productName ? waMessages.piece(productName) : waMessages.general}
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-x-8 gap-y-7 sm:grid-cols-2" noValidate={false}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {productName && (
        <div className="sm:col-span-2">
          <span className="field-label">Piece</span>
          <p className="border-b border-taupe/60 py-3 font-serif text-xl">{productName}</p>
        </div>
      )}
      <label className="block">
        <span className="field-label">Name *</span>
        <input name="name" required autoComplete="name" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Email *</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Phone</span>
        <input name="phone" type="tel" autoComplete="tel" className="field" />
      </label>
      {bespoke ? (
        <label className="block">
          <span className="field-label">Preferred contact method</span>
          <select name="preferredContact" className="field" defaultValue="email">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
      ) : (
        <label className="block">
          <span className="field-label">Enquiry type</span>
          <select name="type" className="field" defaultValue={defaultType}>
            {Object.entries(ENQUIRY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {bespoke && (
        <>
          <label className="block sm:col-span-2">
            <span className="field-label">Your design idea *</span>
            <textarea name="designIdea" required rows={3} className="field resize-y" placeholder="Occasion, silhouette, fabrics, colours..." />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Measurements / notes</span>
            <textarea name="measurements" rows={2} className="field resize-y" />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Reference image URL (optional)</span>
            <input name="referenceImageUrl" type="url" className="field" placeholder="https://" />
          </label>
        </>
      )}

      <label className="block sm:col-span-2">
        <span className="field-label">{bespoke ? 'Message' : 'Message *'}</span>
        <textarea
          name="message"
          required={!bespoke}
          rows={4}
          className="field resize-y"
          defaultValue={productName ? `I'm interested in ${/^the\s/i.test(productName) ? productName : `the ${productName}`}.` : ''}
        />
      </label>

      {state === 'error' && (
        <p className="text-sm text-[#8a4b3c] sm:col-span-2" role="alert">
          {error || 'Something went wrong. Please try again or contact us on WhatsApp.'}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row">
        <button type="submit" disabled={state === 'sending'} className="btn-primary disabled:opacity-60">
          {state === 'sending' ? 'Sending...' : submitLabel ?? (bespoke ? 'Start a bespoke enquiry' : 'Send enquiry')}
        </button>
        <WhatsAppButton
          message={bespoke ? waMessages.bespoke : productName ? waMessages.piece(productName) : waMessages.general}
          label={bespoke ? 'Discuss your bespoke design' : 'Chat on WhatsApp'}
        />
      </div>
    </form>
  );
}
