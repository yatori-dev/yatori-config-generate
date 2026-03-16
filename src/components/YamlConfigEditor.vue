<template>
  <div style="padding-top: 24px; text-align: center;">Yatori-go-console配置生成器</div>
 <a-card style="min-width: 800px; margin: 20px auto;">
  <a-form :model="form" layout="horizontal" >

    <a-collapse :default-active-key="[]" accordion>
      <!-- 基础设置 -->
      <a-collapse-panel key="1" header="基础设置">
        <a-form-item label="完成提示音" :label-col="{ span: 4 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="form.setting.basicSetting.completionTone==0?false:true" @change="function(){
            form.setting.basicSetting.completionTone = form.setting.basicSetting.completionTone==1?0:1
          }" />
        </a-form-item>
        <a-form-item label="彩色日志":label-col="{ span: 4 }" :wrapper-col="{ span:5, offset:0}">
          <a-switch :checked="form.setting.basicSetting.colorLog==0?false:true" @change="function(){
            form.setting.basicSetting.colorLog= form.setting.basicSetting.colorLog==1?0:1
          }" />
        </a-form-item>
        <a-form-item label="日志输出到文件":label-col="{ span: 4 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="form.setting.basicSetting.logOutFileSw==0?false:true" @change="function(){
            form.setting.basicSetting.logOutFileSw=form.setting.basicSetting.logOutFileSw==1?0:1
          }"/>
        </a-form-item>
        <a-form-item label="日志等级":label-col="{ span: 4 }" :wrapper-col="{ span:3, offset:0}">
          <a-select v-model:value="form.setting.basicSetting.logLevel">
            <a-select-option value="INFO">INFO</a-select-option>
            <a-select-option value="DEBUG">DEBUG</a-select-option>
          </a-select>
        </a-form-item>
      </a-collapse-panel>

      <!-- 邮箱通知 -->
      <a-collapse-panel key="2" header="邮箱通知配置">
        <a-form-item label="开启" :label-col="{ span: 4 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch v-model:checked="form.setting.emailInform.sw" />
        </a-form-item>
        <a-form-item label="SMTP Host" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.emailInform.SMTPHost" placeholder="请输入HOST值"/>
        </a-form-item>
        <a-form-item label="SMTP Port" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.emailInform.SMTPPort" placeholder="请输入端口号"/>
        </a-form-item>
        <a-form-item label="userName(Email)" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.emailInform.userName" placeholder="请输入邮箱"/>
        </a-form-item>
        <a-form-item label="密码" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
          <a-input-password v-model:value="form.setting.emailInform.password" placeholder="请输入密码"/>
        </a-form-item>
      </a-collapse-panel>

      <!-- AI 设置 -->
      <a-collapse-panel key="3" header="AI大模型自动答题设置">
        <a-form-item label="AI类型" :label-col="{ span: 2 }" :wrapper-col="{ span:5, offset:0}">
          <a-select v-model:value="form.setting.aiSetting.aiType">
            <a-select-option :value="'SILICON'">SiliconFlow(硅基流动)</a-select-option>
            <a-select-option :value="'DEEPSEEK'">DeepSeek(深度求索)</a-select-option>
            <a-select-option :value="'CHATGLM'">智谱清言(ChatGLM)</a-select-option>
            <a-select-option :value="'TONGYI'">通义千问</a-select-option>
            <a-select-option :value="'XINGHUO'">星火大模型</a-select-option>
            <a-select-option :value="'DOUBAO'">豆包大模型</a-select-option>
            <a-select-option :value="'METAAI'">秘塔AI</a-select-option>
            <a-select-option :value="'OTHER'">其他AI</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="AI URL" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}" v-if="form.setting.aiSetting.aiType=='OTHER'">
          <a-input v-model:value="form.setting.aiSetting.aiUrl" placeholder="请输入模型API接口链接"/>
        </a-form-item>
        <a-form-item label="模型" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.aiSetting.model" placeholder="请输入所选模型编号"/>
        </a-form-item>
        <a-form-item label="API_KEY" :label-col="{ span: 2 }" :wrapper-col="{ span:15, offset:0}">
          <a-input-password v-model:value="form.setting.aiSetting.API_KEY" placeholder="请输入模型的API_KEY"/>
        </a-form-item>
      </a-collapse-panel>

      <!-- API 问题设置 -->
      <a-collapse-panel key="4" header="API外挂题库设置">
        <a-form-item label="接口地址" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.apiQueSetting.url" placeholder="请输入外挂题库对应访问URL"/>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>

    <!-- 用户设置（保持不折叠） -->
    <a-divider>用户设置</a-divider>

    <a-row gutter="[16, 16]">
      <a-col :span="24" v-for="(user, index) in form.users" :key="index" style="margin-top: 5px;">
        <a-collapse :default-active-key="[]" accordion>
          <a-collapse-panel :key="index" :header="'用户 ' + (index + 1)" :extra="index > 0 ? h(DeleteOutlined, { onClick: () => removeUser(index), style: 'color:red;cursor:pointer' }) : null">
            <a-card >
          <a-form-item label="账户类型" :label-col="{ span: 4 }" :wrapper-col="{ span:6, offset:0}">
            <a-select v-model:value="user.accountType">
              <a-select-option :value="'YINGHUA'">英华学堂</a-select-option>
              <a-select-option :value="'XUEXITONG'">学习通</a-select-option>
              <a-select-option :value="'ENAEA'">学习公社(ENAEA)</a-select-option>
              <a-select-option :value="'WELEARN'">随行课堂(Welearn)</a-select-option>
              <a-select-option :value="'ICVE'">智慧职教</a-select-option>
              <a-select-option :value="'CQIE'">重庆工学院</a-select-option>
              <a-select-option :value="'KETANGX'">码上研训</a-select-option>
              <a-select-option :value="'CANGHUI'">仓辉</a-select-option>
              <a-select-option :value="'QSXT'">青书学堂</a-select-option>
              <a-select-option :value="'HQKJ'">海旗科技</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="user.accountType=='YINGHUA'" label="URL" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
            <a-input v-model:value="user.url" placeholder="对应平台登录后的URL链接，英华填其他的平台不用填"/>
          </a-form-item>
          <a-form-item label="账号" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
            <a-input v-model:value="user.account" placeholder="请输入账号"/>
          </a-form-item>
          <a-form-item label="密码" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
            <a-input-password v-model:value="user.password" placeholder="请输入密码"/>
          </a-form-item>
          <a-form-item label="是否开启代理" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
             <a-row :gutter="10">
               <a-col :span="6">
                  <a-switch :checked="user.isProxy==0?false:true" @change="function(){user.isProxy = user.isProxy==1?0:1}" />
               </a-col>
               <a-col :span="14">
                <span v-if="user.isProxy==1" style="color: red;font-size: 12px;">注意:开启代理后将会从ip.txt中所填写的代理地址随机选一个进行，ip.txt需要自行创建并填写(在exe文件同目录下创建即可)，每行一个代理地址，比如http://localhost:7899</span>
               </a-col>
            </a-row>
          </a-form-item>
          <a-form-item v-if="user.accountType=='XUEXITONG' && user.coursesCustom.videoModel==3" label="同时任务点数量" :label-col="{ span: 4 }" :wrapper-col="{ span:10, offset:0}">
            <a-input v-model:value="user.coursesCustom.cxNode" :min="-1" :max="9999" placeholder="请输入同时任务点数量"/>
          </a-form-item>
          <a-form-item label="通知邮箱" :label-col="{ span: 4 }" :wrapper-col="{ span:9, offset:0}">
              <a-intpu-group v-for="(_,emailIndex) in user.informEmails" :key="emailIndex" >
                <a-row :gutter="10" style="margin-top: 10px;">
                  <a-col :span="19">
                    <a-input v-model:value="user.informEmails[emailIndex]" placeholder="请输入Email"/>
                  </a-col>
                  <a-col :span="1">
                    <a-button @click="removeInformEmail(index,emailIndex)">删除</a-button>
                  </a-col>
                </a-row>
              </a-intpu-group>
            <a-button type="dashed" block @click="addInformEmail(index)" style="margin-top: 10px; margin-bottom: 16px">
              <template #icon><PlusOutlined /></template>新增邮箱
            </a-button>
          </a-form-item>
          <a-form-item label="视频模式" :label-col="{ span: 4 }" :wrapper-col="{ span:16, offset:0}">
            <a-row :gutter="10">
              <a-col :span="7">
                <a-select v-model:value="user.coursesCustom.videoModel">
                  <a-select-option :value=0>不刷</a-select-option>
                  <a-select-option :value=1>
                    <span v-if="user.accountType!='WELEARN' && user.accountType!='ICVE' ">普通模式</span>
                    <span v-if="user.accountType=='WELEARN'">刷学时模式</span> 
                    <span v-if="user.accountType=='ICVE'">秒刷模式</span> 
                  </a-select-option>
                  <a-select-option :value=2>
                    <span v-if="user.accountType!='WELEARN' && user.accountType!='XUEXITONG' && user.accountType!='HQKJ'">暴力模式</span>
                    <span v-if="user.accountType=='WELEARN'">刷完成度模式</span>
                    <span v-if="user.accountType=='XUEXITONG'">多课程同时进行模式</span>
                    <span v-if="user.accountType=='HQKJ'">秒刷模式</span>
                  </a-select-option>
                  <a-select-option v-if="user.accountType=='YINGHUA'" :value=3>去红模式</a-select-option>
                  <a-select-option v-if="user.accountType=='XUEXITONG'" :value=3>多任务点同时进行模式</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="14">
                <span v-if="user.coursesCustom.videoModel==2 && user.accountType=='XUEXITONG'" style="color: red;font-size: 12px;">注意:学习通暴力模式有概率打回进度</span>
                <span v-if="user.coursesCustom.videoModel==2 && user.accountType=='YINGHUA'" style="color: red;font-size: 12px;">注意:英华暴力模式学习状态会被检测标红，至于会不会打回全看老师管的严不严</span>
                <span v-if="user.coursesCustom.videoModel==3 && user.accountType=='YINGHUA'" style="color: red;font-size: 12px;">注意:该模式主要是为了去除英华暴力模式下检测标红的学时记录,非英华不要选</span>
                <span v-if="user.coursesCustom.videoModel!=1 && user.accountType=='QSXT'" style="color: red;font-size: 12px;">注意:青书学堂只支持普通模式</span>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="自动考试模式" :label-col="{ span: 4 }" :wrapper-col="{ span:5, offset:0}">
            <a-select v-model:value="user.coursesCustom.autoExam">
              <a-select-option :value=0>不考</a-select-option>
              <a-select-option :value=1>AI大模型自动答题</a-select-option>
              <a-select-option :value=2>外置题库答题</a-select-option>
              <a-select-option v-if="user.accountType=='XUEXITONG'" :value=3>内置AI答题</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="user.coursesCustom.autoExam!=0" label="是否自动交卷" :label-col="{ span: 4 }" :wrapper-col="{ span:5, offset:0}">
            <a-select v-model:value="user.coursesCustom.examAutoSubmit">
              <a-select-option :value=0>不交卷只保存</a-select-option>
              <a-select-option :value=1>答完直接交卷</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="user.coursesCustom.autoExam!=0" label="是否开启写章测" :label-col="{ span: 4 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="user.coursesCustom.cxChapterTestSw==0?false:true" @change="function(){user.coursesCustom.cxChapterTestSw=user.coursesCustom.cxChapterTestSw==1?0:1}"/>
        </a-form-item>
        <a-form-item v-if="user.coursesCustom.autoExam!=0" label="是否开启写作业" :label-col="{ span: 4 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="user.coursesCustom.cxWorkSw==0?false:true" @change="function(){user.coursesCustom.cxWorkSw=user.coursesCustom.cxWorkSw==1?0:1}"/>
        </a-form-item>
        <a-form-item v-if="user.coursesCustom.autoExam!=0" label="是否开启写考试" :label-col="{ span: 4 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="user.coursesCustom.cxExamSw==0?false:true" @change="function(){user.coursesCustom.cxExamSw=user.coursesCustom.cxExamSw==1?0:1}"/>
        </a-form-item>
          <a-form-item label="只刷课程设定项" :label-col="{ span: 4 }" :wrapper-col="{ span:9, offset:0}">
              <a-intpu-group v-for="(_,courseIndex) in user.coursesCustom.includeCourses" :key="courseIndex" >
                <a-row :gutter="10" style="margin-top: 10px;">
                  <a-col :span="19">
                    <a-input v-model:value="user.coursesCustom.includeCourses[courseIndex]" placeholder="请输入课程名称"/>
                  </a-col>
                  <a-col :span="1">
                    <a-button @click="removeIncludeCourse(index,courseIndex)">删除</a-button>
                  </a-col>
                </a-row>
              </a-intpu-group>
            <a-button type="dashed" block @click="addIncludeCourse(index)" style="margin-top: 10px; margin-bottom: 16px">
              <template #icon><PlusOutlined /></template>新增包含课程
            </a-button>
          </a-form-item>
          <a-form-item label="排除课程设定项" :label-col="{ span: 4 }" :wrapper-col="{ span:9, offset:0}">
            <a-intpu-group v-for="(_,courseIndex) in user.coursesCustom.excludeCourses" :key="courseIndex" >
                <a-row :gutter="10" style="margin-top: 10px;">
                  <a-col :span="19">
                    <a-input v-model:value="user.coursesCustom.excludeCourses[courseIndex]" placeholder="请输入课程名称"/>
                  </a-col>
                  <a-col :span="1">
                    <a-button @click="removeExcludeCourse(index,courseIndex)">删除</a-button>
                  </a-col>
                </a-row>
              </a-intpu-group>
            <a-button type="dashed" block @click="addExcludeCourse(index)" style="margin-top: 10px; margin-bottom: 16px">
              <template #icon><PlusOutlined /></template>新增排除课程
            </a-button>
          </a-form-item>
        </a-card>
          </a-collapse-panel>
        </a-collapse>

      </a-col>
    </a-row>
    <a-button type="dashed" block @click="addUser" style="margin-top: 16px; margin-bottom: 16px">
      <template #icon><PlusOutlined /></template>
      新增用户
    </a-button>
    <a-button
      type="default"
      shape="circle"
      @click="importClick"
      :icon="h(DownloadOutlined)"
      style="width: 70px; height: 70px; position: fixed; bottom: 120px; right: 32px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">导入</a-button>
    <input
      ref="fileInput"
      type="file"
      accept=".yaml,.yml"
      @change="importYaml"
      style="display: none"/>
    <a-button type="primary" shape="circle" @click="exportYaml" :icon="h(DownloadOutlined)" style="width: 70px; height: 70px; position: fixed; bottom: 32px; right: 32px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">导出</a-button>
  </a-form>
