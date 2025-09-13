"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var __VLS_props = defineProps();
var count = (0, vue_1.ref)(0);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_elements;
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
(__VLS_ctx.msg);
// @ts-ignore
[msg,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ class: "card" }));
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.count++;
        // @ts-ignore
        [count,];
    } }, { type: "button" }));
(__VLS_ctx.count);
// @ts-ignore
[count,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://vuejs.org/guide/quick-start.html#local",
    target: "_blank",
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://vuejs.org/guide/scaling-up/tooling.html#ide-support",
    target: "_blank",
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)(__assign({ class: "read-the-docs" }));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['read-the-docs']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () { return ({
        count: count,
    }); },
    __typeProps: {},
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
