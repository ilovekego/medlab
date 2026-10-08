'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  MapPin,
  Target,
  Wrench,
} from 'lucide-react';
import { api } from '@/lib/api';

const values = [
  {
    icon: Wrench,
    title: 'Engineering first',
    text: 'We support every system from site readiness and installation to maintenance and repair.',
  },
  {
    icon: CheckCircle2,
    title: 'Reliable delivery',
    text: 'Clear processes, quality equipment, and responsive technical support keep operations moving.',
  },
  {
    icon: MapPin,
    title: 'Built for the region',
    text: 'Nairobi-based teams supporting hospitals and laboratories across East Africa.',
  },
];

const facts = [
  { value: '24/7', label: 'Critical care support' },
  { value: 'East Africa', label: 'Regional field coverage' },
  { value: 'IQ / OQ / PQ', label: 'Commissioning discipline' },
];

const purpose = [
  {
    icon: Target,
    title: 'Our mission',
    text: 'To make dependable healthcare technology accessible through certified equipment, practical engineering, and responsive support.',
  },
  {
    icon: Eye,
    title: 'Our vision',
    text: 'To be the trusted healthcare engineering partner for organisations building better care across the region.',
  },
];

const standards = [
  'ISO 13485:2016',
  'IEC 62353',
  'ISO/IEC 17025',
  'CE-IVD / FDA',
];

const partners = [
  { name: 'Kenyatta National Hospital', logo: '/images/clients/knh.jpg' },
  { name: "St. Paul's Hospital Kitengela", logo: '/images/clients/stpauls.jpg' },
  { name: 'Ultralab E.A Ltd.', logo: '/images/clients/ultralab.jpg' },
  { name: 'Surgipath Services E.A.', logo: '/images/clients/surgipath.jpg' },
  { name: 'Palamed Healthcare', logo: '/images/clients/palamed.jpg' },
];

const eyebrow =
  'text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1769E0] dark:text-[#38BDF8]';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] focus-visible:ring-offset-4';

const primaryButton = `group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#1769E0] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1258BF] active:bg-[#1258BF] sm:w-auto sm:min-h-11 sm:gap-4 shadow-xs ${focusRing}`;

