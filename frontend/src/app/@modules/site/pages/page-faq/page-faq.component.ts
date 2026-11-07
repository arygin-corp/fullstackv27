import { Component } from '@angular/core';

interface FaqItem {
    question: string;
    answer: string[];
    open?: boolean;
}

interface FaqSection {
    title: string;
    items: FaqItem[];
}

@Component({
    selector: 'app-faq',
    templateUrl: './page-faq.component.html',
    styleUrls: ['./page-faq.component.scss']
})
export class PageFaqComponent {
    sections: FaqSection[] = [
        {
            title: 'Getting started',
            items: [
                {
                    question: 'What is the Data Marketplace?',
                    answer: [
                        'The Global Data Marketplace is where Toyota Motor North America users find data products and request access to them. Products include dashboards, datasets, data science models, and APIs.',
                        'The Data Marketplace Team owns the application.'
                    ]
                },
                {
                    question: 'Who can use the Data Marketplace?',
                    answer: [
                        'Team members, business partners, service accounts, and contingent workers can request access as TMNA users. The Data Access Request form also has choices for TMNA affiliates, such as Toyota Connected, Toyota Canada, and Toyota Financial Services, and for external users such as vendors.',
                        'Sign in with your Toyota Microsoft account. The person icon in the header opens your account menu after you are signed in.'
                    ]
                },
                {
                    question: 'How do I search for a data product?',
                    answer: [
                        'Use the search box in the header. It searches the data products in the catalog. Open a result to read the description, domain, platform, and access details before you request it.'
                    ]
                },
                {
                    question: 'Can I change the language?',
                    answer: [
                        'Yes. The language control in the header includes English, Spanish, French, and Japanese. English is the default.'
                    ]
                }
            ]
        },
        {
            title: 'Finding and comparing products',
            items: [
                {
                    question: 'What do the heart, compare, and cart icons do?',
                    answer: [
                        'The heart saves a product to Favorites. The scale icon adds a product to Compare so you can review products side by side. The cart holds products you are ready to request.',
                        'Open those lists from the icons in the header.'
                    ]
                },
                {
                    question: 'How do I request access to a product I already found?',
                    answer: [
                        'Open the product and choose Request Access. Complete the questions for who needs access, the environment, how the data will be used, and whether the product contains personal information.',
                        'Add the request to your cart and proceed to checkout when the cart says checkout is available.'
                    ]
                },
                {
                    question: 'What if the product is not in the catalog?',
                    answer: [
                        'Use Data Access Request from the footer, or open Add New Product in the header if you want a product listed. Data Access Request is the path when you need access and cannot find the product in search.'
                    ]
                },
                {
                    question: 'What does Add New Product ask for?',
                    answer: [
                        'Add New Product asks whether you are requesting a new catalog product. If you are, it asks for the product name, data domain, product type, tags, description, whether it contains sensitive personal information, a stakeholder, and the fulfillment group that would provision access.',
                        'Dashboard and API products also ask for a URL. Submit Product stays disabled until the required fields are valid. If you are not adding a product, the form points you back to search or Data Access Request.'
                    ]
                }
            ]
        },
        {
            title: 'Data Access Request',
            items: [
                {
                    question: 'Where do I start a Data Access Request?',
                    answer: [
                        'Open Data Access Request from the footer or go to the Data Access Request page. The form asks who the access is for, the platform, the data domain, the user type, whether a person or an application needs access, and the environment.'
                    ]
                },
                {
                    question: 'Which platforms can I request?',
                    answer: [
                        'The platform list includes API (EIG Application Support), Data Warehouse/Mart, Gateway access for tools such as Power BI, Tableau, and Alteryx, Mainframe, MySQL, Oracle, PostgreSQL, and SQL.',
                        'Choosing API shows a link to the Toyota API Catalog so you can look up the API name.'
                    ]
                },
                {
                    question: 'What is a data domain?',
                    answer: [
                        'A data domain is the business area the data belongs to, such as Customer, Manufacturing, Vehicle, or Finance. The form includes the full domain list.',
                        'Use the Data Domain Help Document on the form, or open Data Domains from the footer, before you pick a domain.'
                    ]
                },
                {
                    question: 'Can I request access for someone else?',
                    answer: [
                        'Yes. On Data Access Request, set “Who are you requesting data access for?” to “For someone else,” then search for that person. On a product Request Access form, choose “For Someone Else” and search for the user who needs access.'
                    ]
                },
                {
                    question: 'What is the difference between user access and application access?',
                    answer: [
                        'User access means a person opens the data directly. Application access means a program or system uses the data, and a person is not the actor.'
                    ]
                },
                {
                    question: 'What should I put in the description and intended use?',
                    answer: [
                        'Describe the data you need and the job you will use it for. Reviewers use those answers to decide whether the access matches your work. The Required Information list on the left shows which answers are still missing.'
                    ]
                },
                {
                    question: 'What is a fulfillment group?',
                    answer: [
                        'The fulfillment group is the team that would provision access to the product. If you do not know the team, the Add New Product form tells you to enter “I don\'t know.”'
                    ]
                }
            ]
        },
        {
            title: 'Personal information and terms',
            items: [
                {
                    question: 'What is Personal Information and Sensitive Personal Information?',
                    answer: [
                        'Personal Information (PI) is data about a person. Sensitive Personal Information is a narrower set of personal data that needs tighter handling. The form asks these as two separate questions.',
                        'If you answer Yes to either question, the form asks for more detail, including the type of work and whether the data will be shared with a third-party vendor.'
                    ]
                },
                {
                    question: 'A product already says it contains personal information. Why don\'t I see the questions?',
                    answer: [
                        'On a product Request Access form, a product that is already marked as containing personal information or sensitive personal information shows that statement and hides the two questions. You still complete the follow-up questions when the product contains that data.'
                    ]
                },
                {
                    question: 'Where is the classification policy?',
                    answer: [
                        'Data Access Request includes a P02 Information Classification and Handling Policy link above the personal-information questions. Read it before you answer those questions.'
                    ]
                },
                {
                    question: 'What am I accepting in Terms of Use?',
                    answer: [
                        'The acknowledgment says you will use the data only for your job, will not disclose it unless that disclosure is approved, will not share your credentials, and will not use the data to harm Toyota systems.',
                        'It also says a different use needs its own approval, and that you will follow Toyota Motor North America and Data Enablement policies. The policy link on the form goes to dataenablement.toyota.com. Check the box only after you have read that statement. The full Terms of Use page is under Terms of Use in the footer.'
                    ]
                }
            ]
        },
        {
            title: 'Your account and requests',
            items: [
                {
                    question: 'What is in the account menu?',
                    answer: [
                        'The person icon opens your name, title, and email, then My Profile, My Dashboard, Order History, and Log Out. Under Log Out, the menu shows when this Microsoft sign-in started.'
                    ]
                },
                {
                    question: 'How do I track a request?',
                    answer: [
                        'Open Track Request in the header. Enter the request number or the RITM number. The email field uses the email on your signed-in account.',
                        'Order History in the account menu lists requests tied to your account after checkout.'
                    ]
                },
                {
                    question: 'Why can\'t I check out?',
                    answer: [
                        'The cart shows “Checkout is not available yet” and the reason when something required is still missing. Finish the request details on the product, then return to the cart.'
                    ]
                }
            ]
        },
        {
            title: 'Help',
            items: [
                {
                    question: 'What is Ask VIKKI?',
                    answer: [
                        'Ask VIKKI is the chat button on the page. Use it to ask questions about the Data Marketplace while you are looking for a product or filling out a form.'
                    ]
                },
                {
                    question: 'Where do I get help or report a problem?',
                    answer: [
                        'Need Help and Contact Us are in the header. The footer includes the Resource Library, Changelog, FAQ, and Report An Issue. Report An Issue opens the ServiceNow request form.',
                        'Documentation in the footer includes Data Domains, the Data Access Guide, the Data Access Process Flow, and the Product Sourcing Flow. API developers can open the EIG API Developer FAQ from the same list.'
                    ]
                },
                {
                    question: 'Where do I read news and the product roadmap?',
                    answer: [
                        'Newsroom and Changelog are in the header. The footer also links to the team page, the organization chart, the product roadmap, and the Global Hackathon page.'
                    ]
                }
            ]
        }
    ];

    toggle(item: FaqItem): void {
        const open = !item.open;
        this.sections.forEach(section => {
            section.items.forEach(entry => entry.open = false);
        });
        item.open = open;
    }
}
