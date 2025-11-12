import imageUrlBuilder from "@sanity/image-url";
import { sanityConfig } from "./config";

const builder = imageUrlBuilder(sanityConfig);

export function urlFor(
  source: { asset?: { _ref: string; _type: string } } | null | undefined
) {
  if (!source?.asset) return null;
  return builder.image(source).width(800).height(600).url();
}
