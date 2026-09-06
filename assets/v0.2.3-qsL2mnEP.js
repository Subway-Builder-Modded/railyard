import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added `,(0,n.jsx)(t.code,{children:`.railyard_{asset_type}`}),` shared directory support for maps. Assets can now include this folder in their ZIP and Railyard will preserve the files there and place them in the asset's installed directory`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Library`}),` and `,(0,n.jsx)(t.strong,{children:`Browse`}),` counts now adapt to current filter state, showing number of assets matching tags based on the current filter set`]}),`
`,(0,n.jsx)(t.li,{children:`Added a credits section within the app (with maintainers and supporters listed)`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Changed the GitHub permission error toast to a dialogue with a link to the documentation`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed missing dependency that caused crashes on map imports, updates, etc.`}),`
`,(0,n.jsx)(t.li,{children:`Fixed download button being enabled even if an asset was not compatible with the current game version`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed country flags not rendering on `,(0,n.jsx)(t.strong,{children:`Browse`}),` and `,(0,n.jsx)(t.strong,{children:`Home`})]}),`
`,(0,n.jsx)(t.li,{children:`Fixed a bug where the game could be launched twice (if the initial launch was delayed)`}),`
`,(0,n.jsx)(t.li,{children:`Fixed laggy search caused by excessive rendering`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where maps were downloadable despite not having passed an integrity check`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where new assets were not shown in the app due to localization inconsistencies in date mapping`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};