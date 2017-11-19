import React from 'react';

export default ({ config, Router }) => {
  const GA_TRACKING_ID = config.ga.gaTrackingId;

  const GAHead = {
    content: [
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />,
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments)};
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
        }}
      />,
    ],
  };

  const GAMain = class extends React.Component {
    componentDidMount() {
      // We want to do this code _once_ after the component has successfully
      // mounted in the browser only, so we use a special semiphore here.
      if (window.__NEXT_ROUTER_PAGEVIEW_REGISTERED__) {
        return;
      }

      window.__NEXT_ROUTER_PAGEVIEW_REGISTERED__ = true;
      let lastTrackedUrl = '';

      // NOTE: No corresponding `off` as we want this event listener to exist
      // for the entire lifecycle of the page
      // NOTE: This does _not_ fire on first page load. This is what we want
      // since GA already tracks a page view when the tag is first loaded.
      Router.router.events.on(
        'routeChangeComplete',
        (newUrl = document.location) => {
          if (newUrl === lastTrackedUrl || !window.gtag) {
            return;
          }

          // Don't double track the same URL
          lastTrackedUrl = newUrl;

          // Believe it or not, this triggers a new pageview event!
          // https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
          window.gtag('config', GA_TRACKING_ID, {
            page_location: newUrl.href,
            page_path: newUrl.pathname,
            page_title: window.document.title,
          });
        }
      );
    }
  };

  return {
    head: GAHead,
    main: GAMain,
  };
};
