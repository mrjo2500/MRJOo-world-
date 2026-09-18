import React, { useEffect, useState } from 'react';
import { DollarSign, ExternalLink, Settings2, Sparkles, Shield, Crown } from 'lucide-react';
import { AdConfig, getStoredAdConfig, AdSettingsModal } from './AdSettingsModal';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const SponsorAdBanner: React.FC = () => {
  const [adConfig, setAdConfig] = useState<AdConfig>(getStoredAdConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);

  // Load Google AdSense Script dynamically when AdSense Publisher ID is present
  useEffect(() => {
    if (adConfig.type === 'adsense' && adConfig.adsensePublisherId) {
      const scriptId = 'google-adsense-sdk';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsensePublisherId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      try {
        // Push ad slot
        setTimeout(() => {
          if (window.adsbygoogle) {
            window.adsbygoogle.push({});
            setAdLoaded(true);
          }
        }, 500);
      } catch (err) {
        console.warn('AdSense slot init info:', err);
      }
    }
  }, [adConfig.type, adConfig.adsensePublisherId, adConfig.adsenseSlotId]);

  if (!adConfig.enabled) return null;

  return (
    <>
      <section
        id="mr_joo_sponsored_banner"
        aria-label="مساحة الرعاية والإعلانات"
        className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 relative z-20"
      >
        <div className="relative rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-amber-500/30">
          
          {/* Header Tag / Micro-Discretion Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900/60 border-b border-slate-800/60 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
              <span className="font-semibold text-slate-300">مساحة إعلانية مدعومة • Sponsored Space</span>
              <span className="hidden sm:inline text-slate-500">| غير مزعجة نهائياً</span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 text-[10px] text-amber-400/80 hover:text-amber-300 hover:underline transition-colors px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10"
              title="إعدادات إعلانات جوجل والربح"
            >
              <Settings2 className="w-3 h-3" />
              <span>إدارة الأرباح والإعلانات</span>
            </button>
          </div>

          {/* Ad Container Area (IAB Standard Responsive Leaderboard) */}
          <div className="w-full min-h-[60px] sm:min-h-[80px] flex items-center justify-center p-2">
            {adConfig.type === 'adsense' && adConfig.adsensePublisherId && adConfig.adsenseSlotId ? (
              <div className="w-full text-center overflow-hidden flex items-center justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'inline-block', width: '100%', minHeight: '60px', maxHeight: '90px' }}
                  data-ad-client={adConfig.adsensePublisherId}
                  data-ad-slot={adConfig.adsenseSlotId}
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                />
              </div>
            ) : (
              /* High-End MRJOOWORLD VIP Partner Banner */
              <a
                href={adConfig.customTargetUrl || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between gap-3 px-3 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-black hover:from-amber-950/45 hover:via-slate-850 hover:to-slate-950 transition-all border border-amber-500/20 group text-right"
              >
                {/* Left side: Call to action pill */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1 transition-all">
                    <span>انضم الآن</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </span>
                </div>

                {/* Right side: Branding & Tagline */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="text-right truncate">
                    <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5 justify-end">
                      <span>{adConfig.customTitle || 'MRJOOWORLD VIP Club • رعاية حصرية'}</span>
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                      فرصة الرعاية الماسية داخل صرح MR JOO الأسطوري ومجتمع المعرفة
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Ad Settings Modal */}
      <AdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={(newCfg) => setAdConfig(newCfg)}
      />
    </>
  );
};
