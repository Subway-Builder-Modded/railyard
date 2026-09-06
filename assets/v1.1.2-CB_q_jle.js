import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Allowed choice of road types when extracting roads`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`This should only ever be needed for big maps with absurd road density (like Tokyo)`}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Split foundations tiles into a separate PMTiles file (`,(0,n.jsx)(t.code,{children:`<city-code>_foundations.pmtiles`}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[`Uncapped the size of pmtiles by default`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Users can still choose to cap the size of building tiles via `,(0,n.jsx)(t.code,{children:`max_building_tile_size=<value>`}),`, which automatically will drop the smallest buildings until reaching the specified max size for each tile at each zoom`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Enabled new `,(0,n.jsx)(t.strong,{children:`Commercial`}),` map layer for Subway Builder versions `,(0,n.jsx)(t.code,{children:`>=1.4.5`})]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Optimized ocean depth index loop`}),`
`,(0,n.jsx)(t.li,{children:`Added check for building heights <= 0 and reverted those values to the default height`}),`
`,(0,n.jsxs)(t.li,{children:[`Removed unnecessary map layers, like roads (these are controlled by `,(0,n.jsx)(t.code,{children:`roads.geojson`}),`)`]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};