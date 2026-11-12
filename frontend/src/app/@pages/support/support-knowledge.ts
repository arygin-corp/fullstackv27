export interface KbLink {
  label: string;
  path: string;
}

export interface KbBlock {
  heading?: string;
  paragraphs?: string[];
  steps?: string[];
  links?: KbLink[];
}

export interface KbArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  blocks: KbBlock[];
  image?: string;
  walkthrough?: { src: string; caption: string }[];
}

export interface KbCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const KB_CATEGORIES: KbCategory[] = [
  { id: 'all', label: 'All topics', description: 'Every guide in the knowledge base.', icon: 'ri-layout-grid-line' },
  { id: 'start', label: 'Getting started', description: 'What the marketplace is and how to sign in.', icon: 'ri-compass-3-line' },
  { id: 'search', label: 'Search', description: 'How to search, and what to do when nothing matches.', icon: 'ri-search-line' },
  { id: 'ai', label: 'How AI is used', description: 'Header suggestions, request suggestions, and Ask VIKKI.', icon: 'ri-magic-line' },
  { id: 'find', label: 'Find a product', description: 'Domains, filters, the product page, favorites, and compare.', icon: 'ri-archive-line' },
  { id: 'request', label: 'Request access', description: 'Product requests, the cart, checkout, and a missing product.', icon: 'ri-key-2-line' },
  { id: 'dar', label: 'Data Access Request', description: 'The form you use when the catalog does not list the data.', icon: 'ri-file-list-3-line' },
  { id: 'privacy', label: 'Privacy and terms', description: 'Personal information and how the data may be used.', icon: 'ri-lock-2-line' },
  { id: 'account', label: 'Account and help', description: 'Tracking, your account, news, and where to ask.', icon: 'ri-user-3-line' }
];