export default function AboutPage() {
  const [activePurpose, setActivePurpose] = useState(purpose);

  useEffect(() => {
    api.getCMS().then((res) => {
      const data = res.data || {};
      const about = data.about || {};
      if (about.mission || about.vision) {
        setActivePurpose([
          {
            icon: Target,
            title: 'Our mission',
            text: about.mission || purpose[0].text,
          },
          {
            icon: Eye,
            title: 'Our vision',
            text: about.vision || purpose[1].text,
          },
        ]);
      }
    }).catch(() => {});
  }, []);

  return (
    <main className="overflow-x-hidden bg-white dark:bg-[#0B121E] text-[#14263D] dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-12">
        {/* Introduction */}
        <section
          aria-labelledby="about-heading"
          className="relative grid items-center gap-8 pb-10 pt-8 sm:gap-12 sm:pb-20 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"
          data-aos="fade-up"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Figure: mobile pe pehle (top), PC pe right side */}
          <figure className="order-first mx-auto w-full max-w-[280px] sm:max-w-sm lg:order-last lg:ml-auto lg:mr-0">
            <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <img
                src="/images/team/dennis_mathenge.jpg"
                alt="Eng. Dennis M. Mathenge, Managing Director"
                width={640}
                height={720}
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/4.5] w-full object-cover object-top"
              />
            </div>

            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:mt-4">
              <p className="text-sm font-semibold text-[#0F2A43] dark:text-white">Eng. Dennis M. Mathenge</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Managing Director</p>
            </figcaption>
          </figure>

          {/* Text: mobile pe baad mein, PC pe left side */}
          <div className="order-last lg:order-first">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-[#1769E0] dark:bg-[#38BDF8]" />
              <p className={eyebrow}>About Medlab Innovate</p>
            </div>

            <h1
              id="about-heading"
              className="mt-5 max-w-xl text-[30px] font-bold leading-[1.15] tracking-tight text-[#0F2A43] dark:text-white sm:mt-6 sm:text-5xl lg:text-[54px]"
            >
              Healthcare technology that works{' '}
              <span className="text-slate-400 dark:text-slate-400">when it matters.</span>
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:mt-6 sm:text-base sm:leading-8 font-normal">
              Medlab Innovate Engineering Ltd supplies certified clinical equipment,
              laboratory diagnostic systems, and turnkey technical engineering services for healthcare teams
              across Kenya and East Africa.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-3">
              <Link href="/contact" className={primaryButton}>
                <span>Speak to our team</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>

              <Link
                href="/services"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#10233F] dark:text-slate-200 bg-white dark:bg-[#111C2E] hover:bg-[#F8FAFC] dark:hover:bg-[#162740] border border-[#E2E8F0] dark:border-slate-800 transition-colors sm:min-h-11 sm:justify-start ${focusRing}`}
              >
                <span>View engineering services</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Facts */}
        <section
          aria-label="Service highlights"
          className="border-y border-slate-200 dark:border-slate-800/80 py-2 sm:py-0"
          data-aos="fade-up"
        >
          <dl className="grid divide-y divide-slate-100 dark:divide-slate-800/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-slate-200 dark:sm:divide-slate-800/80">
            {facts.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-row-reverse items-center justify-between gap-4 py-4 sm:flex-col-reverse sm:items-start sm:justify-start sm:gap-2 sm:px-7 sm:py-8 sm:first:pl-0 sm:last:pr-0"
              >
                <dt className="text-xs text-slate-500 dark:text-slate-400 font-medium sm:text-sm">{label}</dt>
                <dd className="text-xl font-bold tracking-tight text-[#0F2A43] dark:text-white sm:text-3xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Our approach */}
        <section
          aria-labelledby="approach-heading"
          className="grid gap-6 py-12 sm:gap-7 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
          data-aos="fade-up"
        >
          <div>
            <p className={eyebrow}>Our approach</p>
            <h2
              id="approach-heading"
              className="mt-3 max-w-xs text-[26px] font-bold leading-tight tracking-tight text-[#0F2A43] dark:text-white sm:mt-4 sm:text-4xl"
            >
              More than
              <br />
              a supplier.
            </h2>
          </div>

          <div className="lg:pt-1">
            <p className="text-base leading-7 text-slate-700 dark:text-slate-200 sm:text-lg sm:leading-8 font-medium">
              We started Medlab Innovate to close the gap between buying
              medical technology and making it perform reliably over time.
            </p>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:mt-5 font-normal">
              <p>
                Our teams combine biomedical engineering, equipment sourcing,
                installation, calibration, preventative maintenance, and
                emergency support. This gives clinical teams one accountable
                partner throughout the equipment lifecycle.
              </p>
              <p>
                From our Nairobi operations hub, we support referral hospitals,
                pathology laboratories, surgical centres, and research
                facilities with practical, standards-led solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section
          aria-labelledby="values-heading"
          className="border-t border-slate-200 dark:border-slate-800/80 py-12 sm:py-20"
          data-aos="fade-up"
        >
          <p className={eyebrow}>What guides us</p>
          <h2
            id="values-heading"
            className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[#0F2A43] dark:text-white sm:mt-4 sm:text-4xl"
          >
            Simple principles. Strong outcomes.
          </h2>

          <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-3 md:gap-6">
            {values.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="p-6 rounded-xl bg-slate-50/60 dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 hover:border-[#1769E0]/40 dark:hover:border-blue-500/40 transition-all shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F0F6FE] dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center mb-4">
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="text-base font-semibold text-[#0F2A43] dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Mission and vision */}
        <section
          aria-label="Our mission and vision"
          className="grid gap-6 border-t border-slate-200 dark:border-slate-800/80 py-12 sm:py-20 md:grid-cols-2 md:gap-8"
          data-aos="fade-up"
        >
          {activePurpose.map(({ icon: Icon, title, text }) => (
            <article 
              key={title}
              className="p-6 sm:p-8 rounded-2xl bg-slate-50/60 dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#F0F6FE] dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F2A43] dark:text-white">
                  {title}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
                {text}
              </p>
            </article>
          ))}
        </section>

        {/* Standards */}
        <section
          aria-labelledby="standards-heading"
          className="grid items-start gap-6 border-t border-slate-200 dark:border-slate-800/80 py-12 sm:gap-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
          data-aos="fade-up"
        >
          <div>
            <p className={eyebrow}>Quality framework</p>
            <h2
              id="standards-heading"
              className="mt-3 max-w-xs text-[26px] font-bold leading-tight tracking-tight text-[#0F2A43] dark:text-white sm:mt-4 sm:text-3xl"
            >
              Standards you
              <br />
              can work with.
            </h2>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:pt-1">
            {standards.map((standard) => (
              <li
                key={standard}
                className="p-4 rounded-xl bg-slate-50/60 dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#0F2A43] dark:text-slate-200 font-mono">
                  {standard}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Partners */}
        <section
          aria-labelledby="partners-heading"
          className="border-t border-slate-200 dark:border-slate-800/80 py-12 sm:py-20"
          data-aos="fade-up"
        >
          <div className="text-center">
            <p className={eyebrow}>Trusted partners</p>
            <h2
              id="partners-heading"
              className="mt-3 text-[22px] font-bold leading-tight tracking-tight text-[#0F2A43] dark:text-white sm:mt-4 sm:text-3xl"
            >
              Supporting teams across the region.
            </h2>
          </div>

          <ul className="mt-8 grid grid-cols-2 items-center gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {partners.map((partner) => (
              <li
                key={partner.name}
                className="p-3 bg-slate-50 dark:bg-white/95 rounded-xl border border-slate-200/80 dark:border-white/10 flex h-20 items-center justify-center shadow-xs transition-transform hover:scale-102"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  width={160}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="max-h-10 w-auto max-w-full object-contain sm:max-h-12"
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Contact Banner */}
        <section
          aria-labelledby="contact-heading"
          className="py-12 sm:py-16"
          data-aos="fade-up"
        >
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#0F2A43] via-[#12365A] to-[#0A1E33] dark:from-[#112338] dark:via-[#163354] dark:to-[#0D1B2D] text-white border border-[#163A5C] dark:border-blue-500/30 shadow-subtle dark:shadow-[0_4px_30px_rgba(23,105,224,0.15)] flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center md:gap-8 relative overflow-hidden">
            {/* Ambient Cyan Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <span className="text-xs font-semibold text-[#13A8C7] dark:text-[#38BDF8] uppercase tracking-wider block">
                Institutional Partnership
              </span>
              <h2
                id="contact-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              >
                Have a project or equipment need in mind?
              </h2>
              <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300 font-normal">
                Let&apos;s discuss the right equipment, turnkey installation, and biomedical service agreement for your facility.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="px-6 py-3 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Let&apos;s talk</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 dark:bg-white/10 dark:hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold text-xs sm:text-sm backdrop-blur-xs transition-colors"
              >
                <span>Explore Services</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}