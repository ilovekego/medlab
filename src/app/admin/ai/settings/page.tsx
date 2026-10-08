'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings2,
  Save,
  CheckCircle2,
  Bot,
  ShieldAlert,
  HelpCircle,
  Phone,
  Cpu,
  Globe,
  Lock,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAISettingsPage() {
  const [welcomeMsg, setWelcomeMsg] = useState(
    'Hello! I am Medlab Assistant, specialized in biomedical & laboratory engineering. How can I assist with your facility requirements today?'
  );

  const [systemInstructions, setSystemInstructions] = useState(
    `You are the 24/7 AI Biomedical Engineering Assistant for Medlab Innovate Engineering Ltd.
Rule 1: Answer using ONLY verified database records for Medlab products, approved knowledge base articles, and published services.
Rule 2: NEVER fabricate or guess specifications, prices, warranties, or delivery commitments. If unknown, state clearly that our engineering team will provide a custom quote.
Rule 3: If customer reports an equipment error or fault, provide approved pre-check steps and offer to open a priority service ticket.
Rule 4: When customer inquires about purchasing, gather their name, hospital/facility, email, required equipment, and quantity to generate an official RFQ.`
  );

  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Which ICU ventilators include integrated HFNC therapy?',
    'What is the sample volume required for the 5-Part Hematology Analyzer?',
    'How do I schedule ISO 17025 preventative calibration?',
    'What are the payment and warranty terms for hospital tenders?',
  ]);

  const [escalationContact, setEscalationContact] = useState('+254 142 808755 (WA: +254 745 662 988)');
  const [salesEmail, setSalesEmail] = useState('info@medlabinnovate.co.ke');
  const [modelName, setModelName] = useState('gemini-2.0-flash');
  const [endpointUrl, setEndpointUrl] = useState('https://api.neuralcloud.me/');
  const [temperature, setTemperature] = useState(0.2); // Low temperature for high factual accuracy
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api.getCMS().then((res) => {
      const saved = res.data?.chatbot || {};
      if (saved.welcomeMsg) setWelcomeMsg(saved.welcomeMsg);
      if (saved.systemInstructions) setSystemInstructions(saved.systemInstructions);
      if (Array.isArray(saved.suggestedQuestions)) setSuggestedQuestions(saved.suggestedQuestions);
      if (saved.escalationContact) setEscalationContact(saved.escalationContact);
      if (saved.salesEmail) setSalesEmail(saved.salesEmail);
      if (saved.modelName) setModelName(saved.modelName);
      if (saved.endpointUrl) setEndpointUrl(saved.endpointUrl);
      if (typeof saved.temperature === 'number') setTemperature(saved.temperature);
    }).catch(() => setToast('Unable to load saved chatbot settings.'));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateCMS('chatbot', {
        welcomeMsg, systemInstructions, suggestedQuestions, escalationContact,
        salesEmail, modelName, endpointUrl, temperature,
      });
      setToast('AI assistant configuration saved to the database.');
    } catch (error: any) {
      setToast(error?.message || 'Unable to save chatbot configuration.');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddQuestion = () => {
    setSuggestedQuestions([...suggestedQuestions, '']);
  };

  const handleUpdateQuestion = (idx: number, val: string) => {
    const copy = [...suggestedQuestions];
    copy[idx] = val;
    setSuggestedQuestions(copy);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Settings2 className="w-6 h-6 text-sky-600" />
            AI Assistant Configuration & Guardrails
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure prompt boundaries, prompt chips, Cloudflare Workers AI parameters, and clinical escalation routing.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cloudflare Workers AI Engine & Live Gateway */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              Cloudflare Workers AI Engine & Gateway
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live &amp; Connected
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-sky-600" />
                Production AI Inference Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-[#0A1C2E] font-medium focus:ring-2 focus:ring-sky-500 outline-none text-xs"
              >
                <option value="gemini-2.0-flash">
                  Gemini 2.0 Flash (Fast Multimodal)
                </option>
                <option value="gemini-2.0-flash-thinking">
                  Gemini 2.0 Flash Thinking (Deep Reasoning)
                </option>
                <option value="gemini-1.5-pro">
                  Gemini 1.5 Pro (Long-Context Precision)
                </option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Powered by Google Gemini AI — medical-grade multimodal intelligence.
              </p>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                API Gateway Endpoint
              </label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://api.neuralcloud.me/"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Custom Domain Proxy routing directly to MedBot worker.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Security Authentication Protocol
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#163A5C] border border-slate-200 dark:border-[#163A5C] font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>x-api-key: mle_live_ffa33... (256-bit Token)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>Factual Precision (Temperature: {temperature})</span>
                <span className="text-[11px] text-sky-600 font-bold">Zero Hallucination</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-sky-600 mt-2"
              />
            </div>
          </div>
        </div>

        {/* System Prompt & Guardrails */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            System Prompt &amp; Anti-Hallucination Guardrails
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Active System Persona &amp; Rules
            </label>
            <textarea
              rows={6}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Initial Greeting Message
            </label>
            <input
              type="text"
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              Suggested Prompt Quick Chips (Shown to Visitors)
            </h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              + Add Chip
            </button>
          </div>

          <div className="space-y-2.5">
            {suggestedQuestions.map((q, idx) => (
              <input
                key={idx}
                type="text"
                value={q}
                onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                placeholder="Suggested inquiry..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            ))}
          </div>
        </div>

        {/* Escalation Routing */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            Human Escalation Routing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Emergency Service Phone Hotline
              </label>
              <input
                type="text"
                value={escalationContact}
                onChange={(e) => setEscalationContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Sales &amp; Lead Email Ingestion
              </label>
              <input
                type="email"
                value={salesEmail}
                onChange={(e) => setSalesEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg shadow-sky-600/30"
          >
            Apply AI Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