export const KB_ARTICLES: KbArticle[] = [
  {
    id: 'what-is-the-marketplace',
    category: 'start',
    title: 'What the Data Marketplace is',
    summary: 'Where Toyota Motor North America users find data products and ask for access.',
    blocks: [
      {
        paragraphs: [
          'The Global Data Marketplace is the self-service place to discover data products and request access to them. Products in the catalog include dashboards, datasets, data science models, and APIs.',
          'The application is GDX Data Marketplace. The Data Marketplace Team owns it for Toyota Motor North America.'
        ]
      },
      {
        heading: 'Two ways to ask for data',
        paragraphs: [
          'If the data is already a product, search the catalog and use Request Access on that product. If search does not list it, use Data Access Request and describe the platform, domain, and the job the data supports.',
          'Add New Product, in the header, is the path when you want a product listed in the catalog. It is not a substitute for requesting access to data you already found.'
        ],
        links: [
          { label: 'Open the catalog', path: '/' },
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'who-can-use-it',
    category: 'start',
    title: 'Who can use the Data Marketplace',
    summary: 'Sign in with your Toyota Microsoft account. The request form also covers affiliates and external users.',
    blocks: [
      {
        paragraphs: [
          'Sign in with your Toyota Microsoft account. After you are signed in, the person icon in the header opens your account menu.',
          'Team members, business partners, service accounts, and contingent workers request access as TMNA users. Data Access Request also has a user type for TMNA affiliates, including Toyota Connected, Toyota Canada, and Toyota Financial Services, and a user type for external users such as vendors.'
        ]
      },
      {
        heading: 'What the account menu shows',
        steps: [
          'A status control above My Profile sets Online, Away, Busy, Unavailable, or Offline. The same color shows as a dot on the profile photo.',
          'My Profile opens the profile for the signed-in account.',
          'My Dashboard opens the account home.',
          'Order History lists requests tied to your account after checkout.',
          'Log Out ends the Microsoft session. Under it, the menu shows when this sign-in started.'
        ],
        paragraphs: [
          'Favorites, Compare, and the cart stay on their own icons in the header. A marketplace password is not part of this menu. Sign-in is your Toyota Microsoft account.'
        ]
      }
    ]
  },
  {
    id: 'change-language',
    category: 'start',
    title: 'Change the language',
    summary: 'The header language control includes English, Spanish, French, and Japanese.',
    blocks: [
      {
        paragraphs: [
          'The language control sits in the header. English is the default. You can switch to Spanish, French, or Japanese while you browse the catalog or fill out a form.',
          'Product names and request fields stay in the language they were written. The language control changes the marketplace chrome around them.'
        ]
      }
    ]
  },
  {
    id: 'search-the-catalog',
    category: 'find',
    title: 'Search for a data product',
    summary: 'Use the search box in the header before you start a Data Access Request.',
    blocks: [
      {
        paragraphs: [
          'The search box in the header searches the data products in the catalog. Open a result and read the description, data domain, platform, and the contacts on the product page before you request it.',
          'Search first. Data Access Request is for data that is not already listed as a product.'
        ],
        steps: [
          'Type the product, report, or subject in the header search.',
          'Open a result.',
          'Confirm the datatype, classification, domain, and data steward.',
          'Use Request Access on that product when it is the one your work needs.'
        ],
        links: [{ label: 'Go to the catalog', path: '/' }]
      }
    ]
  },
  {
    id: 'favorites-compare-cart',
    category: 'find',
    title: 'Favorites, Compare, and the cart',
    summary: 'The heart, scale, and cart icons in the header keep products you are reviewing.',
    blocks: [
      {
        paragraphs: [
          'The heart saves a product to Favorites. The scale icon adds a product to Compare so you can review more than one product side by side. The cart holds products you are ready to request.',
          'Open each list from its icon in the header. Those lists are separate from the account menu.'
        ]
      },
      {
        heading: 'When the cart will not check out',
        paragraphs: [
          'The cart shows “Checkout is not available yet” and the reason when something required is still missing. Finish the request details on the product, then return to the cart and use Proceed to checkout when checkout is available.'
        ]
      }
    ]
  },
  {
    id: 'request-access-on-a-product',
    category: 'request',
    title: 'Request access to a product you found',
    summary: 'Request Access on the product page is the shortest path when the catalog already lists the data.',
    blocks: [
      {
        steps: [
          'Open the product from search or from a domain.',
          'Choose Request Access.',
          'Say whether the access is for you or for someone else. For someone else, search for that person.',
          'Answer the environment, how the data will be used, and the personal-information questions.',
          'Add the request to the cart and proceed to checkout when the cart says checkout is available.'
        ]
      },
      {
        heading: 'If the product already contains personal information',
        paragraphs: [
          'When the catalog has already marked the product as containing personal information, sensitive personal information, or both, Request Access shows that statement and hides the two questions. You still complete the follow-up questions when the product contains that data.'
        ]
      }
    ]
  },
  {
    id: 'product-not-in-the-catalog',
    category: 'request',
    title: 'The product is not in the catalog',
    summary: 'Search first. If it is still missing, use Data Access Request or ask for the product to be listed.',
    blocks: [
      {
        paragraphs: [
          'A missing search result does not mean the data is unavailable. It means it is not listed as a product yet, or the name you typed does not match the catalog name.'
        ],
        steps: [
          'Try the header search with the business name, not only an internal code.',
          'If you still cannot find it, open Data Access Request and describe the platform, domain, and intended use.',
          'If you want the data listed as a catalog product, use Add New Product in the header.'
        ],
        links: [
          { label: 'Start a Data Access Request', path: '/form/data-access-request' },
          { label: 'View product requests', path: '/pages/product-intake' }
        ]
      }
    ]
  },
  {
    id: 'add-new-product',
    category: 'request',
    title: 'Add a product to the catalog',
    summary: 'Add New Product asks whether you are requesting a new catalog product, then collects the listing details.',
    blocks: [
      {
        paragraphs: [
          'Add New Product is the button in the header. The first question asks whether you are requesting a new catalog product. If you are not, the form points you back to search or to Data Access Request.'
        ]
      },
      {
        heading: 'What a new product needs',
        paragraphs: [
          'If you are adding a product, the form asks for the product name, data domain, product type, tags, description, whether it contains sensitive personal information, a stakeholder, and the fulfillment group that would provision access.',
          'Dashboard and API products also ask for a URL. Submit Product stays disabled until the required fields are valid. If you do not know the team that would provision access, the form tells you to enter that you do not know.'
        ]
      }
    ]
  },
  {
    id: 'start-a-data-access-request',
    category: 'dar',
    title: 'Start a Data Access Request',
    summary: 'Use this form when you need access and the catalog does not list the data.',
    blocks: [
      {
        paragraphs: [
          'Open Data Access Request from the footer, or from Need Help when an article links you there. The page title stays in place. The form column scrolls, and the Required Information list shows which answers are still missing.'
        ],
        steps: [
          'Choose who the access is for: For me, or For someone else.',
          'Choose the platform and the data domain.',
          'Choose the user type, whether a person or an application needs the data, and the environment.',
          'Describe the data and the job it supports.',
          'Answer the personal-information questions and accept the Terms of Use.'
        ],
        links: [{ label: 'Open Data Access Request', path: '/form/data-access-request' }]
      }
    ]
  },
  {
    id: 'choose-a-platform',
    category: 'dar',
    title: 'Choose a platform',
    summary: 'The platform tells reviewers where the data lives and which extra fields the form should show.',
    blocks: [
      {
        paragraphs: [
          'The platform list includes API (EIG Application Support), Data Warehouse/Mart, Gateway access for tools such as Power BI, Tableau, and Alteryx, Mainframe, MySQL, Oracle, PostgreSQL, SQL, TBDP, cloud, and Other.',
          'Choosing API shows a place to enter the API name and a link to the Toyota API Catalog. Choosing TBDP (IRM, PASA, C360, Q360, IRM-Pricing, and related platforms) turns Database/Schema into a list of catalog databases. After you pick a database, Table Name(s) lists the tables that belong to that database.'
        ]
      },
      {
        heading: 'API name suggestions',
        paragraphs: [
          'API suggestions are separate from dataset suggestions. They run only when the platform is API (EIG Application Support), a data domain is selected, and the API name has at least two characters. You can type the name first and select the platform or domain afterward. Leaving the API name field, or making the last of those selections, is what starts the search.',
          'The suggestions put products that match both the selected platform and the selected domain first. A match on only the platform or only the domain comes next. Products that match neither come last. The reason text on an API suggestion talks about the API name, platform, and domain. It does not use the dataset wording about tables and columns.'
        ]
      },
      {
        heading: 'Dataset suggestions on TBDP',
        paragraphs: [
          'Dataset suggestions use the platform, domain, database, tables, description, and justification. They are the path that talks about the selected database and the tables and columns on that dataset. Open “more tables” or “more fields” in that reason to see the full list.'
        ]
      }
    ]
  },
  {
    id: 'choose-a-data-domain',
    category: 'dar',
    title: 'Choose a data domain',
    summary: 'A data domain is the business area the data belongs to.',
    blocks: [
      {
        paragraphs: [
          'Domains include areas such as Customer, Manufacturing, Vehicle, Parts, Finance, and Service History. The homepage groups products by domain. The Data Access Request form asks you to pick the domain that fits the data.',
          'Use the Data Domain Help Document on the form, or Data Domains in the footer, before you pick one. The domain you select also affects which API suggestions are listed first.'
        ],
        links: [
          { label: 'Browse domains', path: '/' },
          { label: 'FAQ', path: '/site/faq' }
        ]
      }
    ]
  },
  {
    id: 'request-for-someone-else',
    category: 'dar',
    title: 'Request access for someone else',
    summary: 'You can name another person on Data Access Request or on a product Request Access form.',
    blocks: [
      {
        paragraphs: [
          'On Data Access Request, set “Who are you requesting data access for?” to “For someone else,” then search for that person. On a product Request Access form, choose “For Someone Else” and search for the user who needs access.',
          'That choice is separate from user type. You still say whether the account is a TMNA user, an affiliate, or an external user, and whether a person or an application will use the data.'
        ]
      }
    ]
  },
  {
    id: 'user-or-application-access',
    category: 'dar',
    title: 'User access and application access',
    summary: 'Say whether a person opens the data or a system uses it.',
    blocks: [
      {
        paragraphs: [
          'User access means a person opens the data directly. Application access means a program or system uses the data, and a person is not the actor.',
          'The Required Information list keeps User/App Access open until you answer that question.'
        ]
      }
    ]
  },
  {
    id: 'description-and-checklist',
    category: 'dar',
    title: 'Description, intended use, and the checklist',
    summary: 'Reviewers use your description. The checklist shows what is still missing.',
    blocks: [
      {
        paragraphs: [
          'Describe the data you need and the job you will use it for. Reviewers use those answers to decide whether the access matches your work.',
          'The Required Information list on the left matches a product request. Items such as User/App Access, PII Access, PII Explanation, and Terms of Use change when that answer is complete. Use the list before you submit.'
        ]
      },
      {
        heading: 'Environment',
        paragraphs: [
          'Environment is QA, Development, Production, or All. Dataset suggestions on TBDP look at Production or All together with the platform, domain, database, and tables.'
        ]
      }
    ]
  },
  {
    id: 'personal-information',
    category: 'privacy',
    title: 'Personal information and sensitive personal information',
    summary: 'The form asks these as two questions because a product can contain one, the other, or both.',
    blocks: [
      {
        paragraphs: [
          'Personal Information (PI) is data about a person. Sensitive Personal Information is a narrower set of that data and needs tighter handling.',
          'On Data Access Request, read the P02 Information Classification and Handling Policy card above the questions, then answer both. If either answer is Yes, the form asks what the personal data is, the type of work, and whether the data will be shared with a third-party vendor. The checklist adds PII Access and PII Explanation when those answers are required.'
        ]
      },
      {
        heading: 'On a product that is already classified',
        paragraphs: [
          'Request Access hides the two questions when the product record is already marked as containing personal information, sensitive personal information, or both. A card states which kind of data the product contains. Follow-up questions still appear when that card says the product contains personal data.',
          'Do not guess. If you are not sure the data is sensitive, read the P02 link before you choose Yes or No.'
        ]
      }
    ]
  },
  {
    id: 'terms-of-use',
    category: 'privacy',
    title: 'Read the Terms of Use before you submit',
    summary: 'The acknowledgment covers how Toyota data can be used after access is approved.',
    blocks: [
      {
        paragraphs: [
          'Data Access Request ends with a Terms of Use card and a required checkbox. Check the box only after you have read the statement. The checklist keeps Terms of Use open until the box is selected.'
        ],
        steps: [
          'Use the data only to perform your job duties.',
          'Do not disclose it unless that disclosure is approved in advance.',
          'Do not share your access credentials.',
          'Do not use the data in a way that could harm Toyota Motor North America systems.',
          'A different use of the same data needs its own approval.',
          'Follow Toyota Motor North America and Data Enablement policies. The card links to dataenablement.toyota.com.'
        ]
      },
      {
        paragraphs: [
          'The footer also links to the full Terms of Use page and the Disclaimer. Terms of Use is about how you will handle the access after it is approved. The P02 card, higher on the same form, is the classification rule to read before the personal-information questions.'
        ]
      }
    ]
  },
  {
    id: 'track-a-request',
    category: 'account',
    title: 'Track a request',
    summary: 'Track Request uses a request number or an RITM number. Order History lists requests on your account.',
    blocks: [
      {
        paragraphs: [
          'Open Track Request in the header. Enter the request number or the RITM number. The email field uses the email on your signed-in account, so you do not type it again.',
          'Order History in the account menu is the list of requests tied to your account after checkout. Use Track Request when you have a number. Use Order History when you want the requests on this account.'
        ],
        links: [{ label: 'Track Request', path: '/marketplace/order/track-request' }]
      }
    ]
  },
  {
    id: 'ask-vikki',
    category: 'account',
    title: 'Ask VIKKI',
    summary: 'The round chat button answers questions about the marketplace without leaving the page.',
    blocks: [
      {
        paragraphs: [
          'Ask VIKKI is the chat button on marketplace pages. Open it while you are searching, comparing products, or filling out a request and you want a short answer.'
        ],
        steps: [
          'Which path to use: catalog Request Access, Data Access Request, or Add New Product.',
          'What a field means, such as data domain, fulfillment group, user access, or application access.',
          'Where to find the Data Domain Help Document, the P02 policy, Terms of Use, or Track Request.',
          'What to do when a product is not in search.'
        ]
      },
      {
        heading: 'What VIKKI does not do',
        paragraphs: [
          'The chat does not submit a request for you. Access is still requested from the product page or from Data Access Request. VIKKI also does not replace the Required Information checklist. That list is the record of which answers are still missing.',
          'If the chat cannot answer, use Need Help or Contact Us in the header. Report An Issue in the footer opens the ServiceNow form for a problem with the marketplace itself.'
        ]
      }
    ]
  },
  {
    id: 'where-to-get-help',
    category: 'account',
    title: 'Where to get help or read news',
    summary: 'Need Help, the footer documentation, Newsroom, and the roadmap.',
    blocks: [
      {
        paragraphs: [
          'Need Help in the header opens this knowledge base. FAQ is a shorter question list. Contact Us is also in the header.',
          'The footer includes the Resource Library, Changelog, FAQ, and Report An Issue. Documentation in the footer includes Data Domains, the Data Access Guide, the Data Access Process Flow, and the Product Sourcing Flow. API developers can open the EIG API Developer FAQ from the same list.'
        ],
        links: [
          { label: 'FAQ', path: '/site/faq' },
          { label: 'Newsroom', path: '/newsroom' },
          { label: 'Changelog', path: '/site/changelog' },
          { label: 'Roadmap', path: '/pages/roadmap' }
        ]
      },
      {
        heading: 'News and the team',
        paragraphs: [
          'Newsroom and Changelog are in the header. The footer also links to the team page, the organization chart, the product roadmap, and the Global Hackathon page.'
        ],
        links: [
          { label: 'Team', path: '/pages/team' },
          { label: 'Organization chart', path: '/pages/organization-chart' }
        ]
      }
    ]
  },
  {
    id: 'how-to-search',
    category: 'search',
    title: 'How do I search for a product?',
    summary: 'Use the header search. Two characters is enough to start, and the list updates as you type.',
    blocks: [
      {
        paragraphs: [
          'The search box in the header says “Search over 500 Data Products.” Click it and type the product name, a business subject, or part of an API name. Results start after two characters. Fewer than two characters clears the list.',
          'Stay on User-Based for catalog products. Each row shows the image, name, SKU, datatype, data steward, point of contact, and a short description. The words you typed are highlighted in the name.'
        ],
        steps: [
          'Click the header search and type at least two characters.',
          'Read the datatype, steward, and description before you open a row.',
          'Choose View Details to open the product.',
          'Use the heart to save it, or the compare icon to hold it for a side-by-side review.',
          'If several pages of results appear, use the page numbers under the list.'
        ],
        links: [{ label: 'Open the catalog', path: '/' }]
      },
      {
        heading: 'How you should search',
        paragraphs: [
          'If you are asking how you should search, start with the name a business user would recognize, then try a shorter piece of that name if the first try is empty. SKU and steward are on the result, so you can confirm you have the right product before you request it.',
          'Search the catalog before you open Data Access Request. That form is for data that is not already a product.'
        ]
      }
    ]
  },
  {
    id: 'user-based-versus-ai-search',
    category: 'search',
    title: 'What is the difference between User-Based and AI Suggested Products?',
    summary: 'User-Based is the catalog. AI Suggested Products looks for API names.',
    blocks: [
      {
        paragraphs: [
          'The search panel has two modes. User-Based is the default. It lists catalog products that match what you typed and gives you View Details, Favorites, and Compare on each row.',
          'AI Suggested Products opens a separate list titled API names. It is for finding a webservice by the API name, including an original API name when the catalog name is different. Each row shows which part of the name matched. Opening a row goes to that product.'
        ]
      },
      {
        heading: 'Which one to use',
        paragraphs: [
          'Use User-Based when you are looking for a dashboard, dataset, data science model, or any product by its catalog name. Use AI Suggested Products when you know an API name and want the webservice products that match it.',
          'The two modes do not replace Data Access Request suggestions. Those run on the request form after you choose a platform and a domain.'
        ]
      }
    ]
  },
  {
    id: 'did-you-mean',
    category: 'search',
    title: 'What does “Did you mean” mean?',
    summary: 'Search can offer a closer spelling. Click it to run that wording.',
    blocks: [
      {
        paragraphs: [
          'If the words you typed are close to a known product or API name, the search panel can show “Did you mean” and a suggested phrase. Click that phrase. The search box uses it and the results refresh.',
          'This is a spelling aid. It does not request access, and it does not mean the suggested name is the only product that can answer your question. Open the product and read the description before you decide.'
        ]
      }
    ]
  },
  {
    id: 'search-returns-nothing',
    category: 'search',
    title: 'What if search says no products were found?',
    summary: 'Try a shorter name, switch modes, browse a domain, then use Data Access Request if it is still missing.',
    blocks: [
      {
        steps: [
          'Check the spelling and try the business name instead of an internal code.',
          'Stay at two characters or more. A one-character search does not return products.',
          'Switch to AI Suggested Products if you were looking for an API name, or back to User-Based if you were looking for a dashboard or dataset.',
          'Leave search and open a domain card on the homepage, then use the catalog filters.',
          'If the data is still not listed, start a Data Access Request. Use Add New Product only when you want a product added to the catalog.'
        ],
        links: [
          { label: 'Browse domains', path: '/' },
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'browse-by-domain',
    category: 'find',
    title: 'How do I browse by data domain?',
    summary: 'The homepage is a set of domain cards. View All opens the products in that domain.',
    blocks: [
      {
        paragraphs: [
          'The marketplace home lists data domains such as Vehicle, Parts, Customer, Manufacturing, Finance, and the other business areas in the catalog. Each card has a short description and View All.',
          'View All opens the product list for that domain. The same domain list is what Data Access Request asks you to choose, and it is what API suggestions use when they rank a match.'
        ],
        links: [{ label: 'Open domains', path: '/' }]
      }
    ]
  },
  {
    id: 'catalog-filters',
    category: 'find',
    title: 'How do catalog filters work?',
    summary: 'On a product list, Filters narrows the domain and the checkbox groups. Each choice shows how many products it covers.',
    blocks: [
      {
        paragraphs: [
          'Open a domain, or a product list, and use Filters in the sidebar. On a smaller screen the same filters open from the filter control. Each group can be collapsed.',
          'The domain group lists domains and a count. Checkbox groups list values with a count beside each one. A choice that cannot apply to the current list is shown disabled. All Products returns you to the full catalog from inside a domain.'
        ]
      },
      {
        heading: 'Filters are not the header search',
        paragraphs: [
          'Header search looks across products by the words you type. Filters limit the list you are already in. Use search to find a name. Use filters when you already know the domain and want to narrow the type or another catalog attribute.'
        ]
      }
    ]
  },
  {
    id: 'read-a-product-page',
    category: 'find',
    title: 'How do I read a product page before I request it?',
    summary: 'The page is the place to confirm the domain, classification, steward, and what the product contains.',
    blocks: [
      {
        paragraphs: [
          'Open a product from search, a domain, Favorites, or Compare. The top of the page is where you save it, compare it, or choose Request Access. The tabs under that are the detail.'
        ],
        steps: [
          'Description is the product summary.',
          'What’s Included and Intended Use appear when the catalog has that text.',
          'Tables & Columns appears for a dataset and shows the database schema and columns.',
          'Resources appears for a dataset or a webservice when the catalog has a resource link. That link is the catalog resource, such as Collibra for a dataset.',
          'Reviews is the review tab on the product.',
          'Related, similar, and associated products can be selected and added with the product when those lists are on the page.'
        ]
      },
      {
        paragraphs: [
          'Request Access is on this page when the product is the one you need. Do not start a Data Access Request for a product you have already opened.'
        ]
      }
    ]
  },
  {
    id: 'related-products',
    category: 'find',
    title: 'What are related, similar, and associated products?',
    summary: 'A product page can list other catalog products that belong with it. You choose which ones to include.',
    blocks: [
      {
        paragraphs: [
          'Some product pages list related products, similar products, and associated products. These are other catalog records, not a new search.',
          'Select All Related, Select All Similar, and Select All apply to those lists when they have products you can still select. You can also select them individually. They stay optional. Request Access on the main product does not require them.'
        ]
      }
    ]
  },
  {
    id: 'compare-products',
    category: 'find',
    title: 'How many products can I compare?',
    summary: 'Compare holds up to five products. Values that differ are highlighted.',
    blocks: [
      {
        paragraphs: [
          'The scale icon in the header opens Compare. You can add a product from search or from the product page. The page holds up to five products. With one product it tells you that you can add up to four more.',
          'The table shows SKU, domain, data type, classification, platform, AD group, personal information, sensitive personal information, availability, data steward, and contact. Rows whose values differ are highlighted. Clear Compare removes the whole set. Remove drops one product. Request access on a column opens that product.'
        ],
        links: [{ label: 'Open Compare', path: '/marketplace/user/compare' }]
      }
    ]
  },
  {
    id: 'favorites',
    category: 'find',
    title: 'How do I save a product and find it later?',
    summary: 'The heart saves a product to Favorites. The list is separate from the cart.',
    blocks: [
      {
        paragraphs: [
          'Use the heart in header search or on the product page. The heart icon in the header shows how many products you have saved and opens Favorites.',
          'A saved product keeps its classification and data steward on that list. Favorites does not submit a request. When you are ready, open the product and choose Request Access, then add it to the cart.'
        ],
        links: [{ label: 'Open Favorites', path: '/marketplace/user/favorites' }]
      }
    ]
  },
  {
    id: 'where-ai-is-used',
    category: 'ai',
    title: 'Where does the marketplace use AI?',
    summary: 'AI suggestions show up in three places, and each one answers a different question.',
    blocks: [
      {
        paragraphs: [
          'AI does not replace search, and it does not submit a request. It suggests products or explains a suggestion. You still choose the product and complete the form.'
        ],
        steps: [
          'Header search, AI Suggested Products: finds webservice products by API name.',
          'Data Access Request, dataset suggestions: recommends a dataset after you choose TBDP, a domain, a database, and tables, and you describe the request.',
          'Data Access Request, API suggestions: recommends products after the platform is API (EIG Application Support), a domain is selected, and the API name has at least two characters.',
          'Ask VIKKI: the round chat button answers questions about how the marketplace works while you stay on the page.'
        ]
      },
      {
        heading: 'What AI will not do',
        paragraphs: [
          'It will not check the Terms of Use box, choose a domain for you, or provision access. A suggestion is a starting point. Read the product, or the reason text, before you request it.'
        ]
      }
    ]
  },
  {
    id: 'header-ai-api-names',
    category: 'ai',
    title: 'How do I use AI Suggested Products in the header?',
    summary: 'Switch the search mode when you know an API name and want the matching webservice products.',
    blocks: [
      {
        steps: [
          'Click the header search and type at least two characters of the API name.',
          'Choose AI Suggested Products. User-Based stays available if you want the catalog list instead.',
          'Wait for “Looking for API names...” to finish.',
          'Open a row to go to that product. If the catalog name differs from the original API name, the row shows both.',
          'If nothing matches, the panel says no API names match that search. Try User-Based, or a shorter piece of the name.'
        ]
      },
      {
        paragraphs: [
          'This header search is not the same as the API suggestions inside Data Access Request. The form suggestions also use the platform and the domain you selected, and they explain why a product was listed first.'
        ]
      }
    ]
  },
  {
    id: 'dataset-suggestions',
    category: 'ai',
    title: 'How do dataset suggestions work?',
    summary: 'On a TBDP request, suggestions use the database, tables, description, and justification.',
    blocks: [
      {
        paragraphs: [
          'Dataset suggestions run from Data Access Request when the platform is TBDP (IRM, PASA, C360, Q360, IRM-Pricing, and related platforms) and the environment is Production or All. The form also needs a domain, a database, and at least one table.',
          'Choosing TBDP turns Database/Schema into the catalog database list. After you pick a database, Table Name(s) lists only the tables for that database. Put the real database and tables in those fields. A description and justification of at least ten characters each is what moves the suggestion from a standard match to a verified-style match.'
        ]
      },
      {
        heading: 'What the reason is telling you',
        paragraphs: [
          'A direct dataset reason names the database, up to three selected tables, and up to three columns, then says how many more tables or fields were not shown. A suggestion without a confirmed metadata match says no confirmed metadata match was found and that the product was returned as a semantic suggestion.',
          'API suggestions never use that dataset sentence. If you asked for an API, read the API reason instead.'
        ]
      }
    ]
  },
  {
    id: 'api-suggestions-on-the-form',
    category: 'ai',
    title: 'How do API suggestions work on the request form?',
    summary: 'They wait until the platform is API, a domain is selected, and you leave the API name field.',
    blocks: [
      {
        paragraphs: [
          'Typing in the API name field does not call the suggestion engine on every keystroke. The search runs when you click outside the API name field, or when you finish the other required selections after you have already typed the name.',
          'All three have to be true: the platform is exactly API (EIG Application Support), a data domain is selected, and the API name has at least two characters. You can type the name first and select the platform or domain afterward. The last of those actions still starts the search.'
        ]
      },
      {
        heading: 'How the list is ordered',
        paragraphs: [
          'Products that match both the selected platform and the selected domain are listed first. A match on only the platform, or only the domain, comes next. Products that match neither come last. Within a group, the closer API name is higher.',
          'The reason talks about the API name, the selected platform, and the selected domain. It does not talk about database tables and columns. Open the product from the suggestion if you want to request that API.'
        ]
      }
    ]
  },
  {
    id: 'more-tables-and-fields',
    category: 'ai',
    title: 'How do I see every table and field in a suggestion?',
    summary: 'The blue “more tables” and “more fields” links open the catalog list for that suggestion.',
    blocks: [
      {
        paragraphs: [
          'A dataset suggestion shows only the first few table names and field names in the reason, then a link such as “+178 more fields.” That link is underlined because it opens the full list. “+2 more tables” does the same for tables.',
          'The list has Tables and Fields, a search box, and the tables you already selected marked on the Tables tab. Close it when you are done. Opening the list does not change the request form.'
        ]
      }
    ]
  },
  {
    id: 'after-checkout',
    category: 'request',
    title: 'What happens after I check out?',
    summary: 'A successful checkout confirms the request. Track Request and Order History are where you return to it.',
    blocks: [
      {
        paragraphs: [
          'From the cart, Proceed to checkout is available only when the required product details are complete. If the cart says checkout is not available yet, it also says what is missing. Finish that on the product, then come back.',
          'After a successful checkout, the confirmation page shows the products you submitted, including classification. Order History in the account menu lists requests tied to your account. Track Request in the header is the lookup that uses a request number or an RITM number. The email on that lookup is the signed-in account email.'
        ],
        links: [
          { label: 'Track Request', path: '/marketplace/order/track-request' },
          { label: 'Order History', path: '/marketplace/user/orders' }
        ]
      }
    ]
  },
  {
    id: 'report-a-problem',
    category: 'account',
    title: 'How do I report a problem with the marketplace?',
    summary: 'Use Report An Issue for a marketplace problem. Use Contact Us when you need a person.',
    blocks: [
      {
        paragraphs: [
          'Report An Issue is in the footer. It opens the ServiceNow request form for a problem with the marketplace itself, such as a page that will not load or a control that does not behave as this guide describes.',
          'Contact Us is the contact page. Need Help opens this knowledge base. Ask VIKKI can explain a field while you are on a page, and it does not file the ServiceNow issue for you.',
          'A rejected or pending access request is not the same as a broken page. Use Track Request or Order History for the status of a request you already submitted.'
        ],
        links: [
          { label: 'Contact Us', path: '/site/contact-us' },
          { label: 'FAQ', path: '/site/faq' }
        ]
      }
    ]
  },
  {
    id: 'longer-guides',
    category: 'account',
    title: 'Where are the longer guides and What’s New?',
    summary: 'The footer documentation, the Resource Library, Newsroom, Changelog, and What’s New sit beside this knowledge base.',
    blocks: [
      {
        paragraphs: [
          'This knowledge base answers the questions you hit while using the site. The longer references live in Documentation and the Resource Library.'
        ],
        steps: [
          'Data Domains, the Data Access Guide, the Data Access Process Flow, and the Product Sourcing Flow are in the footer Documentation list.',
          'The Resource Library holds brands, documents, policies, processes, and media.',
          'What’s New in the header is the feature walkthrough.',
          'Newsroom and Changelog record product updates. The roadmap, team page, organization chart, and Global Hackathon page are linked from the header and footer.',
          'API developers can open the EIG API Developer FAQ from the footer. Metadata Management opens Collibra. Data Enablement policies are on dataenablement.toyota.com.'
        ],
        links: [
          { label: 'Resource Library', path: '/resources' },
          { label: 'What’s New', path: '/pages/whats-new' },
          { label: 'Newsroom', path: '/newsroom' },
          { label: 'Data Access Guide', path: '/docs/protected/access-guide' }
        ]
      }
    ]
  },
  {
    id: 'product-tabs',
    category: 'find',
    title: 'What do the product tabs mean?',
    summary: 'The tabs under a product separate the description, the catalog resource, the dataset schema, and reviews.',
    blocks: [
      {
        paragraphs: [
          'Open a product with View Details. Under the summary, the tabs change what you read before you choose Request Access. Description is always there. The other tabs appear only when that product has something to show.'
        ],
        steps: [
          'Description shows the brief description.',
          'Resources appears only when the datatype is Datasets or Webservices (APIs). It names the catalog and, when a URL is on the record, links to it.',
          'Tables & Columns appears only on a Datasets product. It is the technical schema for that product.',
          'What\'s Included appears when the product has that text. It describes the kinds of data the product may contain, and the disclaimer says availability can vary by source and record.',
          'Intended Use appears when the product has that text. It describes the purposes the product is designed for. It does not by itself approve a use outside company policy.',
          'Reviews is the rating and the comments from people who have used the product.'
        ],
        links: [
          { label: 'Open the catalog', path: '/marketplace' }
        ]
      }
    ]
  },
  {
    id: 'resource-link',
    category: 'find',
    title: 'Why do only some products show a resource link?',
    summary: 'The Resources tab is only on Datasets and Webservices (APIs), and the link appears when that catalog record has a URL.',
    blocks: [
      {
        paragraphs: [
          'Dashboards, models, and other datatypes do not get a Resources tab. Datasets and Webservices (APIs) do. The tab shows the catalog name beside the resource. If the catalog record has a URL, the name is a link. If it does not, you still see the name, and there is nothing to open.',
          'For an API resource, the link text uses the API name stored on the resource when one is present. Otherwise it uses the product name. A missing link means the catalog URL is not on the product yet. Request Access on the product page is still the way to ask for the data.'
        ],
        links: [
          { label: 'Open the catalog', path: '/marketplace' }
        ]
      }
    ]
  },
  {
    id: 'tables-and-columns',
    category: 'find',
    title: 'How do I read Tables & Columns on a dataset?',
    summary: 'The tab is only on a Datasets product. It is the schema you use after access is granted.',
    blocks: [
      {
        paragraphs: [
          'Tables & Columns is hidden unless the datatype is Datasets. The section is the technical schema for that product. The note on the tab says the table names and column headers are the identifiers your application or script should use in production, so the names match after access is granted.',
          'The list is arranged as Table Name and Column Name. Use those exact names for mapping, ETL, and queries. This tab is the product\'s own schema. It is separate from the “more tables” and “more fields” links inside a Data Access Request suggestion.'
        ],
        links: [
          { label: 'Open the catalog', path: '/marketplace' }
        ]
      }
    ]
  },
  {
    id: 'steward-and-contact',
    category: 'find',
    title: 'What is the difference between the data steward and the point of contact?',
    summary: 'Product Contacts lists both people when the product has them. They are not the same role.',
    blocks: [
      {
        paragraphs: [
          'On the product, Product Contacts can show a Data Steward and a Contact. Search results label the second person Point of Contact. Compare uses the same two rows: Data steward and Contact. A product can also show a Business Contact when that person is recorded.',
          'The data steward is the person accountable for the product. The contact is the person named for questions about it. Either name can be absent. Request Access still goes through the product button. These names do not submit the request for you.'
        ]
      }
    ]
  },
  {
    id: 'product-classification',
    category: 'find',
    title: 'What does the classification on a product mean?',
    summary: 'The badge is the handling level already recorded for that product.',
    blocks: [
      {
        paragraphs: [
          'A product can be badged Public, Protected, Confidential, Highly Confidential, or Legally Privileged. The same value is a row on Compare, and the request form carries it as the access classification. On a product request that field is filled from the product and you do not change it.',
          'Read the badge before you request the product. Personal information and sensitive personal information are separate questions on Data Access Request. Classification does not replace those answers.'
        ],
        links: [
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'ad-group',
    category: 'find',
    title: 'What is the AD group on a product?',
    summary: 'The Active Directory group is shown on Compare, and a dataset request fills it in for you.',
    blocks: [
      {
        paragraphs: [
          'Compare has an AD Group row for each product you add. That is the group associated with the product in the catalog.',
          'When you choose Request Access on a Datasets product, the form shows a calculated AD group and the field is read-only. You do not type a group name. On a product that is not a dataset, the group field is shown and disabled. The group is part of how access is granted. It is not a substitute for Request Access or for Data Access Request.'
        ]
      }
    ]
  },
  {
    id: 'product-reviews',
    category: 'find',
    title: 'How do product reviews work?',
    summary: 'The Reviews tab shows the average rating and lets you leave one review that you can update.',
    blocks: [
      {
        paragraphs: [
          'Reviews sits on every product. The summary shows the average and how the scores spread. If nobody has reviewed it, the list says no reviews yet.',
          'Review This Product asks for an overall rating, then Quality, Value, Ease of use, and Durability. It also asks whether you would recommend the product and whether it met your expectations. Add a title, up to 150 characters, and a comment. Submit review saves it. If you already reviewed that product, the button changes to Update review.'
        ],
        steps: [
          'Open the product and choose Reviews.',
          'Set the stars, answer the two yes or no questions, and write the title and comment.',
          'Submit review. Use Update review later if you need to change it.'
        ]
      }
    ]
  },
  {
    id: 'sort-and-show',
    category: 'find',
    title: 'How do Sort and Show work?',
    summary: 'Above a catalog list, Sort By changes the order and Show changes how many products are on the page.',
    blocks: [
      {
        paragraphs: [
          'On the marketplace list, the line above the products says how many results are showing, such as 1–12 of the total. Sort By has Default, Name (A–Z), and Name (Z–A). Show has 12, 24, 48, and 96. Changing either one reloads the list from the first page of that view.',
          'The same bar has layout buttons for a four-column grid, a grid with features, and a list. Page numbers under the products move through the rest of the results. Filters on the left are separate from Sort and Show.'
        ],
        links: [
          { label: 'Open the catalog', path: '/marketplace' }
        ]
      }
    ]
  },
  {
    id: 'domain-subdomains',
    category: 'find',
    title: 'What if a domain opens subdomain cards instead of products?',
    summary: 'View All follows the domain structure. A domain with children opens those cards. A domain with one product opens that product.',
    blocks: [
      {
        paragraphs: [
          'Each homepage card is a data domain. View All does not always open the catalog. If that domain has subdomain cards, View All opens the next set of cards. A subdomain can do the same and open a third level.',
          'When the card has no further subdomains, View All depends on the products. One product opens that product page. More than one product opens the marketplace with that domain, subdomain, or lower level already selected. A domain with no products is not shown on the homepage.'
        ],
        steps: [
          'Start on the homepage and choose View All on the business area you need.',
          'If you see more cards, choose View All again until you reach products.',
          'Open a product from the catalog, or open the single product page when that is all the card contains.'
        ],
        links: [
          { label: 'Open the homepage', path: '/' },
          { label: 'Open the catalog', path: '/marketplace' }
        ]
      }
    ]
  },
  {
    id: 'clear-a-filter',
    category: 'find',
    title: 'How do I clear a filter?',
    summary: 'Uncheck a filter, choose All Products in the domain list, or use Reset.',
    blocks: [
      {
        paragraphs: [
          'Filters sit on the left of a catalog list. Each checkbox group shows a count. The Filters button also shows how many filters are on. Uncheck a box to drop that one choice. The result count above the grid changes with the list.',
          'In the domain list, All Products returns you to the full marketplace. Reset, under the filter groups, clears the checkbox filters in one step. Sort By and Show stay available after you reset.'
        ],
        links: [
          { label: 'Open the catalog', path: '/marketplace' }
        ]
      }
    ]
  },
  {
    id: 'checkout-unavailable',
    category: 'request',
    title: 'Why can’t I check out?',
    summary: 'The cart keeps Proceed to checkout hidden until the request is complete, and it tells you what is still missing.',
    blocks: [
      {
        paragraphs: [
          'Proceed to checkout appears only for a cart the form can submit. If it is missing, the notice above the button is the reason.',
          'A product request needs Request Details, Business Justification, and Data Usage. A Data Access Request needs Platform, Data Domain, Requested For, Environment, and Access Type. Edit the line from the cart and finish the missing fields.',
          'Catalog products and a Data Access Request cannot be checked out together. Remove the request or remove the products. Only one Data Access Request can be checked out at a time. Remove the extra requests.'
        ],
        links: [
          { label: 'Open the cart', path: '/marketplace/order/cart' }
        ]
      }
    ]
  },
  {
    id: 'checkout-several-products',
    category: 'request',
    title: 'Can I request several products in one checkout?',
    summary: 'Yes, when every product in the cart has a complete request and the cart does not also hold a Data Access Request.',
    blocks: [
      {
        paragraphs: [
          'Add each catalog product with Request Access. The cart lists them together. Checkout stays available when every product has Request Details, Business Justification, and Data Usage, and when the cart has no Data Access Request in it.',
          'A Data Access Request is a different cart line. It checks out alone. If you need both a catalog product and a form request, finish one checkout, then submit the other.',
          'After checkout, the confirmation lists what you submitted. Order History and Track Request are where you return to those requests.'
        ],
        links: [
          { label: 'Open the cart', path: '/marketplace/order/cart' },
          { label: 'Order History', path: '/marketplace/user/orders' }
        ]
      }
    ]
  },
  {
    id: 'remove-a-product',
    category: 'find',
    title: 'How do I remove a product from the cart, favorites, or compare?',
    summary: 'Each list has Remove on the product. Each list also has a button that clears the whole list.',
    blocks: [
      {
        steps: [
          'On the cart, Remove drops that product or that Data Access Request. Clear Cart empties the active cart.',
          'On Favorites, Remove drops one product. Clear Favorites empties the list. Favorites does not submit a request.',
          'On Compare, Remove drops one product. Clear Compare empties the comparison. Compare holds up to five products.',
          'The heart, the compare icon, and Request Access add a product. Removing it from one list does not remove it from the others.'
        ],
        links: [
          { label: 'Cart', path: '/marketplace/order/cart' },
          { label: 'Favorites', path: '/marketplace/user/favorites' },
          { label: 'Compare', path: '/marketplace/user/compare' }
        ]
      }
    ]
  },
  {
    id: 'order-history',
    category: 'account',
    title: 'Where is Order History, and how is it different from Track Request?',
    summary: 'Order History lists the requests on your account. Track Request looks up one request number or RITM number.',
    blocks: [
      {
        paragraphs: [
          'Open the person icon in the header and choose Order History. The page lists requests for the signed-in account. You can search by request number or RITM number. Each row shows the RITM number and the order status.',
          'Track Request, in the header, is a lookup. You enter one request number or one RITM number, and the status opens beside the form. The email on that form is the signed-in account. Use Order History when you want the list. Use Track Request when you already have the number.'
        ],
        links: [
          { label: 'Order History', path: '/marketplace/user/orders' },
          { label: 'Track Request', path: '/marketplace/order/track-request' }
        ]
      }
    ]
  },
  {
    id: 'account-menu',
    category: 'account',
    title: 'What is in the account menu?',
    summary: 'The person icon shows your name, title, and email, then a status control, My Profile, My Dashboard, Order History, and Log Out.',
    blocks: [
      {
        paragraphs: [
          'After you sign in with your Toyota Microsoft account, the person icon in the header opens the account menu. The top of the menu shows your name, job title when the account has one, and email. Choosing that header opens My Dashboard.',
          'Above My Profile, the status control sets Online, Away, Busy, Unavailable, or Offline. That choice is kept on this browser and shows as a dot on the menu photo and the profile photo. My Profile opens the profile page. My Dashboard opens the dashboard. Order History opens the requests on this account. Log Out ends the Microsoft session. The menu can also show the time of your last sign-in.'
        ],
        links: [
          { label: 'My Profile', path: '/marketplace/user/profile' },
          { label: 'My Dashboard', path: '/marketplace/user/dashboard' },
          { label: 'Order History', path: '/marketplace/user/orders' }
        ]
      }
    ]
  },
  {
    id: 'sign-out',
    category: 'account',
    title: 'How do I sign out?',
    summary: 'Log Out is at the bottom of the account menu. It signs you out of the Microsoft account used by the marketplace.',
    blocks: [
      {
        steps: [
          'Choose the person icon in the header.',
          'Choose Log Out.',
          'The marketplace signs you out through the Microsoft account. Sign in again from the same control when you return.'
        ]
      },
      {
        paragraphs: [
          'Signing out does not cancel a request you already submitted. Track Request and Order History are available again after you sign back in with the same account.'
        ],
        links: [
          { label: 'Order History', path: '/marketplace/user/orders' }
        ]
      }
    ]
  },
  {
    id: 'database-and-table-lists',
    category: 'dar',
    title: 'When do the database and table lists appear?',
    summary: 'They appear after you choose the TBDP platform. Tables load for the database you select.',
    blocks: [
      {
        paragraphs: [
          'On Data Access Request, Database/Schema is a dropdown only when the platform is TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.). The list is the databases available for that platform. Choose one. The page then loads the tables for that database into Table Name(s).',
          'Changing the database clears the tables you had selected and loads the tables for the new database. Other platforms that ask for a database use a text field instead of this dropdown. The table list is not the same as the Tables & Columns tab on a catalog product.'
        ],
        steps: [
          'Set the platform to TBDP.',
          'Open Database/Schema and choose a database.',
          'Open Table Name(s) and choose the tables for that database.'
        ],
        links: [
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'dataset-suggestions-did-not-run',
    category: 'ai',
    title: 'Why didn’t dataset suggestions run?',
    summary: 'Dataset suggestions run only for a TBDP request in Production or All, after a domain, a database, and tables are set.',
    blocks: [
      {
        paragraphs: [
          'Suggestions on Data Access Request are not the same as header search. For a dataset, the form waits until four things are true: the platform is exactly TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.), the environment is Production or All, a data domain is selected, and both a database and at least one table are selected.',
          'QA and Development do not open dataset suggestions. A missing domain, database, or table does not either. The form can still be submitted. Suggestions are only a shorter way to find a catalog product that matches what you typed. API suggestions use a different rule: the API platform, a domain, and an API name, after you leave the API name field.'
        ],
        links: [
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'choose-an-environment',
    category: 'dar',
    title: 'Which environment should I choose?',
    summary: 'The form offers QA, Development, Production, and All. Dataset suggestions run only for Production or All.',
    blocks: [
      {
        paragraphs: [
          'Environment is required on Data Access Request. The choices are QA, Development, Production, and All. Pick the environment where the access is needed. All means the request is not limited to one of those environments.',
          'Dataset suggestions look at this field. They run when the environment is Production or All, and only together with the TBDP platform, a domain, a database, and tables. QA and Development still save the environment on the request. They do not start those suggestions.'
        ],
        links: [
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'data-domain-help-document',
    category: 'dar',
    title: 'What is the Data Domain Help Document?',
    summary: 'The link above Data Domain opens the domain guide so you can pick the business area before you submit.',
    blocks: [
      {
        paragraphs: [
          'On Data Access Request, above the Data Domain field, the form says to use the Data Domain Help Document. That link opens the protected Data Domains guide. Read it before you choose a domain. The domain is the business area the data belongs to, and it is one of the answers the checklist keeps open until you select it.',
          'The homepage domain cards use the same business areas. Choosing a card there browses products. Choosing a domain on the form describes the request. They are not the same action.'
        ],
        links: [
          { label: 'Data Domains', path: '/docs/protected/domains' },
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'add-new-product-versus-request-access',
    category: 'request',
    title: 'What is the difference between Add New Product and Request Access?',
    summary: 'Add New Product asks for a product to be listed. Request Access asks for access to a product that is already listed.',
    blocks: [
      {
        paragraphs: [
          'Request Access is the button on a product page. Use it when search or the catalog already shows the data you need. The cart then holds that product until checkout.',
          'Add New Product is in the header. Use it when you want a product added to the catalog. It collects the listing. It does not grant access to a product you already found, and it does not replace Data Access Request when the data is not a catalog product at all.',
          'View Product Request, in the header, is the list of product requests that have been submitted. It shows the product, domain, type, status, and the date submitted.'
        ],
        links: [
          { label: 'View Product Request', path: '/pages/product-intake' },
          { label: 'Data Access Request', path: '/form/data-access-request' }
        ]
      }
    ]
  },
  {
    id: 'product-intake',
    category: 'request',
    title: 'What is the Product Intake page for?',
    summary: 'View Product Request lists catalog-product requests and the status of each one.',
    blocks: [
      {
        paragraphs: [
          'View Product Request is in the header. The page title is View Product Request, and the introduction says these are product requests submitted to add a catalog product. The table shows Product, Domain, Type, Status, and Submitted.',
          'If nothing has been submitted, the page says to use Add New Product in the header. This list is not Order History. Order History is for access requests after checkout. Product Intake is for the request to list a product.'
        ],
        links: [
          { label: 'View Product Request', path: '/pages/product-intake' },
          { label: 'Order History', path: '/marketplace/user/orders' }
        ]
      }
    ]
  },
  {
    id: 'campaigns',
    category: 'start',
    title: 'What is Campaigns?',
    summary: 'Campaigns highlights products and the main actions in the marketplace.',
    blocks: [
      {
        paragraphs: [
          'Campaigns is in the header. The page opens with campaign slides, then highlights Request Access from a product page and browsing by data domain. Below that it can show Most Requested, New Products, and Featured Products. Featured Products can be grouped, and you page through a group with the arrows.',
          'A product on this page opens the same product you would open from search. Campaigns does not submit a request. Use Request Access on the product when you are ready.'
        ],
        links: [
          { label: 'Campaigns', path: '/pages/ads' },
          { label: 'Open the homepage', path: '/' }
        ]
      }
    ]
  },
  {
    id: 'newsroom',
    category: 'account',
    title: 'What is the Newsroom for?',
    summary: 'Newsroom is the list of marketplace articles. Open one to read the full post.',
    blocks: [
      {
        paragraphs: [
          'Newsroom is in the header and in the footer. The page is a grid of posts. Each card shows a title, a summary, the author, the date, and a category. The title opens that post.',
          'Newsroom is where marketplace updates are written up. It is separate from this knowledge base, from the Changelog, and from What’s New. Use Newsroom to read an announcement. Use the knowledge base when you need the steps for search, a product, or a request.'
        ],
        links: [
          { label: 'Newsroom', path: '/newsroom' },
          { label: 'Changelog', path: '/site/changelog' }
        ]
      }
    ]
  }
];
