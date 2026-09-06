import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,h3:`h3`,li:`li`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r,{type:`features`,children:[(0,n.jsx)(t.h3,{children:`Demand`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added a new prepare_osrm function to build a local OSRM server via Docker`}),`
`,(0,n.jsxs)(t.li,{children:[`Added a new IGNORE_SCHEMA parameter to avoid loading/saving schema files`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`This may break adding special demand, but you can apply most methods without issue in this mode`}),`
`]}),`
`]}),`
`]})]}),`
`,(0,n.jsxs)(r,{type:`improvements`,children:[(0,n.jsx)(t.h3,{children:`MapGen`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Optimized ocean depth gridding`}),`
`,(0,n.jsx)(t.li,{children:`All map files now strictly clip to the bounding box`}),`
`]}),(0,n.jsx)(t.h3,{children:`Demand`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Made `,(0,n.jsx)(t.code,{children:`consolidate_pops`}),` method more efficient and now ignores all special demand types`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`_load_schema`}),` now allows users to specify an exponent dictionary to use instead of Depot's default`]}),`
`]})]}),`
`,(0,n.jsxs)(r,{type:`bugfixes`,children:[(0,n.jsx)(t.h3,{children:`Demand`}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Various bugfixes for `,(0,n.jsx)(t.code,{children:`create_description`})]}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed `,(0,n.jsx)(t.code,{children:`scale_demand`}),` to ignore all special demand types`]}),`
`]})]})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};