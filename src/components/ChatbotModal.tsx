'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Wrench,
  Building2,
  Loader2,
  ShieldCheck,
  RotateCcw,
  Stethoscope,
  Microscope,
  HelpCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuote: (productName?: string) => void;
  onOpenTicket: () => void;
}

interface Message {
  id?: string;
  sender: 'user' | 'assistant';
  content: string;
  time: string;
  suggestedProducts?: any[];
  leadForm?: boolean;
  escalateToTicket?: boolean;
  prefilledProduct?: string;
}

/**
 * Lightweight, safe Markdown-to-JSX Formatter
 * Accurately parses bold text, bullet points, numbered lists, headers, and code blocks
 * Colors: Navy Blue headings, Teal bullet points, Medical Blue code & highlights
 */
function FormattedMessageContent({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null;

  function flushList() {
    if (!currentList) return;
    if (currentList.type === 'bullet') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-0.5">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] shrink-0 mt-1.5 shadow-xs" />
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 space-y-1.5 pl-0.5">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="text-[10px] font-bold font-mono text-[#1769E0] bg-sky-50 border border-sky-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                {i + 1}
              </span>
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  }

  function formatInline(str: string): React.ReactNode[] {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[#0F2A43] dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="font-mono px-1.5 py-0.5 rounded bg-sky-50 text-[#1769E0] border border-sky-200/80 text-[11px] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    // Bullet point
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.replace(/^[•\-*]\s+/, '');
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)[.)]\s+(.*)/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Regular line / Heading
    flushList();
    if (line.startsWith('### ') || line.startsWith('## ')) {
      const headingText = line.replace(/^#{2,3}\s+/, '');
      elements.push(
        <h5 key={`h-${i}`} className="font-bold text-[#0F2A43] dark:text-slate-100 text-xs mt-2.5 mb-1">
          {formatInline(headingText)}
        </h5>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed text-slate-700 dark:text-slate-300 my-1">
          {formatInline(line)}
        </p>
      );
    }
  }
  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}

export function ChatbotModal({ isOpen, onClose, onOpenQuote, onOpenTicket }: ChatbotModalProps) {
  const initialGreeting: Message = {
    sender: 'assistant',
    content: `Hello! I am **MedBot**, the certified **Customer Support & Product Enquiry Assistant** for **Medlab Innovate Engineering Ltd** in Nairobi, Kenya.\n\nI can assist you with:\n• **Healthcare Equipment Selection & Technical Sizing** (ICU, OT, Diagnostic, Laboratory)\n• **Clinical Applications & Verified Specifications**\n• **Direct Official Quotations (RFQ) & Proforma Invoices**\n• **Preventive Maintenance (AMC/CMC), Calibration & Repair**\n• **Installation Prerequisites & Site Engineering**\n\nHow can I support your healthcare facility, clinic, or laboratory today?`,
    time: 'Just now',
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // In-chat inline RFQ / Enquiry form state
  const [activeEnquiryProduct, setActiveEnquiryProduct] = useState<string | null>(null);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    organization: '',
    emailAddress: '',
    equipmentSummary: '',
    notes: '',
  });
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Prevent parent scroll interception (e.g. Lenis smooth scroll)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
    setConversationId('');
    setShowInlineForm(false);
  };

  useEffect(() => {
    api.getCMS().then((res) => {
      const saved = res.data?.chatbot;
      if (saved?.welcomeMsg) {
        setMessages((prev) => {
          if (prev.length === 1 && prev[0].sender === 'assistant') {
            return [{ ...prev[0], content: saved.welcomeMsg }];
          }
          return prev;
        });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showInlineForm]);

  const quickChips = [
    { label: 'Who is Medlab?', query: 'Who is Medlab Innovate and what are your services in Kenya?', icon: Stethoscope },
    { label: 'ECG Machines', query: 'I need an ECG machine for our clinic. What models do you offer?', icon: Sparkles },
    { label: 'ICU Ventilators', query: 'What ICU ventilators and patient monitoring systems do you supply?', icon: Stethoscope },
    { label: 'Laboratory Equipment', query: 'I need laboratory equipment. What hematology and chemistry analyzers do you have?', icon: Microscope },
    { label: 'Servicing (AMC/CMC)', query: 'I need equipment servicing and preventive maintenance (AMC/CMC).', icon: Wrench },
    { label: 'Official RFQ Quote', query: 'I want an official quotation for medical equipment.', icon: FileText },
    { label: 'Contact & Hours', query: 'What are your business hours, phone number, and location in Nairobi?', icon: HelpCircle },
  ];

  async function handleSend(textToSend?: string) {
    const text = textToSend || input.trim();
    if (!text) return;
    if (!textToSend) setInput('');

    const userMsg: Message = {
      sender: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage({
        conversationId: conversationId || undefined,
        message: text,
        history: messages
          .filter((m) => m.content)
          .slice(-6)
          .map((m) => ({ sender: m.sender, content: m.content })),
      });

      if (res.conversationId) setConversationId(res.conversationId);

      const topProduct = res.suggestedProducts && res.suggestedProducts.length > 0 ? res.suggestedProducts[0].name : '';

      const botMsg: Message = {
        sender: 'assistant',
        content: res.reply || 'Thank you for contacting Medlab Engineering. How can I assist you further?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: res.suggestedProducts,
        leadForm: res.leadCaptured,
        escalateToTicket: res.escalateToTicket,
        prefilledProduct: topProduct,
      };

      setMessages((prev) => [...prev, botMsg]);

      // If user asks for quotation directly, prompt the inline enquiry form
      if (res.leadCaptured) {
        setFormData((prev) => ({
          ...prev,
          equipmentSummary: topProduct || prev.equipmentSummary || text,
        }));
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content:
            'Our engineering response server is momentarily handling high volume. You can reach our biomedical sales desk directly:\n• **Email**: info@medlabinnovate.co.ke\n• **Phone**: +254 142 808755\n• **WhatsApp**: +254 745 662 988\n\nYou can also click below to submit an official enquiry or support ticket.',
          time: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Handle in-chat inline enquiry / RFQ submission
  async function handleInlineEnquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.customerName || !formData.phoneNumber || !formData.organization) {
      alert('Please provide your name, phone number, and hospital/facility name.');
      return;
    }

    setIsSubmittingEnquiry(true);

    try {
      const equipName = formData.equipmentSummary || activeEnquiryProduct || 'Medical Equipment Package';
      const res = await api.createEnquiry({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        organization: formData.organization,
        emailAddress: formData.emailAddress || 'sales@medlabinnovate.co.ke',
        location: 'Kenya',
        equipmentSummary: equipName,
        items: [{ productName: equipName, quantity: 1 }],
        quantityTotal: 1,
        source: 'Chatbot AI Assistant',
        additionalRequirements: formData.notes
          ? `Chatbot Note: ${formData.notes}`
          : 'Generated via MedBot 24/7 AI Chatbot Requisition',
      });

      const enquiryId =
        (res as any)?.data?.enquiryId || (res as any)?.enquiryId || `MLE-ENQ-${Date.now().toString().slice(-4)}`;

      // Append confirmation message to chat
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: `✅ **Official Requisition Submitted Successfully!**\n\n• **Tracking ID**: \`${enquiryId}\`\n• **Equipment Requested**: ${equipName}\n• **Client/Facility**: ${formData.organization} (${formData.customerName})\n• **Contact Phone**: ${formData.phoneNumber}\n\nOur biomedical sales engineering desk has received your request and will prepare an official quotation with formal specifications, warranty, and lead time. A technical sales representative will contact you shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Reset form
      setShowInlineForm(false);
      setActiveEnquiryProduct(null);
      setFormData({
        customerName: '',
        phoneNumber: '',
        organization: '',
        emailAddress: '',
        equipmentSummary: '',
        notes: '',
      });
    } catch (err) {
      alert('Could not submit requisition. Please contact our desk directly at +254 142 808755 or info@medlabinnovate.co.ke.');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  }

  // Floating trigger button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-30 medbot-widget">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-chat-modal'));
            }
          }}
          aria-label="Open AI Customer Support & Product Enquiry Assistant"
          className="relative group p-3.5 bg-gradient-to-r from-[#1769E0] via-[#1258BF] to-[#0D9488] hover:from-[#1258BF] hover:to-[#0F766E] text-white rounded-full transition-all duration-300 border-2 border-white/30 flex items-center justify-center cursor-pointer shadow-xl shadow-sky-600/30 hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#14B8A6] rounded-full border-2 border-[#0F2A43] animate-pulse" />
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2A43] text-white text-xs font-semibold rounded-xl whitespace-nowrap border border-[#1769E0]/40 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
            AI Engineering Advisor
          </div>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Bottom Sheet Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-[#0F2A43]/50 backdrop-blur-xs sm:hidden ${
          isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
        onClick={handleClose}
      />

      {/* Main Chat Modal Card */}
      <div
        data-lenis-prevent
        className={`fixed z-50 flex flex-col overflow-hidden text-[#0F2A43] dark:text-slate-100 shadow-2xl
        inset-x-0 bottom-0 h-[92vh] rounded-t-[32px] bg-white dark:bg-[#111C2E]
        sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-full sm:max-w-[460px] sm:h-[640px] sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-slate-200/90 dark:border-slate-800
        ${isClosing ? 'animate-slideDownSheet sm:animate-fadeOut' : 'animate-slideUpSheet sm:animate-slideUp'}
      `}
      >
        {/* Header: Radiant Medical Blue with subtle Navy contrast & Teal status */}
        <div className="bg-gradient-to-r from-[#1769E0] via-[#145CBF] to-[#0F2A43] text-white px-4 py-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between relative shrink-0 shadow-md">
          {/* Mobile Drag Indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full sm:hidden" />

          {/* Left: Bot Profile */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 p-0.5 shadow-sm backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#14B8A6] rounded-full border-2 border-[#1258BF] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-tight">MedBot</h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                  Live Assistant
                </span>
              </div>
              <p className="text-[10px] text-sky-100/90 font-medium truncate max-w-[210px] sm:max-w-[260px]">
                Medlab Innovate Engineering &bull; Biomedical Support
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset Conversation"
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              title="Close Chat"
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Contact & Handover Bar: Clean Crisp Light Medical Blue with Teal & Navy accents */}
        <div className="bg-[#F0F7FF] text-[#0F2A43] dark:text-slate-100 px-3.5 py-1.5 border-b border-[#D8E6F5] flex items-center justify-between text-[10px] shrink-0">
          <div className="flex items-center gap-1 font-bold text-[#0F2A43] dark:text-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Biomedical Desk:</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/254745662988?text=Hello%20Medlab%20Innovate%20Engineering%2C%20I%20have%20an%20equipment%20enquiry..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-2.5 h-2.5 text-teal-600" /> WhatsApp
            </a>
            <a
              href="tel:+254142808755"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-[#1769E0] font-bold border border-sky-200 transition-colors shadow-2xs"
            >
              <Phone className="w-2.5 h-2.5 text-[#1769E0]" /> +254 142 808755
            </a>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent
          className="flex-1 min-h-0 p-3.5 sm:p-4 overflow-y-auto overscroll-contain chat-scroll space-y-3.5 bg-[#F8FAFC] dark:bg-[#0B1320] text-xs"
        >
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Bot Avatar: Medical Blue to Teal gradient */}
              {m.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#1769E0] to-[#0D9488] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 shadow-xs space-y-2.5 transition-all ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-[#1769E0] to-[#1258BF] text-white rounded-tr-xs shadow-sky-100'
                    : 'bg-white dark:bg-[#111C2E] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-xs shadow-slate-100'
                }`}
              >
                {/* Formatted Content */}
                {m.sender === 'assistant' ? (
                  <FormattedMessageContent content={m.content} />
                ) : (
                  <div className="whitespace-pre-line leading-relaxed font-normal text-xs">{m.content}</div>
                )}

                {/* Equipment Cards */}
                {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                  <div className="pt-2.5 space-y-2 border-t border-slate-100">
                    <span className="font-bold text-[11px] text-[#1769E0] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                      Matching Equipment Specifications:
                    </span>
                    <div className="space-y-1.5">
                      {m.suggestedProducts.map((p: any, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="p-2.5 bg-white dark:bg-[#0A1C2E] hover:bg-sky-50/40 rounded-xl border border-sky-100 hover:border-[#1769E0]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] shadow-2xs transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <strong className="block text-[#0F2A43] dark:text-slate-100 font-bold truncate">
                              {p.name || p.model}
                            </strong>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full px-2 py-0.5 text-[9px] font-semibold truncate">
                                {p.category}
                              </span>
                              {p.model && (
                                <span className="text-[#64748B] text-[10px] truncate">
                                  Model: {p.model}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.slug && (
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                className="px-2 py-1 bg-white dark:bg-[#0A1C2E] hover:bg-slate-100 text-[#0F2A43] dark:text-slate-100 border border-slate-200 dark:border-[#163A5C] rounded-lg text-[10px] font-semibold flex items-center gap-1 transition shadow-2xs"
                              >
                                Specs <ExternalLink className="w-2.5 h-2.5 text-[#1769E0]" />
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEnquiryProduct(p.name);
                                setFormData((prev) => ({ ...prev, equipmentSummary: p.name }));
                                setShowInlineForm(true);
                              }}
                              className="px-2.5 py-1 bg-gradient-to-r from-[#1769E0] to-[#0D9488] hover:from-[#1258BF] hover:to-[#0F766E] text-white rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer active:scale-95"
                            >
                              Request RFQ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RFQ Trigger Card: Medical Blue to Teal gradient */}
                {m.leadForm && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (m.prefilledProduct) {
                          setActiveEnquiryProduct(m.prefilledProduct);
                          setFormData((prev) => ({ ...prev, equipmentSummary: m.prefilledProduct! }));
                        }
                        setShowInlineForm(true);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-[#1769E0] via-[#145CBF] to-[#0D9488] hover:from-[#1258BF] hover:to-[#0F766E] text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer active:scale-[0.99]"
                    >
                      <FileText className="w-3.5 h-3.5 text-white" />
                      Submit Quotation Requisition (RFQ)
                    </button>
                    <p className="text-[9px] text-slate-500 text-center">
                      Official proforma quotation with formal hospital pricing, tax, and warranty schedule.
                    </p>
                  </div>
                )}

                {/* Service Escalation Card: Teal & Medical Blue accent */}
                {m.escalateToTicket && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="p-3 bg-gradient-to-br from-teal-50/70 via-sky-50/40 to-white border border-teal-200/80 rounded-xl text-[11px] text-[#0F2A43] dark:text-slate-100 space-y-2 shadow-2xs">
                      <div className="font-bold flex items-center gap-1.5 text-[#0F2A43] dark:text-slate-100">
                        <Wrench className="w-3.5 h-3.5 text-[#0D9488]" />
                        Biomedical Engineering Service Desk
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Log an official preventive maintenance (AMC/CMC), equipment calibration, or emergency breakdown ticket.
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => onOpenTicket()}
                          className="px-3 py-1.5 bg-[#0F2A43] hover:bg-[#163A5C] text-white font-bold rounded-lg text-[10px] transition shadow-xs cursor-pointer"
                        >
                          Open Service Ticket
                        </button>
                        <a
                          href="https://wa.me/254745662988?text=URGENT%20Biomedical%20Equipment%20Breakdown%20Support..."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 shadow-xs"
                        >
                          <MessageCircle className="w-2.5 h-2.5" /> Rapid WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <span
                  className={`block text-[9px] text-right mt-1 font-mono ${
                    m.sender === 'user' ? 'text-sky-100/90' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {/* Inline RFQ Requisition Form */}
          {showInlineForm && (
            <div className="p-4 bg-white dark:bg-[#0A1C2E] border-2 border-[#1769E0]/40 rounded-2xl shadow-lg space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1769E0] to-[#0D9488] text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#0F2A43] dark:text-slate-100">Official RFQ Quotation Requisition</h5>
                    <p className="text-[10px] text-slate-500">Connected to Medlab Admin &amp; Instant Email Dispatch</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInlineForm(false)}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-300 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInlineEnquirySubmit} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#0F2A43] dark:text-slate-100 mb-0.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Dr. Dennis Kimani / Jane Doe"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#163A5C] rounded-lg text-xs focus:outline-none focus:border-[#1769E0] focus:ring-1 focus:ring-sky-200 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F2A43] dark:text-slate-100 mb-0.5">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="e.g. 0712345678"
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#163A5C] rounded-lg text-xs focus:outline-none focus:border-[#1769E0] focus:ring-1 focus:ring-sky-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F2A43] dark:text-slate-100 mb-0.5">
                      Hospital / Facility <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Nairobi Hospital / Clinic"
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#163A5C] rounded-lg text-xs focus:outline-none focus:border-[#1769E0] focus:ring-1 focus:ring-sky-200 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0F2A43] dark:text-slate-100 mb-0.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    placeholder="procurement@hospital.org"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#163A5C] rounded-lg text-xs focus:outline-none focus:border-[#1769E0] focus:ring-1 focus:ring-sky-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0F2A43] dark:text-slate-100 mb-0.5">
                    Equipment / Service of Interest
                  </label>
                  <input
                    type="text"
                    value={formData.equipmentSummary}
                    onChange={(e) => setFormData({ ...formData, equipmentSummary: e.target.value })}
                    placeholder="e.g. Mindray SV300 ICU Ventilator"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#163A5C] rounded-lg text-xs focus:outline-none focus:border-[#1769E0] focus:ring-1 focus:ring-sky-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0F2A43] dark:text-slate-100 mb-0.5">
                    Required Specifications / Clinical Note
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Provide facility tier, adult/pediatric, quantity, or installation requirements..."
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#163A5C] rounded-lg text-xs focus:outline-none focus:border-[#1769E0] focus:ring-1 focus:ring-sky-200 resize-none transition"
                  />
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInlineForm(false);
                      onOpenQuote(formData.equipmentSummary);
                    }}
                    className="text-[10px] text-slate-500 hover:text-[#1769E0] underline font-medium transition"
                  >
                    Open Full RFQ Window
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInlineForm(false)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="px-4 py-1.5 bg-gradient-to-r from-[#1769E0] to-[#0D9488] hover:from-[#1258BF] hover:to-[#0F766E] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition shadow-xs cursor-pointer active:scale-95"
                    >
                      {isSubmittingEnquiry ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Submit RFQ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Typing / Loading Wave Animation */}
          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#1769E0] to-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-slate-500 flex items-center gap-2 text-xs shadow-xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1769E0] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F2A43] animate-bounce" />
                </div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Consulting biomedical engineering database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Inquiry Chips: White pills with Medical Blue & Teal highlights */}
        <div
          data-lenis-prevent
          className="px-3 py-2 bg-white dark:bg-[#0D1525] border-t border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0 shadow-xs"
        >
          {quickChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip.query)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-[#111C2E] hover:bg-sky-50 dark:hover:bg-[#16233B] text-slate-700 dark:text-slate-300 hover:text-[#1769E0] dark:hover:text-[#38BDF8] border border-slate-200 dark:border-slate-700 hover:border-[#1769E0]/50 whitespace-nowrap transition-all duration-150 font-medium cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <Icon className="w-3 h-3 text-[#0D9488]" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Area: Clean White background with Medical Blue focus and Teal send button */}
        <div className="p-3 bg-white dark:bg-[#0D1525] border-t border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="relative flex items-center bg-slate-50 dark:bg-[#111C2E] hover:bg-white dark:hover:bg-[#15243B] focus-within:bg-white dark:focus-within:bg-[#111C2E] border border-slate-200 dark:border-slate-700 focus-within:border-[#1769E0] focus-within:ring-2 focus-within:ring-sky-100 rounded-2xl p-1 transition-all shadow-xs">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about equipment sizing, specifications, RFQs, or servicing..."
              className="flex-1 px-3 py-2 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#1769E0] to-[#0D9488] hover:from-[#1258BF] hover:to-[#0F766E] text-white flex items-center justify-center shadow-md shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 px-1 text-[9px] text-[#0F2A43] dark:text-slate-100">
            <span className="font-semibold">Medlab Innovate Engineering Ltd &bull; Kenya</span>
            <span className="flex items-center gap-1 font-mono text-[9px] text-[#0D9488] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              Verified Biomedical AI
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
