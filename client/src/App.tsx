import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Collection = lazy(() => import('./pages/Collection'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Bespoke = lazy(() => import('./pages/Bespoke'));
const Journal = lazy(() => import('./pages/Journal'));
const JournalPost = lazy(() => import('./pages/JournalPost'));
const Contact = lazy(() => import('./pages/Contact'));
const EnquiryPage = lazy(() => import('./pages/EnquiryPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminApp = lazy(() => import('./admin/AdminApp'));

function PageFallback() {
  return <div className="min-h-[70vh]" aria-busy="true" />;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="collection" element={<Collection />} />
          <Route path="collection/:slug" element={<ProductDetail />} />
          <Route path="bespoke" element={<Bespoke />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<JournalPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="enquiry" element={<EnquiryPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
