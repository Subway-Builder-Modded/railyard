import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Enabled the building foundation depth layer`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Depths are at least 10m, and at most 80m`}),`
`,(0,n.jsxs)(t.li,{children:[`Values are calculated according to `,(0,n.jsx)(t.code,{children:`alpha * height * (height / min_width)^0.25`}),`, where `,(0,n.jsx)(t.code,{children:`alpha=0.25`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`This can be disabled if you wish to use the default 10m foundation for all buildings`}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Enabled use of GEBCO bathymetry data (toggleable)`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Enabled the ocean floor depth layer`}),`
`,(0,n.jsxs)(t.li,{children:[`Enabled ocean collisions`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Now, all track must be either elevated or at least 4m below the seafloor`}),`
`,(0,n.jsx)(t.li,{children:`Where there are no GEBCO data (coastal waters, rivers, lakes), a flat value of -4m is used`}),`
`]}),`
`]}),`
`]}),`
`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Clipped park polygons so that they do not overlap with aerodromes to avoid a visual bug when in 3D mode`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};