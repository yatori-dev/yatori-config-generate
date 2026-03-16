import { reactive, h, ref, onMounted, onUnmounted } from 'vue';
import { saveAs } from 'file-saver';
import * as yaml from 'js-yaml';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
function deepMerge(target, source) {
    for (const key in target) {
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
                userName: '',
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
                informEmails: [],
                coursesCustom: {
                    studyTime: "10-30",
                    shuffleSw: 0,
                    cxNode: 3,
                    videoModel: 1,
                    autoExam: 0,
                    cxChapterTestSw: 1,
                    cxWorkSw: 1,
                    cxExamSw: 1,
                    examAutoSubmit: 0,
                    excludeCourses: [],
                    includeCourses: []
                },
            },
        ],
    };
}
function importYaml(event) {
    let file;
    if (event.dataTransfer?.files?.length) {
        file = event.dataTransfer.files[0];
    }
    else if (event.target?.files?.length) {
        file = event.target.files?.[0];
    }
    if (!file || !file.name.endsWith('.yml') && !file.name.endsWith('.yaml')) {
        alert('请上传 YAML 文件（.yml 或 .yaml）');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            const parsed = yaml.load(text);
            const defaultForm = getDefaultForm();
            // 特殊处理 users：逐个合并
            if (Array.isArray(parsed.users)) {
                defaultForm.users = parsed.users.map((u) => {
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
const form = reactive(getDefaultForm());
const isDragging = ref(false); //控制文件拖拽
//新增用户
function addUser() {
    form.users.push({
        accountType: 'YINGHUA',
        url: '',
        account: '',
        password: '',
        isProxy: 0,
        informEmails: [],
        coursesCustom: {
            studyTime: "10-30",
            shuffleSw: 0,
            cxNode: 3,
            cxChapterTestSw: 1,
            cxWorkSw: 1,
            cxExamSw: 1,
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
    const processed = JSON.parse(JSON.stringify(form));
    const yamlStr = yaml.dump(processed, {
        styles: {
            '!!str': 'single-quoted'
        },
        quotingType: '\'', // ✅ 显式使用单引号（避免双引号）
        forceQuotes: true // ✅ 强制所有字符串加引号
    });
    const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' });
    saveAs(blob, 'config.yaml');
}
//添加通知邮箱
function addInformEmail(userIndex) {
    // form.users[userIndex].informEmails=[]
    form.users[userIndex].informEmails.push("");
}
//移除通知邮箱
function removeInformEmail(userIndex, emailIndex) {
    form.users[userIndex].informEmails.splice(emailIndex, 1);
}
// 文件输入框的引用
const fileInput = ref(null);
// 触发文件选择
function importClick() {
    fileInput.value?.click();
}
// 拖拽事件绑定
let dragCounter = 0;
const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter++;
    isDragging.value = true;
};
const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
        isDragging.value = false;
    }
};
const handleDrop = (e) => {
    e.preventDefault();
    dragCounter = 0;
    isDragging.value = false;
    importYaml(e);
};
onMounted(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', (e) => e.preventDefault());
});
onUnmounted(() => {
    window.removeEventListener('dragenter', handleDragEnter);
    window.removeEventListener('dragleave', handleDragLeave);
    window.removeEventListener('drop', handleDrop);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ style: {} },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
ACard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
const __VLS_5 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
AForm;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    model: (__VLS_ctx.form),
    layout: "horizontal",
}));
const __VLS_7 = __VLS_6({
    model: (__VLS_ctx.form),
    layout: "horizontal",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
// @ts-ignore
[form,];
const __VLS_10 = {}.ACollapse;
/** @type {[typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, ]} */ ;
// @ts-ignore
ACollapse;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    defaultActiveKey: ([]),
    accordion: true,
}));
const __VLS_12 = __VLS_11({
    defaultActiveKey: ([]),
    accordion: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_14 } = __VLS_13.slots;
const __VLS_15 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    key: "1",
    header: "基础设置",
}));
const __VLS_17 = __VLS_16({
    key: "1",
    header: "基础设置",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_19 } = __VLS_18.slots;
const __VLS_20 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "完成提示音",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
const __VLS_22 = __VLS_21({
    label: "完成提示音",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_24 } = __VLS_23.slots;
const __VLS_25 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onChange': {} },
    checked: (__VLS_ctx.form.setting.basicSetting.completionTone == 0 ? false : true),
}));
const __VLS_27 = __VLS_26({
    ...{ 'onChange': {} },
    checked: (__VLS_ctx.form.setting.basicSetting.completionTone == 0 ? false : true),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
const __VLS_31 = ({ change: {} },
    { onChange: (function () {
            __VLS_ctx.form.setting.basicSetting.completionTone = __VLS_ctx.form.setting.basicSetting.completionTone == 1 ? 0 : 1;
        }) });
// @ts-ignore
[form, form, form,];
var __VLS_28;
var __VLS_23;
const __VLS_33 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    label: "彩色日志",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 5, offset: 0 }),
}));
const __VLS_35 = __VLS_34({
    label: "彩色日志",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 5, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_37 } = __VLS_36.slots;
const __VLS_38 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    ...{ 'onChange': {} },
    checked: (__VLS_ctx.form.setting.basicSetting.colorLog == 0 ? false : true),
}));
const __VLS_40 = __VLS_39({
    ...{ 'onChange': {} },
    checked: (__VLS_ctx.form.setting.basicSetting.colorLog == 0 ? false : true),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
let __VLS_42;
let __VLS_43;
const __VLS_44 = ({ change: {} },
    { onChange: (function () {
            __VLS_ctx.form.setting.basicSetting.colorLog = __VLS_ctx.form.setting.basicSetting.colorLog == 1 ? 0 : 1;
        }) });
// @ts-ignore
[form, form, form,];
var __VLS_41;
var __VLS_36;
const __VLS_46 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: "日志输出到文件",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
const __VLS_48 = __VLS_47({
    label: "日志输出到文件",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
const { default: __VLS_50 } = __VLS_49.slots;
const __VLS_51 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    ...{ 'onChange': {} },
    checked: (__VLS_ctx.form.setting.basicSetting.logOutFileSw == 0 ? false : true),
}));
const __VLS_53 = __VLS_52({
    ...{ 'onChange': {} },
    checked: (__VLS_ctx.form.setting.basicSetting.logOutFileSw == 0 ? false : true),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
let __VLS_55;
let __VLS_56;
const __VLS_57 = ({ change: {} },
    { onChange: (function () {
            __VLS_ctx.form.setting.basicSetting.logOutFileSw = __VLS_ctx.form.setting.basicSetting.logOutFileSw == 1 ? 0 : 1;
        }) });
// @ts-ignore
[form, form, form,];
var __VLS_54;
var __VLS_49;
const __VLS_59 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    label: "日志等级",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 3, offset: 0 }),
}));
const __VLS_61 = __VLS_60({
    label: "日志等级",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 3, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_63 } = __VLS_62.slots;
const __VLS_64 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
ASelect;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: (__VLS_ctx.form.setting.basicSetting.logLevel),
}));
const __VLS_66 = __VLS_65({
    value: (__VLS_ctx.form.setting.basicSetting.logLevel),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_68 } = __VLS_67.slots;
// @ts-ignore
[form,];
const __VLS_69 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    value: "INFO",
}));
const __VLS_71 = __VLS_70({
    value: "INFO",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
const { default: __VLS_73 } = __VLS_72.slots;
var __VLS_72;
const __VLS_74 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    value: "DEBUG",
}));
const __VLS_76 = __VLS_75({
    value: "DEBUG",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
const { default: __VLS_78 } = __VLS_77.slots;
var __VLS_77;
var __VLS_67;
var __VLS_62;
var __VLS_18;
const __VLS_79 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    key: "2",
    header: "邮箱通知配置",
}));
const __VLS_81 = __VLS_80({
    key: "2",
    header: "邮箱通知配置",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
const { default: __VLS_83 } = __VLS_82.slots;
const __VLS_84 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "开启",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}));
const __VLS_86 = __VLS_85({
    label: "开启",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 2, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_88 } = __VLS_87.slots;
const __VLS_89 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
ASwitch;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    checked: (__VLS_ctx.form.setting.emailInform.sw),
}));
const __VLS_91 = __VLS_90({
    checked: (__VLS_ctx.form.setting.emailInform.sw),
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
// @ts-ignore
[form,];
var __VLS_87;
const __VLS_94 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    label: "SMTP Host",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
const __VLS_96 = __VLS_95({
    label: "SMTP Host",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
const { default: __VLS_98 } = __VLS_97.slots;
const __VLS_99 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
    value: (__VLS_ctx.form.setting.emailInform.SMTPHost),
    placeholder: "请输入HOST值",
}));
const __VLS_101 = __VLS_100({
    value: (__VLS_ctx.form.setting.emailInform.SMTPHost),
    placeholder: "请输入HOST值",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
// @ts-ignore
[form,];
var __VLS_97;
const __VLS_104 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "SMTP Port",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
const __VLS_106 = __VLS_105({
    label: "SMTP Port",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const { default: __VLS_108 } = __VLS_107.slots;
const __VLS_109 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    value: (__VLS_ctx.form.setting.emailInform.SMTPPort),
    placeholder: "请输入端口号",
}));
const __VLS_111 = __VLS_110({
    value: (__VLS_ctx.form.setting.emailInform.SMTPPort),
    placeholder: "请输入端口号",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
// @ts-ignore
[form,];
var __VLS_107;
const __VLS_114 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    label: "userName(Email)",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
const __VLS_116 = __VLS_115({
    label: "userName(Email)",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
const { default: __VLS_118 } = __VLS_117.slots;
const __VLS_119 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    value: (__VLS_ctx.form.setting.emailInform.userName),
    placeholder: "请输入邮箱",
}));
const __VLS_121 = __VLS_120({
    value: (__VLS_ctx.form.setting.emailInform.userName),
    placeholder: "请输入邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
// @ts-ignore
[form,];
var __VLS_117;
const __VLS_124 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "密码",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
const __VLS_126 = __VLS_125({
    label: "密码",
    labelCol: ({ span: 4 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
const { default: __VLS_128 } = __VLS_127.slots;
const __VLS_129 = {}.AInputPassword;
/** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
// @ts-ignore
AInputPassword;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    value: (__VLS_ctx.form.setting.emailInform.password),
    placeholder: "请输入密码",
}));
const __VLS_131 = __VLS_130({
    value: (__VLS_ctx.form.setting.emailInform.password),
    placeholder: "请输入密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
// @ts-ignore
[form,];
var __VLS_127;
var __VLS_82;
const __VLS_134 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    key: "3",
    header: "AI大模型自动答题设置",
}));
const __VLS_136 = __VLS_135({
    key: "3",
    header: "AI大模型自动答题设置",
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
const { default: __VLS_138 } = __VLS_137.slots;
const __VLS_139 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
    label: "AI类型",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 5, offset: 0 }),
}));
const __VLS_141 = __VLS_140({
    label: "AI类型",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 5, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
const { default: __VLS_143 } = __VLS_142.slots;
const __VLS_144 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
ASelect;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    value: (__VLS_ctx.form.setting.aiSetting.aiType),
}));
const __VLS_146 = __VLS_145({
    value: (__VLS_ctx.form.setting.aiSetting.aiType),
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const { default: __VLS_148 } = __VLS_147.slots;
// @ts-ignore
[form,];
const __VLS_149 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    value: ('SILICON'),
}));
const __VLS_151 = __VLS_150({
    value: ('SILICON'),
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
const { default: __VLS_153 } = __VLS_152.slots;
var __VLS_152;
const __VLS_154 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    value: ('DEEPSEEK'),
}));
const __VLS_156 = __VLS_155({
    value: ('DEEPSEEK'),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
const { default: __VLS_158 } = __VLS_157.slots;
var __VLS_157;
const __VLS_159 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    value: ('CHATGLM'),
}));
const __VLS_161 = __VLS_160({
    value: ('CHATGLM'),
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
const { default: __VLS_163 } = __VLS_162.slots;
var __VLS_162;
const __VLS_164 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    value: ('TONGYI'),
}));
const __VLS_166 = __VLS_165({
    value: ('TONGYI'),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
const { default: __VLS_168 } = __VLS_167.slots;
var __VLS_167;
const __VLS_169 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    value: ('XINGHUO'),
}));
const __VLS_171 = __VLS_170({
    value: ('XINGHUO'),
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
const { default: __VLS_173 } = __VLS_172.slots;
var __VLS_172;
const __VLS_174 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    value: ('DOUBAO'),
}));
const __VLS_176 = __VLS_175({
    value: ('DOUBAO'),
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
const { default: __VLS_178 } = __VLS_177.slots;
var __VLS_177;
const __VLS_179 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
    value: ('METAAI'),
}));
const __VLS_181 = __VLS_180({
    value: ('METAAI'),
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
const { default: __VLS_183 } = __VLS_182.slots;
var __VLS_182;
const __VLS_184 = {}.ASelectOption;
/** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
// @ts-ignore
ASelectOption;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    value: ('OTHER'),
}));
const __VLS_186 = __VLS_185({
    value: ('OTHER'),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const { default: __VLS_188 } = __VLS_187.slots;
var __VLS_187;
var __VLS_147;
var __VLS_142;
if (__VLS_ctx.form.setting.aiSetting.aiType == 'OTHER') {
    // @ts-ignore
    [form,];
    const __VLS_189 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
        label: "AI URL",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    const __VLS_191 = __VLS_190({
        label: "AI URL",
        labelCol: ({ span: 2 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    const { default: __VLS_193 } = __VLS_192.slots;
    const __VLS_194 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    AInput;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
        value: (__VLS_ctx.form.setting.aiSetting.aiUrl),
        placeholder: "请输入模型API接口链接",
    }));
    const __VLS_196 = __VLS_195({
        value: (__VLS_ctx.form.setting.aiSetting.aiUrl),
        placeholder: "请输入模型API接口链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    // @ts-ignore
    [form,];
    var __VLS_192;
}
const __VLS_199 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
    label: "模型",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
const __VLS_201 = __VLS_200({
    label: "模型",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_200));
const { default: __VLS_203 } = __VLS_202.slots;
const __VLS_204 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    value: (__VLS_ctx.form.setting.aiSetting.model),
    placeholder: "请输入所选模型编号",
}));
const __VLS_206 = __VLS_205({
    value: (__VLS_ctx.form.setting.aiSetting.model),
    placeholder: "请输入所选模型编号",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
// @ts-ignore
[form,];
var __VLS_202;
const __VLS_209 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    label: "API_KEY",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 15, offset: 0 }),
}));
const __VLS_211 = __VLS_210({
    label: "API_KEY",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 15, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
const { default: __VLS_213 } = __VLS_212.slots;
const __VLS_214 = {}.AInputPassword;
/** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
// @ts-ignore
AInputPassword;
// @ts-ignore
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
    value: (__VLS_ctx.form.setting.aiSetting.API_KEY),
    placeholder: "请输入模型的API_KEY",
}));
const __VLS_216 = __VLS_215({
    value: (__VLS_ctx.form.setting.aiSetting.API_KEY),
    placeholder: "请输入模型的API_KEY",
}, ...__VLS_functionalComponentArgsRest(__VLS_215));
// @ts-ignore
[form,];
var __VLS_212;
var __VLS_137;
const __VLS_219 = {}.ACollapsePanel;
/** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
// @ts-ignore
ACollapsePanel;
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
    key: "4",
    header: "API外挂题库设置",
}));
const __VLS_221 = __VLS_220({
    key: "4",
    header: "API外挂题库设置",
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
const { default: __VLS_223 } = __VLS_222.slots;
const __VLS_224 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
AFormItem;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    label: "接口地址",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}));
const __VLS_226 = __VLS_225({
    label: "接口地址",
    labelCol: ({ span: 2 }),
    wrapperCol: ({ span: 10, offset: 0 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
const { default: __VLS_228 } = __VLS_227.slots;
const __VLS_229 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
AInput;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    value: (__VLS_ctx.form.setting.apiQueSetting.url),
    placeholder: "请输入外挂题库对应访问URL",
}));
const __VLS_231 = __VLS_230({
    value: (__VLS_ctx.form.setting.apiQueSetting.url),
    placeholder: "请输入外挂题库对应访问URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
// @ts-ignore
[form,];
var __VLS_227;
var __VLS_222;
var __VLS_13;
const __VLS_234 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
ADivider;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({}));
const __VLS_236 = __VLS_235({}, ...__VLS_functionalComponentArgsRest(__VLS_235));
const { default: __VLS_238 } = __VLS_237.slots;
var __VLS_237;
const __VLS_239 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
ARow;
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
    gutter: "[16, 16]",
}));
const __VLS_241 = __VLS_240({
    gutter: "[16, 16]",
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
const { default: __VLS_243 } = __VLS_242.slots;
for (const [user, index] of __VLS_getVForSourceType((__VLS_ctx.form.users))) {
    // @ts-ignore
    [form,];
    const __VLS_244 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
        span: (24),
        key: (index),
        ...{ style: {} },
    }));
    const __VLS_246 = __VLS_245({
        span: (24),
        key: (index),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    const { default: __VLS_248 } = __VLS_247.slots;
    const __VLS_249 = {}.ACollapse;
    /** @type {[typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, typeof __VLS_components.ACollapse, typeof __VLS_components.aCollapse, ]} */ ;
    // @ts-ignore
    ACollapse;
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
        defaultActiveKey: ([]),
        accordion: true,
    }));
    const __VLS_251 = __VLS_250({
        defaultActiveKey: ([]),
        accordion: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_250));
    const { default: __VLS_253 } = __VLS_252.slots;
    const __VLS_254 = {}.ACollapsePanel;
    /** @type {[typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, typeof __VLS_components.ACollapsePanel, typeof __VLS_components.aCollapsePanel, ]} */ ;
    // @ts-ignore
    ACollapsePanel;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
        key: (index),
        header: ('用户 ' + (index + 1)),
        extra: (index > 0 ? __VLS_ctx.h(__VLS_ctx.DeleteOutlined, { onClick: () => __VLS_ctx.removeUser(index), style: 'color:red;cursor:pointer' }) : null),
    }));
    const __VLS_256 = __VLS_255({
        key: (index),
        header: ('用户 ' + (index + 1)),
        extra: (index > 0 ? __VLS_ctx.h(__VLS_ctx.DeleteOutlined, { onClick: () => __VLS_ctx.removeUser(index), style: 'color:red;cursor:pointer' }) : null),
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
    const { default: __VLS_258 } = __VLS_257.slots;
    // @ts-ignore
    [h, DeleteOutlined, removeUser,];
    const __VLS_259 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    ACard;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({}));
    const __VLS_261 = __VLS_260({}, ...__VLS_functionalComponentArgsRest(__VLS_260));
    const { default: __VLS_263 } = __VLS_262.slots;
    const __VLS_264 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        label: "账户类型",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 6, offset: 0 }),
    }));
    const __VLS_266 = __VLS_265({
        label: "账户类型",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 6, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    const { default: __VLS_268 } = __VLS_267.slots;
    const __VLS_269 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    ASelect;
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
        value: (user.accountType),
    }));
    const __VLS_271 = __VLS_270({
        value: (user.accountType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_270));
    const { default: __VLS_273 } = __VLS_272.slots;
    const __VLS_274 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
        value: ('YINGHUA'),
    }));
    const __VLS_276 = __VLS_275({
        value: ('YINGHUA'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    const { default: __VLS_278 } = __VLS_277.slots;
    var __VLS_277;
    const __VLS_279 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
        value: ('XUEXITONG'),
    }));
    const __VLS_281 = __VLS_280({
        value: ('XUEXITONG'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_280));
    const { default: __VLS_283 } = __VLS_282.slots;
    var __VLS_282;
    const __VLS_284 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
        value: ('ENAEA'),
    }));
    const __VLS_286 = __VLS_285({
        value: ('ENAEA'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_285));
    const { default: __VLS_288 } = __VLS_287.slots;
    var __VLS_287;
    const __VLS_289 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({
        value: ('WELEARN'),
    }));
    const __VLS_291 = __VLS_290({
        value: ('WELEARN'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_290));
    const { default: __VLS_293 } = __VLS_292.slots;
    var __VLS_292;
    const __VLS_294 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
        value: ('ICVE'),
    }));
    const __VLS_296 = __VLS_295({
        value: ('ICVE'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_295));
    const { default: __VLS_298 } = __VLS_297.slots;
    var __VLS_297;
    const __VLS_299 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
        value: ('CQIE'),
    }));
    const __VLS_301 = __VLS_300({
        value: ('CQIE'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    const { default: __VLS_303 } = __VLS_302.slots;
    var __VLS_302;
    const __VLS_304 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        value: ('KETANGX'),
    }));
    const __VLS_306 = __VLS_305({
        value: ('KETANGX'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    const { default: __VLS_308 } = __VLS_307.slots;
    var __VLS_307;
    const __VLS_309 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
        value: ('CANGHUI'),
    }));
    const __VLS_311 = __VLS_310({
        value: ('CANGHUI'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    const { default: __VLS_313 } = __VLS_312.slots;
    var __VLS_312;
    const __VLS_314 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
        value: ('QSXT'),
    }));
    const __VLS_316 = __VLS_315({
        value: ('QSXT'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_315));
    const { default: __VLS_318 } = __VLS_317.slots;
    var __VLS_317;
    const __VLS_319 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
        value: ('HQKJ'),
    }));
    const __VLS_321 = __VLS_320({
        value: ('HQKJ'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_320));
    const { default: __VLS_323 } = __VLS_322.slots;
    var __VLS_322;
    var __VLS_272;
    var __VLS_267;
    if (user.accountType == 'YINGHUA' || user.accountType == 'HQKJ') {
        const __VLS_324 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
            label: "URL",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }));
        const __VLS_326 = __VLS_325({
            label: "URL",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        const { default: __VLS_328 } = __VLS_327.slots;
        const __VLS_329 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
            value: (user.url),
            placeholder: "对应平台登录后的URL链接，英华和海旗科技的填，其他的平台不用填",
        }));
        const __VLS_331 = __VLS_330({
            value: (user.url),
            placeholder: "对应平台登录后的URL链接，英华和海旗科技的填，其他的平台不用填",
        }, ...__VLS_functionalComponentArgsRest(__VLS_330));
        var __VLS_327;
    }
    const __VLS_334 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({
        label: "账号",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    const __VLS_336 = __VLS_335({
        label: "账号",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_335));
    const { default: __VLS_338 } = __VLS_337.slots;
    const __VLS_339 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    AInput;
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({
        value: (user.account),
        placeholder: "请输入账号",
    }));
    const __VLS_341 = __VLS_340({
        value: (user.account),
        placeholder: "请输入账号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_340));
    var __VLS_337;
    const __VLS_344 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
        label: "密码",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    const __VLS_346 = __VLS_345({
        label: "密码",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_345));
    const { default: __VLS_348 } = __VLS_347.slots;
    const __VLS_349 = {}.AInputPassword;
    /** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
    // @ts-ignore
    AInputPassword;
    // @ts-ignore
    const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
        value: (user.password),
        placeholder: "请输入密码",
    }));
    const __VLS_351 = __VLS_350({
        value: (user.password),
        placeholder: "请输入密码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_350));
    var __VLS_347;
    const __VLS_354 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({
        label: "是否开启代理",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }));
    const __VLS_356 = __VLS_355({
        label: "是否开启代理",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 10, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_355));
    const { default: __VLS_358 } = __VLS_357.slots;
    const __VLS_359 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    ARow;
    // @ts-ignore
    const __VLS_360 = __VLS_asFunctionalComponent(__VLS_359, new __VLS_359({
        gutter: (10),
    }));
    const __VLS_361 = __VLS_360({
        gutter: (10),
    }, ...__VLS_functionalComponentArgsRest(__VLS_360));
    const { default: __VLS_363 } = __VLS_362.slots;
    const __VLS_364 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
        span: (6),
    }));
    const __VLS_366 = __VLS_365({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_365));
    const { default: __VLS_368 } = __VLS_367.slots;
    const __VLS_369 = {}.ASwitch;
    /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
    // @ts-ignore
    ASwitch;
    // @ts-ignore
    const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
        ...{ 'onChange': {} },
        checked: (user.isProxy == 0 ? false : true),
    }));
    const __VLS_371 = __VLS_370({
        ...{ 'onChange': {} },
        checked: (user.isProxy == 0 ? false : true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_370));
    let __VLS_373;
    let __VLS_374;
    const __VLS_375 = ({ change: {} },
        { onChange: (function () { user.isProxy = user.isProxy == 1 ? 0 : 1; }) });
    var __VLS_372;
    var __VLS_367;
    const __VLS_377 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
        span: (14),
    }));
    const __VLS_379 = __VLS_378({
        span: (14),
    }, ...__VLS_functionalComponentArgsRest(__VLS_378));
    const { default: __VLS_381 } = __VLS_380.slots;
    if (user.isProxy == 1) {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
    }
    var __VLS_380;
    var __VLS_362;
    var __VLS_357;
    if (user.accountType == 'XUEXITONG' && user.coursesCustom.videoModel == 3) {
        const __VLS_382 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({
            label: "同时任务点数量",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }));
        const __VLS_384 = __VLS_383({
            label: "同时任务点数量",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 10, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_383));
        const { default: __VLS_386 } = __VLS_385.slots;
        const __VLS_387 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        const __VLS_388 = __VLS_asFunctionalComponent(__VLS_387, new __VLS_387({
            value: (user.coursesCustom.cxNode),
            min: (-1),
            max: (9999),
            placeholder: "请输入同时任务点数量",
        }));
        const __VLS_389 = __VLS_388({
            value: (user.coursesCustom.cxNode),
            min: (-1),
            max: (9999),
            placeholder: "请输入同时任务点数量",
        }, ...__VLS_functionalComponentArgsRest(__VLS_388));
        var __VLS_385;
    }
    const __VLS_392 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
        label: "通知邮箱",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }));
    const __VLS_394 = __VLS_393({
        label: "通知邮箱",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_393));
    const { default: __VLS_396 } = __VLS_395.slots;
    for (const [_, emailIndex] of __VLS_getVForSourceType((user.informEmails))) {
        const __VLS_397 = {}.AIntpuGroup;
        /** @type {[typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, ]} */ ;
        // @ts-ignore
        AIntpuGroup;
        // @ts-ignore
        const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
            key: (emailIndex),
        }));
        const __VLS_399 = __VLS_398({
            key: (emailIndex),
        }, ...__VLS_functionalComponentArgsRest(__VLS_398));
        const { default: __VLS_401 } = __VLS_400.slots;
        const __VLS_402 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        ARow;
        // @ts-ignore
        const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
            gutter: (10),
            ...{ style: {} },
        }));
        const __VLS_404 = __VLS_403({
            gutter: (10),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_403));
        const { default: __VLS_406 } = __VLS_405.slots;
        const __VLS_407 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        const __VLS_408 = __VLS_asFunctionalComponent(__VLS_407, new __VLS_407({
            span: (19),
        }));
        const __VLS_409 = __VLS_408({
            span: (19),
        }, ...__VLS_functionalComponentArgsRest(__VLS_408));
        const { default: __VLS_411 } = __VLS_410.slots;
        const __VLS_412 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({
            value: (user.informEmails[emailIndex]),
            placeholder: "请输入Email",
        }));
        const __VLS_414 = __VLS_413({
            value: (user.informEmails[emailIndex]),
            placeholder: "请输入Email",
        }, ...__VLS_functionalComponentArgsRest(__VLS_413));
        var __VLS_410;
        const __VLS_417 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        const __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({
            span: (1),
        }));
        const __VLS_419 = __VLS_418({
            span: (1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_418));
        const { default: __VLS_421 } = __VLS_420.slots;
        const __VLS_422 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        AButton;
        // @ts-ignore
        const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
            ...{ 'onClick': {} },
        }));
        const __VLS_424 = __VLS_423({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_423));
        let __VLS_426;
        let __VLS_427;
        const __VLS_428 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.removeInformEmail(index, emailIndex);
                    // @ts-ignore
                    [removeInformEmail,];
                } });
        const { default: __VLS_429 } = __VLS_425.slots;
        var __VLS_425;
        var __VLS_420;
        var __VLS_405;
        var __VLS_400;
    }
    const __VLS_430 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    AButton;
    // @ts-ignore
    const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
        ...{ 'onClick': {} },
        type: "dashed",
        block: true,
        ...{ style: {} },
    }));
    const __VLS_432 = __VLS_431({
        ...{ 'onClick': {} },
        type: "dashed",
        block: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_431));
    let __VLS_434;
    let __VLS_435;
    const __VLS_436 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.addInformEmail(index);
                // @ts-ignore
                [addInformEmail,];
            } });
    const { default: __VLS_437 } = __VLS_433.slots;
    {
        const { icon: __VLS_438 } = __VLS_433.slots;
        const __VLS_439 = {}.PlusOutlined;
        /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
        // @ts-ignore
        PlusOutlined;
        // @ts-ignore
        const __VLS_440 = __VLS_asFunctionalComponent(__VLS_439, new __VLS_439({}));
        const __VLS_441 = __VLS_440({}, ...__VLS_functionalComponentArgsRest(__VLS_440));
    }
    var __VLS_433;
    var __VLS_395;
    const __VLS_444 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_445 = __VLS_asFunctionalComponent(__VLS_444, new __VLS_444({
        label: "视频模式",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 16, offset: 0 }),
    }));
    const __VLS_446 = __VLS_445({
        label: "视频模式",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 16, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_445));
    const { default: __VLS_448 } = __VLS_447.slots;
    const __VLS_449 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    ARow;
    // @ts-ignore
    const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({
        gutter: (10),
    }));
    const __VLS_451 = __VLS_450({
        gutter: (10),
    }, ...__VLS_functionalComponentArgsRest(__VLS_450));
    const { default: __VLS_453 } = __VLS_452.slots;
    const __VLS_454 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({
        span: (7),
    }));
    const __VLS_456 = __VLS_455({
        span: (7),
    }, ...__VLS_functionalComponentArgsRest(__VLS_455));
    const { default: __VLS_458 } = __VLS_457.slots;
    const __VLS_459 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    ASelect;
    // @ts-ignore
    const __VLS_460 = __VLS_asFunctionalComponent(__VLS_459, new __VLS_459({
        value: (user.coursesCustom.videoModel),
    }));
    const __VLS_461 = __VLS_460({
        value: (user.coursesCustom.videoModel),
    }, ...__VLS_functionalComponentArgsRest(__VLS_460));
    const { default: __VLS_463 } = __VLS_462.slots;
    const __VLS_464 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_465 = __VLS_asFunctionalComponent(__VLS_464, new __VLS_464({
        value: (0),
    }));
    const __VLS_466 = __VLS_465({
        value: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_465));
    const { default: __VLS_468 } = __VLS_467.slots;
    var __VLS_467;
    const __VLS_469 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_470 = __VLS_asFunctionalComponent(__VLS_469, new __VLS_469({
        value: (1),
    }));
    const __VLS_471 = __VLS_470({
        value: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_470));
    const { default: __VLS_473 } = __VLS_472.slots;
    if (user.accountType != 'WELEARN' && user.accountType != 'ICVE') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    if (user.accountType == 'WELEARN') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    if (user.accountType == 'ICVE') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    var __VLS_472;
    const __VLS_474 = {}.ASelectOption;
    /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
    // @ts-ignore
    ASelectOption;
    // @ts-ignore
    const __VLS_475 = __VLS_asFunctionalComponent(__VLS_474, new __VLS_474({
        value: (2),
    }));
    const __VLS_476 = __VLS_475({
        value: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_475));
    const { default: __VLS_478 } = __VLS_477.slots;
    if (user.accountType != 'WELEARN' && user.accountType != 'XUEXITONG' && user.accountType != 'HQKJ') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    if (user.accountType == 'WELEARN') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    if (user.accountType == 'XUEXITONG') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    if (user.accountType == 'HQKJ') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
    var __VLS_477;
    if (user.accountType == 'YINGHUA') {
        const __VLS_479 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_480 = __VLS_asFunctionalComponent(__VLS_479, new __VLS_479({
            value: (3),
        }));
        const __VLS_481 = __VLS_480({
            value: (3),
        }, ...__VLS_functionalComponentArgsRest(__VLS_480));
        const { default: __VLS_483 } = __VLS_482.slots;
        var __VLS_482;
    }
    if (user.accountType == 'XUEXITONG') {
        const __VLS_484 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_485 = __VLS_asFunctionalComponent(__VLS_484, new __VLS_484({
            value: (3),
        }));
        const __VLS_486 = __VLS_485({
            value: (3),
        }, ...__VLS_functionalComponentArgsRest(__VLS_485));
        const { default: __VLS_488 } = __VLS_487.slots;
        var __VLS_487;
    }
    var __VLS_462;
    var __VLS_457;
    const __VLS_489 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    ACol;
    // @ts-ignore
    const __VLS_490 = __VLS_asFunctionalComponent(__VLS_489, new __VLS_489({
        span: (14),
    }));
    const __VLS_491 = __VLS_490({
        span: (14),
    }, ...__VLS_functionalComponentArgsRest(__VLS_490));
    const { default: __VLS_493 } = __VLS_492.slots;
    if (user.coursesCustom.videoModel == 2 && user.accountType == 'XUEXITONG') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
    }
    if (user.coursesCustom.videoModel == 2 && user.accountType == 'YINGHUA') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
    }
    if (user.coursesCustom.videoModel == 3 && user.accountType == 'YINGHUA') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
    }
    if (user.coursesCustom.videoModel != 1 && user.accountType == 'QSXT') {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
    }
    var __VLS_492;
    var __VLS_452;
    var __VLS_447;
    if (user.accountType != 'HQKJ') {
        const __VLS_494 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({
            label: "自动考试模式",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }));
        const __VLS_496 = __VLS_495({
            label: "自动考试模式",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_495));
        const { default: __VLS_498 } = __VLS_497.slots;
        const __VLS_499 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        ASelect;
        // @ts-ignore
        const __VLS_500 = __VLS_asFunctionalComponent(__VLS_499, new __VLS_499({
            value: (user.coursesCustom.autoExam),
        }));
        const __VLS_501 = __VLS_500({
            value: (user.coursesCustom.autoExam),
        }, ...__VLS_functionalComponentArgsRest(__VLS_500));
        const { default: __VLS_503 } = __VLS_502.slots;
        const __VLS_504 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_505 = __VLS_asFunctionalComponent(__VLS_504, new __VLS_504({
            value: (0),
        }));
        const __VLS_506 = __VLS_505({
            value: (0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_505));
        const { default: __VLS_508 } = __VLS_507.slots;
        var __VLS_507;
        const __VLS_509 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_510 = __VLS_asFunctionalComponent(__VLS_509, new __VLS_509({
            value: (1),
        }));
        const __VLS_511 = __VLS_510({
            value: (1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_510));
        const { default: __VLS_513 } = __VLS_512.slots;
        var __VLS_512;
        const __VLS_514 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({
            value: (2),
        }));
        const __VLS_516 = __VLS_515({
            value: (2),
        }, ...__VLS_functionalComponentArgsRest(__VLS_515));
        const { default: __VLS_518 } = __VLS_517.slots;
        var __VLS_517;
        if (user.accountType == 'XUEXITONG') {
            const __VLS_519 = {}.ASelectOption;
            /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
            // @ts-ignore
            ASelectOption;
            // @ts-ignore
            const __VLS_520 = __VLS_asFunctionalComponent(__VLS_519, new __VLS_519({
                value: (3),
            }));
            const __VLS_521 = __VLS_520({
                value: (3),
            }, ...__VLS_functionalComponentArgsRest(__VLS_520));
            const { default: __VLS_523 } = __VLS_522.slots;
            var __VLS_522;
        }
        var __VLS_502;
        var __VLS_497;
    }
    if (user.coursesCustom.autoExam != 0) {
        const __VLS_524 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_525 = __VLS_asFunctionalComponent(__VLS_524, new __VLS_524({
            label: "是否自动交卷",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }));
        const __VLS_526 = __VLS_525({
            label: "是否自动交卷",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 5, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_525));
        const { default: __VLS_528 } = __VLS_527.slots;
        const __VLS_529 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        ASelect;
        // @ts-ignore
        const __VLS_530 = __VLS_asFunctionalComponent(__VLS_529, new __VLS_529({
            value: (user.coursesCustom.examAutoSubmit),
        }));
        const __VLS_531 = __VLS_530({
            value: (user.coursesCustom.examAutoSubmit),
        }, ...__VLS_functionalComponentArgsRest(__VLS_530));
        const { default: __VLS_533 } = __VLS_532.slots;
        const __VLS_534 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_535 = __VLS_asFunctionalComponent(__VLS_534, new __VLS_534({
            value: (0),
        }));
        const __VLS_536 = __VLS_535({
            value: (0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_535));
        const { default: __VLS_538 } = __VLS_537.slots;
        var __VLS_537;
        const __VLS_539 = {}.ASelectOption;
        /** @type {[typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, typeof __VLS_components.ASelectOption, typeof __VLS_components.aSelectOption, ]} */ ;
        // @ts-ignore
        ASelectOption;
        // @ts-ignore
        const __VLS_540 = __VLS_asFunctionalComponent(__VLS_539, new __VLS_539({
            value: (1),
        }));
        const __VLS_541 = __VLS_540({
            value: (1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_540));
        const { default: __VLS_543 } = __VLS_542.slots;
        var __VLS_542;
        var __VLS_532;
        var __VLS_527;
    }
    if (user.coursesCustom.autoExam != 0) {
        const __VLS_544 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_545 = __VLS_asFunctionalComponent(__VLS_544, new __VLS_544({
            label: "是否开启写章测",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 2, offset: 0 }),
        }));
        const __VLS_546 = __VLS_545({
            label: "是否开启写章测",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 2, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_545));
        const { default: __VLS_548 } = __VLS_547.slots;
        const __VLS_549 = {}.ASwitch;
        /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
        // @ts-ignore
        ASwitch;
        // @ts-ignore
        const __VLS_550 = __VLS_asFunctionalComponent(__VLS_549, new __VLS_549({
            ...{ 'onChange': {} },
            checked: (user.coursesCustom.cxChapterTestSw == 0 ? false : true),
        }));
        const __VLS_551 = __VLS_550({
            ...{ 'onChange': {} },
            checked: (user.coursesCustom.cxChapterTestSw == 0 ? false : true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_550));
        let __VLS_553;
        let __VLS_554;
        const __VLS_555 = ({ change: {} },
            { onChange: (function () { user.coursesCustom.cxChapterTestSw = user.coursesCustom.cxChapterTestSw == 1 ? 0 : 1; }) });
        var __VLS_552;
        var __VLS_547;
    }
    if (user.coursesCustom.autoExam != 0) {
        const __VLS_557 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_558 = __VLS_asFunctionalComponent(__VLS_557, new __VLS_557({
            label: "是否开启写作业",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 2, offset: 0 }),
        }));
        const __VLS_559 = __VLS_558({
            label: "是否开启写作业",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 2, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_558));
        const { default: __VLS_561 } = __VLS_560.slots;
        const __VLS_562 = {}.ASwitch;
        /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
        // @ts-ignore
        ASwitch;
        // @ts-ignore
        const __VLS_563 = __VLS_asFunctionalComponent(__VLS_562, new __VLS_562({
            ...{ 'onChange': {} },
            checked: (user.coursesCustom.cxWorkSw == 0 ? false : true),
        }));
        const __VLS_564 = __VLS_563({
            ...{ 'onChange': {} },
            checked: (user.coursesCustom.cxWorkSw == 0 ? false : true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_563));
        let __VLS_566;
        let __VLS_567;
        const __VLS_568 = ({ change: {} },
            { onChange: (function () { user.coursesCustom.cxWorkSw = user.coursesCustom.cxWorkSw == 1 ? 0 : 1; }) });
        var __VLS_565;
        var __VLS_560;
    }
    if (user.coursesCustom.autoExam != 0) {
        const __VLS_570 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        AFormItem;
        // @ts-ignore
        const __VLS_571 = __VLS_asFunctionalComponent(__VLS_570, new __VLS_570({
            label: "是否开启写考试",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 2, offset: 0 }),
        }));
        const __VLS_572 = __VLS_571({
            label: "是否开启写考试",
            labelCol: ({ span: 4 }),
            wrapperCol: ({ span: 2, offset: 0 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_571));
        const { default: __VLS_574 } = __VLS_573.slots;
        const __VLS_575 = {}.ASwitch;
        /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
        // @ts-ignore
        ASwitch;
        // @ts-ignore
        const __VLS_576 = __VLS_asFunctionalComponent(__VLS_575, new __VLS_575({
            ...{ 'onChange': {} },
            checked: (user.coursesCustom.cxExamSw == 0 ? false : true),
        }));
        const __VLS_577 = __VLS_576({
            ...{ 'onChange': {} },
            checked: (user.coursesCustom.cxExamSw == 0 ? false : true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_576));
        let __VLS_579;
        let __VLS_580;
        const __VLS_581 = ({ change: {} },
            { onChange: (function () { user.coursesCustom.cxExamSw = user.coursesCustom.cxExamSw == 1 ? 0 : 1; }) });
        var __VLS_578;
        var __VLS_573;
    }
    const __VLS_583 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_584 = __VLS_asFunctionalComponent(__VLS_583, new __VLS_583({
        label: "只刷课程设定项",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }));
    const __VLS_585 = __VLS_584({
        label: "只刷课程设定项",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_584));
    const { default: __VLS_587 } = __VLS_586.slots;
    for (const [_, courseIndex] of __VLS_getVForSourceType((user.coursesCustom.includeCourses))) {
        const __VLS_588 = {}.AIntpuGroup;
        /** @type {[typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, ]} */ ;
        // @ts-ignore
        AIntpuGroup;
        // @ts-ignore
        const __VLS_589 = __VLS_asFunctionalComponent(__VLS_588, new __VLS_588({
            key: (courseIndex),
        }));
        const __VLS_590 = __VLS_589({
            key: (courseIndex),
        }, ...__VLS_functionalComponentArgsRest(__VLS_589));
        const { default: __VLS_592 } = __VLS_591.slots;
        const __VLS_593 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        ARow;
        // @ts-ignore
        const __VLS_594 = __VLS_asFunctionalComponent(__VLS_593, new __VLS_593({
            gutter: (10),
            ...{ style: {} },
        }));
        const __VLS_595 = __VLS_594({
            gutter: (10),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_594));
        const { default: __VLS_597 } = __VLS_596.slots;
        const __VLS_598 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        const __VLS_599 = __VLS_asFunctionalComponent(__VLS_598, new __VLS_598({
            span: (19),
        }));
        const __VLS_600 = __VLS_599({
            span: (19),
        }, ...__VLS_functionalComponentArgsRest(__VLS_599));
        const { default: __VLS_602 } = __VLS_601.slots;
        const __VLS_603 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        const __VLS_604 = __VLS_asFunctionalComponent(__VLS_603, new __VLS_603({
            value: (user.coursesCustom.includeCourses[courseIndex]),
            placeholder: "请输入课程名称",
        }));
        const __VLS_605 = __VLS_604({
            value: (user.coursesCustom.includeCourses[courseIndex]),
            placeholder: "请输入课程名称",
        }, ...__VLS_functionalComponentArgsRest(__VLS_604));
        var __VLS_601;
        const __VLS_608 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        const __VLS_609 = __VLS_asFunctionalComponent(__VLS_608, new __VLS_608({
            span: (1),
        }));
        const __VLS_610 = __VLS_609({
            span: (1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_609));
        const { default: __VLS_612 } = __VLS_611.slots;
        const __VLS_613 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        AButton;
        // @ts-ignore
        const __VLS_614 = __VLS_asFunctionalComponent(__VLS_613, new __VLS_613({
            ...{ 'onClick': {} },
        }));
        const __VLS_615 = __VLS_614({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_614));
        let __VLS_617;
        let __VLS_618;
        const __VLS_619 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.removeIncludeCourse(index, courseIndex);
                    // @ts-ignore
                    [removeIncludeCourse,];
                } });
        const { default: __VLS_620 } = __VLS_616.slots;
        var __VLS_616;
        var __VLS_611;
        var __VLS_596;
        var __VLS_591;
    }
    const __VLS_621 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    AButton;
    // @ts-ignore
    const __VLS_622 = __VLS_asFunctionalComponent(__VLS_621, new __VLS_621({
        ...{ 'onClick': {} },
        type: "dashed",
        block: true,
        ...{ style: {} },
    }));
    const __VLS_623 = __VLS_622({
        ...{ 'onClick': {} },
        type: "dashed",
        block: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_622));
    let __VLS_625;
    let __VLS_626;
    const __VLS_627 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.addIncludeCourse(index);
                // @ts-ignore
                [addIncludeCourse,];
            } });
    const { default: __VLS_628 } = __VLS_624.slots;
    {
        const { icon: __VLS_629 } = __VLS_624.slots;
        const __VLS_630 = {}.PlusOutlined;
        /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
        // @ts-ignore
        PlusOutlined;
        // @ts-ignore
        const __VLS_631 = __VLS_asFunctionalComponent(__VLS_630, new __VLS_630({}));
        const __VLS_632 = __VLS_631({}, ...__VLS_functionalComponentArgsRest(__VLS_631));
    }
    var __VLS_624;
    var __VLS_586;
    const __VLS_635 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    AFormItem;
    // @ts-ignore
    const __VLS_636 = __VLS_asFunctionalComponent(__VLS_635, new __VLS_635({
        label: "排除课程设定项",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }));
    const __VLS_637 = __VLS_636({
        label: "排除课程设定项",
        labelCol: ({ span: 4 }),
        wrapperCol: ({ span: 9, offset: 0 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_636));
    const { default: __VLS_639 } = __VLS_638.slots;
    for (const [_, courseIndex] of __VLS_getVForSourceType((user.coursesCustom.excludeCourses))) {
        const __VLS_640 = {}.AIntpuGroup;
        /** @type {[typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, typeof __VLS_components.AIntpuGroup, typeof __VLS_components.aIntpuGroup, ]} */ ;
        // @ts-ignore
        AIntpuGroup;
        // @ts-ignore
        const __VLS_641 = __VLS_asFunctionalComponent(__VLS_640, new __VLS_640({
            key: (courseIndex),
        }));
        const __VLS_642 = __VLS_641({
            key: (courseIndex),
        }, ...__VLS_functionalComponentArgsRest(__VLS_641));
        const { default: __VLS_644 } = __VLS_643.slots;
        const __VLS_645 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        ARow;
        // @ts-ignore
        const __VLS_646 = __VLS_asFunctionalComponent(__VLS_645, new __VLS_645({
            gutter: (10),
            ...{ style: {} },
        }));
        const __VLS_647 = __VLS_646({
            gutter: (10),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_646));
        const { default: __VLS_649 } = __VLS_648.slots;
        const __VLS_650 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        const __VLS_651 = __VLS_asFunctionalComponent(__VLS_650, new __VLS_650({
            span: (19),
        }));
        const __VLS_652 = __VLS_651({
            span: (19),
        }, ...__VLS_functionalComponentArgsRest(__VLS_651));
        const { default: __VLS_654 } = __VLS_653.slots;
        const __VLS_655 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        AInput;
        // @ts-ignore
        const __VLS_656 = __VLS_asFunctionalComponent(__VLS_655, new __VLS_655({
            value: (user.coursesCustom.excludeCourses[courseIndex]),
            placeholder: "请输入课程名称",
        }));
        const __VLS_657 = __VLS_656({
            value: (user.coursesCustom.excludeCourses[courseIndex]),
            placeholder: "请输入课程名称",
        }, ...__VLS_functionalComponentArgsRest(__VLS_656));
        var __VLS_653;
        const __VLS_660 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        ACol;
        // @ts-ignore
        const __VLS_661 = __VLS_asFunctionalComponent(__VLS_660, new __VLS_660({
            span: (1),
        }));
        const __VLS_662 = __VLS_661({
            span: (1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_661));
        const { default: __VLS_664 } = __VLS_663.slots;
        const __VLS_665 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        AButton;
        // @ts-ignore
        const __VLS_666 = __VLS_asFunctionalComponent(__VLS_665, new __VLS_665({
            ...{ 'onClick': {} },
        }));
        const __VLS_667 = __VLS_666({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_666));
        let __VLS_669;
        let __VLS_670;
        const __VLS_671 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.removeExcludeCourse(index, courseIndex);
                    // @ts-ignore
                    [removeExcludeCourse,];
                } });
        const { default: __VLS_672 } = __VLS_668.slots;
        var __VLS_668;
        var __VLS_663;
        var __VLS_648;
        var __VLS_643;
    }
    const __VLS_673 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    AButton;
    // @ts-ignore
    const __VLS_674 = __VLS_asFunctionalComponent(__VLS_673, new __VLS_673({
        ...{ 'onClick': {} },
        type: "dashed",
        block: true,
        ...{ style: {} },
    }));
    const __VLS_675 = __VLS_674({
        ...{ 'onClick': {} },
        type: "dashed",
        block: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_674));
    let __VLS_677;
    let __VLS_678;
    const __VLS_679 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.addExcludeCourse(index);
                // @ts-ignore
                [addExcludeCourse,];
            } });
    const { default: __VLS_680 } = __VLS_676.slots;
    {
        const { icon: __VLS_681 } = __VLS_676.slots;
        const __VLS_682 = {}.PlusOutlined;
        /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
        // @ts-ignore
        PlusOutlined;
        // @ts-ignore
        const __VLS_683 = __VLS_asFunctionalComponent(__VLS_682, new __VLS_682({}));
        const __VLS_684 = __VLS_683({}, ...__VLS_functionalComponentArgsRest(__VLS_683));
    }
    var __VLS_676;
    var __VLS_638;
    var __VLS_262;
    var __VLS_257;
    var __VLS_252;
    var __VLS_247;
}
var __VLS_242;
const __VLS_687 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
AButton;
// @ts-ignore
const __VLS_688 = __VLS_asFunctionalComponent(__VLS_687, new __VLS_687({
    ...{ 'onClick': {} },
    type: "dashed",
    block: true,
    ...{ style: {} },
}));
const __VLS_689 = __VLS_688({
    ...{ 'onClick': {} },
    type: "dashed",
    block: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_688));
