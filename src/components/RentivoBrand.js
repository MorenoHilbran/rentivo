import Image from 'next/image'
import logo from '@/app/logo.png'

export default function RentivoBrand({
  label = 'Rentivo',
  eyebrow = 'CRM Suite',
  tone = 'default',
  compact = false,
}) {
  return (
    <div className={`rentivo-brand rentivo-brand-${tone}${compact ? ' rentivo-brand-compact' : ''}`}>
      <Image
        src={logo}
        alt="Rentivo logo"
        className="rentivo-brand-image"
        priority
        sizes={compact ? '132px' : '172px'}
      />
      {(label !== 'Rentivo' || eyebrow) && (
        <div className="rentivo-brand-copy">
          {label !== 'Rentivo' && <span className="rentivo-brand-title">{label}</span>}
          {eyebrow && <span className="rentivo-brand-eyebrow">{eyebrow}</span>}
        </div>
      )}
    </div>
  )
}
