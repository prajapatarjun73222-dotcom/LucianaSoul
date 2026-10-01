interface Props {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/** Elegant text-only filter tabs that scroll horizontally on mobile. */
export default function TextTabs({ tabs, active, onChange, className = '' }: Props) {
  return (
    <div className={`-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 ${className}`}>
      <div role="tablist" className="flex w-max gap-7 sm:flex-wrap sm:gap-x-9 sm:gap-y-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={active === tab.key}
            aria-current={active === tab.key ? 'page' : undefined}
            onClick={() => onChange(tab.key)}
            className={`label link-underline whitespace-nowrap py-1 transition-colors ${
              active === tab.key ? 'text-ink' : 'text-taupe hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
