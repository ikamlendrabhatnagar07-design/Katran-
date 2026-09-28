# Katran

A circular fashion hackathon prototype built with HTML, CSS and vanilla JavaScript. Based on the supplied Manus export, with portable asset paths and a bundled replacement for the missing hero image.

## Run locally

Install Node.js 20 or newer, open a terminal in this folder, then run:

```sh
npm start
```

Open http://localhost:3000. No dependencies, API keys or installation step are needed.

## Features and limits

- Responsive landing page, material cards and interactive SVG dress studio.
- Choose silhouette, fabric, stencil, ink, scale and placement; estimated prices update immediately.
- Save and restore one design on the same browser/device; export a JSON design brief.
- Material board choices persist on this browser/device.
- This is a frontend demo. Listings, testimonials and impact figures are illustrative. No accounts, payment, shared database, pickup booking, actual orders or automatic maker communication are implemented. Local data does not sync between teammates.
- Original Manus metadata and ideas.md are retained for reference; they are not runtime requirements.

## Publish on GitHub

Repository: https://github.com/ikamlendrabhatnagar07-design/Katran-

In Settings > Pages choose Deploy from a branch, main, / (root). GitHub publishes the site after each push. Expected address: https://ikamlendrabhatnagar07-design.github.io/Katran-/

All runtime files are in the root, so no build service is required. npm run build also creates dist/ for other static hosts.

## Work together

Add your partner in repository Settings > Collaborators. Both teammates clone the repository. Before starting work run git pull; create a separate feature branch, commit changes, push it and open a pull request into main. Review each other's work before merging. Avoid editing the same files on the same branch simultaneously.

## Project files

- index.html: page content and SVG dress preview
- styles.css: responsive styling
- app.js: studio and local saving
- hero.svg and katran-icon.svg: bundled artwork and icon
- serve.cjs and build.cjs: dependency-free local server and static build

Run npm run check and npm run build before pushing. To use another static host, publish dist/.

## Expanded studio

Two original 2D fashion poses, skin-tone selection, plain SVG uploads (250 KB maximum), artwork rotation and text personalization. Drag or tap to position art/text; arrow keys move the selected layer. Save and JSON export include artwork, pose, text and placement. Existing saved designs remain supported. Generic fonts can render differently by device; production proofs should use approved outlined lettering. This does not import ibis Paint project files or provide a 3D fit simulation.

See [COMMERCE.md](COMMERCE.md) for checkout architecture, order schema, payment verification and a staged implementation plan. Payments are not connected.

