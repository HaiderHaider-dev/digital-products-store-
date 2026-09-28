import React, { useState } from 'react';
import { Mail, Check, Sparkles, Send } from 'lucide-react';

interface AboutContactModalProps {
  type: 'about' | 'contact' | null;
  onClose: () => void;
}

export const AboutContactModal: React.FC<AboutContactModalProps> = ({
  type,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0b0b] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
          <span className="text-xs uppercase tracking-[0.2em] text-[#E58A36] font-semibold">
            {type === 'about' ? 'Brand Philosophy' : 'Direct Inquiry'}
          </span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {type === 'about' ? (
          <div className="py-6 space-y-4">
            <h3
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Curated for creators who value time.
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              <strong className="text-white">V</strong> was founded on a singular conviction: creative professionals shouldn't waste hundreds of hours rebuilding foundational tools, prompt architectures, or planning systems from scratch.
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Every digital asset in our store is rigorously tested, version-controlled, and designed with zero subscriptions — pay once, download instantly, keep forever.
            </p>
            <div className="pt-4 border-t border-neutral-850 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white font-mono">100%</p>
                <p className="text-xs text-neutral-500 mt-1">Royalty Free</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white font-mono">24/7</p>
                <p className="text-xs text-neutral-500 mt-1">Instant Sync</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#E58A36] font-mono">0</p>
                <p className="text-xs text-neutral-500 mt-1">Subscriptions</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <h3
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Get in touch with us.
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Have questions about licensing, custom enterprise bundles, or product suggestions?
            </p>

            {submitted ? (
              <div className="bg-[#E58A36]/10 border border-[#E58A36]/30 p-6 rounded-xl text-center space-y-2">
                <Check className="w-8 h-8 text-[#E58A36] mx-auto" />
                <p className="text-white font-semibold text-base">Message Sent</p>
                <p className="text-xs text-neutral-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@studio.com"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#E58A36] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                    Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you're building..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#E58A36] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#E58A36] hover:bg-[#F29543] active:bg-[#D97706] text-black font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
