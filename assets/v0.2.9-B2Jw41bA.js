import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added support for showing driving paths on modded maps (`,(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.a,{href:`https://github.com/martig7`,children:`gcm`})}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[`Improved handling of delayed Steam launches`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Railyard now watches for the Steam game process to launch after starting and timeouts after a minute of no gaming being seen to avoid hanging state`}),`
`,(0,n.jsx)(t.li,{children:`An in progress launch can now be cancelled`}),`
`]}),`
`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Expanded and hardened frontend logging`}),`
`,(0,n.jsx)(t.li,{children:`Overhauled map data quality reporting to be more granular and no longer rely on self-reports`}),`
`,(0,n.jsxs)(t.li,{children:[`Removed `,(0,n.jsx)(t.code,{children:`Level of Detail`}),` tags`]}),`
`,(0,n.jsx)(t.li,{children:`Asset conflicts are now per asset, meaning an approved replacement no longer gets superseded/dropped by a concurrent update`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed a bug where navigating away from the versions info of an asset would cause Railyard to black screen`}),`
`,(0,n.jsx)(t.li,{children:`Fixed a bug where the in-progress download toast would hang indefinitely`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed Steam not working on Linux due to missing paths (`,(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.a,{href:`https://github.com/mellowagain`,children:`Mari`})}),`)`]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};