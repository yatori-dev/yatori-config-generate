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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var file_saver_1 = require("file-saver");
var js_yaml_1 = require("js-yaml");
var icons_vue_1 = require("@ant-design/icons-vue");
var icons_vue_2 = require("@ant-design/icons-vue");
function deepMerge(target, source) {
    for (var key in target) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (typeof target[key] === 'object' &&
                target[key] !== null &&
                !Array.isArray(target[key])) {
                target[key] = deepMerge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
        // 如果 key 在 source 中不存在，target 已经保留默认值
    }
    return target;
}
function getDefaultForm() {
    return {
        setting: {
            basicSetting: {
                completionTone: 1,
                colorLog: 1,
                logOutFileSw: 1,
                logLevel: 'INFO',
                logModel: 0,
            },
            emailInform: {
                sw: 0,
                SMTPHost: '',
                SMTPPort: '',
                email: '',
                password: '',
            },
            aiSetting: {
                aiType: 'TONGYI',
                aiUrl: '',
                model: '',
                API_KEY: '',
            },
            apiQueSetting: {
                url: 'http://localhost:8083',
            },
        },
        users: [
            {
                accountType: 'YINGHUA',
                url: '',
                account: '',
                password: '',
                isProxy: 0,
                coursesCustom: {
                    videoModel: 1,
                    autoExam: 0,
                    examAutoSubmit: 0,
                    excludeCourses: [],
                    includeCourses: []
                },
            },
        ],
    };
}
function importYaml(event) {
    var _a, _b, _c, _d, _e;
    var file;
    if ((_b = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length) {
        file = event.dataTransfer.files[0];
    }
    else if ((_d = (_c = event.target) === null || _c === void 0 ? void 0 : _c.files) === null || _d === void 0 ? void 0 : _d.length) {
        file = (_e = event.target.files) === null || _e === void 0 ? void 0 : _e[0];
    }
    if (!file || !file.name.endsWith('.yml') && !file.name.endsWith('.yaml')) {
        alert('请上传 YAML 文件（.yml 或 .yaml）');
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var _a;
        try {
            var text = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            var parsed = js_yaml_1.default.load(text);
            var defaultForm = getDefaultForm();
            // 特殊处理 users：逐个合并
            if (Array.isArray(parsed.users)) {
                defaultForm.users = parsed.users.map(function (u) {
                    return deepMerge(getDefaultForm().users[0], u);
                });
            }
            // 合并 setting 部分
            defaultForm.setting = deepMerge(defaultForm.setting, parsed.setting || {});
            // 替换响应式 form（不能直接替换 form = xxx，否则 Vue 不追踪）
            Object.assign(form, defaultForm);
        }
        catch (err) {
            console.error('YAML解析失败:', err);
            alert('导入失败，请检查YAML文件格式是否正确');
        }
    };
    reader.readAsText(file);
}
//配置文件信息
var form = (0, vue_1.reactive)(getDefaultForm());
var isDragging = (0, vue_1.ref)(false); //控制文件拖拽
//新增用户
function addUser() {
    form.users.push({
        accountType: 'YINGHUA',
        url: '',
        account: '',
        password: '',
        isProxy: 0,
        coursesCustom: {
            videoModel: 1,
            autoExam: 0,
            examAutoSubmit: 0,
            excludeCourses: [],
            includeCourses: []
        },
    });
}
//移除用户
function removeUser(index) {
    form.users.splice(index, 1);
}
//添加课程信息
function addIncludeCourse(userIndex) {
    form.users[userIndex].coursesCustom.excludeCourses = [];
    form.users[userIndex].coursesCustom.includeCourses.push("");
}
//移除课程信息
function removeIncludeCourse(userIndex, coruseIndex) {
    form.users[userIndex].coursesCustom.includeCourses.splice(coruseIndex, 1);
}
//添加课程信息
function addExcludeCourse(userIndex) {
    form.users[userIndex].coursesCustom.includeCourses = [];
    form.users[userIndex].coursesCustom.excludeCourses.push("");
}
//移除课程信息
function removeExcludeCourse(userIndex, coruseIndex) {
    form.users[userIndex].coursesCustom.excludeCourses.splice(coruseIndex, 1);
}
function exportYaml() {
    var yamlStr = js_yaml_1.default.dump(JSON.parse(JSON.stringify(form)));
    var blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' });
    (0, file_saver_1.saveAs)(blob, 'config.yaml');
}
// 文件输入框的引用
var fileInput = (0, vue_1.ref)(null);
// 触发文件选择
function importClick() {
    var _a;
    (_a = fileInput.value) === null || _a === void 0 ? void 0 : _a.click();
}
// 拖拽事件绑定
var dragCounter = 0;
var handleDragEnter = function (e) {
    e.preventDefault();
    dragCounter++;
    isDragging.value = true;
};
var handleDragLeave = function (e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
        isDragging.value = false;
    }
};
var handleDrop = function (e) {
    e.preventDefault();
    dragCounter = 0;
    isDragging.value = false;
    importYaml(e);
};
(0, vue_1.onMounted)(function () {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', function (e) { return e.preventDefault(); });
});
(0, vue_1.onUnmounted)(function () {
    window.removeEventListener('dragenter', handleDragEnter);
    window.removeEventListener('dragleave', handleDragLeave);
    window.removeEventListener('drop', handleDrop);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_elements;
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ style: {} }));
var __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
ACard;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ style: {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ style: {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = __VLS_3.slots.default;
var __VLS_5 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
AForm;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    model: (__VLS_ctx.form),
    layout: "horizontal",
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        model: (__VLS_ctx.form),
        layout: "horizontal",
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_9 = __VLS_8.slots.default;
// @ts-ignore
[form,];
var __VLS_10 = {}.ACollapse;
/** @type {[typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, ]} */ ;
// @ts-ignore
ACollapse;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    defaultActiveKey: ([]),
    accordion: true,
}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{
        defaultActiveKey: ([]),
        accordion: true,
    }], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_14 = __VLS_13.slots.default;
