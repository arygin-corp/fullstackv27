// export interface Domain {
//   id: number;
//   name: string;
//   slug: string | null;
//   sku: number;
//   image: string;
//   level: number;
//   product_count: number;
//   desc?: string;  
//   subdomains?: Domain[]; // Recursive for nested structures
// }


export interface Domain {
  id: number;
  name: string;
  slug: string | null;
  image: string;
  product_count: number; // Matches the fixed serializer
  desc: string;          // Matches the 'desc' field in serializer
  products?: any[];      // Holds the single product for the redirect
  subdomains?: Domain[];
}