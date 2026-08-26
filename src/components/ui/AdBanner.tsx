'use client';

import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear any existing content to prevent duplicate ads on re-render
    adRef.current.innerHTML = '';

    // Create script for atOptions
    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : '0d0c05eed20fc0db85476fc168d5f0cf',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    // Create script for invoke.js
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://rufflefireballcherries.com/0d0c05eed20fc0db85476fc168d5f0cf/invoke.js';

    adRef.current.appendChild(confScript);
    adRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      <span className="text-[10px] uppercase font-bold tracking-widest text-dark-500 mb-2">
        ADVERTISEMENT
      </span>
      <div
        ref={adRef}
        className="w-[300px] h-[250px] bg-dark-900/60 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shadow-lg"
      />
    </div>
  );
}
