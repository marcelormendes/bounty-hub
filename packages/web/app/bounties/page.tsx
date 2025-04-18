// app/bounties/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import data from "./data.json";

/* -------------------------------------------------------------------------- */
/*  Demo data type                                                            */
/* -------------------------------------------------------------------------- */
export interface Bounty {
  id: string;
  title: string;
  description: string;
  price: number;    // price in dollars
  tags: string[];
}

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */
const LANGUAGES = ["js", "ruby", "java"];
const ROLES = ["backend", "frontend", "fullstack", "devops"];
const FRAMEWORKS = ["next", "react", "nest"];

export default function BountiesPage() {
  /* ────────── filter state ────────── */
  const [query, setQuery] = useState("");
  const [langSel, setLangSel] = useState<Set<string>>(new Set());
  const [roleSel, setRoleSel] = useState<Set<string>>(new Set());
  const [fwSel, setFwSel] = useState<Set<string>>(new Set());
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const bounties = data as Bounty[];

  /* ────────── generic toggle helper ────────── */
  const toggle = (setFn: React.Dispatch<React.SetStateAction<Set<string>>>) => 
    (val: string) => setFn(prev => {
      const nxt = new Set(prev);
      nxt.has(val) ? nxt.delete(val) : nxt.add(val);
      return nxt;
    });

  /* ────────── filtering logic ────────── */
  const shown = useMemo(() => {
    return bounties.filter((b) => {
      /*  query search in title */
      const qOK = !query || b.title.toLowerCase().includes(query.toLowerCase());

      /*  price */
      const priceOK =
        (!minP || b.price >= +minP) &&
        (!maxP || b.price <= +maxP);

      /*  tags  */
      const tagOK = (set: Set<string>) =>
        set.size === 0 || [...set].some((t) => b.tags.includes(t));

      return qOK && priceOK && tagOK(langSel) && tagOK(roleSel) && tagOK(fwSel);
    });
  }, [bounties, query, langSel, roleSel, fwSel, minP, maxP]);

  /* ────────── chips for selected filters ────────── */
  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (query)
    chips.push({ key: "q", label: query, clear: () => setQuery("") });

  langSel.forEach((l) =>
    chips.push({
      key: `l-${l}`,
      label: l,
      clear: () => setLangSel((s) => new Set([...s].filter((x) => x !== l))),
    })
  );
  
  roleSel.forEach((r) =>
    chips.push({
      key: `r-${r}`,
      label: r,
      clear: () => setRoleSel((s) => new Set([...s].filter((x) => x !== r))),
    })
  );
  
  fwSel.forEach((f) =>
    chips.push({
      key: `f-${f}`,
      label: f,
      clear: () => setFwSel((s) => new Set([...s].filter((x) => x !== f))),
    })
  );
  
  if (minP || maxP)
    chips.push({
      key: "price",
      label: `$${minP || 100} – $${maxP || "∞"}`,
      clear: () => { setMinP(""); setMaxP(""); },
    });

  const clearAll = () => {
    setQuery("");
    setLangSel(new Set());
    setRoleSel(new Set());
    setFwSel(new Set());
    setMinP("");
    setMaxP("");
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--ink-color)]">
      {/* Background silhouettes for atmosphere - only on the main background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-silhouette silhouette-1"></div>
        <div className="bg-silhouette silhouette-2"></div>
        <div className="bg-silhouette silhouette-3"></div>
        <div className="bg-silhouette silhouette-4"></div>
      </div>

      {/* Header */}
      <header className="border-b border-[var(--ink-color)] bg-[var(--paper-color)] px-6 py-4 shadow-md relative z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-[url('/sheriff-badge.svg')] bg-contain bg-center bg-no-repeat mr-3"></div>
            <h1 className="text-3xl font-['Rye']">BountyHub</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xl font-['IM_Fell_English']">Leo</span>
            <div className="w-9 h-9 rounded-full bg-[var(--ink-color)] border-2 border-[var(--accent-color)]" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page title with Western decoration */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-['Rye'] text-[var(--paper-color)]">Available Bounties</h2>
        </div>

        {/* Search and filter section - styled like the reference image */}
        <div className="bg-[var(--paper-color)] border border-[var(--ink-color)] rounded-lg mb-8 shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-5 border-b border-[var(--ink-color)]">
            <label htmlFor="search" className="block mb-2 font-semibold text-lg font-['IM_Fell_English']">Track Down a Bounty:</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[url('/gun.svg')] bg-contain bg-center bg-no-repeat"></div>
              <Input
                id="search"
                placeholder="Enter bounty name or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 border-[var(--ink-color)] bg-white/80 focus-visible:ring-[var(--accent-color)]"
              />
            </div>
          </div>

          {/* Filter section with collapsible UI */}
          <Collapsible className="p-5 w-full" defaultOpen={true}>
            <div className="border-b border-[var(--ink-color)] pb-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold font-['Playfair_Display'] text-black">Filters</h3>
                  {/* Filter chips moved here and always visible */}
                  <div className="flex flex-wrap gap-1 max-w-[500px] overflow-x-auto py-1">
                    {chips.map(({ key, label, clear }) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#8B4513] bg-[#8B4513] text-white text-xs font-['IM_Fell_English']"
                      >
                        {label}
                        <button 
                          onClick={clear}
                          className="ml-1 w-3 h-3 rounded-full flex items-center justify-center hover:bg-[#6b3008] border border-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  {chips.length > 0 && (
                    <button 
                      onClick={clearAll}
                      className="px-4 py-1 bg-[var(--paper-color)] border border-[var(--ink-color)] text-[var(--ink-color)] rounded font-['IM_Fell_English'] hover:bg-[var(--ink-color)] hover:text-[var(--paper-color)] transition-colors text-sm"
                    >
                      Clear All
                    </button>
                  )}
                  <CollapsibleTrigger className="flex items-center gap-1 text-black hover:text-[var(--ink-color)] transition-colors">
                    <span className="font-['IM_Fell_English']">More Options</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 data-[state=open]:rotate-180">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </CollapsibleTrigger>
                </div>
              </div>
            </div>
            
            <CollapsibleContent className="pt-4">
              <div className="space-y-6">
                {/* Salary Range Slider */}
                <div className="border border-[var(--ink-color)] rounded-md p-4 bg-white/50">
                  <h4 className="text-lg font-semibold mb-3 font-['Playfair_Display'] text-[var(--accent-color)]">Reward</h4>
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-['IM_Fell_English'] text-sm">${minP || '100'}</span>
                      <span className="font-['IM_Fell_English'] text-sm">${maxP || '2000'}+</span>
                    </div>
                    <div className="grid gap-4">
                      <Slider
                        defaultValue={[100, 2000]}
                        min={100}
                        max={2000}
                        step={25}
                        value={[minP ? parseInt(minP) : 100, maxP ? parseInt(maxP) : 2000]}
                        onValueChange={(values) => {
                          setMinP(values[0].toString());
                          setMaxP(values[1].toString());
                        }}
                        className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-[var(--ink-color)] [&_[role=slider]]:bg-[var(--paper-color)]"
                      />
                    </div>
                  </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-sm font-['IM_Fell_English'] mb-1 block">Min ($)</label>
                    <Input
                      type="number"
                      placeholder="100"
                      min="100"
                      step="25"
                      value={minP}
                      onChange={(e) => setMinP(e.target.value)}
                      className="w-full border-[var(--ink-color)] bg-white/80"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-['IM_Fell_English'] mb-1 block">Max ($)</label>
                    <Input
                      type="number"
                      placeholder="2000"
                      min="100"
                      step="25"
                      value={maxP}
                      onChange={(e) => setMaxP(e.target.value)}
                      className="w-full border-[var(--ink-color)] bg-white/80"
                    />
                  </div>
                </div>
              </div>

              {/* Languages, Roles, and Frameworks in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Languages */}
                <div className="border border-[var(--ink-color)] rounded-md p-4 bg-white/50">
                  <h4 className="text-lg font-semibold mb-3 font-['Playfair_Display'] text-[var(--accent-color)]">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggle(setLangSel)(lang)}
                        className={`px-3 py-1 rounded-full border ${langSel.has(lang) 
                          ? 'bg-[#8B4513] text-white border-[#8B4513]' 
                          : 'bg-white/80 text-[var(--ink-color)] border-[var(--ink-color)]'} 
                          transition-colors font-['IM_Fell_English'] text-sm capitalize`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div className="border border-[var(--ink-color)] rounded-md p-4 bg-white/50">
                  <h4 className="text-lg font-semibold mb-3 font-['Playfair_Display'] text-[var(--accent-color)]">Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => toggle(setRoleSel)(role)}
                        className={`px-3 py-1 rounded-full border ${roleSel.has(role) 
                          ? 'bg-[#8B4513] text-white border-[#8B4513]' 
                          : 'bg-white/80 text-[var(--ink-color)] border-[var(--ink-color)]'} 
                          transition-colors font-['IM_Fell_English'] text-sm capitalize`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frameworks */}
                <div className="border border-[var(--ink-color)] rounded-md p-4 bg-white/50">
                  <h4 className="text-lg font-semibold mb-3 font-['Playfair_Display'] text-[var(--accent-color)]">Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {FRAMEWORKS.map((fw) => (
                      <button
                        key={fw}
                        onClick={() => toggle(setFwSel)(fw)}
                        className={`px-3 py-1 rounded-full border ${fwSel.has(fw) 
                          ? 'bg-[#8B4513] text-white border-[#8B4513]' 
                          : 'bg-white/80 text-[var(--ink-color)] border-[var(--ink-color)]'} 
                          transition-colors font-['IM_Fell_English'] text-sm capitalize`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected filter chips moved to the header area */}
          </CollapsibleContent>
        </Collapsible>
        </div>

        {/* Bounty cards - styled like small wanted posters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((bounty) => (
            <Link key={bounty.id} href={`/bounties/${bounty.id}`} className="block">
              <Card className="bg-[var(--paper-color)] border-2 border-[var(--ink-color)] hover:shadow-lg transition-shadow h-full overflow-hidden">
                <CardContent className="p-0">
                  {/* Reward banner */}
                  <div className="bg-[var(--accent-color)] text-[var(--paper-color)] py-2 px-4 font-['Rye'] text-center">
                    <div className="text-lg">REWARD</div>
                    <div className="text-2xl">${bounty.price}</div>
                  </div>
                  
                  <div className="p-4 relative">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--ink-color)]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--ink-color)]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--ink-color)]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--ink-color)]"></div>
                    
                    <h3 className="uppercase tracking-wide font-['Rye'] text-xl mb-2 text-[var(--ink-color)]">{bounty.title}</h3>
                    
                    <div className="border-t border-b border-[var(--ink-color)] my-2 py-2">
                      <p className="text-sm line-clamp-3 font-['IM_Fell_English']">{bounty.description}</p>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {bounty.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-[var(--ink-color)] text-xs bg-[var(--background-color)] text-[var(--paper-color)]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* Empty state */}
        {shown.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-[url('/horseshoe.svg')] bg-contain bg-center bg-no-repeat opacity-50"></div>
            <h3 className="text-2xl font-['Rye'] text-[var(--paper-color)] mb-2">No Bounties Found</h3>
            <p className="text-[var(--paper-color)] font-['IM_Fell_English']">Try adjusting your search terms or filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-[var(--ink-color)] p-4 text-center text-[var(--paper-color)]">
        <div className="container mx-auto">
          <p className="text-sm font-['IM_Fell_English']">BountyHub • The Wild West of Freelancing • &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
}