var __VLS_15 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    key: "1",
    header: "基础设置",
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        key: "1",
        header: "基础设置",
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_19 = __VLS_18.slots.default;
var __VLS_20 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "完成提示音",
    labelCol: ({ span: 3 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        label: "完成提示音",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 2, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_24 = __VLS_23.slots.default;
var __VLS_25 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25(__assign({ 'onChange': {} }, { checked: (__VLS_ctx.form.setting.basicSetting.completionTone == 0 ? false : true) })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onChange': {} }, { checked: (__VLS_ctx.form.setting.basicSetting.completionTone == 0 ? false : true) })], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_29;
var __VLS_30;
var __VLS_31 = ({ change: {} },
    { onChange: (function () {
            __VLS_ctx.form.setting.basicSetting.completionTone = __VLS_ctx.form.setting.basicSetting.completionTone == 1 ? 0 : 1;
        }) });
// @ts-ignore
[form, form, form,];
var __VLS_28;
var __VLS_23;
var __VLS_33 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    label: "彩色日志",
    labelCol: ({ span: 3 }),
    wrapperCol: ({ span: 5, offset: 0 }),
}));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{
        label: "彩色日志",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 5, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_37 = __VLS_36.slots.default;
var __VLS_38 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38(__assign({ 'onChange': {} }, { checked: (__VLS_ctx.form.setting.basicSetting.colorLog == 0 ? false : true) })));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ 'onChange': {} }, { checked: (__VLS_ctx.form.setting.basicSetting.colorLog == 0 ? false : true) })], __VLS_functionalComponentArgsRest(__VLS_39), false));
var __VLS_42;
var __VLS_43;
var __VLS_44 = ({ change: {} },
    { onChange: (function () {
            __VLS_ctx.form.setting.basicSetting.colorLog = __VLS_ctx.form.setting.basicSetting.colorLog == 1 ? 0 : 1;
        }) });
// @ts-ignore
[form, form, form,];
var __VLS_41;
var __VLS_36;
var __VLS_46 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: "日志输出到文件",
    labelCol: ({ span: 3 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
        label: "日志输出到文件",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 2, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_50 = __VLS_49.slots.default;
var __VLS_51 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
var __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51(__assign({ 'onChange': {} }, { checked: (__VLS_ctx.form.setting.basicSetting.logOutFileSw == 0 ? false : true) })));
var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([__assign({ 'onChange': {} }, { checked: (__VLS_ctx.form.setting.basicSetting.logOutFileSw == 0 ? false : true) })], __VLS_functionalComponentArgsRest(__VLS_52), false));
var __VLS_55;
var __VLS_56;
var __VLS_57 = ({ change: {} },
    { onChange: (function () {
            __VLS_ctx.form.setting.basicSetting.logOutFileSw = __VLS_ctx.form.setting.basicSetting.logOutFileSw == 1 ? 0 : 1;
        }) });
// @ts-ignore
[form, form, form,];
var __VLS_54;
var __VLS_49;
var __VLS_59 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    label: "日志等级",
    labelCol: ({ span: 3 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{
        label: "日志等级",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 2, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_63 = __VLS_62.slots.default;
var __VLS_64 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
ASelect;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: (__VLS_ctx.form.setting.basicSetting.logLevel),
}));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.basicSetting.logLevel),
    }], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_68 = __VLS_67.slots.default;
// @ts-ignore
[form,];
var __VLS_69 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    value: "INFO",
}));
var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([{
        value: "INFO",
    }], __VLS_functionalComponentArgsRest(__VLS_70), false));
var __VLS_73 = __VLS_72.slots.default;
var __VLS_72;
var __VLS_74 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    value: "DEBUG",
}));
var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([{
        value: "DEBUG",
    }], __VLS_functionalComponentArgsRest(__VLS_75), false));
var __VLS_78 = __VLS_77.slots.default;
var __VLS_77;
var __VLS_67;
var __VLS_62;
var __VLS_18;
var __VLS_79 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
var __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    key: "2",
    header: "邮箱通知配置",
}));
var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([{
        key: "2",
        header: "邮箱通知配置",
    }], __VLS_functionalComponentArgsRest(__VLS_80), false));
var __VLS_83 = __VLS_82.slots.default;
var __VLS_84 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "开启",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([{
        label: "开启",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 2, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_85), false));
var __VLS_88 = __VLS_87.slots.default;
var __VLS_89 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
var __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    checked: (__VLS_ctx.form.setting.emailInform.sw),
}));
var __VLS_91 = __VLS_90.apply(void 0, __spreadArray([{
        checked: (__VLS_ctx.form.setting.emailInform.sw),
    }], __VLS_functionalComponentArgsRest(__VLS_90), false));
// @ts-ignore
[form,];
var __VLS_87;
var __VLS_94 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    label: "SMTP Host",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_96 = __VLS_95.apply(void 0, __spreadArray([{
        label: "SMTP Host",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_95), false));
var __VLS_98 = __VLS_97.slots.default;
var __VLS_99 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
var __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
    value: (__VLS_ctx.form.setting.emailInform.SMTPHost),
    placeholder: "请输入HOST值",
}));
var __VLS_101 = __VLS_100.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.emailInform.SMTPHost),
        placeholder: "请输入HOST值",
    }], __VLS_functionalComponentArgsRest(__VLS_100), false));
// @ts-ignore
[form,];
var __VLS_97;
var __VLS_104 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "SMTP Port",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_106 = __VLS_105.apply(void 0, __spreadArray([{
        label: "SMTP Port",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_105), false));
var __VLS_108 = __VLS_107.slots.default;
var __VLS_109 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
var __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    value: (__VLS_ctx.form.setting.emailInform.SMTPPort),
    placeholder: "请输入端口号",
}));
var __VLS_111 = __VLS_110.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.emailInform.SMTPPort),
        placeholder: "请输入端口号",
    }], __VLS_functionalComponentArgsRest(__VLS_110), false));
// @ts-ignore
[form,];
var __VLS_107;
var __VLS_114 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    label: "Email",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_116 = __VLS_115.apply(void 0, __spreadArray([{
        label: "Email",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_115), false));
var __VLS_118 = __VLS_117.slots.default;
var __VLS_119 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
var __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    value: (__VLS_ctx.form.setting.emailInform.email),
    placeholder: "请输入邮箱",
}));
var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.emailInform.email),
        placeholder: "请输入邮箱",
    }], __VLS_functionalComponentArgsRest(__VLS_120), false));
