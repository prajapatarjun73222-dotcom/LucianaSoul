import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../lib/settings';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

export const DEFAULT_TITLE = 'LucianaSoul | Bespoke & Up-Cycled Fashion Designer in London';
export const DEFAULT_DESCRIPTION =
  'LucianaSoul creates unique and bespoke clothing in London, combining creative design with up-cycled textiles and individual craftsmanship.';

export default function Seo({ title, description, image, type = 'website', jsonLd, noindex }: Props) {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const fullTitle = title ? `${title} | LucianaSoul` : settings?.seo?.title || DEFAULT_TITLE;
  const desc = description || settings?.seo?.description || DEFAULT_DESCRIPTION;
  const img = image || settings?.seo?.ogImage || `${origin}/logo.png`;
  const canonical = `${origin}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:site_name" content="LucianaSoul" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type === 'product' ? 'website' : type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="en_GB" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
