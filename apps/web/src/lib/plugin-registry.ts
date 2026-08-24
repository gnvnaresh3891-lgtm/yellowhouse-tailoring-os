/**
 * RedHouse OS Plugin System Architecture & Registry
 * 
 * Provides a modular, decoupled plugin registry allowing any ecosystem capability
 * (Marketplace, Equipment Rentals, Material Sourcing, Bidding, Stylist Directory, or future plugins)
 * to be dynamically discovered, enabled, or disabled per tenant atelier without altering
 * core YellowHouse Tailoring OS operations.
 */

import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';

export type PluginCategory = 'DESIGN' | 'EQUIPMENT' | 'SUPPLY' | 'PRODUCTION' | 'SERVICES' | 'CUSTOM';

export interface RedHousePluginManifest {
  id: string;
  name: string;
  version: string;
  category: PluginCategory;
  route: string;
  description: string;
  iconName: string;
  author: string;
  badge: string;
  statsMetric: string;
  isCore: boolean; // if true, installed by default
  defaultEnabled: boolean;
  minTierRequired: 'FREE' | 'PRO' | 'ENTERPRISE';
  tags: string[];
}

export interface TenantPluginSetting {
  pluginId: string;
  enabled: boolean;
  installedAt: string;
  updatedAt: string;
}

export const REGISTERED_PLUGINS: RedHousePluginManifest[] = [
  {
    id: 'plugin-marketplace',
    name: 'Digital Asset Warehouse',
    version: '1.2.0',
    category: 'DESIGN',
    route: '/redhouse/marketplace',
    description: 'Design as a Product: 3D tech packs, blueprints, digital silhouettes, instant licensing, and creator royalties.',
    iconName: 'ShoppingBag',
    author: 'RedHouse Digital Atelier',
    badge: 'Layer 1',
    statsMetric: '64+ Blueprints',
    isCore: true,
    defaultEnabled: true,
    minTierRequired: 'FREE',
    tags: ['Tech Packs', '3D Blueprints', 'Licensing', 'Royalty']
  },
  {
    id: 'plugin-equipment-sharing',
    name: 'Workshop Equipment Sharing',
    version: '1.1.0',
    category: 'EQUIPMENT',
    route: '/redhouse/equipment',
    description: 'High-tech machine rental access: digital textile printers, laser fabric cutters, and Tajima multi-head embroidery.',
    iconName: 'Cpu',
    author: 'RedHouse Hardware Network',
    badge: 'Layer 2',
    statsMetric: '12 Active Units',
    isCore: true,
    defaultEnabled: true,
    minTierRequired: 'FREE',
    tags: ['Machine Rental', 'Laser Cutters', 'Embroidery', 'Collision Buffer']
  },
  {
    id: 'plugin-material-sourcing',
    name: 'Vendor Material Sourcing',
    version: '1.0.4',
    category: 'SUPPLY',
    route: '/redhouse/supply',
    description: 'Direct supplier fabric swatches, tiered volume discounts, and multi-factor AI Smart Fabric Recommendation engine.',
    iconName: 'Package',
    author: 'RedHouse Supply Hub',
    badge: 'Layer 3',
    statsMetric: '350+ Swatches',
    isCore: true,
    defaultEnabled: true,
    minTierRequired: 'FREE',
    tags: ['Fabric Sourcing', 'AI Recommender', 'Volume Discounts', 'Organic Silk']
  },
  {
    id: 'plugin-tailor-bidding',
    name: 'Production Bidding & Tailor Hub',
    version: '1.3.0',
    category: 'PRODUCTION',
    route: '/redhouse/bidding',
    description: 'Artisan specialization network: post design briefs, receive tailor bids, and manage 4-stage milestone escrow contracts.',
    iconName: 'Award',
    author: 'RedHouse Artisan Guild',
    badge: 'Layer 4',
    statsMetric: '28 Master Artisans',
    isCore: true,
    defaultEnabled: true,
    minTierRequired: 'FREE',
    tags: ['Tailor Bidding', 'Escrow', 'Zardozi', 'Master Cutting']
  },
  {
    id: 'plugin-stylist-directory',
    name: 'Stylists & 3-Month Free Trial',
    version: '1.0.0',
    category: 'SERVICES',
    route: '/redhouse/stylists',
    description: 'Certified regional stylist directory across 9 hubs, bridal draping consultations, and 90-day trial onboarding tier.',
    iconName: 'Sparkles',
    author: 'RedHouse Stylist Network',
    badge: 'Layer 5',
    statsMetric: '9 Regional Hubs',
    isCore: true,
    defaultEnabled: true,
    minTierRequired: 'FREE',
    tags: ['Stylists', 'Trial Tier', 'Haute Draping', 'Onboarding']
  }
];

const STORAGE_KEY = 'redhouse_tenant_plugins';

/**
 * Get active plugin states for current tenant from localStorage with safe fallback
 */
export function getTenantPluginSettings(): Record<string, boolean> {
  const initialSettings: Record<string, boolean> = {};
  for (const plugin of REGISTERED_PLUGINS) {
    initialSettings[plugin.id] = plugin.defaultEnabled;
  }

  const stored = getLocalStorage<Record<string, boolean>>(STORAGE_KEY, initialSettings);
  return { ...initialSettings, ...stored };
}

/**
 * Toggle plugin enabled/disabled state for the boutique tenant
 */
export function setPluginEnabledState(pluginId: string, enabled: boolean): Record<string, boolean> {
  const current = getTenantPluginSettings();
  const updated = { ...current, [pluginId]: enabled };
  setLocalStorage(STORAGE_KEY, updated);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('redhouse_plugins_updated', { detail: updated }));
  }
  return updated;
}

/**
 * Get list of currently active & enabled plugins
 */
export function getActivePlugins(): RedHousePluginManifest[] {
  const settings = getTenantPluginSettings();
  return REGISTERED_PLUGINS.filter((p) => settings[p.id] !== false);
}

/**
 * Register a new custom/third-party plugin manifest dynamically
 */
export function registerCustomPlugin(plugin: RedHousePluginManifest): boolean {
  if (REGISTERED_PLUGINS.some((p) => p.id === plugin.id)) {
    return false;
  }
  REGISTERED_PLUGINS.push(plugin);
  return true;
}
