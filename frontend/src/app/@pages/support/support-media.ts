import { KB_ARTICLES, KB_CATEGORIES, KbArticle } from './support-knowledge';

export interface KbShot {
  src: string;
  caption: string;
}

export interface KbMedia {
  image: string;
  walkthrough?: KbShot[];
}

const domains = 'assets/images/support/guides/kb-home-domains.png';
const search = 'assets/images/support/guides/kb-search-user.png';
const product = 'assets/images/support/guides/kb-product.png';
const catalog = 'assets/images/support/guides/kb-catalog.png';
const dar = 'assets/images/support/guides/kb-dar.png';
const privacy = 'assets/images/support/guides/kb-dar-privacy.png';
const compare = 'assets/images/support/guides/kb-compare.png';
const favorites = 'assets/images/support/guides/kb-favorites.png';
const vikki = 'assets/images/support/guides/kb-vikki.png';
const track = 'assets/images/support/guides/kb-track.png';
const cart = 'assets/images/support/guides/kb-cart.png';

export const KB_MEDIA: Record<string, KbMedia> = {
  'what-is-the-marketplace': { image: domains },
  'who-can-use-it': { image: domains },
  'change-language': { image: domains },
  'search-the-catalog': {
    image: search,
    walkthrough: [
      { src: domains, caption: 'Start from the header search. The homepage domains are there if you would rather browse.' },
      { src: search, caption: 'Type at least two characters. User-Based lists the name, SKU, datatype, steward, and point of contact. View Details opens the product.' }
    ]
  },
  'favorites-compare-cart': {
    image: search,
    walkthrough: [
      { src: search, caption: 'The heart and the compare icon sit on each search result, and the same icons are in the header.' },
      { src: favorites, caption: 'Favorites keeps saved products. It does not submit a request.' },
      { src: cart, caption: 'The cart is where a request waits until checkout is available.' }
    ]
  },
  'request-access-on-a-product': {
    image: product,
    walkthrough: [
      { src: search, caption: 'Find the product in User-Based search and choose View Details.' },
      { src: product, caption: 'On the product, choose Request Access. The heart and compare icon are beside that button.' },
      { src: cart, caption: 'After the request is added, open the cart and continue when checkout is available.' }
    ]
  },
  'product-not-in-the-catalog': {
    image: search,
    walkthrough: [
      { src: search, caption: 'Search first. If the panel says no products were found, the data is not listed under that name.' },
      { src: dar, caption: 'Data Access Request is the form for data the catalog does not list.' }
    ]
  },
  'add-new-product': { image: domains },
  'start-a-data-access-request': {
    image: dar,
    walkthrough: [
      { src: dar, caption: 'The checklist on the left shows which answers are still open. Start with who the access is for, then platform, domain, user type, and environment.' },
      { src: privacy, caption: 'Finish with the personal-information questions and the Terms of Use checkbox.' }
    ]
  },
  'choose-a-platform': { image: dar },
  'choose-a-data-domain': {
    image: domains,
    walkthrough: [
      { src: domains, caption: 'Domains on the homepage are the same business areas the request form asks you to choose.' },
      { src: dar, caption: 'On the form, use the Data Domain Help Document before you pick a domain.' }
    ]
  },
  'request-for-someone-else': { image: dar },
  'user-or-application-access': { image: dar },
  'description-and-checklist': { image: dar },
  'personal-information': {
    image: privacy,
    walkthrough: [
      { src: privacy, caption: 'Read the P02 card, then answer Personal Information and Sensitive Personal Information as two separate questions.' }
    ]
  },
  'terms-of-use': {
    image: privacy,
    walkthrough: [
      { src: privacy, caption: 'The Terms of Use card is the acknowledgment. Check the box only after you have read it. The checklist stays open until you do.' }
    ]
  },
  'track-a-request': {
    image: track,
    walkthrough: [
      { src: track, caption: 'Enter a request number or an RITM number. The email is the signed-in account, and the status opens on the right.' }
    ]
  },
  'ask-vikki': {
    image: vikki,
    walkthrough: [
      { src: vikki, caption: 'Open the round button. Ask how to use the marketplace. The shortcuts under the reply jump to search, domains, or a guide. VIKKI does not submit the request.' }
    ]
  },
  'where-to-get-help': { image: domains },
  'how-to-search': {
    image: search,
    walkthrough: [
      { src: domains, caption: 'Click the search box in the header. It searches the catalog, which is also grouped by the domain cards below it.' },
      { src: search, caption: 'Type at least two characters and stay on User-Based. Read the datatype and steward, then choose View Details. Use the heart or compare icon if you are not ready to open it.' }
    ]
  },
  'user-based-versus-ai-search': {
    image: search,
    walkthrough: [
      { src: search, caption: 'User-Based is the catalog list. AI Suggested Products is the other mode in the same panel, used when you know an API name.' }
    ]
  },
  'did-you-mean': { image: search },
  'search-returns-nothing': {
    image: search,
    walkthrough: [
      { src: search, caption: 'A match looks like this. If the panel says no products were found, try a shorter business name or the other search mode.' },
      { src: domains, caption: 'You can also leave search and open a domain card.' },
      { src: dar, caption: 'If it is still not listed, describe it on Data Access Request.' }
    ]
  },
  'browse-by-domain': {
    image: domains,
    walkthrough: [
      { src: domains, caption: 'Each homepage card is a data domain. View All opens the products in that domain.' },
      { src: catalog, caption: 'The catalog list is what opens. Filters on the left narrow that list.' }
    ]
  },
  'catalog-filters': {
    image: catalog,
    walkthrough: [
      { src: catalog, caption: 'Filters list each domain with a count. Check a domain to limit the grid. Sort and Show sit above the products.' }
    ]
  },
  'read-a-product-page': {
    image: product,
    walkthrough: [
      { src: search, caption: 'Open the product from View Details.' },
      { src: product, caption: 'Confirm the datatype, classification, description, and contacts. Description and Reviews are the tabs. Request Access is the button when this is the product you need.' }
    ]
  },
  'related-products': { image: product },
  'compare-products': {
    image: compare,
    walkthrough: [
      { src: search, caption: 'Add a product with the compare icon on a search result, or from the product page. The header icon shows how many are selected.' },
      { src: compare, caption: 'Compare holds up to five products. An empty list tells you to browse products. Differences are highlighted once more than one product is selected.' }
    ]
  },
  'favorites': {
    image: favorites,
    walkthrough: [
      { src: search, caption: 'Save a product with the heart on the search result or on the product page.' },
      { src: favorites, caption: 'The header heart opens this list. Open the product from here when you are ready to request it.' }
    ]
  },
  'where-ai-is-used': {
    image: search,
    walkthrough: [
      { src: search, caption: 'Header search has User-Based catalog results and AI Suggested Products for API names.' },
      { src: dar, caption: 'Data Access Request has its own suggestions after you choose a platform, a domain, and the database or API name.' },
      { src: vikki, caption: 'Ask VIKKI is the chat. It explains the marketplace and does not file the request.' }
    ]
  },
  'header-ai-api-names': {
    image: search,
    walkthrough: [
      { src: search, caption: 'Type the API name, then choose AI Suggested Products. User-Based stays available if you want the catalog list instead.' }
    ]
  },
  'dataset-suggestions': {
    image: dar,
    walkthrough: [
      { src: dar, caption: 'For a TBDP dataset suggestion, set the platform, domain, environment, database, and tables on this form before you describe the request.' }
    ]
  },
  'api-suggestions-on-the-form': {
    image: dar,
    walkthrough: [
      { src: dar, caption: 'Choose API (EIG Application Support) and a data domain, enter at least two characters of the API name, then click outside that field.' },
      { src: search, caption: 'Header AI Suggested Products is a separate API-name search. It does not use the domain you selected on the form.' }
    ]
  },
  'more-tables-and-fields': { image: dar },
  'after-checkout': {
    image: cart,
    walkthrough: [
      { src: cart, caption: 'The cart shows the request. Proceed when checkout is available. If it is not, the cart says what is still missing.' },
      { src: track, caption: 'After checkout, look the request up here with the request number or the RITM number.' }
    ]
  },
  'report-a-problem': { image: compare },
  'longer-guides': { image: domains },
  'product-tabs': {
    image: product,
    walkthrough: [
      { src: product, caption: 'Open the product, then use the tabs under the summary. Description is always there. Resources and Tables & Columns appear only for the datatypes that have them.' }
    ]
  },
  'resource-link': { image: product },
  'tables-and-columns': { image: product },
  'steward-and-contact': { image: product },
  'product-classification': { image: product },
  'ad-group': { image: compare },
  'product-reviews': { image: product },
  'sort-and-show': {
    image: catalog,
    walkthrough: [
      { src: catalog, caption: 'Sort By and Show sit above the product grid, next to the result count. Filters stay on the left.' }
    ]
  },
  'domain-subdomains': {
    image: domains,
    walkthrough: [
      { src: domains, caption: 'View All on a homepage domain opens the next cards when that domain has subdomains.' },
      { src: catalog, caption: 'A domain with products and no further cards opens this catalog list.' }
    ]
  },
  'clear-a-filter': { image: catalog },
  'checkout-unavailable': { image: cart },
  'checkout-several-products': { image: cart },
  'remove-a-product': {
    image: cart,
    walkthrough: [
      { src: cart, caption: 'Remove drops one cart line. Clear Cart empties the cart.' },
      { src: favorites, caption: 'Favorites has Remove on a product and Clear Favorites for the whole list.' },
      { src: compare, caption: 'Compare has Remove on a product and Clear Compare for the whole list.' }
    ]
  },
  'order-history': { image: track },
  'account-menu': { image: domains },
  'sign-out': { image: domains },
  'database-and-table-lists': { image: dar },
  'dataset-suggestions-did-not-run': { image: dar },
  'choose-an-environment': { image: dar },
  'data-domain-help-document': {
    image: dar,
    walkthrough: [
      { src: domains, caption: 'Homepage domains are the same business areas the form asks you to choose.' },
      { src: dar, caption: 'On the form, open the Data Domain Help Document before you pick a domain.' }
    ]
  },
  'add-new-product-versus-request-access': {
    image: product,
    walkthrough: [
      { src: product, caption: 'Request Access is on a product that is already in the catalog.' },
      { src: dar, caption: 'Data Access Request is the form when the catalog does not list the data. Add New Product, in the header, is the path for listing a new catalog product.' }
    ]
  },
  'product-intake': { image: domains },
  'campaigns': { image: domains },
  'newsroom': { image: domains }
};

export function presentArticle(article: KbArticle): KbArticle {
  const media = KB_MEDIA[article.id];
  if (!media) {
    return article;
  }
  return {
    ...article,
    image: media.image,
    walkthrough: media.walkthrough
  };
}

export function presentArticleById(id: string): KbArticle | undefined {
  const article = KB_ARTICLES.find(item => item.id === id);
  return article ? presentArticle(article) : undefined;
}

export function relatedArticles(article: KbArticle): KbArticle[] {
  return KB_ARTICLES
    .filter(item => item.category === article.category && item.id !== article.id)
    .slice(0, 3)
    .map(presentArticle);
}

export function categoryLabel(id: string): string {
  const match = KB_CATEGORIES.find(category => category.id === id);
  return match ? match.label : id;
}
