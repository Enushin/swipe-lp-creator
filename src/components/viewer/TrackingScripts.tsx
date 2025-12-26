"use client";

import { useEffect } from "react";
import Script from "next/script";
import type { TrackingConfig } from "@/types";

interface TrackingScriptsProps {
  config: TrackingConfig;
}

export function TrackingScripts({ config }: TrackingScriptsProps) {
  const { gtmId, metaPixelId, customHeadScript, customBodyScript } = config;

  useEffect(() => {
    // Initialize dataLayer for GTM
    if (gtmId && typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
    }
  }, [gtmId]);

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Custom Head Script */}
      {customHeadScript && (
        <Script
          id="custom-head-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: customHeadScript }}
        />
      )}

      {/* Custom Body Script */}
      {customBodyScript && (
        <Script
          id="custom-body-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: customBodyScript }}
        />
      )}
    </>
  );
}

export default TrackingScripts;
