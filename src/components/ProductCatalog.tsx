import React, { useState } from 'react';
import { Download, Check, Sparkles, Filter, Search, ArrowUpRight, DollarSign, Bot, Eye, EyeOff, Copy, CheckCheck, Loader2, ShoppingCart, Package } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/storeData';
import { downloadPromptAsZip } from '../utils/downloadPrompt';
import { PaymentModal, STORE_CONFIG } from './PaymentModal';
import { useAdminAccess } from '../hooks/useAdminAccess';

interface ProductCatalogProps {
  selectedCategoryFilter?: string | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  selectedCategoryFilter = null,
  isModal = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    selectedCategoryFilter || 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Payment modal state
  const [paymentProduct, setPaymentProduct] = useState<Product | null>(null);
  const [showBundlePayment, setShowBundlePayment] = useState(false);

  // Admin bypass
  const isAdmin = useAdminAccess();

  const categories = ['All', 'AI Tools', 'Templates', 'Planners'];

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' ||
      p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Admin: direct download. Regular user: open payment modal.
  const handleBuyClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin) {
      handleDirectDownload(product, e);
    } else {
      setPaymentProduct(product);
    }
  };

  const handleDirectDownload = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadingIds.includes(product.id)) return;
    setDownloadingIds((prev) => [...prev, product.id]);
    try {
      await downloadPromptAsZip(product);
      if (!downloadedIds.includes(product.id)) {
        setDownloadedIds((prev) => [...prev, product.id]);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingIds((prev) => prev.filter((did) => did !== product.id));
    }
  };

  const handleCopyPrompt = (prompt: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      id="store-catalog"
      className={`w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 ${
        isModal ? 'py-4' : 'py-20 sm:py-28'
      } border-t border-neutral-900 bg-black`}
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-neutral-900">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#E58A36] uppercase">
            AI Money-Making Prompts
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Make Money with AI-Prompts
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
            High-level detailed prompts that strictly command AI chatbots to produce professional output. Use free tools from anywhere in the world to earn <span className="text-[#E58A36] font-semibold">$10–$100/day</span>. Each prompt is just <span className="text-white font-bold">${PRODUCTS[0]?.price ?? 2}</span>.
          </p>

          {/* Admin Indicator */}
          {isAdmin && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold px-2.5 py-1 rounded-md">
              ✓ Owner Access — Free Downloads Enabled
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#E58A36] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs + Bundle CTA */}
      <div className="flex items-center gap-2 sm:gap-6 py-6 overflow-x-auto no-scrollbar border-b border-neutral-900/60">
        <span className="text-xs text-neutral-500 uppercase tracking-widest hidden sm:inline-block mr-2">
          Filter:
        </span>
        {categories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer rounded-md ${
                isActive
                  ? 'text-[#E58A36] bg-[#E58A36]/10 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              {cat}
            </button>
          );
        })}

        {/* Bundle button */}
        <button
          onClick={() => {
            if (isAdmin) {
              // Admin: download all
              PRODUCTS.forEach(async (p) => {
                await downloadPromptAsZip(p);
              });
            } else {
              setShowBundlePayment(true);
            }
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#E58A36]/10 text-[#E58A36] hover:bg-[#E58A36]/20 rounded-md transition-colors cursor-pointer"
        >
          <Package className="w-3.5 h-3.5" />
          <span>All {STORE_CONFIG.bundleProductCount} for ${STORE_CONFIG.bundlePrice}</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-10">
        {filteredProducts.map((product) => {
          const isDownloaded = downloadedIds.includes(product.id);
          const isDownloading = downloadingIds.includes(product.id);
          return (
            <div
              key={product.id}
              onClick={() => setActiveProductDetail(product)}
              className="group relative bg-[#090909] border border-neutral-850 hover:border-neutral-700 rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 cursor-pointer"
            >
              <div>
                {/* Meta row: Category and Platform */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span className="text-[#E58A36] font-medium tracking-wide">
                    {product.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    {product.platform.split(' — ')[0].split(' or ')[0]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#E58A36] transition-colors leading-snug">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-400 text-xs sm:text-sm font-normal leading-relaxed mt-2.5 mb-4">
                  {product.description}
                </p>

                {/* Earning Potential Badge */}
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-md mb-4">
                  <DollarSign className="w-3 h-3" />
                  <span>Earn {product.earningPotential}</span>
                </div>

                {/* Platform Info */}
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mb-2">
                  <Bot className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Use with: <span className="text-neutral-300">{product.platform}</span></span>
                </div>
              </div>

              {/* Price & Action row */}
              <div className="pt-4 border-t border-neutral-900 flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-white tabular-nums">
                    ${product.price}
                  </span>
                  <span className="text-xs text-neutral-500 ml-1.5">one-time</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleBuyClick(product, e)}
                    disabled={isDownloading}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                      isDownloading
                        ? 'bg-neutral-800 text-neutral-400 cursor-wait'
                        : isAdmin && isDownloaded
                          ? 'bg-neutral-800 text-emerald-400 hover:bg-neutral-700 cursor-pointer'
                          : 'bg-white hover:bg-neutral-200 text-black active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Preparing...</span>
                      </>
                    ) : isAdmin && isDownloaded ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Again</span>
                      </>
                    ) : isAdmin ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">No prompts found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-4 text-xs font-semibold text-[#E58A36] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {activeProductDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveProductDetail(null)}
        >
          <div
            className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-[#E58A36] font-semibold">
                  {activeProductDetail.category}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  <DollarSign className="w-2.5 h-2.5" />
                  {activeProductDetail.earningPotential}
                </span>
              </div>
              <button
                onClick={() => setActiveProductDetail(null)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeProductDetail.title}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                {activeProductDetail.description}
              </p>

              {/* Platform & Earning Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-lg">
                  <Bot className="w-4 h-4 text-[#E58A36]" />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Platform</p>
                    <p className="text-xs text-white font-medium">{activeProductDetail.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Earning Potential</p>
                    <p className="text-xs text-emerald-400 font-medium">{activeProductDetail.earningPotential}</p>
                  </div>
                </div>
              </div>

              {/* Prompt Preview — Hidden for non-admin users */}
              {isAdmin ? (
                <div className="relative bg-neutral-950 p-4 sm:p-5 rounded-xl border border-neutral-900">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#E58A36] font-semibold">
                      Full Prompt Preview
                    </span>
                    <button
                      onClick={(e) => handleCopyPrompt(activeProductDetail.promptPreview, activeProductDetail.id, e)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      {copiedId === activeProductDetail.id ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-neutral-300 text-xs sm:text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
                    {activeProductDetail.promptPreview}
                  </p>
                </div>
              ) : (
                <div className="relative bg-neutral-950 p-4 sm:p-5 rounded-xl border border-neutral-900">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#E58A36] font-semibold">
                      Prompt Preview
                    </span>
                    <span className="text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
                      Full prompt after purchase
                    </span>
                  </div>
                  <p className="text-neutral-300 text-xs sm:text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
                    {activeProductDetail.promptPreview.substring(0, 280)}...
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent rounded-b-xl" />
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-2 text-xs text-neutral-300 mt-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Format:</span>
                  <span className="font-mono text-white">{activeProductDetail.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Downloads:</span>
                  <span className="tabular-nums text-white">{activeProductDetail.downloads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">User Rating:</span>
                  <span className="text-[#E58A36]">★ {activeProductDetail.rating} / 5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Works From:</span>
                  <span className="text-white">Any Country — Worldwide 🌍</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">License:</span>
                  <span className="text-white">Commercial & Personal (Royalty-free)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-white tabular-nums">
                  ${activeProductDetail.price}
                </span>
                <span className="text-xs text-neutral-500 block">
                  {isAdmin ? 'Owner — Free Access' : 'Instant delivery after payment'}
                </span>
              </div>
              {isAdmin ? (
                <button
                  onClick={async (e) => {
                    await handleDirectDownload(activeProductDetail, e);
                    setActiveProductDetail(null);
                  }}
                  disabled={downloadingIds.includes(activeProductDetail.id)}
                  className={`font-semibold px-6 py-2.5 rounded-full text-sm transition-all ${
                    downloadingIds.includes(activeProductDetail.id)
                      ? 'bg-neutral-700 text-neutral-400 cursor-wait'
                      : 'bg-[#E58A36] hover:bg-[#F29543] text-black cursor-pointer'
                  }`}
                >
                  {downloadingIds.includes(activeProductDetail.id) ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating PDF...
                    </span>
                  ) : downloadedIds.includes(activeProductDetail.id) ? (
                    'Download Again'
                  ) : (
                    'Download Free (Owner)'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPaymentProduct(activeProductDetail);
                    setActiveProductDetail(null);
                  }}
                  className="bg-[#E58A36] hover:bg-[#F29543] text-black font-semibold px-6 py-2.5 rounded-full text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy This Prompt — ${activeProductDetail.price}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modals */}
      {paymentProduct && (
        <PaymentModal
          product={paymentProduct}
          onClose={() => setPaymentProduct(null)}
        />
      )}

      {showBundlePayment && (
        <PaymentModal
          product={null}
          isBundle={true}
          onClose={() => setShowBundlePayment(false)}
        />
      )}
    </section>
  );
};
