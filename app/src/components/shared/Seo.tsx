import { Helmet } from "react-helmet-async";

// NOTE: intentionally left pointing at the current live domain rather than a
// "continua..." placeholder — canonical/og:url tags need to match wherever
// the app is actually deployed, or they actively hurt SEO. Update this the
// moment a real Continua domain is live and DNS/hosting is pointed at it.
const SITE = "https://afrifinance.lovable.app";

interface SeoProps {
  title: string;
  description: string;
  /** Route path, e.g. "/markets". Used for canonical + og:url self-reference. */
  path: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route head metadata. Each route owns its own title, description,
 * canonical and social preview so no two routes share identical metadata.
 */
export const Seo = ({ title, description, path, type = "website", jsonLd }: SeoProps) => {
  const url = `${SITE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};