import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added `,(0,n.jsx)(t.code,{children:`.railyard_{asset_type}`}),` shared directory support for maps`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Assets can now include this folder in their `,(0,n.jsx)(t.code,{children:`.zip`}),` and Railyard will preserve the files there and place them in the asset's installed directory`]}),`
`]}),`
`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed download button enabled even if an asset was not compatible with the current game version (and added help text)`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed country flags not rendering on `,(0,n.jsx)(t.strong,{children:`Browse`}),`/`,(0,n.jsx)(t.strong,{children:`Home`})]}),`
`,(0,n.jsx)(t.li,{children:`Fixed a bug where the game could be launched twice (if the initial launch was delayed)`}),`
`,(0,n.jsx)(t.li,{children:`Fixed laggy search caused by eager rendering and excessive use of Fuse`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where a map was downloadable despite not having an integrity check`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where new assets were not shown on the frontend due to localization inconsistencies in date mapping`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};