'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  enabled?: boolean;
}

export function LoadingScreen({ enabled = true }: LoadingScreenProps) {
  const [visible, setVisible] = useState(enabled);
  const screenRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    // Check if loader has already run in this session
    if (typeof window !== 'undefined') {
      const hasRun = sessionStorage.getItem('medlab_loader_played');
      if (hasRun) {
        setVisible(false);
        return;
      }
    }

    const screen = screenRef.current;
    const logo = logoRef.current;
    const line = lineRef.current;

    if (!screen || !logo || !line) return;

    document.body.style.overflow = 'hidden';

    // Use gsap.context to fix React 18 StrictMode double-rendering
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          document.body.style.overflow = '';
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('medlab_loader_played', 'true');
          }
          setVisible(false);
        },
      });

      timeline
        .fromTo(logo, { autoAlpha: 0, y: 12, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4 })
        .to(line, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, '-=0.1')
        .to(screen, { autoAlpha: 0, duration: 0.35, ease: 'power2.inOut', delay: 0.1 });
    }, screenRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [enabled]);

  if (!visible) return null;

  return (
    <div ref={screenRef} className="site-loading-screen" aria-label="Loading Medlab Innovate" role="status">
      <div className="site-loading-content">
        <div ref={logoRef} className="site-loading-logo">
          {/* Light Mode Logo (Dark Navy "MEDLAB" text) */}
          <img
            src="/images/logo.svg"
            alt="Medlab Innovate"
            className="w-full h-auto object-contain dark:hidden"
            width={220}
            height={72}
          />
          {/* Dark Mode Logo (Pure White "MEDLAB" text) */}
          <img
            src="/images/logo-white.svg"
            alt="Medlab Innovate"
            className="w-full h-auto object-contain hidden dark:block"
            width={220}
            height={72}
          />
        </div>
        <div className="site-loading-track" aria-hidden="true">
          <div ref={lineRef} className="site-loading-progress" />
        </div>
      </div>
    </div>
  );
}
