# Tactical Command Deck UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Simulation Page into a high-fidelity "Tactical Command Deck" that matches the Landing Page's Slate/Cyan aesthetic and premium interactive feel.

**Architecture:** We will apply the landing page's global styles (background, grids, fonts) to the simulation page, then restyle the ScenarioPanel, PlanCard, and visualization components to use backdrop-blur panels and aviation-grade typography.

**Tech Stack:** React, Tailwind CSS, Lucide-React icons, SVG.

---

### Task 1: Apply Global Tactical Theme to SimulationPage

**Files:**
- Modify: `frontend/src/components/SimulationPage.jsx`

**Step 1: Replace background and layout styles**

Update the `SimulationPage` to use the landing page's background system.

```javascript
// Replace lines 40-45 with:
<div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30">
  {/* Enhanced Background with Brighter Blue Accents */}
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/15 blur-[160px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full" />
    <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
    <div className="absolute inset-0 opacity-[0.1]" 
         style={{ backgroundImage: 'radial-gradient(#334155 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
  </div>
```

**Step 2: Update Header to match Landing Page**

Align the logo, typography, and "K2 Ready" badge with the landing page header.

**Step 3: Commit**

git add frontend/src/components/SimulationPage.jsx
git commit -m "style: apply tactical background and header to simulation page"

---

### Task 2: Redesign Scenario Panel as "Pre-Flight Control"

**Files:**
- Modify: `frontend/src/components/ScenarioPanel.jsx`

**Step 1: Update Panel Container**

Use `bg-slate-950/80 backdrop-blur-xl border border-slate-800/50` for the container.

**Step 2: Style Inputs and Labels**

Use the high-detail label style: `text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]`.
Style select/inputs with `bg-slate-900 border-slate-800 text-slate-100`.

**Step 3: Update "Optimize" Button**

Mimic the landing page CTA: `bg-cyan-500 text-slate-950 font-black uppercase shadow-cyan-500/20`.

**Step 4: Commit**

git add frontend/src/components/ScenarioPanel.jsx
git commit -m "style: redesign scenario panel as pre-flight control"

---

### Task 3: Restyle PlanCards and Recommendation Badge

**Files:**
- Modify: `frontend/src/components/PlanCard.jsx`

**Step 1: Update Card Container**

Apply the backdrop-blur style. Use `border-cyan-500/30` for the K2 Recommended plan.

**Step 2: Update Typography**

Use bold, tracking-tighter headers. Add the "K2 Optimal Synthesis" styling from the landing page preview.

**Step 3: Commit**

git add frontend/src/components/PlanCard.jsx
git commit -m "style: restyle plan cards to match landing page preview"

---

### Task 4: Modernize GanttTimeline and GateDiagram Containers

**Files:**
- Modify: `frontend/src/components/GanttTimeline.jsx`
- Modify: `frontend/src/components/GateDiagram.jsx`
- Modify: `frontend/src/components/ExplainabilityPanel.jsx`

**Step 1: Apply Unified Container Style**

All three components should use the same backdrop-blur card style.

**Step 2: Refine Internal Borders**

Remove solid gray borders in favor of subtle `slate-800/50` separators.

**Step 3: Update Explainability Tabs**

Style tabs to look like high-end instrument selectors.

**Step 4: Commit**

git add frontend/src/components/GanttTimeline.jsx frontend/src/components/GateDiagram.jsx frontend/src/components/ExplainabilityPanel.jsx
git commit -m "style: unify visualization containers under tactical theme"

---

### Task 5: Add Finishing Polish and Interactive Micro-animations

**Files:**
- Modify: `frontend/src/components/SimulationPage.jsx`
- Modify: `frontend/src/App.jsx`

**Step 1: Add Glint Animation to Progress/Timeline**

Include the `@keyframes glint` CSS in the simulation page styles.

**Step 2: Add Slide-in animations to panels**

Wrap main components in `framer-motion` if available, or use standard CSS transition classes for entering state.

**Step 3: Commit**

git add frontend/src/components/SimulationPage.jsx
git commit -m "style: add glint animations and interactive polish"

---

**Plan complete and saved to `docs/plans/2026-04-08-tactical-ui-redesign.md`. 

**Which execution approach should I take?**
1. **Subagent-Driven (this session)**
2. **Parallel Session (separate)**