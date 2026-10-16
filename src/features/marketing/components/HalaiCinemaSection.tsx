import React from "react";
import { House, ArrowRight } from "lucide-react";

interface HalaiCinemaSectionProps {
  onBackToStudio: () => void;
}

export const HalaiCinemaSection: React.FC<HalaiCinemaSectionProps> = ({ onBackToStudio }) => {
  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-[#141416]" dir="rtl">
      {/* Background cinematic visual */}
      <img
        src="https://media.hallah.ai/cdn-cgi/image/width=1600,quality=65,format=auto/79d24fa4-8c98-4aee-b581-a4479f138d18/references/1782593219608-727f33f3-halai-coming-soon-bg.png"
        alt="Cinema Studio Coming Soon"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Content Card */}
      <div className="relative z-10 text-center px-6 max-w-lg space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl">
          قــريباً
        </h1>
        <p className="mt-4 text-zinc-300 text-sm md:text-base leading-relaxed drop-shadow">
          نحن نعمل على تحسين استوديو السينما ومحركات التوليد السينمائي فائقة الدقة لتقديم قدرات إبداعية غير مسبوقة لكافيه KUBE. ابقَ على اطلاع بينما نواصل دفع حدود الذكاء الاصطناعي التوليدي.
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={onBackToStudio}
            className="inline-flex items-center justify-center whitespace-nowrap font-semibold duration-150 active:scale-98 bg-white/[0.12] text-white border border-white/[0.22] backdrop-blur-md hover:bg-white/[0.20] hover:border-white/30 h-11 px-7 rounded-2xl text-sm gap-2 transition-all shadow-xl"
          >
            <House className="w-4 h-4 text-[#00e575]" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