let __VLS_691;
let __VLS_692;
const __VLS_693 = ({ click: {} },
    { onClick: (__VLS_ctx.addUser) });
const { default: __VLS_694 } = __VLS_690.slots;
// @ts-ignore
[addUser,];
{
    const { icon: __VLS_695 } = __VLS_690.slots;
    const __VLS_696 = {}.PlusOutlined;
    /** @type {[typeof __VLS_components.PlusOutlined, ]} */ ;
    // @ts-ignore
    PlusOutlined;
    // @ts-ignore
    const __VLS_697 = __VLS_asFunctionalComponent(__VLS_696, new __VLS_696({}));
    const __VLS_698 = __VLS_697({}, ...__VLS_functionalComponentArgsRest(__VLS_697));
}
var __VLS_690;
const __VLS_701 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
AButton;
// @ts-ignore
const __VLS_702 = __VLS_asFunctionalComponent(__VLS_701, new __VLS_701({
    ...{ 'onClick': {} },
    type: "default",
    shape: "circle",
    icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)),
    ...{ style: {} },
}));
const __VLS_703 = __VLS_702({
    ...{ 'onClick': {} },
    type: "default",
    shape: "circle",
    icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_702));
let __VLS_705;
let __VLS_706;
const __VLS_707 = ({ click: {} },
    { onClick: (__VLS_ctx.importClick) });
