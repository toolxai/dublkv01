import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | DubLK',
  description: 'DubLK Terms of Service and Usage Conditions in English and Sinhala.',
};

export default function TermsPage() {
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
            Terms & Conditions
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-dark-300 mt-2 font-medium">
            සේවා පියවර සහ කොන්දේසි
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8">
          
          {/* English Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-brand-400">📜</span> Terms of Service
            </h2>

            <p className="text-sm text-dark-200 leading-relaxed font-medium">
              By using Dub LK, you agree to comply with and be bound by the following Terms of Service. If you do not agree with any part of these terms, please do not use our website.
            </p>

            <ul className="space-y-4 pl-2">
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Content Disclaimer:</strong> All video content available on Dub LK is hosted on third-party platforms. We do not host, store, or upload any media on our servers and act solely as an index of publicly available content.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Third-Party Links:</strong> Our website contains links and embedded players from external websites. We have no control over the content, privacy policies, or practices of any third-party sites and accept no responsibility for them.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">User Conduct:</strong> You agree to use this site only for lawful, personal, and non-commercial purposes. Any attempt to exploit, tamper with, or misuse the site&apos;s services is strictly prohibited.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Limitation of Liability:</strong> Dub LK shall not be held liable for any damages, losses, or legal issues arising from the use or inability to use the content provided on this website.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span><strong className="text-white">Modifications:</strong> We reserve the right to modify or replace these terms at any time without prior notice. Continuous use of the site constitutes acceptance of the updated terms.</span>
              </li>
            </ul>
          </div>

          {/* Sinhala Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-emerald-400">🇱🇰</span> සේවා පියවර සහ කොන්දේසි (සිංහල)
            </h2>

            <p className="text-sm text-dark-200 leading-relaxed font-medium">
              Dub LK වෙබ් අඩවිය භාවිතා කිරීම මගින්, ඔබ පහත සඳහන් සේවා කොන්දේසිවලට එකඟ වන බව තහවුරු කරයි. ඔබ මෙම කොන්දේසිවලට එකඟ නොවන්නේ නම්, කරුණාකර අපගේ වෙබ් අඩවිය භාවිතා කිරීමෙන් වළකින්න.
            </p>

            <ul className="space-y-4 pl-2">
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">අන්තර්ගතය පිළිබඳ වගකීම:</strong> Dub LK හි ඇති සියලුම වීඩියෝ අන්තර්ගතයන් තෙවන පාර්ශවීය වෙබ් අඩවිවල සත්කාරකත්වය (host) දරයි. අපගේ සේවාදායක (servers) තුළ කිසිදු වීඩියෝවක් ගබඩා කිරීම හෝ උඩුගත කිරීම සිදු නොකරන අතර, අප වෙබ් අඩවිය මගින් සිදු කරනුයේ ප්‍රසිද්ධියේ ලබා ගත හැකි අන්තර්ගතයන් වෙත පිවිසීමට පහසුකම් සැලසීම පමණි.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">තෙවන පාර්ශවීය සබැඳි:</strong> අපගේ වෙබ් අඩවියේ බාහිර වෙබ් අඩවිවල සබැඳි (links) සහ වීඩියෝ ප්ලේයර් අඩංගු වේ. එම බාහිර වෙබ් අඩවිවල අන්තර්ගතය හෝ ඒවායේ පෞද්ගලිකත්ව ප්‍රතිපත්ති පිළිබඳව අපට කිසිදු පාලනයක් නොමැති අතර, ඒ පිළිබඳ වගකීමක් අප විසින් භාරගනු නොලැබේ.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">පරිශීලක හැසිරීම:</strong> මෙම වෙබ් අඩවිය පුද්ගලික සහ වාණිජ නොවන නීත්‍යානුකූල කටයුතු සඳහා පමණක් භාවිතා කිරීමට ඔබ එකඟ වේ. වෙබ් අඩවියේ සේවාවන් අවභාවිත කිරීම හෝ හානි කිරීම strictly prohibited (තහනම්) වේ.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">වගකීම් සීමාව:</strong> මෙම වෙබ් අඩවියේ ඇති අන්තර්ගතයන් භාවිත කිරීමෙන් හෝ භාවිත කිරීමට නොහැකි වීමෙන් සිදුවන කිසිදු හානියක් හෝ නීතිමය ගැටලුවක් සම්බන්ධයෙන් Dub LK වගකීමක් නොදරයි.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong className="text-white">කොන්දේසි වෙනස් කිරීම:</strong> පූර්ව දැනුම්දීමකින් තොරව ඕනෑම වේලාවක මෙම කොන්දේසි වෙනස් කිරීමට හෝ යාවත්කාලීන කිරීමට අපට අයිතිය ඇත. යාවත්කාලීන කිරීමෙන් පසුවද වෙබ් අඩවිය භාවිත කිරීම මගින් ඔබ නව කොන්දේසිවලට එකඟ වූවා සේ සැලකේ.</span>
              </li>
            </ul>
          </div>

          {/* Contact Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📬</span> Contact Information / සම්බන්ධ කරගැනීමට:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://t.me/apexAIlk"
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
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">@apexAIlk</div>
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
