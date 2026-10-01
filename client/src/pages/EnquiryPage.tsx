import { useSearchParams, Link } from 'react-router-dom';
import Seo from '../components/Seo';
import EnquiryForm from '../components/EnquiryForm';
import MediaView from '../components/MediaView';
import { heroMedia } from '../components/EditorialPiece';
import { useFetch } from '../lib/useFetch';
import { displayName, ENQUIRY_TYPE_LABELS } from '../lib/labels';
import type { EnquiryType, Product } from '../types';

export default function EnquiryPage() {
  const [params] = useSearchParams();
  const productId = params.get('product');
  const typeParam = params.get('type') as EnquiryType | null;
  const type: EnquiryType = typeParam && typeParam in ENQUIRY_TYPE_LABELS ? typeParam : productId ? 'collection' : 'general';
  const { data: product } = useFetch<Product>(productId ? `/products/id/${productId}` : null);
  const bespoke = type === 'bespoke';

  return (
    <>
      <Seo title="Enquire" description="Send an enquiry to LucianaSoul." />
      <section className="container-editorial grid gap-12 pb-12 pt-12 lg:grid-cols-12 lg:pt-20">
        <div className="lg:col-span-4">
          <p className="label text-taupe">{ENQUIRY_TYPE_LABELS[type]}</p>
          <h1 className="display mt-5 text-5xl sm:text-6xl">
            {product ? 'Enquire about this piece' : bespoke ? 'Request a bespoke design' : 'Contact LucianaSoul'}
          </h1>
          {product && (
            <Link to={`/collection/${product.slug}`} className="group mt-10 block max-w-xs">
              <MediaView media={heroMedia(product)} ratio="4/5" className="zoom-hover" sizes="320px" />
              <p className="mt-3 font-serif text-xl">{displayName(product.name)}</p>
            </Link>
          )}
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <EnquiryForm
            key={product?._id ?? type}
            variant={bespoke ? 'bespoke' : 'contact'}
            defaultType={type}
            productId={product?._id}
            productName={product ? displayName(product.name) : undefined}
          />
        </div>
      </section>
    </>
  );
}
