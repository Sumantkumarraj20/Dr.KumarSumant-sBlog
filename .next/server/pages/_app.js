/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./context/authContext.tsx":
/*!*********************************!*\
  !*** ./context/authContext.tsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/supabaseClient */ \"(pages-dir-node)/./lib/supabaseClient.ts\");\n// context/AuthContext.tsx\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n    user: null,\n    session: null,\n    loading: true,\n    profile: null\n});\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [session, setSession] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const [profile, setProfile] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"AuthProvider.useEffect\": ()=>{\n            // Get current session\n            _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.getSession().then({\n                \"AuthProvider.useEffect\": ({ data })=>{\n                    setSession(data.session);\n                    setUser(data.session?.user ?? null);\n                    setProfile(data.session?.user ? _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.supabase.from('profiles').select('*').eq('id', data.session.user.id).single().then({\n                        \"AuthProvider.useEffect\": ({ data })=>setProfile(data)\n                    }[\"AuthProvider.useEffect\"]) : null);\n                    setLoading(false);\n                }\n            }[\"AuthProvider.useEffect\"]);\n            // Listen for auth state changes\n            const { data: listener } = _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.onAuthStateChange({\n                \"AuthProvider.useEffect\": (_event, newSession)=>{\n                    setSession(newSession);\n                    setUser(newSession?.user ?? null);\n                    setProfile(newSession?.user ? _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.supabase.from('profiles').select('*').eq('id', newSession.user.id).single().then({\n                        \"AuthProvider.useEffect\": ({ data })=>setProfile(data)\n                    }[\"AuthProvider.useEffect\"]) : null);\n                    setLoading(false);\n                }\n            }[\"AuthProvider.useEffect\"]);\n            return ({\n                \"AuthProvider.useEffect\": ()=>{\n                    listener.subscription.unsubscribe();\n                }\n            })[\"AuthProvider.useEffect\"];\n        }\n    }[\"AuthProvider.useEffect\"], []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            session,\n            profile,\n            loading\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\context\\\\authContext.tsx\",\n        lineNumber: 48,\n        columnNumber: 5\n    }, undefined);\n};\nconst useAuth = ()=>(0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHQvYXV0aENvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwwQkFBMEI7O0FBQ3dEO0FBQ2pDO0FBU2pELE1BQU1LLDRCQUFjTCxvREFBYUEsQ0FBa0I7SUFDakRNLE1BQU07SUFDTkMsU0FBUztJQUNUQyxTQUFTO0lBQ1RDLFNBQVM7QUFDWDtBQUVPLE1BQU1DLGVBQWUsQ0FBQyxFQUFFQyxRQUFRLEVBQTJCO0lBQ2hFLE1BQU0sQ0FBQ0wsTUFBTU0sUUFBUSxHQUFHVCwrQ0FBUUEsQ0FBYTtJQUM3QyxNQUFNLENBQUNJLFNBQVNNLFdBQVcsR0FBR1YsK0NBQVFBLENBQWE7SUFDbkQsTUFBTSxDQUFDSyxTQUFTTSxXQUFXLEdBQUdYLCtDQUFRQSxDQUFDO0lBQ3ZDLE1BQU0sQ0FBQ00sU0FBU00sV0FBVyxHQUFHWiwrQ0FBUUEsQ0FBYTtJQUVuREQsZ0RBQVNBO2tDQUFDO1lBQ1Isc0JBQXNCO1lBQ3RCRSx5REFBUUEsQ0FBQ1ksSUFBSSxDQUFDQyxVQUFVLEdBQUdDLElBQUk7MENBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUU7b0JBQ3ZDTixXQUFXTSxLQUFLWixPQUFPO29CQUN2QkssUUFBUU8sS0FBS1osT0FBTyxFQUFFRCxRQUFRO29CQUM5QlMsV0FBV0ksS0FBS1osT0FBTyxFQUFFRCxPQUFPRix5REFBUUEsQ0FBQ2dCLElBQUksQ0FBQyxZQUFZQyxNQUFNLENBQUMsS0FBS0MsRUFBRSxDQUFDLE1BQU1ILEtBQUtaLE9BQU8sQ0FBQ0QsSUFBSSxDQUFDaUIsRUFBRSxFQUFFQyxNQUFNLEdBQUdOLElBQUk7a0RBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUUsR0FBS0osV0FBV0k7bURBQVM7b0JBQ3JKTCxXQUFXO2dCQUNiOztZQUVBLGdDQUFnQztZQUNoQyxNQUFNLEVBQUVLLE1BQU1NLFFBQVEsRUFBRSxHQUFHckIseURBQVFBLENBQUNZLElBQUksQ0FBQ1UsaUJBQWlCOzBDQUFDLENBQUNDLFFBQVFDO29CQUNsRWYsV0FBV2U7b0JBQ1hoQixRQUFRZ0IsWUFBWXRCLFFBQVE7b0JBQzVCUyxXQUFXYSxZQUFZdEIsT0FBT0YseURBQVFBLENBQUNnQixJQUFJLENBQUMsWUFBWUMsTUFBTSxDQUFDLEtBQUtDLEVBQUUsQ0FBQyxNQUFNTSxXQUFXdEIsSUFBSSxDQUFDaUIsRUFBRSxFQUFFQyxNQUFNLEdBQUdOLElBQUk7a0RBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUUsR0FBS0osV0FBV0k7bURBQVM7b0JBQ2pKTCxXQUFXO2dCQUNiOztZQUVBOzBDQUFPO29CQUNMVyxTQUFTSSxZQUFZLENBQUNDLFdBQVc7Z0JBQ25DOztRQUNGO2lDQUFHLEVBQUU7SUFFTCxxQkFDRSw4REFBQ3pCLFlBQVkwQixRQUFRO1FBQUNDLE9BQU87WUFBRTFCO1lBQU1DO1lBQVNFO1lBQVNEO1FBQVE7a0JBQzVERzs7Ozs7O0FBR1AsRUFBRTtBQUVLLE1BQU1zQixVQUFVLElBQU1oQyxpREFBVUEsQ0FBQ0ksYUFBYSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxLdW1hciBTdW1hbnRcXGhlYWx0aF9ibG9nX3N0YXJ0ZXJcXGNvbnRleHRcXGF1dGhDb250ZXh0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb250ZXh0L0F1dGhDb250ZXh0LnRzeFxyXG5pbXBvcnQgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VFZmZlY3QsIHVzZVN0YXRlLCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSAnLi4vbGliL3N1cGFiYXNlQ2xpZW50JztcclxuXHJcbmludGVyZmFjZSBBdXRoQ29udGV4dFR5cGUge1xyXG4gIHVzZXI6IGFueSB8IG51bGw7XHJcbiAgc2Vzc2lvbjogYW55IHwgbnVsbDtcclxuICBsb2FkaW5nOiBib29sZWFuO1xyXG4gIHByb2ZpbGU/OiBhbnkgfCBudWxsO1xyXG59XHJcblxyXG5jb25zdCBBdXRoQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8QXV0aENvbnRleHRUeXBlPih7XHJcbiAgdXNlcjogbnVsbCxcclxuICBzZXNzaW9uOiBudWxsLFxyXG4gIGxvYWRpbmc6IHRydWUsXHJcbiAgcHJvZmlsZTogbnVsbCxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQXV0aFByb3ZpZGVyID0gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcclxuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZTxhbnkgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbc2Vzc2lvbiwgc2V0U2Vzc2lvbl0gPSB1c2VTdGF0ZTxhbnkgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbcHJvZmlsZSwgc2V0UHJvZmlsZV0gPSB1c2VTdGF0ZTxhbnkgfCBudWxsPihudWxsKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIC8vIEdldCBjdXJyZW50IHNlc3Npb25cclxuICAgIHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpLnRoZW4oKHsgZGF0YSB9KSA9PiB7XHJcbiAgICAgIHNldFNlc3Npb24oZGF0YS5zZXNzaW9uKTtcclxuICAgICAgc2V0VXNlcihkYXRhLnNlc3Npb24/LnVzZXIgPz8gbnVsbCk7XHJcbiAgICAgIHNldFByb2ZpbGUoZGF0YS5zZXNzaW9uPy51c2VyID8gc3VwYWJhc2UuZnJvbSgncHJvZmlsZXMnKS5zZWxlY3QoJyonKS5lcSgnaWQnLCBkYXRhLnNlc3Npb24udXNlci5pZCkuc2luZ2xlKCkudGhlbigoeyBkYXRhIH0pID0+IHNldFByb2ZpbGUoZGF0YSkpIDogbnVsbCk7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgICAvLyBMaXN0ZW4gZm9yIGF1dGggc3RhdGUgY2hhbmdlc1xyXG4gICAgY29uc3QgeyBkYXRhOiBsaXN0ZW5lciB9ID0gc3VwYWJhc2UuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZSgoX2V2ZW50LCBuZXdTZXNzaW9uKSA9PiB7XHJcbiAgICAgIHNldFNlc3Npb24obmV3U2Vzc2lvbik7XHJcbiAgICAgIHNldFVzZXIobmV3U2Vzc2lvbj8udXNlciA/PyBudWxsKTtcclxuICAgICAgc2V0UHJvZmlsZShuZXdTZXNzaW9uPy51c2VyID8gc3VwYWJhc2UuZnJvbSgncHJvZmlsZXMnKS5zZWxlY3QoJyonKS5lcSgnaWQnLCBuZXdTZXNzaW9uLnVzZXIuaWQpLnNpbmdsZSgpLnRoZW4oKHsgZGF0YSB9KSA9PiBzZXRQcm9maWxlKGRhdGEpKSA6IG51bGwpO1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGxpc3RlbmVyLnN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgc2Vzc2lvbiwgcHJvZmlsZSwgbG9hZGluZyB9fT5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUF1dGggPSAoKSA9PiB1c2VDb250ZXh0KEF1dGhDb250ZXh0KTtcclxuIl0sIm5hbWVzIjpbImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJzdXBhYmFzZSIsIkF1dGhDb250ZXh0IiwidXNlciIsInNlc3Npb24iLCJsb2FkaW5nIiwicHJvZmlsZSIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwic2V0VXNlciIsInNldFNlc3Npb24iLCJzZXRMb2FkaW5nIiwic2V0UHJvZmlsZSIsImF1dGgiLCJnZXRTZXNzaW9uIiwidGhlbiIsImRhdGEiLCJmcm9tIiwic2VsZWN0IiwiZXEiLCJpZCIsInNpbmdsZSIsImxpc3RlbmVyIiwib25BdXRoU3RhdGVDaGFuZ2UiLCJfZXZlbnQiLCJuZXdTZXNzaW9uIiwic3Vic2NyaXB0aW9uIiwidW5zdWJzY3JpYmUiLCJQcm92aWRlciIsInZhbHVlIiwidXNlQXV0aCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./context/authContext.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./context/languageContext.tsx":
