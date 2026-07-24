import { useEffect } from "react";
import { loadAnalyticsIds } from "@/lib/site-config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { load: (id: string) => void; page: () => void };
    pintrk?: (...args: unknown[]) => void;
  }
}

function injectScript(id: string, src?: string, inline?: string) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  if (src) {
    el.async = true;
    el.src = src;
  }
  if (inline) el.text = inline;
  document.head.appendChild(el);
}

/** Client-only analytics bootstrap from admin/env IDs — no UI impact */
export function AnalyticsBootstrap() {
  useEffect(() => {
    const ids = loadAnalyticsIds();

    if (ids.searchConsole) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "google-site-verification");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", ids.searchConsole);
    }

    if (ids.gtm) {
      window.dataLayer = window.dataLayer || [];
      injectScript(
        "pahraan-gtm",
        undefined,
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ids.gtm}');`,
      );
    }

    if (ids.ga4) {
      injectScript("pahraan-ga4-src", `https://www.googletagmanager.com/gtag/js?id=${ids.ga4}`);
      injectScript(
        "pahraan-ga4",
        undefined,
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ids.ga4}');`,
      );
    }

    if (ids.metaPixel) {
      injectScript(
        "pahraan-meta",
        undefined,
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ids.metaPixel}');fbq('track','PageView');`,
      );
    }

    if (ids.tiktok) {
      injectScript(
        "pahraan-tiktok",
        undefined,
        `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${ids.tiktok}');ttq.page();}(window,document,'ttq');`,
      );
    }

    if (ids.clarity) {
      injectScript(
        "pahraan-clarity",
        undefined,
        `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${ids.clarity}");`,
      );
    }

    if (ids.pinterest) {
      injectScript(
        "pahraan-pinterest",
        undefined,
        `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${ids.pinterest}');pintrk('page');`,
      );
    }
  }, []);

  return null;
}
