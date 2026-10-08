'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import 'aos/dist/aos.css';
import 'lenis/dist/lenis.css';
import AOS from 'aos';
import Lenis from 'lenis';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequestQuoteModal } from '@/components/RequestQuoteModal';
import { ChatbotModal } from '@/components/ChatbotModal';
import { WhatsAppContactWidget } from '@/components/WhatsAppContactWidget';
import { ConfirmProvider } from '@/components/ConfirmModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState('');

  function handleOpenQuote(productName = '') {
    setSelectedProductForQuote(productName);
    setQuoteModalOpen(true);
  }

  function handleOpenChat() {
    setChatModalOpen(true);
  }

  // 1. Initialize Lenis Smooth Scrolling and AOS Scroll Animations
  useEffect(() => {
    if (isAdmin) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Store globally so we can reset scroll on route change
    (window as any).lenis = lenis;

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      disable: false,
    });

    // Synchronize Lenis scroll with AOS
    lenis.on('scroll', () => {
      AOS.refresh();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, [isAdmin]);

  // Refresh AOS and reset scroll on route navigation
  useEffect(() => {
    // Force lenis to reset to top immediately without animation
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    AOS.refresh();
  }, [pathname]);

  // Global event listeners for modals
  useEffect(() => {
    function onQuote(e: any) {
      handleOpenQuote(e?.detail?.product || '');
    }
    function onChat(e: any) {
      handleOpenChat();
    }
    window.addEventListener('open-quote-modal', onQuote);
    window.addEventListener('open-chat-modal', onChat);
    return () => {
      window.removeEventListener('open-quote-modal', onQuote);
      window.removeEventListener('open-chat-modal', onChat);
    };
  }, []);

  return (

    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MEDLAB INNOVATE ENGINEERING LTD. | Medical &amp; Laboratory Solutions</title>
        <meta name="description" content="Certified clinical instrumentation, laboratory diagnostic equipment, analytical instruments, turnkey engineering, calibration, maintenance, and technical support for healthcare operations." />
        <link rel="icon" type="image/svg+xml" href="/images/logo-icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-white dark:bg-[#0B121E] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#1769E0] selection:text-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem forcedTheme={isAdmin ? 'light' : undefined}>
          <ConfirmProvider>
            <LoadingScreen enabled={!isAdmin} />

            {!isAdmin && (
              <Navbar
                onRequestQuote={() => handleOpenQuote()}
                onOpenChat={() => handleOpenChat()}
              />
            )}

            <main className="flex-1">{children}</main>

            {!isAdmin && <Footer />}

            {/* Global Floating Contact / WhatsApp Widget */}
            {!isAdmin && <WhatsAppContactWidget />}

            {/* Global Modals (Hidden on Admin routes) */}
            {!isAdmin && (
              <>
                <RequestQuoteModal
                  isOpen={quoteModalOpen}
                  onClose={() => setQuoteModalOpen(false)}
                  preselectedProduct={selectedProductForQuote}
                />

                <ChatbotModal
                  isOpen={chatModalOpen}
                  onClose={() => setChatModalOpen(false)}
                  onOpenQuote={(prod) => handleOpenQuote(prod)}
                  onOpenTicket={() => {
                    setChatModalOpen(false);
                    if (typeof window !== 'undefined') window.location.href = '/support';
                  }}
                />
              </>
            )}
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
