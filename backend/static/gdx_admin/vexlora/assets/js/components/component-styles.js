// H3: source-aligned class contracts for the Vexlora HTML edition.
// Keep these synchronized with audit/source-reference/h3-components.
export const buttonBase = "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[background-color,color,border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4";
export const buttonVariants = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  soft: "bg-primary/10 text-primary hover:bg-primary/15",
  success: "bg-success text-success-foreground shadow-xs hover:bg-success/90",
  destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  link: "h-auto rounded-none px-0 text-primary underline-offset-4 hover:underline",
};
export const buttonSizes = { sm:"h-9 px-3", default:"h-10 px-4", lg:"h-11 px-5", icon:"size-10", iconSm:"size-9" };
export const badgeBase = "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4";
export const badgeVariants = {
  default:"bg-primary/10 text-primary", primary:"bg-primary/10 text-primary", secondary:"bg-secondary text-secondary-foreground",
  success:"bg-success/10 text-success", info:"bg-info/10 text-info", warning:"bg-warning/15 text-warning-foreground dark:text-warning",
  destructive:"bg-destructive/10 text-destructive", neutral:"bg-muted text-muted-foreground", outline:"border border-border bg-background text-foreground",
};
export const card = {
  root:"rounded-lg border border-border bg-card text-card-foreground shadow-xs",
  header:"flex flex-col gap-1.5 p-5 sm:p-6",
  title:"text-base font-semibold leading-6 tracking-tight",
  description:"text-sm leading-5 text-muted-foreground",
  content:"px-5 pb-5 sm:px-6 sm:pb-6",
  footer:"flex items-center gap-2 border-t border-border px-5 py-4 sm:px-6",
};
export const field = {
  label:"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  control:"flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  textarea:"flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  description:"text-compact text-muted-foreground",
  error:"text-compact font-medium text-destructive",
};
export const table = {
  wrapper:"relative w-full overflow-auto",
  root:"w-full caption-bottom text-sm",
  header:"[&_tr]:border-b",
  body:"[&_tr:last-child]:border-0",
  row:"border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  head:"h-11 px-4 text-start align-middle text-compact font-semibold text-muted-foreground",
  cell:"p-4 align-middle",
};
export function cx(...parts){ return parts.filter(Boolean).join(" "); }
export function buttonClass(variant="default", size="default", extra=""){ return cx(buttonBase,buttonVariants[variant]||buttonVariants.default,buttonSizes[size]||buttonSizes.default,extra); }
export function badgeClass(variant="default", extra=""){ return cx(badgeBase,badgeVariants[variant]||badgeVariants.default,extra); }
