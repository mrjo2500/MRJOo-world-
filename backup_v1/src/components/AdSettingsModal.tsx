import React, { useState, useEffect } from 'react';
import { X, DollarSign, Sparkles, CheckCircle2, ShieldCheck, HelpCircle, ExternalLink, Sliders } from 'lucide-react';

export interface AdConfig {
  enabled: boolean;
  type: 'adsense' | 'custom';
  adsensePublisherId: string; // e.g. ca-pub-1234567890123456
  adsenseSlotId: string;      // e.g. 1234567890
  customImageUrl?: string;
  customTargetUrl?: string;
  customTitle?: string;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  enabled: true,
  type: 'custom',
  adsensePublisherId: '',
  adsenseSlotId: '',
  customImageUrl: '',
  customTargetUrl: 'https://instagram.com',
  customTitle: 'MRJOOWORLD VIP Club • انضم للرعاة الرسميين',
};

const STORAGE_AD_CONFIG_KEY = 'mr_joo_ad_config_v1';

export function getStoredAdConfig(): AdConfig {
  try {
    const raw = localStorage.getItem(STORAGE_AD_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_AD_CONFIG;
}

export function saveStoredAdConfig(cfg: AdConfig) {
  try {
    localStorage.setItem(STORAGE_AD_CONFIG_KEY, JSON.stringify(cfg));
  } catch {}
}

interface AdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (cfg: AdConfig) => void;
}

export const AdSettingsModal: React.FC<AdSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveConfig,
}) => {
  const [config, setConfig] = useState<AdConfig>(getStoredAdConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredAdConfig());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredAdConfig(config);
    onSaveConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/30 to-slate-900">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 justify-end">
                <span>إعدادات الإعلانات والأرباح</span>
                <DollarSign className="w-5 h-5 text-amber-400" />
              </h3>
              <p className="text-xs text-amber-300/80">
                مساحة ربحية احترافية غير مزعجة نهائياً ومتوافقة مع Google AdSense
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">ضمان عدم الإزعاج وتجربة لعب نظيفة 100%:</strong>
              مكان الإعلان مثبت بأسلوب قياسي (Responsive IAB Banner) أسفل المحتوى، ولا يظهر منبثقاً (No Popups) ولا يحجب واجهة اللعب أو العالم ثلاثي الأبعاد.
            </div>
          </div>

          {/* Ad Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">نوع الإعلان المُفعّل:</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfig({ ...config, type: 'adsense' })}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  config.type === 'adsense'
                    ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-2 ring-amber-400/20'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  <span>Google AdSense</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[10px] text-slate-400">إعلانات جوجل الرسمية للربح المالي</span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, type: 'custom' })}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  config.type === 'custom'
                    ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-2 ring-amber-400/20'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  <span>إعلان راعي مخصص</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[10px] text-slate-400">بنر رعاة خاصين / روابط تسويق</span>
              </button>
            </div>
          </div>

          {/* AdSense Inputs */}
          {config.type === 'adsense' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-mono">مثال: ca-pub-1234567890123456</span>
                  <label className="text-xs font-bold text-slate-200">معرف ناشر أدسنس (Publisher Client ID):</label>
                </div>
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={config.adsensePublisherId}
                  onChange={(e) => setConfig({ ...config, adsensePublisherId: e.target.value.trim() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-mono">مثال: 9876543210</span>
                  <label className="text-xs font-bold text-slate-200">معرف الوحدة الإعلانية (Ad Slot ID):</label>
                </div>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={config.adsenseSlotId}
                  onChange={(e) => setConfig({ ...config, adsenseSlotId: e.target.value.trim() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  dir="ltr"
                />
              </div>

              {/* Instructions on how to earn */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1 text-blue-300">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>خطوات الربح من Google AdSense لـ MR JOO:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed pr-1">
                  <li>قم بفتح حساب مجاني في <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">adsense.google.com <ExternalLink className="w-2.5 h-2.5 inline" /></a>.</li>
                  <li>أضف موقعك ليتم اعتماده وتفعيل الإعلانات المربحة.</li>
                  <li>انسخ Publisher ID والـ Slot ID من لوحة تحكم أدسنس وضعهما هنا.</li>
                  <li>ستظهر الإعلانات مباشرة ويتم تحويل الأرباح لحسابك البنكي شهرياً!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Custom Sponsor Banner Inputs */}
          {config.type === 'custom' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">عنوان البنر / الراعي:</label>
                <input
                  type="text"
                  placeholder="MRJOOWORLD VIP Club • انضم للرعاة الرسميين"
                  value={config.customTitle || ''}
                  onChange={(e) => setConfig({ ...config, customTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">رابط تحويل الراعي (عند الضغط):</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/mrjoo"
                  value={config.customTargetUrl || ''}
                  onChange={(e) => setConfig({ ...config, customTargetUrl: e.target.value.trim() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                تم الحفظ والتطبيق بنجاح!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