</a-card>
  <!-- 拖拽提示区域（可选） -->
  <div
      v-show="isDragging"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
         background: rgba(0, 0, 0, 0.4); z-index: 2000; display: flex;
         justify-content: center; align-items: center; color: white; font-size: 24px;">
    松开以导入 config.yml
  </div>
  <div style="text-align: center; "><span style="color: red">注</span>：导出后直接<span style="color: red;">覆盖</span>原来的config配置文件即可</div>
</template>

<script setup lang="ts">
import { reactive, h,ref,onMounted,onUnmounted } from 'vue'
import { saveAs } from 'file-saver'
import * as yaml from 'js-yaml';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'


interface CoursesCustom {
  studyTime: string
  shuffleSw: number
  cxNode?: number
  cxChapterTestSw?: number
  cxWorkSw?: number
  cxExamSw?: number
  videoModel: number
  autoExam: number
  examAutoSubmit: number
  excludeCourses: string[]
  includeCourses: string[]
}

interface User {
  accountType: string
  url: string
  account: string
  password: string
  isProxy: number
  informEmails: string[]
  coursesCustom: CoursesCustom
}

interface FormData {
  setting: {
    basicSetting: {
      completionTone: number
      colorLog: number
      logOutFileSw: number
      logLevel: string
      logModel: number
    }
    emailInform: {
      sw: number
      SMTPHost: string
      SMTPPort: string
      userName: string
      password: string
    }
    aiSetting: {
      aiType: string
      aiUrl: string
      model: string
      API_KEY: string
    }
    apiQueSetting: {
      url: string
    }
  }
  users: User[]
}

