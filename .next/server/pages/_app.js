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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/supabaseClient */ \"(pages-dir-node)/./lib/supabaseClient.ts\");\n// context/AuthContext.tsx\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n    user: null,\n    loading: true\n});\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"AuthProvider.useEffect\": ()=>{\n            _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.getUser().then({\n                \"AuthProvider.useEffect\": ({ data })=>{\n                    setUser(data.user);\n                    setLoading(false);\n                }\n            }[\"AuthProvider.useEffect\"]);\n            const { data: listener } = _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.supabase.auth.onAuthStateChange({\n                \"AuthProvider.useEffect\": (_event, session)=>{\n                    setUser(session?.user ?? null);\n                }\n            }[\"AuthProvider.useEffect\"]);\n            return ({\n                \"AuthProvider.useEffect\": ()=>listener.subscription.unsubscribe()\n            })[\"AuthProvider.useEffect\"];\n        }\n    }[\"AuthProvider.useEffect\"], []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            loading\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\context\\\\authContext.tsx\",\n        lineNumber: 24,\n        columnNumber: 10\n    }, undefined);\n};\nconst useAuth = ()=>(0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHQvYXV0aENvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwwQkFBMEI7O0FBQzZDO0FBQ3RCO0FBRWpELE1BQU1LLDRCQUFjTCxvREFBYUEsQ0FBa0M7SUFBRU0sTUFBTTtJQUFNQyxTQUFTO0FBQUs7QUFFeEYsTUFBTUMsZUFBZSxDQUFDLEVBQUVDLFFBQVEsRUFBaUM7SUFDdEUsTUFBTSxDQUFDSCxNQUFNSSxRQUFRLEdBQUdQLCtDQUFRQSxDQUFNO0lBQ3RDLE1BQU0sQ0FBQ0ksU0FBU0ksV0FBVyxHQUFHUiwrQ0FBUUEsQ0FBQztJQUV2Q0QsZ0RBQVNBO2tDQUFDO1lBQ1JFLHlEQUFRQSxDQUFDUSxJQUFJLENBQUNDLE9BQU8sR0FBR0MsSUFBSTswQ0FBQyxDQUFDLEVBQUVDLElBQUksRUFBRTtvQkFDcENMLFFBQVFLLEtBQUtULElBQUk7b0JBQ2pCSyxXQUFXO2dCQUNiOztZQUVBLE1BQU0sRUFBRUksTUFBTUMsUUFBUSxFQUFFLEdBQUdaLHlEQUFRQSxDQUFDUSxJQUFJLENBQUNLLGlCQUFpQjswQ0FBQyxDQUFDQyxRQUFRQztvQkFDbEVULFFBQVFTLFNBQVNiLFFBQVE7Z0JBQzNCOztZQUVBOzBDQUFPLElBQU1VLFNBQVNJLFlBQVksQ0FBQ0MsV0FBVzs7UUFDaEQ7aUNBQUcsRUFBRTtJQUVMLHFCQUFPLDhEQUFDaEIsWUFBWWlCLFFBQVE7UUFBQ0MsT0FBTztZQUFFakI7WUFBTUM7UUFBUTtrQkFBSUU7Ozs7OztBQUMxRCxFQUFFO0FBRUssTUFBTWUsVUFBVSxJQUFNdkIsaURBQVVBLENBQUNJLGFBQWEiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcS3VtYXIgU3VtYW50XFxoZWFsdGhfYmxvZ19zdGFydGVyXFxjb250ZXh0XFxhdXRoQ29udGV4dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gY29udGV4dC9BdXRoQ29udGV4dC50c3hcclxuaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tICcuLi9saWIvc3VwYWJhc2VDbGllbnQnO1xyXG5cclxuY29uc3QgQXV0aENvbnRleHQgPSBjcmVhdGVDb250ZXh0PHsgdXNlcjogYW55OyBsb2FkaW5nOiBib29sZWFuIH0+KHsgdXNlcjogbnVsbCwgbG9hZGluZzogdHJ1ZSB9KTtcclxuXHJcbmV4cG9ydCBjb25zdCBBdXRoUHJvdmlkZXIgPSAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IFt1c2VyLCBzZXRVc2VyXSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKS50aGVuKCh7IGRhdGEgfSkgPT4ge1xyXG4gICAgICBzZXRVc2VyKGRhdGEudXNlcik7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgeyBkYXRhOiBsaXN0ZW5lciB9ID0gc3VwYWJhc2UuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZSgoX2V2ZW50LCBzZXNzaW9uKSA9PiB7XHJcbiAgICAgIHNldFVzZXIoc2Vzc2lvbj8udXNlciA/PyBudWxsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lci5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHJldHVybiA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgbG9hZGluZyB9fT57Y2hpbGRyZW59PC9BdXRoQ29udGV4dC5Qcm92aWRlcj47XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXNlQXV0aCA9ICgpID0+IHVzZUNvbnRleHQoQXV0aENvbnRleHQpO1xyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInN1cGFiYXNlIiwiQXV0aENvbnRleHQiLCJ1c2VyIiwibG9hZGluZyIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwic2V0VXNlciIsInNldExvYWRpbmciLCJhdXRoIiwiZ2V0VXNlciIsInRoZW4iLCJkYXRhIiwibGlzdGVuZXIiLCJvbkF1dGhTdGF0ZUNoYW5nZSIsIl9ldmVudCIsInNlc3Npb24iLCJzdWJzY3JpcHRpb24iLCJ1bnN1YnNjcmliZSIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VBdXRoIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./context/authContext.tsx\n");

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
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _context_authContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context/authContext */ \"(pages-dir-node)/./context/authContext.tsx\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-i18next */ \"next-i18next\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_i18next__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _context_languageContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../context/languageContext */ \"(pages-dir-node)/./context/languageContext.tsx\");\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @chakra-ui/react */ \"@chakra-ui/react\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__]);\n_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\nconst theme = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.extendTheme)({});\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.ChakraProvider, {\n        theme: theme,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_authContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_languageContext__WEBPACK_IMPORTED_MODULE_4__.LanguageProvider, {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n                    lineNumber: 16,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n                lineNumber: 15,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n            lineNumber: 14,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Kumar Sumant\\\\health_blog_starter\\\\pages\\\\_app.tsx\",\n        lineNumber: 13,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_i18next__WEBPACK_IMPORTED_MODULE_3__.appWithTranslation)(App));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQStCO0FBRXVCO0FBQ0o7QUFDWTtBQUNaO0FBQ0g7QUFFL0MsTUFBTUssUUFBUUQsNkRBQVdBLENBQUMsQ0FBQztBQUUzQixTQUFTRSxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQzdDLHFCQUNFLDhEQUFDTCw0REFBY0E7UUFBQ0UsT0FBT0E7a0JBQ3JCLDRFQUFDTCw4REFBWUE7c0JBQ1gsNEVBQUNFLHNFQUFnQkE7MEJBQ2YsNEVBQUNLO29CQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtsQztBQUVBLGlFQUFlUCxnRUFBa0JBLENBQUNLLElBQUlBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcS3VtYXIgU3VtYW50XFxoZWFsdGhfYmxvZ19zdGFydGVyXFxwYWdlc1xcX2FwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xyXG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xyXG5pbXBvcnQgeyBBdXRoUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0L2F1dGhDb250ZXh0JztcclxuaW1wb3J0IHsgYXBwV2l0aFRyYW5zbGF0aW9uIH0gZnJvbSAnbmV4dC1pMThuZXh0JztcclxuaW1wb3J0IHsgTGFuZ3VhZ2VQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHQvbGFuZ3VhZ2VDb250ZXh0JztcclxuaW1wb3J0IHsgQ2hha3JhUHJvdmlkZXIgfSBmcm9tICdAY2hha3JhLXVpL3JlYWN0JztcclxuaW1wb3J0IHsgZXh0ZW5kVGhlbWUgfSBmcm9tICdAY2hha3JhLXVpL3JlYWN0JztcclxuXHJcbmNvbnN0IHRoZW1lID0gZXh0ZW5kVGhlbWUoe30pO1xyXG5cclxuZnVuY3Rpb24gQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcclxuICByZXR1cm4gKFxyXG4gICAgPENoYWtyYVByb3ZpZGVyIHRoZW1lPXt0aGVtZX0+XHJcbiAgICAgIDxBdXRoUHJvdmlkZXI+XHJcbiAgICAgICAgPExhbmd1YWdlUHJvdmlkZXI+XHJcbiAgICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICAgICAgPC9MYW5ndWFnZVByb3ZpZGVyPlxyXG4gICAgICA8L0F1dGhQcm92aWRlcj5cclxuICAgIDwvQ2hha3JhUHJvdmlkZXI+XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXBwV2l0aFRyYW5zbGF0aW9uKEFwcCk7Il0sIm5hbWVzIjpbIkF1dGhQcm92aWRlciIsImFwcFdpdGhUcmFuc2xhdGlvbiIsIkxhbmd1YWdlUHJvdmlkZXIiLCJDaGFrcmFQcm92aWRlciIsImV4dGVuZFRoZW1lIiwidGhlbWUiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.tsx\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(pages-dir-node)/./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();