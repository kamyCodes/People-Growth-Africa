import { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem } from '../data/events';

interface EventRegistrationModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export default function EventRegistrationModal({ event, onClose }: EventRegistrationModalProps) {
  const formId = useId();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    question: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmed(true);
    }, 800);
  };

  const downloadCalendarFile = () => {
    const icsDate = event.isoDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//People Growth Africa//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.subtitle}\\n\\nSpeaker: ${event.speaker.name}, ${event.speaker.title}`,
      `LOCATION:${event.format}`,
      `DTSTART:${icsDate}T140000Z`,
      `DTEND:${icsDate}T153000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 bg-white rounded-[24px] max-w-[620px] w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-charcoal/10"
      >
        {/* Header */}
        <div className="bg-deep-green p-6 md:p-8 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-all"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <span className="inline-block px-3 py-1 rounded-full bg-mint text-deep-green text-xs font-semibold uppercase tracking-wider mb-2">
            {event.typeLabel}
          </span>
          <h3 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-semibold leading-snug mb-1">
            {event.title}
          </h3>
          <p className="text-xs md:text-sm text-white/80 font-medium">
            {event.date} &bull; {event.time}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {isConfirmed ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 rounded-full bg-mint text-deep-green flex items-center justify-center mx-auto mb-4 border border-brand-green">
                  <svg className="w-7 h-7 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-charcoal mb-2">
                  Registration Confirmed
                </h4>
                <p className="text-charcoal/70 text-sm leading-relaxed mb-6">
                  Thank you, <strong>{formData.fullName}</strong>. A calendar invite and direct session link have been generated for <strong>{formData.email}</strong>.
                </p>

                <div className="bg-cream/70 rounded-[14px] p-5 text-left text-xs mb-6 space-y-2 border border-charcoal/10">
                  <div><strong>Event:</strong> {event.title}</div>
                  <div><strong>Schedule:</strong> {event.date} at {event.time}</div>
                  <div><strong>Platform:</strong> {event.format}</div>
                  <div><strong>Speaker:</strong> {event.speaker.name} ({event.speaker.title})</div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={downloadCalendarFile}
                    className="px-6 py-2.5 bg-deep-green text-white text-xs font-semibold rounded-full hover:bg-brand-green transition-all"
                  >
                    Add to Calendar (.ics)
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-cream text-charcoal text-xs font-semibold rounded-full hover:bg-charcoal/10 transition-all border border-charcoal/15"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed mb-4">
                  Complete the quick registration form below to secure your seat and receive the agenda briefing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-charcoal/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      id={`${formId}-name`}
                      type="text"
                      required
                      placeholder="e.g. Oluwaseun Davies"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-charcoal/20 bg-cream/20 text-charcoal text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${formId}-email`} className="block text-xs font-semibold text-charcoal/70 mb-1">
                      Work Email *
                    </label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      required
                      placeholder="oluwaseun@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-charcoal/20 bg-cream/20 text-charcoal text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${formId}-phone`} className="block text-xs font-semibold text-charcoal/70 mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-charcoal/20 bg-cream/20 text-charcoal text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${formId}-org`} className="block text-xs font-semibold text-charcoal/70 mb-1">
                      Organization / Company *
                    </label>
                    <input
                      id={`${formId}-org`}
                      type="text"
                      required
                      placeholder="e.g. Sterling Ventures"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-charcoal/20 bg-cream/20 text-charcoal text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-role`} className="block text-xs font-semibold text-charcoal/70 mb-1">
                    Your Role / Job Title
                  </label>
                  <input
                    id={`${formId}-role`}
                    type="text"
                    placeholder="e.g. Managing Director / Head of People"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-charcoal/20 bg-cream/20 text-charcoal text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-question`} className="block text-xs font-semibold text-charcoal/70 mb-1">
                    Specific Question for the Speaker (Optional)
                  </label>
                  <textarea
                    id={`${formId}-question`}
                    rows={2}
                    placeholder="Submit a challenge or question you would like addressed during the session..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-charcoal/20 bg-cream/20 text-charcoal text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-brand-green text-white font-semibold rounded-full hover:bg-terracotta transition-all text-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? 'Confirming Registration...'
                      : event.type === 'mentorship'
                      ? 'Submit Mentorship Application'
                      : 'Complete Free RSVP'}
                  </button>
                  <p className="text-center text-[0.7rem] text-charcoal/50 mt-2">
                    Direct access links and session calendar files will be delivered immediately to your email.
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