function deepMerge(target: any, source: any): any {
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        target[key] = deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
    // 如果 key 在 source 中不存在，target 已经保留默认值
  }
  return target
}

function getDefaultForm(): FormData {
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
        informEmails:[],
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
  }
}

function importYaml(event: Event | DragEvent) {
  let file: File | undefined

  if ((event as DragEvent).dataTransfer?.files?.length) {
    file = (event as DragEvent).dataTransfer!.files[0]
  } else if ((event.target as HTMLInputElement)?.files?.length) {
    file = (event.target as HTMLInputElement).files?.[0]
  }

  if (!file || !file.name.endsWith('.yml') && !file.name.endsWith('.yaml')) {
    alert('请上传 YAML 文件（.yml 或 .yaml）')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string
      const parsed = yaml.load(text) as Partial<FormData>

      const defaultForm = getDefaultForm()

      // 特殊处理 users：逐个合并
      if (Array.isArray(parsed.users)) {
        defaultForm.users = parsed.users.map((u) => {
          return deepMerge(getDefaultForm().users[0], u)
        })
      }

      // 合并 setting 部分
      defaultForm.setting = deepMerge(defaultForm.setting, parsed.setting || {})

      // 替换响应式 form（不能直接替换 form = xxx，否则 Vue 不追踪）
      Object.assign(form, defaultForm)

    } catch (err) {
      console.error('YAML解析失败:', err)
      alert('导入失败，请检查YAML文件格式是否正确')
    }
  }
  reader.readAsText(file)
}


