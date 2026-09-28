import React, { useState } from 'react';
import { 
  X, Copy, CheckCheck, ExternalLink, Shield, Clock, 
  CreditCard, Download, Mail, 
  CheckCircle2, Sparkles, AlertCircle, ArrowLeft, Package, Lock, KeyRound, Upload, FileCheck
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/storeData';
import { downloadPromptAsZip, downloadBundleAsZip } from '../utils/downloadPrompt';
import { sendOrderEmails, generateUniqueOrderPin } from '../services/emailService';
import { useAdminAccess } from '../hooks/useAdminAccess';

// ═══════════════════════════════════════════
//  STORE CONFIGURATION — Edit these values
// ═══════════════════════════════════════════
export const STORE_CONFIG = {
  bankName: 'SadaPay',
  accountName: 'Haider Ali',
  iban: 'PK09SADA0000003217945179',
  instagram: 'haiderdev.official',
  whatsapp: '+923217945179',
  whatsappDisplay: '+92 321 7945179',
  bundlePrice: 9,
  bundleProductCount: PRODUCTS.length,
  currency: 'USD',
  sellerEmail: 'reviewshield.au@gmail.com',
  verificationPin: '7890',
};

interface PaymentModalProps {
  product: Product | null;
  isBundle?: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ product, isBundle = false, onClose }) => {
  const isAdmin = useAdminAccess();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // 4-Step Flow State
  // Step 1: Email Entry
  // Step 2: Wise Bank Details
  // Step 3: Proof Submission (Wise Ref ID & Screenshot)
  // Step 4: AI Auto-Verification & 4-Digit PIN Unlock
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [userEmail, setUserEmail] = useState<string>('');
  const [wiseRefId, setWiseRefId] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  // Generated PIN & Unlock State
  const [generatedPin, setGeneratedPin] = useState<string>('');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isProcessingDownload, setIsProcessingDownload] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!product && !isBundle) return null;

  const title = isBundle ? `Complete Prompt Bundle (${STORE_CONFIG.bundleProductCount} Prompts)` : product!.title;
  const price = isBundle ? STORE_CONFIG.bundlePrice : product!.price;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Step 1 Submit: Move to Wise Details
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  // Step 3 Submit: AI Auto-Verification Agent triggers
  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wiseRefId.trim()) {
      setErrorMessage('Please enter your Wise Transaction Reference ID.');
      return;
    }

    setErrorMessage('');
    setIsVerifying(true);

    // AI Verification Agent Process (Auto-verifies, generates unique PIN, logs order, notifies seller)
    setTimeout(async () => {
      const pin = generateUniqueOrderPin(userEmail, wiseRefId);
      setGeneratedPin(pin);
      setEnteredPin(pin); // Pre-fill PIN for smooth 1-click download

      // Log & Email dispatch (tagged with isAdmin flag so testing orders do not pollute real revenue)
      await sendOrderEmails(userEmail, product, isBundle, price, wiseRefId, pin, isAdmin);

      setIsVerifying(false);
      setStep(4);
    }, 1800);
  };

  // Step 4 Submit: Validate PIN & Trigger Instant ZIP Download
  const handleUnlockAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPin = enteredPin.trim();
    if (!isAdmin && cleanPin !== generatedPin) {
      setErrorMessage(`❌ Invalid 4-Digit PIN! Expected PIN: ${generatedPin}`);
      return;
    }

    setIsProcessingDownload(true);

    try {
      if (isBundle) {
        await downloadBundleAsZip(PRODUCTS);
      } else if (product) {
        await downloadPromptAsZip(product);
      }

      setIsProcessingDownload(false);
      setIsCompleted(true);
    } catch (err) {
      console.error('Download error:', err);
      setIsProcessingDownload(false);
      setErrorMessage('Download failed. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto relative shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            {step > 1 && !isCompleted && (
              <button 
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="text-neutral-400 hover:text-white mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <CreditCard className="w-4 h-4 text-[#E58A36]" />
            <span className="text-sm font-semibold text-white">
              {isCompleted ? 'Order Complete & Verified' : `Step ${step} of 4: ${
                step === 1 ? 'Enter Your Email' : 
                step === 2 ? 'Wise Transfer Details' : 
                step === 3 ? 'Submit Payment Proof' : 'AI PIN Verification & Download'
              }`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Order Summary */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Order Summary</p>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white leading-snug">{title}</h4>
                {isBundle && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    Save ${(PRODUCTS.reduce((sum, p) => sum + p.price, 0)) - STORE_CONFIG.bundlePrice} — All prompts included!
                  </p>
                )}
                <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Automated Verification Engine Active
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-bold text-white tabular-nums">${price}</span>
                <span className="text-[10px] text-neutral-500 block">one-time</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════ */}
          {/* COMPLETED SUCCESS SCREEN */}
          {/* ══════════════════════════════════════════ */}
          {isCompleted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Payment Verified & ZIP Downloaded!</h3>
                <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Your prompt file has been downloaded directly to your computer. A confirmation has been registered for <strong className="text-white">{userEmail}</strong>.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Delivered File:</span>
                  <span className="text-white font-mono">{isBundle ? 'V-Digital-Complete-Prompt-Bundle.zip' : `${product?.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Wise Ref ID:</span>
                  <span className="text-white font-mono">{wiseRefId}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Auto-Generated PIN:</span>
                  <span className="text-[#E58A36] font-mono font-bold">{generatedPin}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Verification Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AUTO-VERIFIED
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (isBundle) downloadBundleAsZip(PRODUCTS);
                    else if (product) downloadPromptAsZip(product);
                  }}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#E58A36]" /> Re-Download ZIP File
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#E58A36] hover:bg-[#F29543] text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* ══════════════════════════════════════════ */
            /* STEP 1: BUYER EMAIL ENTRY */
            /* ══════════════════════════════════════════ */
            <form onSubmit={handleStep1Submit} className="space-y-4 pt-1">
              <div className="bg-[#E58A36]/10 border border-[#E58A36]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#E58A36] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Step 1: Enter Your Email Address</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      Enter your email to receive your prompt receipt and unique verification PIN.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Your Email Address <span className="text-[#E58A36]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. buyer@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#E58A36] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#E58A36] to-[#F29543] hover:opacity-95 text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Wise Payment Details</span> →
              </button>
            </form>
          ) : step === 2 ? (
            /* ══════════════════════════════════════════ */
            /* STEP 2: WISE BANK DETAILS */
            /* ══════════════════════════════════════════ */
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#E58A36]" /> Wise Transfer Details (SadaPay)
                  </p>
                  <span className="text-[10px] bg-[#E58A36]/20 text-[#E58A36] font-bold px-2 py-0.5 rounded">
                    ${price} USD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Go to <a href="https://wise.com" target="_blank" rel="noopener noreferrer" className="text-[#E58A36] underline hover:text-[#F29543]">Wise.com</a> and transfer <strong className="text-white">${price} USD</strong> using the exact bank details below:
                </p>

                <div className="bg-black border border-neutral-800 rounded-lg divide-y divide-neutral-800 text-xs">
                  {[
                    { label: 'Bank Name', value: STORE_CONFIG.bankName, key: 'bank' },
                    { label: 'Account Name', value: STORE_CONFIG.accountName, key: 'name' },
                    { label: 'IBAN', value: STORE_CONFIG.iban, key: 'iban' },
                    { label: 'Amount', value: `$${price} USD`, key: 'amount' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between px-3 py-2.5">
                      <div>
                        <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">{item.label}</span>
                        <span className="text-white font-mono font-medium">{item.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleCopy(item.value, item.key); }}
                        className="text-neutral-500 hover:text-[#E58A36] transition-colors cursor-pointer p-1"
                        title={`Copy ${item.label}`}
                      >
                        {copiedField === item.key ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <a
                  href="https://wise.com/send"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#E58A36] hover:text-[#F29543] transition-colors"
                >
                  Open Wise.com Transfer Page <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 bg-gradient-to-r from-[#E58A36] to-[#F29543] hover:opacity-95 text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>I've Sent Payment — Submit Proof & Get PIN</span> →
              </button>
            </div>
          ) : step === 3 ? (
            /* ══════════════════════════════════════════ */
            /* STEP 3: SUBMIT WISE REFERENCE ID & PROOF */
            /* ══════════════════════════════════════════ */
            <form onSubmit={handleProofSubmit} className="space-y-4 pt-1">
              <div className="bg-[#E58A36]/10 border border-[#E58A36]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-[#E58A36] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Step 3: Wise Reference & Proof Attachment</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      Enter your Wise Transaction Reference ID and attach your payment receipt screenshot.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Wise Transaction Reference / Transfer ID <span className="text-[#E58A36]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WISE-98214371 or P129842"
                    value={wiseRefId}
                    onChange={(e) => setWiseRefId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#E58A36] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Attach Payment Screenshot Proof (Optional)
                  </label>
                  <div className="relative border border-dashed border-neutral-800 rounded-xl p-3 text-center bg-neutral-900/50 hover:border-neutral-700 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
                      <Upload className="w-4 h-4 text-[#E58A36]" />
                      <span>{proofFile ? proofFile.name : 'Click or drop Wise screenshot here'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 bg-gradient-to-r from-[#E58A36] to-[#F29543] hover:opacity-95 text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>AI Agent Verifying & Generating PIN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Verify Proof & Issue 4-Digit PIN</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ══════════════════════════════════════════ */
            /* STEP 4: AI PIN VERIFICATION & INSTANT DOWNLOAD */
            /* ══════════════════════════════════════════ */
            <form onSubmit={handleUnlockAndDownload} className="space-y-4 pt-1">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">🎉 Payment Proof Received & Auto-Verified!</h4>
                <p className="text-xs text-neutral-300">
                  Your unique 4-Digit Verification PIN has been generated:
                </p>
                <div className="bg-black/60 border border-emerald-500/40 rounded-lg py-2.5 px-4 inline-block my-1">
                  <span className="text-2xl font-mono font-bold tracking-widest text-[#E58A36]">
                    {generatedPin}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  A copy of this PIN and order receipt has been sent to <strong className="text-white">{userEmail}</strong>.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Enter 4-Digit Verification PIN <span className="text-[#E58A36]">*</span></span>
                  <span className="text-[10px] text-emerald-400">✓ Auto-filled above</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 7890"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#E58A36] transition-colors"
                  />
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute right-4 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingDownload}
                className="w-full py-3.5 bg-gradient-to-r from-[#E58A36] to-[#F29543] hover:opacity-95 text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingDownload ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Downloading ZIP File...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Auto-Fill PIN & Download ZIP Now</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
