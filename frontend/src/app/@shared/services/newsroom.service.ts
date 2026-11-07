import { Injectable } from '@angular/core';
import { Newsroom } from '../interfaces/newsroom';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsroomService {
  private createSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim();
  }

  private selectedCategorySubject = new BehaviorSubject<string | null>(null);
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  setSelectedCategory(cat: string | null) {
    this.selectedCategorySubject.next(cat);
  }

  private readonly team = 'Data Marketplace Team';
  private readonly teamAvatar = 'assets/icons/android-chrome-512x512.png';

  private rawNewsroom: Omit<Newsroom, 'slug'>[] = [
    {
      id: '1',
      title: 'Data Access Request is easier to complete',
      summary: 'The request form now keeps the page header in place, uses floating labels, and shows the same required-information checklist as a product request.',
      content: '<p>Use Data Access Request when the catalog search does not list the data you need. Open it from the footer. The marketplace header and the page title stay fixed. Only the form column scrolls, so the Required Information list remains visible while you move through the fields.</p><h2>What you fill in</h2><p>Start with who the access is for. Choose For me, or For someone else and search for that person. Then choose the platform. The list includes API (EIG Application Support), Data Warehouse/Mart, Gateway access for tools such as Power BI, Tableau, and Alteryx, Mainframe, MySQL, Oracle, PostgreSQL, and SQL.</p><p>Next choose the data domain. The Data Domain Help Document sits above that field and explains how domains are organized. Then choose the user type, whether a person or an application will use the data, and the environment: QA, Development, Production, or All.</p><p>Describe the data and the work it supports. Those answers are what a reviewer uses to decide if the request matches the job.</p><h2>How the form helps you finish</h2><ul><li>Field labels sit on the controls, including the person search.</li><li>The Required Information list matches a product request. It includes User/App Access, PII Access, and PII Explanation, and each item changes when that answer is complete.</li><li>Choosing API shows a card with the Toyota API Catalog so you can look up the API name before you type it.</li><li>Mainframe requests for Sales or Manufacturing show a short card that names that access path.</li><li>The P02 Information Classification and Handling Policy, the data domain note, and the Terms of Use acknowledgment use the same gray card.</li></ul><h2>Before you submit</h2><p>Answer both personal-information questions. If either answer is Yes, the form asks for more detail, including the type of work and whether a third party will receive the data. Read the Terms of Use card and check the box only after you agree. The checklist on the left is the fastest way to see what is still missing.</p>',
      image: 'assets/images/domains/data-governance@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'updates'
    },
    {
      id: '2',
      title: 'Your account menu now includes My Dashboard',
      summary: 'The person icon opens your profile, dashboard, order history, and the time this sign-in started.',
      content: '<p>The person icon in the header is your account menu after you sign in with your Toyota Microsoft account. It stays available on catalog, request, and newsroom pages.</p><h2>What the menu shows</h2><p>The top of the menu is your profile card: photo or initials, name, job title, and email. That card opens My Dashboard. Under it, the links are in this order:</p><ul><li>My Profile opens the profile page for the signed-in account.</li><li>My Dashboard opens the account home, with the same name, title, and email and a link back to the profile.</li><li>Order History opens the requests tied to your account after checkout.</li><li>Log Out ends the Microsoft session.</li></ul><h2>Last sign-in</h2><p>Under Log Out, the menu says hello by your first name and shows when this sign-in started. The date comes from the current Microsoft sign-in, so it is the start of this session, not an older visit. It is written out in full, for example November 6, 2026, with the time.</p><h2>What the menu does not include</h2><p>Addresses and a marketplace password are not in this menu. Sign-in is handled by your Toyota Microsoft account, so a password change belongs there, not in the Data Marketplace. Favorites, Compare, and the cart stay on their own icons in the header.</p>',
      image: 'assets/images/domains/identity@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'updates'
    },
    {
      id: '3',
      title: 'Find a product, then request access',
      summary: 'Search the catalog, open a product, and use Request Access when the data is already listed.',
      content: '<p>If the data is already a product, request it from the catalog. Do not start a Data Access Request until you have searched.</p><h2>Find the product</h2><p>Use the search box in the header. Open a result and read the description, data domain, platform, and the contacts listed on the page. Those details tell you whether this product is the one your work needs.</p><p>The heart icon saves the product to Favorites. The scale icon adds it to Compare so you can review more than one product side by side before you choose. Both lists open from the header.</p><h2>Request Access</h2><p>On the product page, choose Request Access. The form asks whether the access is For Myself or For Someone Else. For someone else, search for the person who needs it. Then answer the environment, how the data will be used, and the personal-information questions.</p><p>If the product is already marked as containing personal information or sensitive personal information, the form shows that statement and hides the two questions. You still answer the follow-up questions when that data is in the product.</p><h2>Cart and checkout</h2><p>Add the request to the cart. Open the cart from the header and use Proceed to checkout when the cart says checkout is available. If checkout is not available yet, the cart shows the reason. Finish the missing product details, then return to the cart.</p><p>After checkout, Order History in the account menu is where you return to requests tied to your account. Track Request in the header is the lookup that uses a request number or an RITM number.</p>',
      image: 'assets/images/domains/customer@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'features'
    },
    {
      id: '4',
      title: 'Ask VIKKI while you look for data',
      summary: 'The Ask VIKKI button is available on marketplace pages when you want help finding a product or completing a form.',
      content: '<p>Ask VIKKI is the chat on marketplace pages. Open it when you are searching, comparing products, or filling out a request and you want a short answer without leaving the page.</p><h2>What to ask</h2><ul><li>Which path to use: catalog Request Access, Data Access Request, or Add New Product.</li><li>What a field means, such as data domain, fulfillment group, user access, or application access.</li><li>Where to find the Data Domain Help Document, the P02 policy, Terms of Use, or Track Request.</li><li>What to do when a product is not in search.</li></ul><h2>What VIKKI does not do</h2><p>The chat does not submit a request for you. Access is still requested from the product page or from Data Access Request, and a new catalog product is still described with Add New Product. VIKKI also does not replace the Required Information checklist. That list is the record of which answers are still missing.</p><p>If the chat cannot answer, use Contact Us or Need Help in the header. Report An Issue in the footer opens the ServiceNow form for a problem with the marketplace itself.</p>',
      image: 'assets/images/cover/default.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'features'
    },
    {
      id: '5',
      title: 'Search first, then request what is missing',
      summary: 'Most access starts in the catalog. Data Access Request covers data that is not listed as a product.',
      content: '<p>There are three ways to ask for data. Pick the one that matches what you already know.</p><h2>The product is in the catalog</h2><p>Search first. Products in the marketplace are dashboards, datasets, data science models, and APIs. When you find the right one, use Request Access on that product, then the cart. This is the shortest path because the domain, platform, and contacts are already on the product.</p><h2>The data is not listed</h2><p>Use Data Access Request. You will name the platform, the data domain, the user type, whether a person or an application needs access, and the environment. You will also describe the data and the job it supports, answer the personal-information questions, and accept the Terms of Use.</p><p>The Required Information list stays on the left while the form scrolls. Use it to see which answers are still open before you submit.</p><h2>You want a product added to the catalog</h2><p>Add New Product is in the header. The first question asks whether you are requesting a new product. If you answer No, the form sends you back to search or to Data Access Request.</p><p>If you answer Yes, the form asks for the product name, data domain, and type. Dashboard and API products also ask for a URL of at least 16 characters. Every request needs at least one tag, a description of at least 16 characters, an answer on sensitive personal information, a stakeholder, and a fulfillment group of at least 10 characters. If you do not know the team that would provision access, enter that you do not know.</p><p>Submit Product stays disabled until those required fields are valid. Sample data is no longer part of this form.</p>',
      image: 'assets/images/domains/manufacturing@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'trending'
    },
    {
      id: '6',
      title: 'Personal information is two questions',
      summary: 'Access requests ask separately about Personal Information and Sensitive Personal Information.',
      content: '<p>Personal Information (PI) is data about a person. Sensitive Personal Information is a narrower set of that data and needs tighter handling. The marketplace asks about them separately because a product can contain one, the other, or both.</p><h2>On Data Access Request</h2><p>Read the P02 Information Classification and Handling Policy card first. It sits above the two questions. Then answer:</p><ul><li>Are you requesting Personal Information (PI) data?</li><li>Are you requesting Sensitive Personal Information (Sensitive PI) data?</li></ul><p>Both questions stay on the form. If either answer is Yes, more fields open: what the personal data is, the type of work, and whether the data will be shared with a third-party vendor. The Required Information list adds PII Access and PII Explanation when those answers are required.</p><h2>On a product request</h2><p>Request Access asks the same two questions when the catalog has not already classified the product. If the product record is already marked Yes for personal information, sensitive personal information, or both, the questions are hidden and a gray card states which kind of data the product contains. The follow-up questions still appear when that card says the product contains personal data.</p><h2>Why the answers matter</h2><p>Reviewers use these answers with your description and intended use. A different use of the same data needs its own approval. Do not guess. If you are not sure whether the data is sensitive, read the P02 link before you choose Yes or No.</p>',
      image: 'assets/images/domains/customer_interaction@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'trending'
    },
    {
      id: '7',
      title: 'Read the Terms of Use before you submit',
      summary: 'Every Data Access Request includes an acknowledgment of how Toyota data can be used.',
      content: '<p>Data Access Request ends with a Terms of Use card and a required checkbox. The checkbox stays off to the side of its label. Submit only after you have read the card. The same acknowledgment applies to the data you are asking for, whether you found it in the catalog or you are describing it on this form.</p><h2>What the card says</h2><ul><li>You are authorized to use this data only to perform your job duties.</li><li>You will not disclose it to any person or entity unless that disclosure is approved in advance.</li><li>You will protect your access credentials and will not share them.</li><li>You will not use the data for unauthorized, fraudulent, or malicious purposes, or in a way that could damage, disable, overburden, or impair Toyota Motor North America systems.</li><li>The data is only for the use case that was approved. Any other use needs its own approval.</li><li>You will follow Toyota Motor North America and Data Enablement and Global Compliance policies. The card links to dataenablement.toyota.com.</li></ul><h2>Where else to read</h2><p>The footer links to the full Terms of Use page and to the Disclaimer. The P02 Information Classification and Handling Policy card, higher on the same form, is the classification rule to read before you answer the personal-information questions. Terms of Use is about how you will handle the access after it is approved.</p><p>The Required Information list keeps Terms of Use marked open until the checkbox is selected.</p>',
      image: 'assets/images/domains/corporate-identity@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'security'
    },
    {
      id: '8',
      title: 'Sign in with your Toyota account',
      summary: 'Marketplace access uses your Toyota Microsoft account. The account menu shows the profile from that sign-in.',
      content: '<p>The Data Marketplace uses your Toyota Microsoft account. After sign-in, the person icon shows the name, title, and email from that account, and the account menu can open My Profile, My Dashboard, and Order History.</p><h2>Who the request form expects</h2><p>On Data Access Request, User Type is where you say which kind of account needs the data:</p><ul><li>TMNA users: team members, business partners, service accounts, and contingent workers.</li><li>TMNA affiliates, including examples such as Toyota Connected, Toyota Canada, and Toyota Financial Services.</li><li>External users, such as vendors.</li></ul><p>That choice is separate from who the access is for. You can request for yourself or search for someone else, and you still choose whether a person or an application will use the data.</p><h2>After you submit</h2><p>Track Request in the header asks for a request number or an RITM number. The email field uses the email on the signed-in account, so you do not type it again. Order History in the account menu is the list of requests tied to your account.</p><p>For a problem with the marketplace, use Need Help or Contact Us in the header. Report An Issue in the footer opens the ServiceNow form. The footer also links to the Data Access Guide, the Data Access Process Flow, and the Data Domain Help Document when you need the longer reference.</p>',
      image: 'assets/images/domains/identity_mgmt@3x.jpg',
      author: this.team,
      authorImage: this.teamAvatar,
      date: 'November 6, 2026',
      category: 'security'
    }
  ];

  private newsroom: Newsroom[] = this.rawNewsroom.map(item => ({
    ...item,
    slug: this.createSlug(item.title)
  }));

  getNewsroom(): Newsroom[] {
    return [...this.newsroom];
  }

  getNewsroomById(id: string): Newsroom | undefined {
    return this.newsroom.find(x => x.id === id);
  }

  getNewsroomBySlug(slug: string): Newsroom | undefined {
    return this.newsroom.find(x => x.slug === slug);
  }

  getByCategory(category: string): Newsroom[] {
    return this.newsroom.filter(x => x.category === category);
  }

  search(query: string): Newsroom[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getNewsroom();
    return this.newsroom.filter(x =>
      x.title.toLowerCase().includes(q) ||
      x.summary.toLowerCase().includes(q) ||
      (x.content && x.content.toLowerCase().includes(q))
    );
  }
}