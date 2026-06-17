'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

interface PricingPlan {
  name: string
  price: string
  label: string
  cta: string
  href: string
  badge?: string
  featured?: boolean
  features: string[]
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: 'Rp0',
    label: 'Untuk mulai merapikan bisnis rental',
    cta: 'Mulai Gratis',
    href: '/register',
    features: [
      'Manajemen customer dasar',
      'Pencatatan booking sederhana',
      'Inventaris dasar',
      'Invoice manual',
      'Dashboard ringkas',
      '1 user workspace',
    ],
  },
  {
    name: 'Pro',
    price: 'Custom',
    label: 'Untuk bisnis rental yang ingin scale lebih rapi',
    cta: 'Daftarkan Bisnis',
    href: '/register',
    badge: 'Recommended',
    featured: true,
    features: [
      'Semua fitur Free',
      'Omnichannel inbox',
      'Smart booking workflow',
      'Payment verification',
      'Return management',
      'Team role access',
      'AI Copilot',
      'Advanced dashboard',
      'Priority support',
    ],
  },
]

export default function PricingSection() {
  return (
    <section className="landing-section landing-pricing-section" id="pricing">
      <div className="landing-pricing-glow landing-pricing-glow-left" aria-hidden="true" />
      <div className="landing-pricing-glow landing-pricing-glow-right" aria-hidden="true" />

      <div className="landing-section-inner landing-pricing-inner">
        <motion.div
          className="landing-section-heading landing-pricing-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px', amount: 0.25 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow landing-pricing-eyebrow">Plan Rentivo</span>
          <h2>Pilih Plan yang Sesuai dengan Tahap Bisnismu</h2>
          <p>
            Mulai dari workflow dasar untuk merapikan operasional rental, lalu upgrade saat bisnis
            membutuhkan automasi, AI, dan kontrol tim yang lebih lengkap.
          </p>
        </motion.div>

        <div className="landing-pricing-grid">
          {plans.map((plan, index) => (
            <motion.article
              className={`landing-pricing-card${plan.featured ? ' landing-pricing-card-featured' : ''}`}
              key={plan.name}
              initial={{ opacity: 0, y: 30, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-90px', amount: 0.22 }}
              transition={{ duration: 0.58, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="landing-pricing-card-light" aria-hidden="true" />
              <div className="landing-pricing-card-top">
                <div>
                  <span className="landing-pricing-plan">{plan.name}</span>
                  <h3>{plan.price}</h3>
                </div>
                {plan.badge ? <span className="landing-pricing-badge">{plan.badge}</span> : null}
              </div>

              <p className="landing-pricing-label">{plan.label}</p>

              <ul className="landing-pricing-features" aria-label={`Fitur plan ${plan.name}`}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span className="landing-pricing-check" aria-hidden="true">
                      <Check size={14} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={
                  plan.featured
                    ? 'landing-pricing-button landing-pricing-button-primary'
                    : 'landing-pricing-button landing-pricing-button-secondary'
                }
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
