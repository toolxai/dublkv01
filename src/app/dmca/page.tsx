import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DMCA Takedown Policy | DubLK',
  description: 'DubLK DMCA Notice & Takedown Policy. Report copyright infringement and submit formal takedown requests.',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white pt-24 pb-16 page-enter">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-dark-800/80 to-dark-900/80 border border-white/10 backdrop-blur-xl mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4">
            Legal & Compliance
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            DMCA Notice & Takedown Policy
          </h1>
          <p className="text-sm sm:text-base text-dark-300 mt-2 font-medium">
            DMCA දැනුම්දීම් සහ ඉවත් කිරීමේ ප්‍රතිපත්තිය
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8">
          
          {/* English Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-brand-400">🛡️</span> English Notice
            </h2>

            <p className="text-sm text-dark-200 leading-relaxed">
              Dub LK respects the intellectual property rights of others. We do not host, store, or upload any video content on our servers. All media content displayed on this website is hosted on third-party services and embedded for viewing.
            </p>

            <p className="text-sm text-dark-200 leading-relaxed font-medium">
              If you are a copyright owner or an authorized agent and believe that any content available on our site infringes upon your copyright, please submit a formal takedown request containing the following information:
            </p>

            <ul className="space-y-3 pl-2">
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Copyrighted Work:</strong> Clear identification of the copyrighted work claimed to have been infringed.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Infringing Location:</strong> The exact URL(s) on our site where the alleged infringing content is located.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Contact Details:</strong> Your full legal name, email address, and official contact information.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Good Faith Statement:</strong> A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-sm text-brand-300 leading-relaxed">
              Upon receiving a valid notification, we will review the request and remove or disable access to the infringing material within 48 to 72 hours.
            </div>
          </div>

          {/* Sinhala Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-emerald-400">🇱🇰</span> සිංහල දැනුම්දීම
            </h2>

            <p className="text-sm text-dark-200 leading-relaxed">
              Dub LK වෙබ් අඩවිය අන් අයගේ බුද්ධිමය දේපළ අයිතිවාසිකම්වලට ගරු කරයි. අපගේ සේවාදායක (servers) තුළ කිසිදු වීඩියෝ පටයක් ගබඩා කිරීම, සත්කාරකත්වය (host) දැක්වීම හෝ උඩුගත කිරීම සිදු නොකෙරේ. මෙම වෙබ් අඩවියේ ප්‍රදර්ශනය වන සියලුම වීඩියෝ අන්තර්ගතයන් තෙවන පාර්ශවීය වෙබ් අඩවි මගින් ලබාදී ඇති ඒවා වේ.
            </p>

            <p className="text-sm text-dark-200 leading-relaxed font-medium">
              ඔබ යම් ප්‍රකාශන හිමිකමක හිමිකරුවෙකු හෝ බලයලත් නියෝජිතයෙකු නම් සහ අපගේ වෙබ් අඩවියේ ඇති යම් අන්තර්ගතයකින් ඔබේ ප්‍රකාශන හිමිකම උල්ලංඝනය වන බව විශ්වාස කරන්නේ නම්, කරුණාකර පහත තොරතුරු ඇතුළත් කර අප වෙත දැනුම් දෙන්න:
            </p>

            <ul className="space-y-3 pl-2">
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">ප්‍රකාශන හිමිකම් සහිත අන්තර්ගතය:</strong> උල්ලංඝනය වී ඇති බවට හිමිකම් කියන නිශ්චිත නිර්මාණය හෝ වීඩියෝව හඳුනාගැනීමේ විස්තර.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">අදාළ ලිපිනය (URL):</strong> අපගේ වෙබ් අඩවියේ අදාළ අන්තර්ගතය පිහිටා ඇති නිශ්චිත URL ලිපිනය.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">සම්බන්ධ කරගැනීමේ තොරතුරු:</strong> ඔබේ සම්පූර්ණ නම, විද්‍යුත් තැපැල් ලිපිනය (email) සහ දුරකථන අංකය.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">තහවුරු කිරීමේ ප්‍රකාශය:</strong> අදාළ කරුණ සම්බන්ධයෙන් ප්‍රකාශන හිමිකරු හෝ නීතිය මගින් අවසර ලබාදී නොමැති බවට ඔබගේ විශ්වාසය තහවුරු කරන ප්‍රකාශය.</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 leading-relaxed">
              නිවැරදි සහ වලංගු නිවේදනයක් ලැබුණු පසු, අදාළ අන්තර්ගතය පැය 24-48 අතර කාලයක් ඇතුළත අපගේ වෙබ් අඩවියෙන් ඉවත් කිරීමට පියවර ගනු ලැබේ.
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📬</span> Contact Information / සම්බන්ධ කරගැනීමට:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://t.me/DubLK00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-dark-900/80 border border-white/10 hover:border-blue-500/40 hover:bg-dark-800 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0088cc]/20 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-medium">Telegram Contact</div>
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">@DubLK00</div>
                </div>
              </a>

              <a
                href="mailto:dublkofficial01@gmail.com"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-dark-900/80 border border-white/10 hover:border-purple-500/40 hover:bg-dark-800 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-medium">Email Inquiry</div>
                  <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">dublkofficial01@gmail.com</div>
                </div>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
