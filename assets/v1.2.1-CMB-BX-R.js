import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,h3:`h3`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r,{type:`features`,children:[(0,n.jsx)(t.h3,{children:`Registry`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added a `,(0,n.jsx)(t.strong,{children:`Status`}),` filter to cover all listing states: `,(0,n.jsx)(t.code,{children:`Active`}),`, `,(0,n.jsx)(t.code,{children:`Deprecated`}),`, and `,(0,n.jsx)(t.code,{children:`Deleted`}),` (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/614`,children:`#614`}),`, `,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/624`,children:`#624`}),`)`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`Deprecated`}),` and `,(0,n.jsx)(t.code,{children:`Deleted`}),` listings each carry their own badge and color, and sort last when shown`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`Deleted`}),` listings also carry a notice on their detail page, and their analytics series is split at the point of deletion`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Added compatibility with per-version retirement and removal of published assets`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`Retired`}),` and `,(0,n.jsx)(t.code,{children:`Removed`}),` versions now appear in a listing's version history as `,(0,n.jsx)(t.strong,{children:`No Longer Available`}),`, but keep their changelog, release date, and download count (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/621`,children:`#621`}),`)`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Added hourly-derived 1d/3d download graphs and an hour-of-day seasonality view (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/620`,children:`#620`}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[`Added sorting by data quality, and added alphabetical sort as a generic tiebreakers (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/613`,children:`#613`}),`)`]}),`
`]})]}),`
`,(0,n.jsxs)(r,{type:`improvements`,children:[(0,n.jsx)(t.h3,{children:`General`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Grouped the documentation sidebar now that both suites have outgrown a flat list (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/631`,children:`#631`}),`)`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Registry docs are grouped into `,(0,n.jsx)(t.strong,{children:`Publishing`}),`, `,(0,n.jsx)(t.strong,{children:`Lifecycle`}),`, and `,(0,n.jsx)(t.strong,{children:`Ownership`}),`; Railyard docs into `,(0,n.jsx)(t.strong,{children:`Installing`}),`, `,(0,n.jsx)(t.strong,{children:`Using Railyard`}),`, and `,(0,n.jsx)(t.strong,{children:`Troubleshooting`})]}),`
`,(0,n.jsx)(t.li,{children:`Every page keeps the URL it was published under, so existing links still resolve`}),`
`]}),`
`]}),`
`]}),(0,n.jsx)(t.h3,{children:`Registry`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Published the full `,(0,n.jsxs)(t.a,{href:`/registry/docs/using-custom-url#field-reference`,children:[(0,n.jsx)(t.code,{children:`update.json`}),` field reference`]}),` for custom update sources, covering every field the Registry reads and when each is required (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/629`,children:`#629`}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[`Documented withdrawing a single version for GitHub Releases sources in `,(0,n.jsx)(t.a,{href:`/registry/docs/retiring-versions`,children:`Retiring Versions`})]}),`
`,(0,n.jsxs)(t.li,{children:[`Matched the documented Status filter classes and retirement colors to what the apps actually ship (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/628`,children:`#628`}),`)`]}),`
`]}),(0,n.jsx)(t.h3,{children:`Railyard`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added `,(0,n.jsx)(t.a,{href:`/railyard/docs/latest/listing-status-and-filters`,children:`Listing Status & Filters`}),`, covering the Compatibility and Status filter groups, the `,(0,n.jsx)(t.strong,{children:`Show Deleted Listings`}),` setting, and what happens to installed content when a listing is retired (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/630`,children:`#630`}),`)`]}),`
`]})]}),`
`,(0,n.jsxs)(r,{type:`bugfixes`,children:[(0,n.jsx)(t.h3,{children:`Registry`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Fixed the listing visibility rule so a retired listing is shown or hidden consistently across browse, search, and author pages (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/627`,children:`#627`}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[`Corrected the custom update source example, which used a download URL the Registry rejects and which would have left the version permanently uninstallable (`,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/pull/629`,children:`#629`}),`)`]}),`
`]})]})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};