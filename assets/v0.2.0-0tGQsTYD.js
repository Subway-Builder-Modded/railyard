import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,h3:`h3`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r,{type:`features`,children:[(0,n.jsx)(t.h3,{children:`UI Overhaul`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Completely redesigned the Railyard UI with a new layout and visual style`}),`
`,(0,n.jsxs)(t.li,{children:[`Added 4 new themes (in place of the old high-contrast and soft ones): `,(0,n.jsx)(t.code,{children:`Coffee`}),`, `,(0,n.jsx)(t.code,{children:`Midnight`}),`, `,(0,n.jsx)(t.code,{children:`Crystal`}),`, and `,(0,n.jsx)(t.code,{children:`Forest`})]}),`
`,(0,n.jsx)(t.li,{children:`Added a new versions, changelog, and dependencies page for each individual asset`}),`
`]}),(0,n.jsx)(t.h3,{children:`Import Local Maps`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added support for importing local map ZIPs`}),`
`,(0,n.jsxs)(t.li,{children:[`Local maps are displayed on `,(0,n.jsx)(t.strong,{children:`Library`}),` with a `,(0,n.jsx)(t.strong,{children:`Local`}),` tag and are loaded alongside any Railyard-hosted maps`]}),`
`]}),(0,n.jsx)(t.h3,{children:`Profiles`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added support for multiple profiles`}),`
`,(0,n.jsx)(t.li,{children:`Individual profiles maintain separate sets of subscriptions and UI/System preferences`}),`
`,(0,n.jsx)(t.li,{children:`Archives of non-active profiles are maintained to allow quick switches between different profiles`}),`
`]}),(0,n.jsx)(t.h3,{children:`Dependencies`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added dependency resolution for mods`}),`
`,(0,n.jsx)(t.li,{children:`Mods can now declare another mod as a dependency, and all dependencies will automatically be installed`}),`
`]}),(0,n.jsx)(t.h3,{children:`Command-Line Arguments`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`You can now enable Subway Builder DevTools in the Railyard settings`}),`
`]})]}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Registry refreshes and downloaded asset extraction are now atomic to reduce risk of corrupted/mixed disk state on unexpected shutdown`}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Browse`}),` now displays a brief loading screen to eliminate lag/slow loading behavior on startup`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Library`}),` now displays city code for all maps`]}),`
`,(0,n.jsx)(t.li,{children:`Disabled modifying (installing, deleting, updating) content while the game is launched`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Fixed Ctrl+Click on an asset's `,(0,n.jsx)(t.strong,{children:`Browse`}),` card causing it to open up in an instanced browser window`]}),`
`,(0,n.jsx)(t.li,{children:`Fixed toast notifications being able to be picked up and moved around the screen`}),`
`,(0,n.jsxs)(t.li,{children:[`Command line argument insertion no longer replaces machine env when `,(0,n.jsx)(t.strong,{children:`DevTools`}),` is enabled`]}),`
`,(0,n.jsx)(t.li,{children:`Fixed fuzzy search being too lenient and matching on small subsets of strings`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`notes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`v0.2 documentation is live at `,(0,n.jsx)(t.a,{href:`https://subwaybuildermodded.com/railyard/docs/v0.2`,children:`https://subwaybuildermodded.com/railyard/docs/v0.2`})]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};