// @ts-ignore
[form,];
var __VLS_117;
var __VLS_124 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "密码",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([{
        label: "密码",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_125), false));
var __VLS_128 = __VLS_127.slots.default;
var __VLS_129 = {}.AInputPassword;
/** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
// @ts-ignore
AInputPassword;
// @ts-ignore
var __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    value: (__VLS_ctx.form.setting.emailInform.password),
    placeholder: "请输入密码",
}));
var __VLS_131 = __VLS_130.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.emailInform.password),
        placeholder: "请输入密码",
    }], __VLS_functionalComponentArgsRest(__VLS_130), false));
// @ts-ignore
[form,];
var __VLS_127;
var __VLS_82;
var __VLS_134 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
var __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    key: "3",
    header: "AI大模型自动答题设置",
}));
var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([{
        key: "3",
        header: "AI大模型自动答题设置",
    }], __VLS_functionalComponentArgsRest(__VLS_135), false));
var __VLS_138 = __VLS_137.slots.default;
var __VLS_139 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
    label: "AI类型",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 5, offset: 0 }),
}));
var __VLS_141 = __VLS_140.apply(void 0, __spreadArray([{
        label: "AI类型",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 5, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_140), false));
var __VLS_143 = __VLS_142.slots.default;
var __VLS_144 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
ASelect;
// @ts-ignore
var __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    value: (__VLS_ctx.form.setting.aiSetting.aiType),
}));
var __VLS_146 = __VLS_145.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.aiSetting.aiType),
    }], __VLS_functionalComponentArgsRest(__VLS_145), false));
var __VLS_148 = __VLS_147.slots.default;
// @ts-ignore
[form,];
var __VLS_149 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    value: "CHATGLM",
}));
var __VLS_151 = __VLS_150.apply(void 0, __spreadArray([{
        value: "CHATGLM",
    }], __VLS_functionalComponentArgsRest(__VLS_150), false));
var __VLS_153 = __VLS_152.slots.default;
var __VLS_152;
var __VLS_154 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    value: "TONGYI",
}));
var __VLS_156 = __VLS_155.apply(void 0, __spreadArray([{
        value: "TONGYI",
    }], __VLS_functionalComponentArgsRest(__VLS_155), false));
var __VLS_158 = __VLS_157.slots.default;
var __VLS_157;
var __VLS_159 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    value: "XINGHUO",
}));
var __VLS_161 = __VLS_160.apply(void 0, __spreadArray([{
        value: "XINGHUO",
    }], __VLS_functionalComponentArgsRest(__VLS_160), false));
var __VLS_163 = __VLS_162.slots.default;
var __VLS_162;
var __VLS_164 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    value: "DOUBAO",
}));
var __VLS_166 = __VLS_165.apply(void 0, __spreadArray([{
        value: "DOUBAO",
    }], __VLS_functionalComponentArgsRest(__VLS_165), false));
var __VLS_168 = __VLS_167.slots.default;
var __VLS_167;
var __VLS_169 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
var __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    value: "OTHER",
}));
var __VLS_171 = __VLS_170.apply(void 0, __spreadArray([{
        value: "OTHER",
    }], __VLS_functionalComponentArgsRest(__VLS_170), false));
var __VLS_173 = __VLS_172.slots.default;
var __VLS_172;
var __VLS_147;
var __VLS_142;
var __VLS_174 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    label: "AI URL",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_176 = __VLS_175.apply(void 0, __spreadArray([{
        label: "AI URL",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_175), false));
var __VLS_178 = __VLS_177.slots.default;
var __VLS_179 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
var __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
    value: (__VLS_ctx.form.setting.aiSetting.aiUrl),
    placeholder: "请输入模型API接口链接",
}));
var __VLS_181 = __VLS_180.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.aiSetting.aiUrl),
        placeholder: "请输入模型API接口链接",
    }], __VLS_functionalComponentArgsRest(__VLS_180), false));
// @ts-ignore
[form,];
var __VLS_177;
var __VLS_184 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    label: "模型",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_186 = __VLS_185.apply(void 0, __spreadArray([{
        label: "模型",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_185), false));
var __VLS_188 = __VLS_187.slots.default;
var __VLS_189 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
var __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    value: (__VLS_ctx.form.setting.aiSetting.model),
    placeholder: "请输入所选模型编号",
}));
var __VLS_191 = __VLS_190.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.aiSetting.model),
        placeholder: "请输入所选模型编号",
    }], __VLS_functionalComponentArgsRest(__VLS_190), false));
// @ts-ignore
[form,];
var __VLS_187;
var __VLS_194 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    label: "API_KEY",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 15, offset: 0 }),
}));
var __VLS_196 = __VLS_195.apply(void 0, __spreadArray([{
        label: "API_KEY",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 15, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_195), false));
var __VLS_198 = __VLS_197.slots.default;
var __VLS_199 = {}.AInputPassword;
/** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
// @ts-ignore
AInputPassword;
// @ts-ignore
var __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
    value: (__VLS_ctx.form.setting.aiSetting.API_KEY),
    placeholder: "请输入模型的API_KEY",
}));
var __VLS_201 = __VLS_200.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.aiSetting.API_KEY),
        placeholder: "请输入模型的API_KEY",
    }], __VLS_functionalComponentArgsRest(__VLS_200), false));
// @ts-ignore
[form,];
var __VLS_197;
var __VLS_137;
var __VLS_204 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
var __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    key: "4",
    header: "API外挂题库设置",
}));
var __VLS_206 = __VLS_205.apply(void 0, __spreadArray([{
        key: "4",
        header: "API外挂题库设置",
    }], __VLS_functionalComponentArgsRest(__VLS_205), false));
var __VLS_208 = __VLS_207.slots.default;
var __VLS_209 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
var __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    label: "接口地址",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
var __VLS_211 = __VLS_210.apply(void 0, __spreadArray([{
        label: "接口地址",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }], __VLS_functionalComponentArgsRest(__VLS_210), false));
var __VLS_213 = __VLS_212.slots.default;
var __VLS_214 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
var __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
    value: (__VLS_ctx.form.setting.apiQueSetting.url),
    placeholder: "请输入外挂题库对应访问URL",
}));
var __VLS_216 = __VLS_215.apply(void 0, __spreadArray([{
        value: (__VLS_ctx.form.setting.apiQueSetting.url),
        placeholder: "请输入外挂题库对应访问URL",
    }], __VLS_functionalComponentArgsRest(__VLS_215), false));
// @ts-ignore
[form,];
var __VLS_212;
var __VLS_207;
var __VLS_13;
var __VLS_219 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
ADivider;
// @ts-ignore
var __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({}));
var __VLS_221 = __VLS_220.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_220), false));
var __VLS_223 = __VLS_222.slots.default;
var __VLS_222;
var __VLS_224 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
ARow;
// @ts-ignore
var __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    gutter: "[16, 16]",
}));
var __VLS_226 = __VLS_225.apply(void 0, __spreadArray([{
        gutter: "[16, 16]",
    }], __VLS_functionalComponentArgsRest(__VLS_225), false));
var __VLS_228 = __VLS_227.slots.default;
var _loop_1 = function (user, index) {
    // @ts-ignore
    [form,];
    var __VLS_229 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    var __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229(__assign({ span: (24), key: (index) }, { style: {} })));
    var __VLS_231 = __VLS_230.apply(void 0, __spreadArray([__assign({ span: (24), key: (index) }, { style: {} })], __VLS_functionalComponentArgsRest(__VLS_230), false));
    var __VLS_233 = __VLS_232.slots.default;
    var __VLS_234 = {}.ACollapse;
    /** @type {[typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, ]} */ ;
    // @ts-ignore
    ACollapse;
    // @ts-ignore
    var __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
        defaultActiveKey: ([]),
        accordion: true,
    }));
    var __VLS_236 = __VLS_235.apply(void 0, __spreadArray([{
            defaultActiveKey: ([]),
            accordion: true,
        }], __VLS_functionalComponentArgsRest(__VLS_235), false));
    var __VLS_238 = __VLS_237.slots.default;
    var __VLS_239 = {}.ACollapsePanel;
    /** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
    // @ts-ignore
    ACollapsePanel;
    // @ts-ignore
    var __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
        key: (index),
        header: ('用户 ' + (index + 1)),
        extra: (index > 0 ? __VLS_ctx.h(__VLS_ctx.DeleteOutlined, { onClick: function () { return __VLS_ctx.removeUser(index); }, style: 'color:red;cursor:pointer' }) : null),
    }));
    var __VLS_241 = __VLS_240.apply(void 0, __spreadArray([{
            key: (index),
            header: ('用户 ' + (index + 1)),
            extra: (index > 0 ? __VLS_ctx.h(__VLS_ctx.DeleteOutlined, { onClick: function () { return __VLS_ctx.removeUser(index); }, style: 'color:red;cursor:pointer' }) : null),
        }], __VLS_functionalComponentArgsRest(__VLS_240), false));
    var __VLS_243 = __VLS_242.slots.default;
    // @ts-ignore
    [vue_1.h, icons_vue_1.DeleteOutlined, removeUser,];
    var __VLS_244 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    ACard;
    // @ts-ignore
    var __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({}));
    var __VLS_246 = __VLS_245.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_245), false));
    var __VLS_248 = __VLS_247.slots.default;
    var __VLS_249 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
        label: "账户类型",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 5, offset: 0 }),
    }));
    var __VLS_251 = __VLS_250.apply(void 0, __spreadArray([{
            label: "账户类型",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_250), false));
    var __VLS_253 = __VLS_252.slots.default;
    var __VLS_254 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    ASelect;
    // @ts-ignore
    var __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
        value: (user.accountType),
    }));
    var __VLS_256 = __VLS_255.apply(void 0, __spreadArray([{
            value: (user.accountType),
        }], __VLS_functionalComponentArgsRest(__VLS_255), false));
    var __VLS_258 = __VLS_257.slots.default;
    var __VLS_259 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
        value: ('YINGHUA'),
    }));
    var __VLS_261 = __VLS_260.apply(void 0, __spreadArray([{
            value: ('YINGHUA'),
        }], __VLS_functionalComponentArgsRest(__VLS_260), false));
    var __VLS_263 = __VLS_262.slots.default;
    var __VLS_264 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        value: ('XUEXITONG'),
    }));
    var __VLS_266 = __VLS_265.apply(void 0, __spreadArray([{
            value: ('XUEXITONG'),
        }], __VLS_functionalComponentArgsRest(__VLS_265), false));
    var __VLS_268 = __VLS_267.slots.default;
    var __VLS_269 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
        value: ('ENAEA'),
    }));
    var __VLS_271 = __VLS_270.apply(void 0, __spreadArray([{
            value: ('ENAEA'),
        }], __VLS_functionalComponentArgsRest(__VLS_270), false));
    var __VLS_273 = __VLS_272.slots.default;
    var __VLS_274 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
        value: ('CQIE'),
    }));
    var __VLS_276 = __VLS_275.apply(void 0, __spreadArray([{
            value: ('CQIE'),
        }], __VLS_functionalComponentArgsRest(__VLS_275), false));
    var __VLS_278 = __VLS_277.slots.default;
    var __VLS_279 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
        value: ('CANGHUI'),
    }));
    var __VLS_281 = __VLS_280.apply(void 0, __spreadArray([{
            value: ('CANGHUI'),
        }], __VLS_functionalComponentArgsRest(__VLS_280), false));
    var __VLS_283 = __VLS_282.slots.default;
    if (user.accountType == 'YINGHUA') {
        var __VLS_284 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        var __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
            label: "URL",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }));
        var __VLS_286 = __VLS_285.apply(void 0, __spreadArray([{
                label: "URL",
                labelCol: ({ span: 3 }),
                wrapperCol: ({ span: 10, offset: 0 }),
            }], __VLS_functionalComponentArgsRest(__VLS_285), false));
        var __VLS_288 = __VLS_287.slots.default;
        var __VLS_289 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        var __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({
            value: (user.url),
            placeholder: "对应平台登录后的URL链接，英华填其他的平台不用填",
        }));
        var __VLS_291 = __VLS_290.apply(void 0, __spreadArray([{
                value: (user.url),
                placeholder: "对应平台登录后的URL链接，英华填其他的平台不用填",
            }], __VLS_functionalComponentArgsRest(__VLS_290), false));
    }
    var __VLS_294 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
        label: "账号",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    var __VLS_296 = __VLS_295.apply(void 0, __spreadArray([{
            label: "账号",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_295), false));
    var __VLS_298 = __VLS_297.slots.default;
    var __VLS_299 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    AInput;
    // @ts-ignore
    var __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
        value: (user.account),
        placeholder: "请输入账号",
    }));
    var __VLS_301 = __VLS_300.apply(void 0, __spreadArray([{
            value: (user.account),
            placeholder: "请输入账号",
        }], __VLS_functionalComponentArgsRest(__VLS_300), false));
    var __VLS_304 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        label: "密码",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    var __VLS_306 = __VLS_305.apply(void 0, __spreadArray([{
            label: "密码",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_305), false));
    var __VLS_308 = __VLS_307.slots.default;
    var __VLS_309 = {}.AInputPassword;
    /** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
    // @ts-ignore
    AInputPassword;
    // @ts-ignore
    var __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
        value: (user.password),
        placeholder: "请输入密码",
    }));
    var __VLS_311 = __VLS_310.apply(void 0, __spreadArray([{
            value: (user.password),
            placeholder: "请输入密码",
        }], __VLS_functionalComponentArgsRest(__VLS_310), false));
    var __VLS_314 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
        label: "是否开启代理",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    var __VLS_316 = __VLS_315.apply(void 0, __spreadArray([{
            label: "是否开启代理",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_315), false));
    var __VLS_318 = __VLS_317.slots.default;
    var __VLS_319 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    ARow;
    // @ts-ignore
    var __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
        gutter: (10),
    }));
    var __VLS_321 = __VLS_320.apply(void 0, __spreadArray([{
            gutter: (10),
        }], __VLS_functionalComponentArgsRest(__VLS_320), false));
    var __VLS_323 = __VLS_322.slots.default;
    var __VLS_324 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    var __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
        span: (6),
    }));
    var __VLS_326 = __VLS_325.apply(void 0, __spreadArray([{
            span: (6),
        }], __VLS_functionalComponentArgsRest(__VLS_325), false));
    var __VLS_328 = __VLS_327.slots.default;
    var __VLS_329 = {}.ASwitch;
    /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
    // @ts-ignore
    ASwitch;
    // @ts-ignore
    var __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329(__assign({ 'onChange': {} }, { checked: (user.isProxy == 0 ? false : true) })));
    var __VLS_331 = __VLS_330.apply(void 0, __spreadArray([__assign({ 'onChange': {} }, { checked: (user.isProxy == 0 ? false : true) })], __VLS_functionalComponentArgsRest(__VLS_330), false));
    var __VLS_333 = void 0;
    var __VLS_334 = void 0;
    var __VLS_335 = ({ change: {} },
        { onChange: (function () { user.isProxy = user.isProxy == 1 ? 0 : 1; }) });
    var __VLS_337 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    var __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
        span: (14),
    }));
    var __VLS_339 = __VLS_338.apply(void 0, __spreadArray([{
            span: (14),
        }], __VLS_functionalComponentArgsRest(__VLS_338), false));
    var __VLS_341 = __VLS_340.slots.default;
    if (user.isProxy == 1) {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)(__assign({ style: {} }));
    }
    var __VLS_342 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({
        label: "视频模式",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 16, offset: 0 }),
    }));
    var __VLS_344 = __VLS_343.apply(void 0, __spreadArray([{
            label: "视频模式",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 16, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_343), false));
    var __VLS_346 = __VLS_345.slots.default;
    var __VLS_347 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    ARow;
    // @ts-ignore
    var __VLS_348 = __VLS_asFunctionalComponent(__VLS_347, new __VLS_347({
        gutter: (10),
    }));
    var __VLS_349 = __VLS_348.apply(void 0, __spreadArray([{
            gutter: (10),
        }], __VLS_functionalComponentArgsRest(__VLS_348), false));
    var __VLS_351 = __VLS_350.slots.default;
    var __VLS_352 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    var __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
        span: (6),
    }));
    var __VLS_354 = __VLS_353.apply(void 0, __spreadArray([{
            span: (6),
        }], __VLS_functionalComponentArgsRest(__VLS_353), false));
    var __VLS_356 = __VLS_355.slots.default;
    var __VLS_357 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    ASelect;
    // @ts-ignore
    var __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
        value: (user.coursesCustom.videoModel),
    }));
    var __VLS_359 = __VLS_358.apply(void 0, __spreadArray([{
            value: (user.coursesCustom.videoModel),
        }], __VLS_functionalComponentArgsRest(__VLS_358), false));
    var __VLS_361 = __VLS_360.slots.default;
    var __VLS_362 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({
        value: (0),
    }));
    var __VLS_364 = __VLS_363.apply(void 0, __spreadArray([{
            value: (0),
        }], __VLS_functionalComponentArgsRest(__VLS_363), false));
    var __VLS_366 = __VLS_365.slots.default;
    var __VLS_367 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_368 = __VLS_asFunctionalComponent(__VLS_367, new __VLS_367({
        value: (1),
    }));
    var __VLS_369 = __VLS_368.apply(void 0, __spreadArray([{
            value: (1),
        }], __VLS_functionalComponentArgsRest(__VLS_368), false));
    var __VLS_371 = __VLS_370.slots.default;
    var __VLS_372 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
        value: (2),
    }));
    var __VLS_374 = __VLS_373.apply(void 0, __spreadArray([{
            value: (2),
        }], __VLS_functionalComponentArgsRest(__VLS_373), false));
    var __VLS_376 = __VLS_375.slots.default;
    if (user.accountType == 'YINGHUA') {
        var __VLS_377 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        var __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
            value: (3),
        }));
        var __VLS_379 = __VLS_378.apply(void 0, __spreadArray([{
                value: (3),
            }], __VLS_functionalComponentArgsRest(__VLS_378), false));
        var __VLS_381 = __VLS_380.slots.default;
    }
    if (user.accountType == 'XUEXITONG') {
        var __VLS_382 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        var __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({
            value: (3),
        }));
        var __VLS_384 = __VLS_383.apply(void 0, __spreadArray([{
                value: (3),
            }], __VLS_functionalComponentArgsRest(__VLS_383), false));
        var __VLS_386 = __VLS_385.slots.default;
    }
    var __VLS_387 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    var __VLS_388 = __VLS_asFunctionalComponent(__VLS_387, new __VLS_387({
        span: (14),
    }));
    var __VLS_389 = __VLS_388.apply(void 0, __spreadArray([{
            span: (14),
        }], __VLS_functionalComponentArgsRest(__VLS_388), false));
    var __VLS_391 = __VLS_390.slots.default;
    if (user.coursesCustom.videoModel == 2 && user.accountType == 'XUEXITONG') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)(__assign({ style: {} }));
    }
    if (user.coursesCustom.videoModel == 2 && user.accountType == 'YINGHUA') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)(__assign({ style: {} }));
    }
    if (user.coursesCustom.videoModel == 3 && user.accountType == 'YINGHUA') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)(__assign({ style: {} }));
    }
    var __VLS_392 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
        label: "自动考试模式",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 5, offset: 0 }),
    }));
    var __VLS_394 = __VLS_393.apply(void 0, __spreadArray([{
            label: "自动考试模式",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_393), false));
    var __VLS_396 = __VLS_395.slots.default;
    var __VLS_397 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    ASelect;
    // @ts-ignore
    var __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
        value: (user.coursesCustom.autoExam),
    }));
    var __VLS_399 = __VLS_398.apply(void 0, __spreadArray([{
            value: (user.coursesCustom.autoExam),
        }], __VLS_functionalComponentArgsRest(__VLS_398), false));
    var __VLS_401 = __VLS_400.slots.default;
    var __VLS_402 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
        value: (0),
    }));
    var __VLS_404 = __VLS_403.apply(void 0, __spreadArray([{
            value: (0),
        }], __VLS_functionalComponentArgsRest(__VLS_403), false));
    var __VLS_406 = __VLS_405.slots.default;
    var __VLS_407 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_408 = __VLS_asFunctionalComponent(__VLS_407, new __VLS_407({
        value: (1),
    }));
    var __VLS_409 = __VLS_408.apply(void 0, __spreadArray([{
            value: (1),
        }], __VLS_functionalComponentArgsRest(__VLS_408), false));
    var __VLS_411 = __VLS_410.slots.default;
    var __VLS_412 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    var __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({
        value: (2),
    }));
    var __VLS_414 = __VLS_413.apply(void 0, __spreadArray([{
            value: (2),
        }], __VLS_functionalComponentArgsRest(__VLS_413), false));
    var __VLS_416 = __VLS_415.slots.default;
    if (user.coursesCustom.autoExam != 0) {
        var __VLS_417 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        var __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({
            label: "是否自动交卷",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }));
        var __VLS_419 = __VLS_418.apply(void 0, __spreadArray([{
                label: "是否自动交卷",
                labelCol: ({ span: 3 }),
                wrapperCol: ({ span: 5, offset: 0 }),
            }], __VLS_functionalComponentArgsRest(__VLS_418), false));
        var __VLS_421 = __VLS_420.slots.default;
        var __VLS_422 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        ASelect;
        // @ts-ignore
        var __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
            value: (user.coursesCustom.examAutoSubmit),
        }));
        var __VLS_424 = __VLS_423.apply(void 0, __spreadArray([{
                value: (user.coursesCustom.examAutoSubmit),
            }], __VLS_functionalComponentArgsRest(__VLS_423), false));
        var __VLS_426 = __VLS_425.slots.default;
        var __VLS_427 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        var __VLS_428 = __VLS_asFunctionalComponent(__VLS_427, new __VLS_427({
            value: (0),
        }));
        var __VLS_429 = __VLS_428.apply(void 0, __spreadArray([{
                value: (0),
            }], __VLS_functionalComponentArgsRest(__VLS_428), false));
        var __VLS_431 = __VLS_430.slots.default;
        var __VLS_432 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        var __VLS_433 = __VLS_asFunctionalComponent(__VLS_432, new __VLS_432({
            value: (1),
        }));
        var __VLS_434 = __VLS_433.apply(void 0, __spreadArray([{
                value: (1),
            }], __VLS_functionalComponentArgsRest(__VLS_433), false));
        var __VLS_436 = __VLS_435.slots.default;
    }
    var __VLS_437 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_438 = __VLS_asFunctionalComponent(__VLS_437, new __VLS_437({
        label: "只刷课程设定项",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }));
    var __VLS_439 = __VLS_438.apply(void 0, __spreadArray([{
            label: "只刷课程设定项",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 9, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_438), false));
    var __VLS_441 = __VLS_440.slots.default;
    var _loop_2 = function (_, courseIndex) {
        var __VLS_442 = {}.AIntpuGroup;
        /** @type {[typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, ]} */ ;
        // @ts-ignore
        AIntpuGroup;
        // @ts-ignore
        var __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({
            key: (courseIndex),
        }));
        var __VLS_444 = __VLS_443.apply(void 0, __spreadArray([{
                key: (courseIndex),
            }], __VLS_functionalComponentArgsRest(__VLS_443), false));
        var __VLS_446 = __VLS_445.slots.default;
        var __VLS_447 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        ARow;
        // @ts-ignore
        var __VLS_448 = __VLS_asFunctionalComponent(__VLS_447, new __VLS_447(__assign({ gutter: (10) }, { style: {} })));
        var __VLS_449 = __VLS_448.apply(void 0, __spreadArray([__assign({ gutter: (10) }, { style: {} })], __VLS_functionalComponentArgsRest(__VLS_448), false));
        var __VLS_451 = __VLS_450.slots.default;
        var __VLS_452 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        var __VLS_453 = __VLS_asFunctionalComponent(__VLS_452, new __VLS_452({
            span: (19),
        }));
        var __VLS_454 = __VLS_453.apply(void 0, __spreadArray([{
                span: (19),
            }], __VLS_functionalComponentArgsRest(__VLS_453), false));
        var __VLS_456 = __VLS_455.slots.default;
        var __VLS_457 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        var __VLS_458 = __VLS_asFunctionalComponent(__VLS_457, new __VLS_457({
            value: (user.coursesCustom.includeCourses[courseIndex]),
            placeholder: "请输入课程名称",
        }));
        var __VLS_459 = __VLS_458.apply(void 0, __spreadArray([{
                value: (user.coursesCustom.includeCourses[courseIndex]),
                placeholder: "请输入课程名称",
            }], __VLS_functionalComponentArgsRest(__VLS_458), false));
        var __VLS_462 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        var __VLS_463 = __VLS_asFunctionalComponent(__VLS_462, new __VLS_462({
            span: (1),
        }));
        var __VLS_464 = __VLS_463.apply(void 0, __spreadArray([{
                span: (1),
            }], __VLS_functionalComponentArgsRest(__VLS_463), false));
        var __VLS_466 = __VLS_465.slots.default;
        var __VLS_467 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        AButton;
        // @ts-ignore
        var __VLS_468 = __VLS_asFunctionalComponent(__VLS_467, new __VLS_467(__assign({ 'onClick': {} })));
        var __VLS_469 = __VLS_468.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_468), false));
        var __VLS_471 = void 0;
        var __VLS_472 = void 0;
        var __VLS_473 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    __VLS_ctx.removeIncludeCourse(index, courseIndex);
                    // @ts-ignore
                    [removeIncludeCourse,];
                } });
        var __VLS_474 = __VLS_470.slots.default;
    };
    for (var _c = 0, _d = __VLS_getVForSourceType((user.coursesCustom.includeCourses)); _c < _d.length; _c++) {
        var _e = _d[_c], _ = _e[0], courseIndex = _e[1];
        _loop_2(_, courseIndex);
    }
    var __VLS_475 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    AButton;
    // @ts-ignore
    var __VLS_476 = __VLS_asFunctionalComponent(__VLS_475, new __VLS_475(__assign(__assign({ 'onClick': {} }, { type: "dashed", block: true }), { style: {} })));
    var __VLS_477 = __VLS_476.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "dashed", block: true }), { style: {} })], __VLS_functionalComponentArgsRest(__VLS_476), false));
    var __VLS_479 = void 0;
    var __VLS_480 = void 0;
    var __VLS_481 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.addIncludeCourse(index);
                // @ts-ignore
                [addIncludeCourse,];
            } });
    var __VLS_482 = __VLS_478.slots.default;
    {
        var __VLS_483 = __VLS_478.slots.icon;
        var __VLS_484 = {}.PlusOutlined;
        /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
        // @ts-ignore
        icons_vue_1.PlusOutlined;
        // @ts-ignore
        var __VLS_485 = __VLS_asFunctionalComponent(__VLS_484, new __VLS_484({}));
        var __VLS_486 = __VLS_485.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_485), false));
    }
    var __VLS_489 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    var __VLS_490 = __VLS_asFunctionalComponent(__VLS_489, new __VLS_489({
        label: "排除课程设定项",
        labelCol: ({ span: 3 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }));
    var __VLS_491 = __VLS_490.apply(void 0, __spreadArray([{
            label: "排除课程设定项",
            labelCol: ({ span: 3 }),
            wrapperCol: ({ span: 9, offset: 0 }),
        }], __VLS_functionalComponentArgsRest(__VLS_490), false));
    var __VLS_493 = __VLS_492.slots.default;
    var _loop_3 = function (_, courseIndex) {
        var __VLS_494 = {}.AIntpuGroup;
        /** @type {[typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, ]} */ ;
        // @ts-ignore
        AIntpuGroup;
        // @ts-ignore
        var __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({
            key: (courseIndex),
        }));
        var __VLS_496 = __VLS_495.apply(void 0, __spreadArray([{
                key: (courseIndex),
            }], __VLS_functionalComponentArgsRest(__VLS_495), false));
        var __VLS_498 = __VLS_497.slots.default;
        var __VLS_499 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        ARow;
        // @ts-ignore
        var __VLS_500 = __VLS_asFunctionalComponent(__VLS_499, new __VLS_499(__assign({ gutter: (10) }, { style: {} })));
        var __VLS_501 = __VLS_500.apply(void 0, __spreadArray([__assign({ gutter: (10) }, { style: {} })], __VLS_functionalComponentArgsRest(__VLS_500), false));
        var __VLS_503 = __VLS_502.slots.default;
        var __VLS_504 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        var __VLS_505 = __VLS_asFunctionalComponent(__VLS_504, new __VLS_504({
            span: (19),
        }));
        var __VLS_506 = __VLS_505.apply(void 0, __spreadArray([{
                span: (19),
            }], __VLS_functionalComponentArgsRest(__VLS_505), false));
        var __VLS_508 = __VLS_507.slots.default;
        var __VLS_509 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        var __VLS_510 = __VLS_asFunctionalComponent(__VLS_509, new __VLS_509({
            value: (user.coursesCustom.excludeCourses[courseIndex]),
            placeholder: "请输入课程名称",
        }));
        var __VLS_511 = __VLS_510.apply(void 0, __spreadArray([{
                value: (user.coursesCustom.excludeCourses[courseIndex]),
                placeholder: "请输入课程名称",
            }], __VLS_functionalComponentArgsRest(__VLS_510), false));
        var __VLS_514 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        var __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({
            span: (1),
        }));
        var __VLS_516 = __VLS_515.apply(void 0, __spreadArray([{
                span: (1),
            }], __VLS_functionalComponentArgsRest(__VLS_515), false));
        var __VLS_518 = __VLS_517.slots.default;
        var __VLS_519 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        AButton;
        // @ts-ignore
        var __VLS_520 = __VLS_asFunctionalComponent(__VLS_519, new __VLS_519(__assign({ 'onClick': {} })));
        var __VLS_521 = __VLS_520.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_520), false));
        var __VLS_523 = void 0;
        var __VLS_524 = void 0;
        var __VLS_525 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    __VLS_ctx.removeExcludeCourse(index, courseIndex);
                    // @ts-ignore
                    [removeExcludeCourse,];
                } });
        var __VLS_526 = __VLS_522.slots.default;
    };
    for (var _f = 0, _g = __VLS_getVForSourceType((user.coursesCustom.excludeCourses)); _f < _g.length; _f++) {
        var _h = _g[_f], _ = _h[0], courseIndex = _h[1];
        _loop_3(_, courseIndex);
    }
    var __VLS_527 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    AButton;
    // @ts-ignore
    var __VLS_528 = __VLS_asFunctionalComponent(__VLS_527, new __VLS_527(__assign(__assign({ 'onClick': {} }, { type: "dashed", block: true }), { style: {} })));
    var __VLS_529 = __VLS_528.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "dashed", block: true }), { style: {} })], __VLS_functionalComponentArgsRest(__VLS_528), false));
    var __VLS_531 = void 0;
    var __VLS_532 = void 0;
    var __VLS_533 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.addExcludeCourse(index);
                // @ts-ignore
                [addExcludeCourse,];
            } });
    var __VLS_534 = __VLS_530.slots.default;
    {
        var __VLS_535 = __VLS_530.slots.icon;
        var __VLS_536 = {}.PlusOutlined;
        /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
        // @ts-ignore
        icons_vue_1.PlusOutlined;
        // @ts-ignore
        var __VLS_537 = __VLS_asFunctionalComponent(__VLS_536, new __VLS_536({}));
        var __VLS_538 = __VLS_537.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_537), false));
    }
};
var __VLS_262, __VLS_267, __VLS_272, __VLS_277, __VLS_282, __VLS_257, __VLS_252, __VLS_287, __VLS_297, __VLS_307, __VLS_332, __VLS_327, __VLS_340, __VLS_322, __VLS_317, __VLS_365, __VLS_370, __VLS_375, __VLS_380, __VLS_385, __VLS_360, __VLS_355, __VLS_390, __VLS_350, __VLS_345, __VLS_405, __VLS_410, __VLS_415, __VLS_400, __VLS_395, __VLS_430, __VLS_435, __VLS_425, __VLS_420, __VLS_455, __VLS_470, __VLS_465, __VLS_450, __VLS_445, __VLS_478, __VLS_440, __VLS_507, __VLS_522, __VLS_517, __VLS_502, __VLS_497, __VLS_530, __VLS_492, __VLS_247, __VLS_242, __VLS_237, __VLS_232;
for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.form.users)); _i < _a.length; _i++) {
    var _b = _a[_i], user = _b[0], index = _b[1];
    _loop_1(user, index);
}
var __VLS_227;
var __VLS_541 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
AButton;
// @ts-ignore
var __VLS_542 = __VLS_asFunctionalComponent(__VLS_541, new __VLS_541(__assign(__assign({ 'onClick': {} }, { type: "dashed", block: true }), { style: {} })));
var __VLS_543 = __VLS_542.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "dashed", block: true }), { style: {} })], __VLS_functionalComponentArgsRest(__VLS_542), false));
var __VLS_545;
var __VLS_546;
var __VLS_547 = ({ click: {} },
    { onClick: (__VLS_ctx.addUser) });
