import React, { useState } from 'react';
import { Mail, Send, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { PageView } from '../types';

interface ContactPageProps {
  onNavigate: (page: PageView) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 text-right">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-indigo-400" />
            <span>اتصل بنا / الدعم الفني</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            نسعد بسماع اقتراحاتكم، ملاحظاتكم، أو الاستفسار عن نشر الألعاب
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>الرئيسية</span>
        </button>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>تم إرسال رسالتك بنجاح! سيقوم فريق إدارة GameZone Store بالرد عليك في أقرب وقت.</span>
        </div>
      )}

      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد علي"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">موضوع الرسالة</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="اقتراح ميزة جديدة / مشكلة في رابط تحميل..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">الرسالة أو الاستفسار</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب تفاصيل استفسارك أو اقتراحك هنا..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال الرسالة</span>
          </button>
        </form>
      </div>
    </div>
  );
};
