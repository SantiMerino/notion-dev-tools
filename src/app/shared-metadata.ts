/**
 * Metadata fragments shared across route segments.
 *
 * Metadata objects are merged *shallowly*, so a segment that defines its own
 * `openGraph` replaces the root layout's wholesale -- including the images the
 * `opengraph-image` file convention contributes. Without spreading this back
 * in, post pages ship no `og:image` at all, which is exactly the case that
 * matters most since posts are the URLs people actually share.
 */
const ALT =
  "A halftone line-art portrait of Santi: glasses, a cap pushed up on the forehead, and a slight smile.";

export const openGraphImage = {
  images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: ALT }],
};

/** Same reasoning as `openGraphImage`, for the `twitter` namespace. */
export const twitterImage = {
  images: [{ url: "/twitter-image.png", width: 1200, height: 630, alt: ALT }],
};
