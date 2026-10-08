'use client';

import React, { useState } from 'react';
import {
  Bot,
  Search,
  MessageSquare,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Boxes,
  FileCheck
} from 'lucide-react';

import { api } from '@/lib/api';

export default function AdminAIConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const res = await api.getConversations();
        if (res.success && Array.isArray(res.data)) {
          setConversations(res.data);
          if (res.data.length > 0) {
            setActiveConv(res.data[0]);
          }
        } else {
          setConversations([]);
        }
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-sky-600" />
          AI Chat Assistant Conversations Audit
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review 24/7 client conversations, database-grounded product recommendations, and lead qualification logs.
        </p>
      </div>

      {/* Grid: Conversation List (5 cols) & Live Transcript (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3.5 bg-slate-50 dark:bg-[#163A5C] border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Conversations ({conversations.length})</span>
            <span className="text-[11px] text-sky-600 font-semibold">Live Logs</span>
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">No conversations recorded</p>
                <p className="text-slate-400 mt-1">Live customer chats with the 24/7 AI Assistant will appear here.</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConv?._id === c._id || activeConv?.id === c.id;
                return (
                  <div
                    key={c._id || c.id}
                    onClick={() => setActiveConv(c)}
                    className={`p-4 cursor-pointer transition ${isSelected ? 'bg-sky-50/70 border-l-4 border-sky-600' : 'hover:bg-slate-50 dark:bg-[#163A5C]'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.customer?.organization || c.customer?.org || 'Hospital Facility'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.date || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{c.topic || c.messages?.[0]?.text || 'General Enquiry'}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 truncate">{c.customer?.name || 'Visitor'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.leadStatus === 'Converted to RFQ' ? 'bg-emerald-100 text-emerald-800' :
                        c.leadStatus === 'Support Escalated' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {c.leadStatus || 'Chatting'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Transcript (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs p-6 flex flex-col justify-between">
          {activeConv ? (
            <div className="space-y-4">
              
              {/* Header info */}
              <div className="pb-4 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wider">{activeConv.id || activeConv.conversationId}</span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{activeConv.customer?.org || activeConv.customer?.organization || 'Hospital Client'}</h2>
                  <span className="text-xs text-slate-500">{activeConv.customer?.name || 'Visitor'} &bull; {activeConv.customer?.email || 'No email provided'}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  activeConv.leadStatus === 'Converted to RFQ' ? 'bg-emerald-100 text-emerald-800' :
                  activeConv.leadStatus === 'Support Escalated' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                }`}>
                  {activeConv.leadStatus || 'Active'}
                </span>
              </div>

              {/* Products discussed pill */}
              {activeConv.productsDiscussed && activeConv.productsDiscussed.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Boxes className="w-4 h-4 text-sky-600" />
                  <span>Equipment Discussed:</span>
                  {activeConv.productsDiscussed.map((p: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Chat Transcript Bubbles */}
              <div className="space-y-3 pt-3 max-h-[380px] overflow-y-auto p-2 bg-slate-50 dark:bg-[#163A5C] rounded-2xl border border-slate-100">
                {(activeConv.messages || []).map((m: any, idx: number) => (
                  <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white dark:bg-[#0A1C2E] border border-slate-200 dark:border-[#163A5C] text-slate-800 dark:text-slate-200 rounded-bl-none shadow-xs'
                    }`}>
                      {m.text}
                    </div>
                    {m.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs space-y-2">
              <Bot className="w-10 h-10 text-slate-300 mx-auto" />
              <p>Select any conversation on the left to inspect the live client transcript and AI responses.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>RAG Model: <strong>GPT-4o with Knowledge Base Grounding</strong></span>
            <span>Clinical Grounding Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