/*!*************************************!*\
  !*** ./context/languageContext.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   LanguageProvider: () => (/* binding */ LanguageProvider),\n/* harmony export */   useLanguage: () => (/* binding */ useLanguage)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst LanguageContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst LanguageProvider = ({ children })=>{\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const [language, setLanguage] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(router.locale || 'en');\n    const changeLanguage = (lng)=>{\n        // Use Next router to change locale; let next-i18next handle i18n initialization\n        if (router.locale !== lng) {\n            setLanguage(lng);\n            router.push(router.pathname, router.asPath, {\n                locale: lng,\n                scroll: false\n            });\n        }\n    };\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"LanguageProvider.useEffect\": ()=>{\n            // sync language state with router.locale once router is available\n            if (router.locale && router.locale !== language) {\n                setLanguage(router.locale);\n            }\n        }\n    }[\"LanguageProvider.useEffect\"], [\n        router.locale\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(LanguageContext.Provider, {\n        value: {\n            language,\n            changeLanguage\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\context\\\\languageContext.tsx\",\n        lineNumber: 32,\n        columnNumber: 5\n    }, undefined);\n};\nconst useLanguage = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(LanguageContext);\n    if (!context) throw new Error('useLanguage must be used within LanguageProvider');\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHQvbGFuZ3VhZ2VDb250ZXh0LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBa0Y7QUFDMUM7QUFReEMsTUFBTUssZ0NBQWtCTCxvREFBYUEsQ0FBbUNNO0FBRWpFLE1BQU1DLG1CQUFtQixDQUFDLEVBQUVDLFFBQVEsRUFBMkI7SUFDcEUsTUFBTUMsU0FBU0wsc0RBQVNBO0lBQ3hCLE1BQU0sQ0FBQ00sVUFBVUMsWUFBWSxHQUFHUiwrQ0FBUUEsQ0FBQ00sT0FBT0csTUFBTSxJQUFJO0lBRTFELE1BQU1DLGlCQUFpQixDQUFDQztRQUN0QixnRkFBZ0Y7UUFDaEYsSUFBSUwsT0FBT0csTUFBTSxLQUFLRSxLQUFLO1lBQ3pCSCxZQUFZRztZQUNaTCxPQUFPTSxJQUFJLENBQUNOLE9BQU9PLFFBQVEsRUFBRVAsT0FBT1EsTUFBTSxFQUFFO2dCQUFFTCxRQUFRRTtnQkFBS0ksUUFBUTtZQUFNO1FBQzNFO0lBQ0Y7SUFFQWhCLGdEQUFTQTtzQ0FBQztZQUNSLGtFQUFrRTtZQUNsRSxJQUFJTyxPQUFPRyxNQUFNLElBQUlILE9BQU9HLE1BQU0sS0FBS0YsVUFBVTtnQkFDL0NDLFlBQVlGLE9BQU9HLE1BQU07WUFDM0I7UUFDRjtxQ0FBRztRQUFDSCxPQUFPRyxNQUFNO0tBQUM7SUFFbEIscUJBQ0UsOERBQUNQLGdCQUFnQmMsUUFBUTtRQUFDQyxPQUFPO1lBQUVWO1lBQVVHO1FBQWU7a0JBQ3pETDs7Ozs7O0FBR1AsRUFBRTtBQUVLLE1BQU1hLGNBQWM7SUFDekIsTUFBTUMsVUFBVXJCLGlEQUFVQSxDQUFDSTtJQUMzQixJQUFJLENBQUNpQixTQUFTLE1BQU0sSUFBSUMsTUFBTTtJQUM5QixPQUFPRDtBQUNULEVBQUUiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcS3VtYXIgU3VtYW50XFxoZWFsdGhfYmxvZ19zdGFydGVyXFxjb250ZXh0XFxsYW5ndWFnZUNvbnRleHQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIFJlYWN0Tm9kZSwgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG4vLyBEb24ndCBjYWxsIHVzZVRyYW5zbGF0aW9uIGF0IG1vZHVsZS90b3AtbGV2ZWwgdG8gYXZvaWQgTk9fSTE4TkVYVF9JTlNUQU5DRSBkdXJpbmcgU1NSXHJcblxyXG5pbnRlcmZhY2UgTGFuZ3VhZ2VDb250ZXh0UHJvcHMge1xyXG4gIGxhbmd1YWdlOiBzdHJpbmc7XHJcbiAgY2hhbmdlTGFuZ3VhZ2U6IChsbmc6IHN0cmluZykgPT4gdm9pZDtcclxufVxyXG5cclxuY29uc3QgTGFuZ3VhZ2VDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxMYW5ndWFnZUNvbnRleHRQcm9wcyB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcclxuXHJcbmV4cG9ydCBjb25zdCBMYW5ndWFnZVByb3ZpZGVyID0gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcclxuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcclxuICBjb25zdCBbbGFuZ3VhZ2UsIHNldExhbmd1YWdlXSA9IHVzZVN0YXRlKHJvdXRlci5sb2NhbGUgfHwgJ2VuJyk7XHJcblxyXG4gIGNvbnN0IGNoYW5nZUxhbmd1YWdlID0gKGxuZzogc3RyaW5nKSA9PiB7XHJcbiAgICAvLyBVc2UgTmV4dCByb3V0ZXIgdG8gY2hhbmdlIGxvY2FsZTsgbGV0IG5leHQtaTE4bmV4dCBoYW5kbGUgaTE4biBpbml0aWFsaXphdGlvblxyXG4gICAgaWYgKHJvdXRlci5sb2NhbGUgIT09IGxuZykge1xyXG4gICAgICBzZXRMYW5ndWFnZShsbmcpO1xyXG4gICAgICByb3V0ZXIucHVzaChyb3V0ZXIucGF0aG5hbWUsIHJvdXRlci5hc1BhdGgsIHsgbG9jYWxlOiBsbmcsIHNjcm9sbDogZmFsc2UgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIC8vIHN5bmMgbGFuZ3VhZ2Ugc3RhdGUgd2l0aCByb3V0ZXIubG9jYWxlIG9uY2Ugcm91dGVyIGlzIGF2YWlsYWJsZVxyXG4gICAgaWYgKHJvdXRlci5sb2NhbGUgJiYgcm91dGVyLmxvY2FsZSAhPT0gbGFuZ3VhZ2UpIHtcclxuICAgICAgc2V0TGFuZ3VhZ2Uocm91dGVyLmxvY2FsZSk7XHJcbiAgICB9XHJcbiAgfSwgW3JvdXRlci5sb2NhbGVdKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxMYW5ndWFnZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgbGFuZ3VhZ2UsIGNoYW5nZUxhbmd1YWdlIH19PlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L0xhbmd1YWdlQ29udGV4dC5Qcm92aWRlcj5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUxhbmd1YWdlID0gKCkgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KExhbmd1YWdlQ29udGV4dCk7XHJcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZUxhbmd1YWdlIG11c3QgYmUgdXNlZCB3aXRoaW4gTGFuZ3VhZ2VQcm92aWRlcicpO1xyXG4gIHJldHVybiBjb250ZXh0O1xyXG59O1xyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInVzZVJvdXRlciIsIkxhbmd1YWdlQ29udGV4dCIsInVuZGVmaW5lZCIsIkxhbmd1YWdlUHJvdmlkZXIiLCJjaGlsZHJlbiIsInJvdXRlciIsImxhbmd1YWdlIiwic2V0TGFuZ3VhZ2UiLCJsb2NhbGUiLCJjaGFuZ2VMYW5ndWFnZSIsImxuZyIsInB1c2giLCJwYXRobmFtZSIsImFzUGF0aCIsInNjcm9sbCIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VMYW5ndWFnZSIsImNvbnRleHQiLCJFcnJvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./context/languageContext.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./lib/supabaseClient.ts":
/*!*******************************!*\
  !*** ./lib/supabaseClient.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n\nconst supabaseUrl = \"https://bgxrjlcjofkmwdifmfhk.supabase.co\";\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneHJqbGNqb2ZrbXdkaWZtZmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDAyNzAsImV4cCI6MjA3MzY3NjI3MH0.7iJtvMEeWQokMAvhPVrE7XDWzf2pasDOcnkFT69oX38\";\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2xpYi9zdXBhYmFzZUNsaWVudC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBb0Q7QUFFcEQsTUFBTUMsY0FBY0MsMENBQW9DO0FBQ3hELE1BQU1HLGtCQUFrQkgsa05BQW9DO0FBRXJELE1BQU1LLFdBQVdQLG1FQUFZQSxDQUFDQyxhQUFhSSxpQkFBZ0IiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcS3VtYXIgU3VtYW50XFxoZWFsdGhfYmxvZ19zdGFydGVyXFxsaWJcXHN1cGFiYXNlQ2xpZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcclxuXHJcbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIVxyXG5jb25zdCBzdXBhYmFzZUFub25LZXkgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9LRVkhXHJcblxyXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlQW5vbktleSkiXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50Iiwic3VwYWJhc2VVcmwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwic3VwYWJhc2VBbm9uS2V5IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfS0VZIiwic3VwYWJhc2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./lib/supabaseClient.ts\n");

/***/ }),

