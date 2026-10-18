# Mahmoud Elfeel - Developer Portfolio

This is my personal portfolio built with Next.js App Router, Chakra UI, Framer Motion, and WebGL shaders. It showcases my projects, skills, and experience in a modern, animated, responsive interface.

## Features

- Framer Motion animations and scroll effects
- Chakra UI component styling and theming
- 3D hero banner with WebGL shaders via `@react-three/fiber`
- Modular sections:
  - About Me with typing animation
  - Experience timeline
  - Expandable project cards
  - Visual skill tree
- Smooth scroll-driven `ParallaxBand` backgrounds
- Fully responsive for all screen sizes

## File Structure

```text
app/
├─ layout.tsx             # Global layout with Chakra
├─ page.tsx               # Homepage route
components/
├─ motion/                # Framer motion utilities (e.g. FadeIn)
├─ sections/              # About, Projects, Experience, etc.
├─ three/                 # ShaderPlane.tsx, Banner3D.tsx (3D hero)
├─ ui/                    # Reusable components (Footer, ParallaxBand, etc.)
lib/
├─ motionConfig.ts        # Shared motion easing/timing
public/
├─ bands/                 # Parallax background images
├─ hero.mp4               # Video asset
styles/
├─ globals.css            # Global styles and overrides
```

## Tech Stack

- Next.js App Router
- Chakra UI
- TypeScript
- Framer Motion
- Three.js / `@react-three/fiber`
- GLSL shaders
- Responsive layout

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/elephancy/Portfolio.git
   ```

2. Install dependencies:
   ```bash
   cd portfolio
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The site will be live at `http://localhost:3000`.

## Deployment

This project targets Cloudflare Workers through OpenNext, not the deprecated
`@cloudflare/next-on-pages` Pages adapter.

```bash
npm run build:cloudflare
npm run deploy:cloudflare
```

Cloudflare configuration lives in:

- `wrangler.jsonc`
- `open-next.config.ts`
- `next.config.ts`

Production deployments are owned by Cloudflare Builds through the repository
connection configured in the Cloudflare dashboard. Pushes to its production
branch build and deploy the Worker automatically; other branches can produce
preview versions. Manual Wrangler deployment remains available only for
recovery or first-time setup.

The repository explorer works without credentials and falls back to the
portfolio's bundled project data if GitHub is unavailable. For a higher GitHub
API rate limit, add `GITHUB_TOKEN` as a Cloudflare Worker secret.

Do not use `npx @cloudflare/next-on-pages` or `.vercel/output/static` for this
project; that setup is the old Pages build path and will not run the Next API
route correctly.

### Privacy-friendly analytics

The portfolio supports Umami Analytics without loading analytics code before
the visitor consents. Add the site in Umami, copy its website ID from the
tracking-code screen, and set:

```bash
NEXT_PUBLIC_UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000
NEXT_PUBLIC_UMAMI_SCRIPT_SRC=/telemetry/script.js
```

The integration records pageviews, Core Web Vitals, section reach, project
search/filter/navigation activity, preview engagement, recruiter conversion
steps, outbound repository/demo/CV/contact clicks, Elly outcomes, and scrubbed
client-error categories. It never records Elly question text. Analytics remains
unloaded until the visitor accepts it in the first-visit privacy dialog.
Visitors can change that choice later through the persistent footer Privacy
settings control. The tracker respects Do Not Track and excludes query strings
and URL hashes.

Optional Cloudflare Web Analytics and Sentry browser error monitoring use the
same consent decision:

```bash
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=
NEXT_PUBLIC_SENTRY_LOADER_URL=
```

Find the Cloudflare token under **Analytics & Logs → Web Analytics → Manage
site → JS snippet**. Find the Sentry Loader URL under **Project Settings →
Client Keys (DSN) → JavaScript Loader**. Leave either value blank to keep that
integration disabled. In Umami, use **Events → Properties** to break down event
data and **Funnels** to build:

```text
Project Opened → Repository Opened / Live Demo Opened → Contact Clicked
```

### Shareable portfolio state

The homepage keeps selected state in query parameters:

```text
/?project=anubis&mode=security&status=active&view=graph
```

## Preview

- About: typing animation with highlighted keywords
- Experience: timeline with role, date, and bullet points
- Projects: card grid with expandable details and tech stack
- Skills: interactive skill tree
- Hero: WebGL shader-based animated banner

## Contact

Mahmoud Elfeel  
Email: mahmoudelfeelig@gmail.com  
Website: https://elfeel.me  
GitHub: https://github.com/elephancy

## License

Source code is licensed under the GNU Affero General Public License v3.0 or
later (`AGPL-3.0-or-later`). See [LICENSE](./LICENSE).

Personal assets, screenshots, demo videos, logos, CV/resume files, and other
identity/portfolio media in `public/` are not licensed for reuse without
explicit permission unless a file-specific notice says otherwise.
