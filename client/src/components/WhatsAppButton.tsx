import { useSettings } from '../lib/settings';
import { whatsappLink } from '../lib/whatsapp';
import { WhatsAppIcon } from './Icons';

interface Props {
  message: string;
  label?: string;
  variant?: 'outline' | 'primary' | 'light' | 'text';
  className?: string;
}

export default function WhatsAppButton({ message, label = 'Chat on WhatsApp', variant = 'outline', className = '' }: Props) {
  const { contact } = useSettings();
  const base =
    variant === 'text'
      ? 'label inline-flex items-center gap-2 link-underline text-ink'
      : variant === 'primary'
        ? 'btn-primary'
        : variant === 'light'
          ? 'btn-light'
          : 'btn-outline';
  return (
    <a href={whatsappLink(contact.whatsapp, message)} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`}>
      <WhatsAppIcon className="h-4 w-4" />
      {label}
    </a>
  );
}
