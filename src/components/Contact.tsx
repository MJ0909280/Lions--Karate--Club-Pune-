import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, ChevronDown, HelpCircle, Send, CheckCircle2, MessageSquare, Bot, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db, triggerWhatsAppNotification } from '../firebase';
import { runParentQueryAgent } from '../services/agentWorkflow';

type ChatMessage = {
  role: 'agent' | 'parent';
  text: string;
};

export default function Contact() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [queryType, setQueryType] = useState('General Query');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'agent',
      text: 'Hi, I am the Lions AI enquiry assistant. Ask me about fees, trial class, batch timing, admission, branches, or belt exams.',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !phone.trim() || !message.trim()) {
      setSubmitError('Please add parent name, phone number, and your question before sending.');
      return;
    }

    const parentMessage = message.trim();
    setChatMessages((items) => [...items, { role: 'parent', text: parentMessage }]);
    setMessage('');
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const currentTimestamp = Date.now();
      const queryPayload = {
        parentName: parentName.trim(),
        childName: childName.trim() || '',
        phone: phone.trim(),
        email: email.trim() || '',
        queryType,
        message: parentMessage,
        status: 'new' as const,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };

      const queryDoc = await addDoc(collection(db, 'parent_queries'), queryPayload);
      let reply = 'Your enquiry was saved. Our admin team will review it and follow up shortly.';

      try {
        const agentResult = await runParentQueryAgent({
          queryId: queryDoc.id,
          parentName: parentName.trim(),
          childName: childName.trim() || '',
          phone: phone.trim(),
          email: email.trim() || '',
          queryType,
          message: parentMessage,
          createdAt: currentTimestamp,
        });
        reply = agentResult.reply;
      } catch (agentErr) {
        console.warn('Non-blocking agent reply failed:', agentErr);
      }

      setChatMessages((items) => [...items, { role: 'agent', text: reply }]);

      await triggerWhatsAppNotification('inquiry', {
        fullName: parentName.trim(),
        phone: phone.trim(),
        batch: queryType,
        branch: `Child: ${childName.trim() || 'N/A'}. Msg: ${parentMessage.substring(0, 50)}`,
      });
    } catch (err: any) {
      console.error('Error submitting query:', err);
      setSubmitError('Failed to send enquiry. Please try again or call us directly.');
      setChatMessages((items) => [...items, { role: 'agent', text: 'Sorry, I could not save this enquiry right now. Please call 9049688172 or try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const useQuickQuestion = (text: string, type: string) => {
    setQueryType(type);
    setMessage(text);
  };

  const contactDetails = [
    {
      icon: <Phone className="w-5 h-5 text-yellow-500" />,
      title: 'Talk To Us',
      val: '9049688172',
      clickUrl: 'tel:9049688172',
    },
    {
      icon: <Mail className="w-5 h-5 text-yellow-500" />,
      title: 'Write An Email',
      val: 'LIONSKARATECLUBPUNE09@gmail.com',
      clickUrl: 'mailto:LIONSKARATECLUBPUNE09@gmail.com',
    },
  ];

  const operatingHours = [
    { day: 'Mon, Wed, Fri', hours: '04:30 PM - 09:30 PM' },
    { day: 'Tue, Thu', hours: '05:00 PM - 09:30 PM' },
    { day: 'Saturday', hours: '09:00 AM - 03:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  const faqs = [
    {
      q: 'What age can children start training at Lions Karate Club Pune?',
      a: 'We accept children starting from 4 years of age. Training is age-appropriate and focused on discipline, confidence, stamina, and safety.',
    },
    {
      q: 'Is martial arts training safe for young boys and girls?',
      a: 'Yes. Classes use safe drills, close coach supervision, and age-specific training methods.',
    },
    {
      q: 'Where are your offline dojo branches in Pune?',
      a: 'Main locations include Narhe, Katraj/Duttanagar, and Jambulwadi Lake View. Admin can confirm the nearest active branch.',
    },
    {
      q: 'Do you provide belt certifications?',
      a: 'Yes. Belt promotion exams and certificates are handled through the club process and student portal.',
    },
    {
      q: 'Can parents watch classes or attend trial drills?',
      a: 'Yes. Parents can discuss trial class options and class observation with admin.',
    },
  ];

  useEffect(() => {
    const schemaId = 'json-ld-faq-page';
    let scriptElement = document.getElementById(schemaId) as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = schemaId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
  }, []);

  return (
    <div className="relative py-4">
      <div className="w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4 mb-16">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0f0e0f] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-title text-base sm:text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-yellow-500 rounded-sm"></span>
                  Contact Channels
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-sans">
                  Speak with Lions Karate Club Pune about fees, trial class, batches, admission, or belt exams.
                </p>
              </div>

              <div className="space-y-4">
                {contactDetails.map((item, id) => (
                  <a
                    key={id}
                    href={item.clickUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-4 bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl hover:border-yellow-500/30 hover:bg-zinc-900/40 transition-all cursor-pointer group"
                  >
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-zinc-800 group-hover:text-yellow-400 transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-black text-[10px] uppercase text-zinc-500 tracking-wider">{item.title}</h4>
                      <span className="text-zinc-200 text-xs sm:text-sm font-semibold mt-0.5 block group-hover:text-yellow-500 transition-colors break-all">
                        {item.val}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-[#0f0e0f] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-center">
              <div className="flex items-center space-x-2 text-yellow-500 mb-4">
                <Clock className="w-5 h-5 animate-pulse" />
                <h3 className="font-title text-base sm:text-lg font-extrabold text-white uppercase tracking-wider">Training Periods</h3>
              </div>
              <div className="space-y-2.5">
                {operatingHours.map((oh, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-zinc-900/80 font-sans last:border-0 last:pb-0">
                    <span className="font-medium text-zinc-450">{oh.day}</span>
                    <span className="font-mono text-[11px] text-zinc-400 bg-zinc-950/80 border border-zinc-900/80 px-2 py-0.5 rounded">{oh.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0f0e0f] border border-zinc-900 rounded-2xl overflow-hidden flex flex-col min-h-[620px]">
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-title text-base sm:text-lg font-extrabold text-white uppercase tracking-wider">Chat With Lions AI</h3>
                  <p className="text-[11px] text-zinc-500 font-sans">Instant enquiry assistant. Saved to admin Parent Queries.</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-zinc-900 bg-[#0b0b0c]">
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent name *"
                className="w-full text-xs font-sans text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-3 focus:border-yellow-500/50 focus:outline-none"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number *"
                className="w-full text-xs font-sans text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-3 focus:border-yellow-500/50 focus:outline-none"
              />
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Child name optional"
                className="w-full text-xs font-sans text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-3 focus:border-yellow-500/50 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email optional"
                className="w-full text-xs font-sans text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-3 focus:border-yellow-500/50 focus:outline-none"
              />
            </div>

            <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(255,42,53,0.08),transparent_35%)]">
              {chatMessages.map((item, index) => (
                <div key={index} className={`flex gap-3 ${item.role === 'parent' ? 'justify-end' : 'justify-start'}`}>
                  {item.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed font-sans border ${item.role === 'parent' ? 'bg-yellow-500 text-slate-950 border-yellow-400 rounded-br-sm' : 'bg-zinc-950/90 text-zinc-200 border-zinc-850 rounded-bl-sm'}`}>
                    {item.text}
                  </div>
                  {item.role === 'parent' && (
                    <div className="w-8 h-8 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shrink-0">
                      <UserRound className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isSubmitting && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-950/90 border border-zinc-850 rounded-2xl rounded-bl-sm px-4 py-3 text-zinc-400 text-xs font-sans">
                    Agent is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-zinc-900 bg-[#0b0b0c] space-y-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => useQuickQuestion('What are fees and trial class timing for my child?', 'Fees & Billing Query')} className="text-[10px] sm:text-xs text-zinc-300 bg-zinc-950 border border-zinc-850 hover:border-yellow-500/40 px-3 py-2 rounded-full transition-colors">Fees + trial</button>
                <button type="button" onClick={() => useQuickQuestion('Which batch timing is best for my child?', 'General Query')} className="text-[10px] sm:text-xs text-zinc-300 bg-zinc-950 border border-zinc-850 hover:border-yellow-500/40 px-3 py-2 rounded-full transition-colors">Batch timing</button>
                <button type="button" onClick={() => useQuickQuestion('How can I take admission?', 'Admission Enquiry')} className="text-[10px] sm:text-xs text-zinc-300 bg-zinc-950 border border-zinc-850 hover:border-yellow-500/40 px-3 py-2 rounded-full transition-colors">Admission</button>
              </div>

              <form onSubmit={handleSubmitQuery} className="flex flex-col sm:flex-row gap-3">
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  className="sm:w-48 text-xs font-sans text-zinc-300 bg-zinc-950 border border-zinc-900 rounded-xl p-3 focus:border-yellow-500/50 focus:outline-none cursor-pointer"
                >
                  <option value="General Query">General</option>
                  <option value="Admission Enquiry">Admission</option>
                  <option value="Fees & Billing Query">Fees</option>
                  <option value="Belt Exam & Promotions">Belt Exam</option>
                  <option value="Complaints or Feedback">Feedback</option>
                </select>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your question here..."
                  rows={1}
                  className="flex-1 min-h-[48px] max-h-28 text-xs sm:text-sm font-sans text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-3 focus:border-yellow-500/50 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 font-heading font-black text-xs text-slate-950 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 px-5 py-3 rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>

              {submitError && (
                <p className="text-red-500 font-sans text-[11px] font-semibold bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">
                  {submitError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto border-t border-zinc-900/80 pt-16" id="faq-section">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-1.5 text-yellow-500 text-xs font-bold uppercase tracking-widest font-mono mb-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Dojo FAQ & Answers</span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-wider">Common Parental Concerns</h3>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-md mx-auto">Quick answers for parents before they chat with the agent.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqId === index;
              return (
                <div key={index} className="bg-[#0f0e0f] border border-zinc-900 rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-heading text-xs sm:text-sm font-bold text-zinc-200 hover:text-yellow-500 select-none cursor-pointer group"
                    id={`faq-btn-${index}`}
                  >
                    <span className="pr-4 leading-normal">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className="shrink-0 bg-zinc-950 p-1.5 rounded-lg border border-zinc-900 group-hover:border-yellow-500/20 text-zinc-500 group-hover:text-yellow-500"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { type: 'spring', stiffness: 400, damping: 22, mass: 0.8 }, opacity: { duration: 0.2 } }}
                      >
                        <div className="p-4.5 pt-0 text-zinc-400 text-xs sm:text-[13px] leading-relaxed font-sans border-t border-zinc-900/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
