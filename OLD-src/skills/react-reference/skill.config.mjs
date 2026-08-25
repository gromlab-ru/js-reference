const references = "src/references"
const reactVite = `${references}/apps/react-vite`
const languages = `${references}/languages`
const technologies = `${references}/technologies`

export default {
  schemaVersion: 2,
  entries: [
    // Skill
    { to: "SKILL.md", from: "src/skills/react-reference/SKILL.md" },

    // Architecture
    { to: "references/architecture", from: `${reactVite}/architecture` },
    { to: "references/failure-handling.md", from: `${references}/failure-handling.md` },

    // React UI
    { to: "references/react-ui", from: `${reactVite}/react-ui` },
    { to: "references/code-style.md", from: `${references}/code-style.md` },
    { to: "references/languages/html.md", from: `${languages}/html.md` },
    { to: "references/languages/javascript.md", from: `${languages}/javascript.md` },
    { to: "references/languages/jsx-tsx.md", from: `${languages}/jsx-tsx.md` },
    { to: "references/languages/typescript", from: `${languages}/typescript` },

    // Forms
    { to: "references/forms", from: `${reactVite}/forms` },

    // Styling
    { to: "references/styling", from: `${reactVite}/styling` },
    { to: "references/languages/postcss", from: `${languages}/postcss` },

    // Icons
    { to: "references/icons", from: `${reactVite}/icons` },
    { to: "references/technologies/svg-sprites.md", from: `${technologies}/svg-sprites.md` },

    // Data And Integrations
    { to: "references/data-integrations", from: `${reactVite}/data-integrations` },
    { to: "references/technologies/rest-api", from: `${technologies}/rest-api` },
    { to: "references/technologies/swr/get-data.md", from: `${technologies}/swr/get-data.md` },
    { to: "references/technologies/swr/subscriptions.md", from: `${technologies}/swr/subscriptions.md` },
    { to: "references/technologies/swr/examples", from: `${technologies}/swr/examples` },

    // Routing
    { to: "references/routing", from: `${reactVite}/routing` },

    // Platform
    { to: "references/platform", from: `${reactVite}/platform` },

    // Quality
    { to: "references/quality", from: `${reactVite}/quality` },

    // Examples
    { to: "references/examples", from: `${reactVite}/examples`, rewrite: false },
  ],
}
