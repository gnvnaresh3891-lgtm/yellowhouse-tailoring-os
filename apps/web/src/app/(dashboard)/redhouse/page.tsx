'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShoppingBag, 
  Cpu, 
  Package, 
  Award, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Compass, 
  ExternalLink,
  Power,
  Sliders,
  CheckCircle2,
  Boxes,
  Plus,
  Settings
} from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  REGISTERED_PLUGINS, 
  getTenantPluginSettings, 
  setPluginEnabledState, 
  RedHousePluginManifest 
} from '@/lib/plugin-registry';
import { useToast } from '@/components/toast-context';

const ICON_MAP: Record<string, any> = {
  ShoppingBag,
  Cpu,
  Package,
  Award,
  Sparkles
};

export default function RedHouseHubPage() {
  const toast = useToast();
  const [plugins, setPlugins] = useState<RedHousePluginManifest[]>(REGISTERED_PLUGINS);
  const [pluginStates, setPluginStates] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    setPluginStates(getTenantPluginSettings());
  }, []);

  const handleTogglePlugin = (e: React.MouseEvent, pluginId: string, currentEnabled: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !currentEnabled;
    const updated = setPluginEnabledState(pluginId, nextState);
    setPluginStates(updated);

    const plugin = REGISTERED_PLUGINS.find((p) => p.id === pluginId);
    if (nextState) {
      toast.success(`${plugin?.name || 'Plugin'} enabled in your atelier.`);
    } else {
      toast.info(`${plugin?.name || 'Plugin'} disabled. Core YellowHouse operations remain unchanged.`);
    }
  };

  const filteredPlugins = plugins.filter((p) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ENABLED') return pluginStates[p.id] !== false;
    if (activeFilter === 'DISABLED') return pluginStates[p.id] === false;
    return p.category === activeFilter;
  });

  const enabledCount = plugins.filter((p) => pluginStates[p.id] !== false).length;

  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-8 animate-fade-in pb-16">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RedHouse OS (Plugins)', active: true }
        ]}
      />

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-rose-500/30 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
            <Boxes className="w-3.5 h-3.5" />
            <span>Extensible Modular Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">RedHouse OS</span> Plugin Marketplace
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Every feature is an independent, hot-swappable plugin. Enable high-tech machine rentals, 3D tech pack marketplaces, or artisan bidding whenever your atelier is ready — without disturbing core bespoke workflows.
          </p>

          <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {enabledCount} of {plugins.length} Plugins Active</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-rose-400" /> Zero Core Disruption</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /> Instant Route Sandboxing</span>
          </div>
        </div>
      </div>

      {/* Plugin Filters & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ENABLED', 'DISABLED', 'DESIGN', 'EQUIPMENT', 'SUPPLY', 'PRODUCTION', 'SERVICES'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 self-end sm:self-auto">
          <span>Toggle switch to activate or deactivate any module</span>
        </div>
      </div>

      {/* 5 Layer Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin) => {
          const Icon = ICON_MAP[plugin.iconName] || Sparkles;
          const isEnabled = pluginStates[plugin.id] !== false;

          return (
            <div
              key={plugin.id}
              className={`group glass-card rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                isEnabled
                  ? 'border-rose-500/30 hover:border-rose-500/60 bg-gradient-to-b from-rose-950/20 via-slate-900/60 to-slate-950 hover:shadow-2xl'
                  : 'border-slate-800/80 bg-slate-950/40 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="space-y-4">
                {/* Header & Toggle */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${isEnabled ? 'text-rose-400' : 'text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                      v{plugin.version}
                    </span>

                    {/* Plugin On/Off Switch */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlugin(e, plugin.id, isEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                      title={isEnabled ? 'Click to disable plugin' : 'Click to enable plugin'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                      {plugin.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {plugin.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{plugin.statsMetric}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {plugin.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {plugin.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                {isEnabled ? (
                  <Link
                    href={plugin.route}
                    className="w-full flex items-center justify-between text-rose-400 hover:text-rose-300 group/btn"
                  >
                    <span>Launch Plugin Portal</span>
                    <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1.5 transition-transform" />
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleTogglePlugin(e, plugin.id, false)}
                    className="w-full flex items-center justify-between text-slate-500 hover:text-white"
                  >
                    <span>Plugin Disabled — Click to Activate</span>
                    <Power className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
