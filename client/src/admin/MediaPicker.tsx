import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { SOURCE_LABELS } from '../lib/labels';
import type { Media, Paged } from '../types';
import MediaThumb from './MediaThumb';
import { Modal, inputCls, smallBtn } from './ui';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (items: Media[]) => void;
  multiple?: boolean;
  initial?: string[];
  title?: string;
}

/** Choose items from the media library. Selection order is preserved and becomes display order. */
export default function MediaPicker({ open, onClose, onSelect, multiple = true, initial = [], title = 'Choose media' }: Props) {
  const [items, setItems] = useState<Media[]>([]);
  const [selected, setSelected] = useState<string[]>(initial);
  const [source, setSource] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelected(initial);
    api<Paged<Media>>('/media?limit=200').then((res) => setItems(res.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const visible = useMemo(
    () =>
      items.filter(
        (m) =>
          (!source || m.source === source) &&
          (!query || `${m.title} ${m.caption} ${m.alt}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, source, query],
  );

  function toggle(id: string) {
    if (!multiple) {
      setSelected([id]);
      return;
    }
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input className={inputCls} placeholder="Search title, caption or alt text" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={`${inputCls} sm:w-56`} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-deep">The media library is empty. Add media in Admin, Media first.</p>
      ) : (
        <div className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
          {visible.map((m) => {
            const pos = selected.indexOf(m._id);
            return (
              <button
                key={m._id}
                type="button"
                onClick={() => toggle(m._id)}
                className={`relative text-left ${pos >= 0 ? 'outline outline-2 outline-offset-2 outline-ink' : 'opacity-80 hover:opacity-100'}`}
              >
                <MediaThumb media={m} />
                {pos >= 0 && (
                  <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center bg-ink text-xs text-cream">
                    {multiple ? pos + 1 : '✓'}
                  </span>
                )}
                <p className="mt-1 truncate text-xs text-deep">{m.title || m.caption || m.url}</p>
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3 border-t border-taupe/30 pt-4">
        <button type="button" className={smallBtn} onClick={() => setSelected([])}>
          Clear
        </button>
        <button
          type="button"
          className="btn-primary px-5 py-2.5"
          onClick={() => {
            const byId = new Map(items.map((m) => [m._id, m]));
            onSelect(selected.map((id) => byId.get(id)).filter((m): m is Media => Boolean(m)));
            onClose();
          }}
        >
          Use {selected.length} selected
        </button>
      </div>
    </Modal>
  );
}
