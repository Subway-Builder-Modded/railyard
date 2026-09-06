import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added support for `,(0,n.jsx)(t.code,{children:`buildings_index.bin`}),` (post 1.3.0 map building index format)`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Railyard now loads the `,(0,n.jsx)(t.code,{children:`.bin`}),` or `,(0,n.jsx)(t.code,{children:`.json`}),` index conditionally depending on the user's installed game version`]}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.li,{children:`Added country-name search (including endonyms such as 日本, Eesti, etc.) for maps`}),`
`,(0,n.jsx)(t.li,{children:`Added support for rendering building foundations for modded maps`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Persist cache of asset versions to disk and use conditional fetches via ETags to reduce Github API request churn`}),`
`,(0,n.jsxs)(t.li,{children:[`Maps can now set `,(0,n.jsx)(t.code,{children:`minZoom`}),`, `,(0,n.jsx)(t.code,{children:`maxZoom`}),`, and `,(0,n.jsx)(t.code,{children:`demandDotScaling`}),` in their `,(0,n.jsx)(t.code,{children:`config.json`})]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed issue where newly released assets without passing integrity could be installed via update`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed game version dependency parsing to honor Custom JSON version expressions over `,(0,n.jsx)(t.code,{children:`manifest.json`}),` when provided`]}),`
`,(0,n.jsx)(t.li,{children:`Fixed the custom colors map layer not working properly`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`notes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Reduced local clone size of registry repository from ~1.4 GB to around ~300MB`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Large PNG/JPG are now automatically replaced with WebP`}),`
`,(0,n.jsx)(t.li,{children:`App-unused files are now sequestered to a separate branch`}),`
`,(0,n.jsx)(t.li,{children:`Local registry no longer clones tags, reducing .git size`}),`
`]}),`
`]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};