//配置文件信息
const form = reactive<FormData>(getDefaultForm())
const isDragging = ref(false) //控制文件拖拽

//新增用户
function addUser(): void {
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
  })
}
//移除用户
function removeUser(index: number): void {
  form.users.splice(index, 1)
}

//添加课程信息
function addIncludeCourse(userIndex: number): void{
  form.users[userIndex].coursesCustom.excludeCourses=[]
  form.users[userIndex].coursesCustom.includeCourses.push("")
}
//移除课程信息
function removeIncludeCourse(userIndex: number,coruseIndex: number){
  form.users[userIndex].coursesCustom.includeCourses.splice(coruseIndex,1)
}

//添加课程信息
function addExcludeCourse(userIndex: number): void{
  form.users[userIndex].coursesCustom.includeCourses=[]
  form.users[userIndex].coursesCustom.excludeCourses.push("")
}
//移除课程信息
function removeExcludeCourse(userIndex: number,coruseIndex: number){
  form.users[userIndex].coursesCustom.excludeCourses.splice(coruseIndex,1)
}


function exportYaml(): void {
  const processed =JSON.parse(JSON.stringify(form))
  const yamlStr = yaml.dump(processed,
  {
    styles: {
      '!!str': 'single-quoted'
    },
    quotingType: '\'', // ✅ 显式使用单引号（避免双引号）
      forceQuotes: true   // ✅ 强制所有字符串加引号
  })
  const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' })
  saveAs(blob, 'config.yaml')
}


//添加通知邮箱
function addInformEmail(userIndex: number): void{
  // form.users[userIndex].informEmails=[]
  form.users[userIndex].informEmails.push("")
}
//移除通知邮箱
function removeInformEmail(userIndex: number,emailIndex: number){
  form.users[userIndex].informEmails.splice(emailIndex,1)
}

// 文件输入框的引用
const fileInput = ref<HTMLInputElement | null>(null)

// 触发文件选择
function importClick() {
  fileInput.value?.click()
}


// 拖拽事件绑定
let dragCounter = 0

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) {
    isDragging.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false
  importYaml(e)
}

onMounted(() => {
  window.addEventListener('dragenter', handleDragEnter)
  window.addEventListener('dragleave', handleDragLeave)
  window.addEventListener('drop', handleDrop)
  window.addEventListener('dragover', (e) => e.preventDefault())
})

onUnmounted(() => {
  window.removeEventListener('dragenter', handleDragEnter)
  window.removeEventListener('dragleave', handleDragLeave)
  window.removeEventListener('drop', handleDrop)
})

</script>

<style scoped>
</style>
