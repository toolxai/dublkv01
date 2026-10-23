'use client';

import Script from 'next/script';

export default function AdBanner() {
  return (
    <>
      {/* ProfitableRateCPM Ad Script */}
      <Script
        id="prcpm-ad-script"
        async
        data-cfasync="false"
        src="https://pl31901261.profitableratecpmnetwork.com/fcbbc70a064725d257af2184712cfb77/invoke.js"
        strategy="afterInteractive"
      />
      {/* Ad Container */}
      <div id="container-fcbbc70a064725d257af2184712cfb77" />
    </>
  );
}
