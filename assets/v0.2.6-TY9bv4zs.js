import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added support for maps with separate building foundations tiles.`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Put a `,(0,n.jsx)(t.code,{children:`<city-code>_foundations.pmtiles`}),` file in your zip and Railyard will handle the rest.`]}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.li,{children:`The Map Loader will now show ocean depth by default (if the map includes it)`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where all download counts on Railyard were showing as 0`}),`
`,(0,n.jsx)(t.li,{children:`Fixed a bug where park and airport colors may occasionally not show up for modded maps by checking the API for colors if available`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};