var __VLS_548 = __VLS_544.slots.default;
// @ts-ignore
[addUser,];
{
    var __VLS_549 = __VLS_544.slots.icon;
    var __VLS_550 = {}.PlusOutlined;
    /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
    // @ts-ignore
    icons_vue_1.PlusOutlined;
    // @ts-ignore
    var __VLS_551 = __VLS_asFunctionalComponent(__VLS_550, new __VLS_550({}));
    var __VLS_552 = __VLS_551.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_551), false));
}
var __VLS_544;
var __VLS_555 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
AButton;
// @ts-ignore
var __VLS_556 = __VLS_asFunctionalComponent(__VLS_555, new __VLS_555(__assign(__assign({ 'onClick': {} }, { type: "default", shape: "circle", icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)) }), { style: {} })));
var __VLS_557 = __VLS_556.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "default", shape: "circle", icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)) }), { style: {} })], __VLS_functionalComponentArgsRest(__VLS_556), false));
var __VLS_559;
var __VLS_560;
var __VLS_561 = ({ click: {} },
    { onClick: (__VLS_ctx.importClick) });
var __VLS_562 = __VLS_558.slots.default;
// @ts-ignore
[vue_1.h, icons_vue_2.DownloadOutlined, importClick,];
var __VLS_558;
__VLS_asFunctionalElement(__VLS_elements.input)(__assign(__assign({ onChange: (__VLS_ctx.importYaml) }, { ref: "fileInput", type: "file", accept: ".yaml,.yml" }), { style: {} }));
/** @type {typeof __VLS_ctx.fileInput} */ ;
// @ts-ignore
[importYaml, fileInput,];
var __VLS_563 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
AButton;
// @ts-ignore
var __VLS_564 = __VLS_asFunctionalComponent(__VLS_563, new __VLS_563(__assign(__assign({ 'onClick': {} }, { type: "primary", shape: "circle", icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)) }), { style: {} })));
var __VLS_565 = __VLS_564.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "primary", shape: "circle", icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)) }), { style: {} })], __VLS_functionalComponentArgsRest(__VLS_564), false));
var __VLS_567;
var __VLS_568;
var __VLS_569 = ({ click: {} },
    { onClick: (__VLS_ctx.exportYaml) });
var __VLS_570 = __VLS_566.slots.default;
// @ts-ignore
[vue_1.h, icons_vue_2.DownloadOutlined, exportYaml,];
var __VLS_566;
var __VLS_8;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)(__assign({ style: {} }));
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.isDragging) }), null, null);
// @ts-ignore
[isDragging,];
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () { return ({
        h: vue_1.h,
        PlusOutlined: icons_vue_1.PlusOutlined,
        DeleteOutlined: icons_vue_1.DeleteOutlined,
        DownloadOutlined: icons_vue_2.DownloadOutlined,
        importYaml: importYaml,
        form: form,
        isDragging: isDragging,
        addUser: addUser,
        removeUser: removeUser,
        addIncludeCourse: addIncludeCourse,
        removeIncludeCourse: removeIncludeCourse,
        addExcludeCourse: addExcludeCourse,
        removeExcludeCourse: removeExcludeCourse,
        exportYaml: exportYaml,
        fileInput: fileInput,
        importClick: importClick,
    }); },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
