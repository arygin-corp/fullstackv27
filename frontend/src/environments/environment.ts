// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

// LOCAL ENVIRONMENT W/ ME
export const environment = {
  version: '26.11.06',
  timestamp: '11/06/2026, 095805 CT',
  engineer: 'Giovanni Austin',
  buildId: 'local-build-13',
  production: false,
  hotjar: '1935085',
  environmentName: 'Local',
  isIE,
  jsonAPIUrl: 'http://localhost:8000/marketplace/api',
  clientId: "e469e37c-6300-4d6b-866a-501dc2b2edfe",
  authority: "https://login.microsoftonline.com/b7be26fb-0007-4e34-9f39-088aa7bc74b0",
  redirectUri: "http://localhost:4200",
  postLogoutRedirectUri: "http://localhost:4200",
  validateAuthority: true,
  navigateToLoginRequestUrl: true,
  cacheLocation: "sessionStorage",
  versionCheckURL: "http://localhost:4200/version.json",
  apiUrl: 'http://localhost:8000', // For Engine B
  gdx: {
    baseURL: "http://localhost:8000/",
    axon: "http://localhost:8000/view/endpoint/axon/get-token",
    axonFacets: "http://localhost:8000/view/endpoint/axon/axon-facet-search",
    axonGlossary: "http://localhost:8000/view/endpoint/axon/axon-glossary",
    denodo: "http://localhost:8000/api/integrations/denodo/get-token",
    denodoTables: "http://localhost:8000/api/integrations/denodo/table/view",
    collibra: "http://localhost:8000/view/endpoint/",
    collibraFacets: "http://localhost:8000/view/endpoint/",
    collibraGlossary: "http://localhost:8000/view/endpoint/",
    users: "http://localhost:8000/api/integrations/people-finder/search/gac/user/?q=",
    addToCart: "http://localhost:8000/view/endpoint/requests/checkout",
    submitCart: "http://localhost:8000/view/endpoint/requests/checkout",
    fileUpload: "http://localhost:8000/view/endpoint/requests/upload",
    pods: "http://localhost:8000/api/integrations/tbdp-pods/dropdown/",
    products: "http://localhost:8000/marketplace/api/products/",
    request: "http://localhost:8000/view/endpoint/requests/",
    requestSave: "http://localhost:8000/view/endpoint/requests/save",
    requestFindAndSave: "http://localhost:8000/view/endpoint/requests/findAndSave",
    requestEvent: "http://localhost:8000/view/endpoint/requests/event",
    requestProduct: "http://localhost:8000/view/endpoint/requests/product",
    form: "http://localhost:8000/api/forms/api/definitions/",
  },
  serviceNow: {
    auth: "RE1QIFN1YiBQcm9kOjRHdy08PTssVERTdEc2QDhoSUc4N3ZHO3V0RUN0b2MsNUQrJFEu",
    addToCart: "https://tmnatest.service-now.com/api/sn_sc/servicecatalog/items/9a51d2dd1b03c490d96b11b92a4bcb99/add_to_cart",
    submitOrder: 'https://tmnatest.service-now.com/api/sn_sc/servicecatalog/cart/submit_dar_order',
    upload: "https://tmnatest.service-now.com/api/now/attachment/upload",
  },
  useMockServiceNow: false,
  microsoft: {
    graphAPI: "https://graph.microsoft.com/v1.0/me?$select=id,accountEnabled,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3",
  },
  ai: {
    chatApiClientId: '',
    chatApiScope: '',
    chatProtectedResource:'',
    /* These paths match the exact outgoing calls from AiChatService.*/
    vikkiApiBase:'',
    chatApiUrl: '',
    chatContextApiUrl: '',
    chatFeedbackApiUrl:'',

    // chatApiClientId: 'b7be26fb-0007-4e34-9f39-088aa7bc74b0',
    // chatApiScope: 'api://b7be26fb-0007-4e34-9f39-088aa7bc74b0/access_as_user',
    // chatProtectedResource:'http://localhost:4200/api/ai/*',
    // /* These paths match the exact outgoing calls from AiChatService.*/
    // vikkiApiBase:'http://localhost:8000/api/ai',
    // chatApiUrl: 'chat/',
    // chatContextApiUrl: 'chat/context/',
    // chatFeedbackApiUrl:'chat/feedback/',

    // chatApiClientId: '496a6de0-52a2-44d9-aaab-42a964716e65',
    // chatApiScope: 'api://496a6de0-52a2-44d9-aaab-42a964716e65/access_as_user',
    // chatProtectedResource: 'http://localhost:4200/api/ai/*',
    // vikkiApiBase: '/api/ai',
    // chatApiUrl: 'chat/',
    // chatContextApiUrl: 'chat/context/',
    // chatFeedbackApiUrl: 'chat/feedback/',
  }
}