import React, { useState } from 'react';

export const SponsorAdBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState('');

  const phoneNumber = '01090718514';
  const fullName = 'يوسف عبدالفتاح عبدالحق';

  // نسخ رقم فودافون كاش (داخل مصر)
  const copyVodafoneCash = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedMsg('تم نسخ رقم فودافون كاش بنجاح! 📱');
    setTimeout(() => setCopiedMsg(''), 3000);
  };

  // نسخ البيانات والتحويل الدولي (خارج مصر)
  const copyInternationalAndRedirect = () => {
    const textToCopy = `الاسم: ${fullName}\nالرقم: ${phoneNumber}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedMsg('تم نسخ الاسم والرقم للتحويل الدولي! 🌍');
    
    setTimeout(() => {
      setCopiedMsg('');
      // فتح تطبيق/موقع TapTap Send
      window.open('https://www.taptapsend.com/', '_blank');
    }, 1500);
  };

  return (
    <div className="flex justify-center my-4">
      {/* زر Buy Me A Coffee الرئيسي */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        <span className="text-xl">☕</span>
        <span>ادعم المشروع (Buy me a coffee)</span>
      </button>

      {/* النافذة المنبثقة Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-yellow-500/40 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl relative dir-rtl text-right">
            
            {/* زر الإغلاق */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 left-3 text-gray-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-yellow-400 text-center mb-1">
              ☕ دعم مشروع MRJOO
            </h3>
            <p className="text-xs text-gray-300 text-center mb-5">
              اختر طريقة الدعم المناسبة لك للتسهيل عليك
            </p>

            {/* رسالة التنبيه عند النسخ */}
            {copiedMsg && (
              <div className="mb-4 p-2.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg text-center text-xs font-bold animate-pulse">
                {copiedMsg}
              </div>
            )}

            <div className="space-y-3">
              {/* خيار فودافون كاش (داخل مصر) */}
              <button
                onClick={copyVodafoneCash}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between shadow-md transition-all active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <span>فودافون كاش (داخل مصر)</span>
                </span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded">نسخ الرقم 📋</span>
              </button>

              {/* خيار تحويل دولي (TapTap Send / تحويل خارجي) */}
              <button
                onClick={copyInternationalAndRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between shadow-md transition-all active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🌍</span>
                  <span>تحويل دولي (Taptap Send)</span>
                </span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded">نسخ وتحويل 🔗</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-5">
              * للتحويل الدولي يتم نسخ الاسم الكامل والتحويل تلقائياً لتطبيقات التحويل.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
