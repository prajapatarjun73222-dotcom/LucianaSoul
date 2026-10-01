import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { DressFormMark } from '../components/Botanical';

export default function NotFound() {
  return (
    <section className="container-editorial flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Page not found" noindex />
      <DressFormMark className="h-28 w-20 text-taupe" />
      <h1 className="display mt-8 text-5xl sm:text-6xl">This page has moved on.</h1>
      <p className="mt-5 text-deep">The piece or page you were looking for is no longer here.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link to="/collection" className="btn-primary">
          Explore the collection
        </Link>
        <Link to="/" className="btn-outline">
          Return home
        </Link>
      </div>
    </section>
  );
}
