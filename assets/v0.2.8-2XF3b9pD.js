import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added Steam version compatibility for all three major operating systems`}),`
`,(0,n.jsx)(t.li,{children:`If the steam option is enabled, Railyard will attempt to autodetect the install path`}),`
`,(0,n.jsx)(t.li,{children:`Dev tools and Subway Builder logs are unavailable on Steam`}),`
`,(0,n.jsxs)(t.li,{children:[`Consistency pass on game launch semantics`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Game launch is now mutually exclusive with installing/importing content and profile swapping`}),`
`]}),`
`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Thumbnails now generate with the maps' native park layer`}),`
`,(0,n.jsx)(t.li,{children:`Author links now redirect to website author pages instead of the registry attribution link`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Fixed `,(0,n.jsx)(t.strong,{children:`Asset Status`}),` counts not being updated when sidebar sub-filters are applied`]}),`
`,(0,n.jsx)(t.li,{children:`Fixed thumbnail cache not respecting map version asset updates (thumbnails now regenerate each time a map's install is updated)`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};