/***/ "(pages-dir-node)/./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _context_authContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context/authContext */ \"(pages-dir-node)/./context/authContext.tsx\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-i18next */ \"next-i18next\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_i18next__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _context_languageContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../context/languageContext */ \"(pages-dir-node)/./context/languageContext.tsx\");\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @chakra-ui/react */ \"@chakra-ui/react\");\n/* harmony import */ var prosemirror_view_style_prosemirror_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! prosemirror-view/style/prosemirror.css */ \"(pages-dir-node)/./node_modules/prosemirror-view/style/prosemirror.css\");\n/* harmony import */ var prosemirror_view_style_prosemirror_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(prosemirror_view_style_prosemirror_css__WEBPACK_IMPORTED_MODULE_6__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__]);\n_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\n\nconst theme = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.extendTheme)({});\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.ChakraProvider, {\n        theme: theme,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_authContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_languageContext__WEBPACK_IMPORTED_MODULE_4__.LanguageProvider, {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n                    lineNumber: 18,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n                lineNumber: 17,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n            lineNumber: 16,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n        lineNumber: 15,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_i18next__WEBPACK_IMPORTED_MODULE_3__.appWithTranslation)(App));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBK0I7QUFFdUI7QUFDSjtBQUNZO0FBQ1o7QUFDSDtBQUNDO0FBR2hELE1BQU1LLFFBQVFELDZEQUFXQSxDQUFDLENBQUM7QUFFM0IsU0FBU0UsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUM3QyxxQkFDRSw4REFBQ0wsNERBQWNBO1FBQUNFLE9BQU9BO2tCQUNyQiw0RUFBQ0wsOERBQVlBO3NCQUNYLDRFQUFDRSxzRUFBZ0JBOzBCQUNmLDRFQUFDSztvQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLbEM7QUFFQSxpRUFBZVAsZ0VBQWtCQSxDQUFDSyxJQUFJQSxFQUFDIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEt1bWFyIFN1bWFudFxcaGVhbHRoX2Jsb2dfc3RhcnRlclxccGFnZXNcXF9hcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJztcclxuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcclxuaW1wb3J0IHsgQXV0aFByb3ZpZGVyIH0gZnJvbSAnLi4vY29udGV4dC9hdXRoQ29udGV4dCc7XHJcbmltcG9ydCB7IGFwcFdpdGhUcmFuc2xhdGlvbiB9IGZyb20gJ25leHQtaTE4bmV4dCc7XHJcbmltcG9ydCB7IExhbmd1YWdlUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0L2xhbmd1YWdlQ29udGV4dCc7XHJcbmltcG9ydCB7IENoYWtyYVByb3ZpZGVyIH0gZnJvbSAnQGNoYWtyYS11aS9yZWFjdCc7XHJcbmltcG9ydCB7IGV4dGVuZFRoZW1lIH0gZnJvbSAnQGNoYWtyYS11aS9yZWFjdCc7XHJcbmltcG9ydCAncHJvc2VtaXJyb3Itdmlldy9zdHlsZS9wcm9zZW1pcnJvci5jc3MnO1xyXG5cclxuXHJcbmNvbnN0IHRoZW1lID0gZXh0ZW5kVGhlbWUoe30pO1xyXG5cclxuZnVuY3Rpb24gQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcclxuICByZXR1cm4gKFxyXG4gICAgPENoYWtyYVByb3ZpZGVyIHRoZW1lPXt0aGVtZX0+XHJcbiAgICAgIDxBdXRoUHJvdmlkZXI+XHJcbiAgICAgICAgPExhbmd1YWdlUHJvdmlkZXI+XHJcbiAgICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICAgICAgPC9MYW5ndWFnZVByb3ZpZGVyPlxyXG4gICAgICA8L0F1dGhQcm92aWRlcj5cclxuICAgIDwvQ2hha3JhUHJvdmlkZXI+XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXBwV2l0aFRyYW5zbGF0aW9uKEFwcCk7Il0sIm5hbWVzIjpbIkF1dGhQcm92aWRlciIsImFwcFdpdGhUcmFuc2xhdGlvbiIsIkxhbmd1YWdlUHJvdmlkZXIiLCJDaGFrcmFQcm92aWRlciIsImV4dGVuZFRoZW1lIiwidGhlbWUiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "@chakra-ui/react":
/*!***********************************!*\
  !*** external "@chakra-ui/react" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = import("@chakra-ui/react");;

/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next-i18next":
/*!*******************************!*\
  !*** external "next-i18next" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-i18next");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/prosemirror-view"], () => (__webpack_exec__("(pages-dir-node)/./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();