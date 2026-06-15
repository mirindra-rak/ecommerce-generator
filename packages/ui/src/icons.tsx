"use client";

// Icônes du design system — banque Phosphor (@phosphor-icons/react), source unique
// consommée par l'app ET le catalogue. Hériteent de `currentColor` ; la taille se
// règle par className (`h-5 w-5`). Poids par défaut « regular » (réglable via
// IconContext si besoin d'unifier thin/light/duotone globalement).
import { Star, type IconProps } from "@phosphor-icons/react";

export {
  MagnifyingGlass as SearchIcon,
  Heart as HeartIcon,
  ShoppingCart as CartIcon,
  User as UserIcon,
  List as MenuIcon,
  Truck as TruckIcon,
  ShieldCheck as ShieldIcon,
  Stethoscope as StethoscopeIcon,
  ArrowsClockwise as RefreshIcon,
  Leaf as LeafIcon,
  Sparkle as SparklesIcon,
  Gift as GiftIcon,
  Percent as PercentIcon,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  Envelope as MailIcon,
  MapPin as MapPinIcon,
  Check as CheckIcon,
  CaretRight as ChevronRightIcon,
  CaretDown as ChevronDownIcon,
  Globe as GlobeIcon,
  ArrowRight,
  InstagramLogo as InstagramIcon,
  FacebookLogo as FacebookIcon,
  TiktokLogo as TiktokIcon,
  // Admin
  House as HouseIcon,
  Tag as TagIcon,
  Storefront as StorefrontIcon,
  Package as PackageIcon,
  ShoppingBag as BagIcon,
  Users as UsersIcon,
  Bell as BellIcon,
  Gear as GearIcon,
  WarningCircle as WarningIcon,
  SignOut as SignOutIcon,
  ArrowUpRight as TrendUpIcon,
  PencilSimple as PencilIcon,
  Trash as TrashIcon,
} from "@phosphor-icons/react";

// Étoile pleine (notation) — variante « fill ».
export function StarIcon(props: IconProps) {
  return <Star weight="fill" {...props} />;
}
