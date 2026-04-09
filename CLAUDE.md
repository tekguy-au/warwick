# Warwick — Claude Code Instructions

## Project
Child-friendly fictional spider character. Landing page with story snippets and email subscription capture. Audience: under 8s (parents landing here).

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Deployed on Vercel (`tekguy-aus-projects/spiderwarwick`)
- GitHub: `tekguy-au/warwick`

## Visual Identity
- Warm browns, amber/honey, cream (#fdf6ee background), gold sparkles
- Friendly, cosy, magical tone
- Warwick image: `/public/warwick.jpg` — fluffy spider, big eyes, warm colours

## Status
- Landing page live at https://spiderwarwick.vercel.app
- Domain TBC
- Social handles (IG, TikTok) TBC — add to footer/hero when confirmed

## Deploy
```
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_github" git push origin main
vercel --token $VERCEL_TOKEN --yes --scope tekguy-aus-projects
```
Vercel auto-deploys on push to main once GitHub connection is active.

## Rules
- Keep tone warm and child-appropriate at all times
- No dark themes, no scary content
- Subscription form has no backend yet — wire up when ready
