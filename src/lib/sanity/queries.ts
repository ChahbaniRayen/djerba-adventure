import { sanityClient } from "./config";
import { urlFor } from "./image";

export { urlFor };

export interface Activity {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  available: boolean;
  slug: {
    current: string;
  };
}

export interface Tour {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  highlights: string[];
  image: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  slug: {
    current: string;
  };
}

export interface Transfer {
  _id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  features: string[];
  image: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  slug: {
    current: string;
  };
}

const activitiesQuery = `*[_type == "activity"] | order(_createdAt desc) {
  _id,
  name,
  description,
  price,
  duration,
  image,
  available,
  slug
}`;

const toursQuery = `*[_type == "tour"] | order(_createdAt desc) {
  _id,
  name,
  description,
  price,
  duration,
  highlights,
  image,
  slug
}`;

const transfersQuery = `*[_type == "transfer"] | order(_createdAt desc) {
  _id,
  name,
  description,
  price,
  capacity,
  features,
  image,
  slug
}`;

export async function getActivities(): Promise<Activity[]> {
  return await sanityClient.fetch(activitiesQuery);
}

export async function getTours(): Promise<Tour[]> {
  return await sanityClient.fetch(toursQuery);
}

export async function getTransfers(): Promise<Transfer[]> {
  return await sanityClient.fetch(transfersQuery);
}

export async function getActivityBySlug(
  slug: string
): Promise<Activity | null> {
  const query = `*[_type == "activity" && slug.current == $slug][0] {
    _id,
    name,
    description,
    price,
    duration,
    image,
    available,
    slug
  }`;
  return await sanityClient.fetch(query, { slug });
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const query = `*[_type == "tour" && slug.current == $slug][0] {
    _id,
    name,
    description,
    price,
    duration,
    highlights,
    image,
    slug
  }`;
  return await sanityClient.fetch(query, { slug });
}

export async function getTransferBySlug(
  slug: string
): Promise<Transfer | null> {
  const query = `*[_type == "transfer" && slug.current == $slug][0] {
    _id,
    name,
    description,
    price,
    capacity,
    features,
    image,
    slug
  }`;
  return await sanityClient.fetch(query, { slug });
}
