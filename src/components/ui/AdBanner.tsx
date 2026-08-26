'use client';

export default function AdBanner() {
  const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    html, body { margin: 0; padding: 0; width: 300px; height: 250px; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '0d0c05eed20fc0db85476fc168d5f0cf',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://rufflefireballcherries.com/0d0c05eed20fc0db85476fc168d5f0cf/invoke.js"></script>
</body>
</html>`;

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      <span className="text-[10px] uppercase font-bold tracking-widest text-dark-500 mb-2">
        ADVERTISEMENT
      </span>
      <div className="w-[300px] h-[250px] bg-dark-900/60 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
        <iframe
          srcDoc={adHtml}
          width="300"
          height="250"
          className="w-[300px] h-[250px] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Advertisement"
        />
      </div>
    </div>
  );
}