const { default: __VLS_708 } = __VLS_704.slots;
// @ts-ignore
[h, DownloadOutlined, importClick,];
var __VLS_704;
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.importYaml) },
    ref: "fileInput",
    type: "file",
    accept: ".yaml,.yml",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
// @ts-ignore
[importYaml, fileInput,];
const __VLS_709 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
AButton;
// @ts-ignore
const __VLS_710 = __VLS_asFunctionalComponent(__VLS_709, new __VLS_709({
    ...{ 'onClick': {} },
    type: "primary",
    shape: "circle",
    icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)),
    ...{ style: {} },
}));
const __VLS_711 = __VLS_710({
    ...{ 'onClick': {} },
    type: "primary",
    shape: "circle",
    icon: (__VLS_ctx.h(__VLS_ctx.DownloadOutlined)),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_710));
let __VLS_713;
let __VLS_714;
const __VLS_715 = ({ click: {} },
    { onClick: (__VLS_ctx.exportYaml) });
const { default: __VLS_716 } = __VLS_712.slots;
// @ts-ignore
[h, DownloadOutlined, exportYaml,];
var __VLS_712;
var __VLS_8;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isDragging) }, null, null);
// @ts-ignore
[isDragging,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ style: {} },
});
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        h: h,
        PlusOutlined: PlusOutlined,
        DeleteOutlined: DeleteOutlined,
        DownloadOutlined: DownloadOutlined,
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
        addInformEmail: addInformEmail,
        removeInformEmail: removeInformEmail,
        fileInput: fileInput,
        importClick: importClick,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
