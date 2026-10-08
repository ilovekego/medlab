'use client';

import React from 'react';
import Link from 'next/link';

interface CompanyLogoProps {
  className?: string;
  variant?: 'badge' | 'white' | 'image' | 'dark';
  iconOnly?: boolean;
  linkToHome?: boolean;
}

export function CompanyLogo({
  className = 'h-10 sm:h-11 md:h-12 w-auto',
  variant = 'badge',
  iconOnly = false,
  linkToHome = true,
}: CompanyLogoProps) {
  let content: React.ReactNode;

  if (iconOnly) {
    content = (
      <div className="w-10 h-10 rounded-xl bg-[#F3F8FA] p-1 flex items-center justify-center shrink-0 border border-[#D9E4E8]">
        <img
          src="/images/logo-icon.svg"
          alt="Medlab Innovate"
          className="w-8 h-8 object-contain"
          loading="eager"
        />
      </div>
    );
  } else if (variant === 'badge') {
    // Official uploaded logo inside a solid clean white container
    content = (
      <div className="bg-white dark:bg-[#111C2E] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center border border-[#D9E4E8] dark:border-slate-800 shadow-xs">
        <img
          src="/images/logo.png"
          alt="Medlab Innovate Engineering Ltd"
          className={`${className} object-contain`}
          loading="eager"
        />
      </div>
    );
  } else if (variant === 'white') {
    // Transparent vector logo with crisp white typography on dark backgrounds
    content = (
      <img
        src="/images/logo-white.svg"
        alt="Medlab Innovate Engineering Ltd"
        className={`${className} object-contain`}
        loading="eager"
      />
    );
  } else if (variant === 'dark') {
    // High-resolution vector logo on light backgrounds, adaptive in dark mode
    content = (
      <>
        <img
          src="/images/logo.svg"
          alt="Medlab Innovate Engineering Ltd"
          className={`${className} object-contain dark:hidden`}
          loading="eager"
        />
        <img
          src="/images/logo-white.svg"
          alt="Medlab Innovate Engineering Ltd"
          className={`${className} object-contain hidden dark:block`}
          loading="eager"
        />
      </>
    );
  } else {
    // Direct uploaded logo image for light / white backgrounds
    content = (
      <img
        src="/images/logo.png"
        alt="Medlab Innovate Engineering Ltd"
        className={`${className} object-contain`}
        loading="eager"
      />
    );
  }

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center shrink-0 group focus:outline-none transition-transform active:scale-98">
        {content}
      </Link>
    );
  }

  return <div className="inline-flex items-center shrink-0">{content}</div>;
}
