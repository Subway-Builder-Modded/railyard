import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,li:`li`,p:`p`,ul:`ul`,...e.components},{ChangelogSection:r,Warning:i}=t;return r||a(`ChangelogSection`,!0),i||a(`Warning`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added a loading screen on app startup`}),`
`,(0,n.jsx)(t.li,{children:`Added light mode`}),`
`,(0,n.jsx)(t.li,{children:`Added persistent search filters (search state will remain even if you visit another page, including tags and search query)`}),`
`]})}),`
`,(0,n.jsxs)(r,{type:`improvements`,children:[(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Fixed an issue where Railyard wouldn't work on some distros due to them not supporting `,(0,n.jsx)(t.code,{children:`libwebkit2gtk-4.0`})]}),`
`]}),(0,n.jsx)(i,{children:(0,n.jsxs)(t.p,{children:[`This means there are now two builds for Linux. `,(0,n.jsx)(t.code,{children:`current`}),` is built targeting `,(0,n.jsx)(t.code,{children:`libwebkit2gtk-4.1`}),`, whereas `,(0,n.jsx)(t.code,{children:`legacy`}),` is built targeting `,(0,n.jsx)(t.code,{children:`libwebkit2gtk-4.0`}),`. Make sure you install the correct one!`]})}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added an auto-updater (toggleable in settings)`}),`
`,(0,n.jsxs)(t.li,{children:[`Removed GitHub authentication, as `,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/registry`,children:`the Registry`}),` is now public`]}),`
`,(0,n.jsx)(t.li,{children:`Added static download counts to the Registry. Download counts within Railyard will now utilize that as a more reliable source of data`}),`
`,(0,n.jsxs)(t.li,{children:[`Updated tagging for maps (Level of Detail / Source Quality) to replace ambiguous high/medium/low-detail (see the `,(0,n.jsx)(t.a,{href:`/railyard/docs/latest/data-quality`,children:`Data Quality guide`}),`)`]}),`
`]})]}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed installed assets not being displayed on initial load-in`}),`
`,(0,n.jsx)(t.li,{children:`Fixed multiple parallel downloads sometimes leading to crashes`}),`
`,(0,n.jsx)(t.li,{children:`Fixed download counts displaying total downloads for all assets for a release (rather than just the asset ZIP)`}),`
`,(0,n.jsx)(t.li,{children:`Fixed maps having a download count of 0`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where updating Railyard would delete all installed content`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};