import Seo from '../components/Seo';
import EnquiryForm from '../components/EnquiryForm';
import WhatsAppButton from '../components/WhatsAppButton';
import Reveal from '../components/Reveal';
import { BotanicalSprig } from '../components/Botanical';
import { InstagramIcon } from '../components/Icons';
import { instagramUrl, useSettings } from '../lib/settings';
import { waMessages } from '../lib/whatsapp';

export default function Contact() {
  const { contact } = useSettings();
  const mapsUrl =
    contact.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(['LucianaSoul', ...contact.addressLines].join(', '))}`;

  return (
    <>
      <Seo title="Contact" description="Contact LucianaSoul in London about bespoke designs, collection pieces, collaborations and textiles." />

      <section className="container-editorial pb-12 pt-12 lg:pt-20">
        <p className="label animate-fadeUp text-taupe">Contact</p>
        <h1 className="display mt-6 animate-fadeUp text-[11vw] [animation-delay:120ms] sm:text-7xl xl:text-8xl">
          Let's create
          <br />
          something beautiful.
        </h1>
      </section>

      <section className="container-editorial grid gap-16 pb-12 lg:grid-cols-12">
        <Reveal className="relative space-y-10 lg:col-span-4">
          <div>
            <p className="label mb-3 text-taupe">Phone</p>
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="link-underline font-serif text-2xl text-ink">
              {contact.phone}
            </a>
          </div>
          <div>
            <p className="label mb-3 text-taupe">Email</p>
            <a href={`mailto:${contact.email}`} className="link-underline break-all font-serif text-2xl text-ink">
              {contact.email}
            </a>
          </div>
          <div>
            <p className="label mb-3 text-taupe">Studio</p>
            <address className="font-serif text-2xl not-italic leading-snug text-ink">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="label link-underline mt-3 inline-block text-deep">
              View on Google Maps
            </a>
          </div>
          <div>
            <p className="label mb-3 text-taupe">Instagram</p>
            <a
              href={instagramUrl(contact.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline flex w-fit items-center gap-2 font-serif text-2xl text-ink"
            >
              <InstagramIcon className="h-5 w-5" /> @{contact.instagram}
            </a>
          </div>
          <WhatsAppButton message={waMessages.general} variant="primary" />
          <BotanicalSprig className="hidden h-44 w-16 text-taupe/70 lg:block" />
        </Reveal>

        <div className="lg:col-span-7 lg:col-start-6">
          <p className="label mb-8 text-taupe">Send an enquiry</p>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
