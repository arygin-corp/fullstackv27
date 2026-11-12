export const productConfig = Object.freeze({
  name: "Vexlora",
  adminName: "Vexlora Admin",
  companyName: "Vexlora Labs",
  tagline: "Multipurpose Tailwind HTML Admin",
  description: "Multipurpose Tailwind HTML5 admin dashboard template with AI-first workflows.",
  homeHref: "/dashboard/executive",
  docsHref: "/foundation/customization",
  exportPrefix: "vexlora",
  storagePrefix: "vexlora",
  brand: { mark: "VX", logoSrc: null, logoAlt: "Vexlora" }
});

export const storageKeys = Object.freeze({
  layout: `${productConfig.storagePrefix}-layout`,
  locale: `${productConfig.storagePrefix}-locale`,
  presentation: `${productConfig.storagePrefix}-presentation`,
  branding: `${productConfig.storagePrefix}-branding`,
  theme: `${productConfig.storagePrefix}-theme`,
  commandFavorites: `${productConfig.storagePrefix}.command-center.favorites`,
  commandRecent: `${productConfig.storagePrefix}.command-center.recent`,
  currentUserProfile: `${productConfig.storagePrefix}.current-user-profile.v1`
});

export const defaultLayout = Object.freeze({
  navigation: "vertical",
  sidebar: "standard",
  contentWidth: "full",
  header: "sticky"
});

export const defaultPresentation = Object.freeze({
  accent: "indigo",
  radius: "balanced",
  font: "inter",
  density: "comfortable",
  direction: "ltr"
});
