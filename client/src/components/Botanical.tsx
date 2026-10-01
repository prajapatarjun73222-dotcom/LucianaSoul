type P = { className?: string };

/** Fine line-art sprig echoing the leaves on the LucianaSoul logo. */
export function BotanicalSprig({ className = 'h-40 w-16' }: P) {
  return (
    <svg viewBox="0 0 80 220" fill="none" stroke="currentColor" strokeWidth="0.8" className={className} aria-hidden>
      <path d="M40 218C40 160 38 110 44 4" strokeLinecap="round" />
      <path d="M41 180c-14-4-24-14-27-28 13 2 24 12 27 28Z" />
      <path d="M41 160c13-5 21-16 22-30-12 4-20 15-22 30Z" />
      <path d="M41 128c-13-4-22-13-25-26 12 2 22 11 25 26Z" />
      <path d="M42 106c12-5 20-15 21-28-11 4-19 14-21 28Z" />
      <path d="M42 76c-11-4-19-12-21-24 11 2 19 10 21 24Z" />
      <path d="M43 56c10-4 17-13 18-24-10 3-16 12-18 24Z" />
      <path d="M43 30c-7-3-12-9-13-17 7 2 12 8 13 17Z" />
      <path d="M41 180c-8-8-13-17-14-26M41 160c7-8 11-17 12-25M41 128c-8-7-12-15-14-22M42 106c7-7 11-15 12-22" strokeWidth="0.5" />
    </svg>
  );
}

/** Horizontal botanical flourish used as a section divider. */
export function BotanicalDivider({ className = 'h-6 w-40' }: P) {
  return (
    <svg viewBox="0 0 200 30" fill="none" stroke="currentColor" strokeWidth="0.8" className={className} aria-hidden>
      <path d="M2 15h80M118 15h80" strokeLinecap="round" />
      <path d="M100 15c-6-8-6-12 0-14 6 2 6 6 0 14Z" />
      <path d="M100 15c-9-2-14-6-14-11 6 0 11 4 14 11Z" />
      <path d="M100 15c9-2 14-6 14-11-6 0-11 4-14 11Z" />
      <path d="M100 15c-7 4-12 9-12 14 5-1 10-6 12-14Z" />
      <path d="M100 15c7 4 12 9 12 14-5-1-10-6-12-14Z" />
    </svg>
  );
}

/** Dress-form silhouette with climbing leaves, after the logo mark. */
export function DressFormMark({ className = 'h-24 w-16' }: P) {
  return (
    <svg viewBox="0 0 100 160" fill="none" stroke="currentColor" strokeWidth="0.9" className={className} aria-hidden>
      <path d="M50 4v10M44 14h12" strokeLinecap="round" />
      <path d="M38 22c4-4 20-4 24 0 3 10-2 18-4 26-1 6 2 10 6 16 8 14 10 40 6 70H30c-4-30-2-56 6-70 4-6 7-10 6-16-2-8-7-16-4-26Z" />
      <path d="M50 150V60" strokeWidth="0.6" />
      <path d="M50 120c-10-2-16-8-18-17 9 1 16 7 18 17Z" />
      <path d="M50 100c10-3 15-10 16-19-9 2-15 9-16 19Z" />
      <path d="M50 80c-8-2-13-7-14-14 7 1 12 6 14 14Z" />
      <path d="M50 64c7-2 11-7 12-13-6 1-11 6-12 13Z" />
    </svg>
  );
}
