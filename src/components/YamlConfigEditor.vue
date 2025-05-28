<template>
  <div style="padding-top: 24px; text-align: center;">Yatori-go-console配置生成器</div>
 <a-card style="min-width: 800px; margin: 20px auto;">
  <a-form :model="form" layout="horizontal" >
    
    <a-collapse :default-active-key="[]" accordion>
      <!-- 基础设置 -->
      <a-collapse-panel key="1" header="基础设置">
        <a-form-item label="完成提示音" :label-col="{ span: 3 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="form.setting.basicSetting.completionTone==0?false:true" @change="function(){
            form.setting.basicSetting.completionTone = form.setting.basicSetting.completionTone==1?0:1
          }" />
        </a-form-item>
        <a-form-item label="彩色日志":label-col="{ span: 3 }" :wrapper-col="{ span:5, offset:0}">
          <a-switch :checked="form.setting.basicSetting.colorLog==0?false:true" @change="function(){
            form.setting.basicSetting.colorLog= form.setting.basicSetting.colorLog==1?0:1
          }" />
        </a-form-item>
        <a-form-item label="日志输出到文件":label-col="{ span: 3 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch :checked="form.setting.basicSetting.logOutFileSw==0?false:true" @change="function(){
            form.setting.basicSetting.logOutFileSw=form.setting.basicSetting.logOutFileSw==1?0:1
          }"/>
        </a-form-item>
        <a-form-item label="日志等级":label-col="{ span: 3 }" :wrapper-col="{ span:2, offset:0}">
          <a-select v-model:value="form.setting.basicSetting.logLevel">
            <a-select-option value="DEBUG">DEBUG</a-select-option>
            <a-select-option value="INFO">INFO</a-select-option>
          </a-select>
        </a-form-item>
      </a-collapse-panel>

      <!-- 邮箱通知 -->
      <a-collapse-panel key="2" header="邮箱通知配置">
        <a-form-item label="开启" :label-col="{ span: 2 }" :wrapper-col="{ span:2, offset:0}">
          <a-switch v-model:checked="form.setting.emailInform.sw" />
        </a-form-item>
        <a-form-item label="SMTP Host" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.emailInform.SMTPHost" placeholder="请输入HOST值"/>
        </a-form-item>
        <a-form-item label="SMTP Port" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.emailInform.SMTPPort" placeholder="请输入端口号"/>
        </a-form-item>
        <a-form-item label="Email" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
          <a-input v-model:value="form.setting.emailInform.email" placeholder="请输入邮箱"/>
        </a-form-item>
        <a-form-item label="密码" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
          <a-input-password v-model:value="form.setting.emailInform.password" placeholder="请输入密码"/>
        </a-form-item>
      </a-collapse-panel>

      <!-- AI 设置 -->
      <a-collapse-panel key="3" header="AI大模型自动答题设置">
        <a-form-item label="AI类型" :label-col="{ span: 2 }" :wrapper-col="{ span:5, offset:0}">
          <a-select v-model:value="form.setting.aiSetting.aiType">
            <a-select-option value="CHATGLM">智谱清言(ChatGLM)</a-select-option>
            <a-select-option value="TONGYI">通义千问</a-select-option>
            <a-select-option value="XINGHUO">星火大模型</a-select-option>
            <a-select-option value="DOUBAO">豆包大模型</a-select-option>
            <a-select-option value="OTHER">其他AI</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="AI URL" :label-col="{ span: 2 }" :wrapper-col="{ span:10, offset:0}">
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
      <a-col :span="24" v-for="(user, index) in form.users" :key="index">
        <a-card :title="'用户 ' + (index + 1)" :extra="index > 0 ? h(DeleteOutlined, { onClick: () => removeUser(index), style: 'color:red;cursor:pointer' }) : null">
          <a-form-item label="账户类型" :label-col="{ span: 3 }" :wrapper-col="{ span:4, offset:0}">
            <!-- <a-input v-model:value="user.accountType" /> -->
            <a-select v-model:value="user.accountType">
              <a-select-option :value="'YINGHUA'">英华学堂</a-select-option>
              <a-select-option :value="'XUEXITONG'">学习通</a-select-option>
              <a-select-option :value="'ENAEA'">学习公社</a-select-option>
              <a-select-option :value="'CQIE'">重庆工学院</a-select-option>
              <a-select-option :value="'CANGHUI'">仓辉</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="URL" :label-col="{ span: 3 }" :wrapper-col="{ span:10, offset:0}">
            <a-input v-model:value="user.url" placeholder="对应平台登录后的URL链接，英华填其他的平台不用填"/>
          </a-form-item>
          <a-form-item label="账号" :label-col="{ span: 3 }" :wrapper-col="{ span:10, offset:0}">
            <a-input v-model:value="user.account" placeholder="请输入账号"/>
          </a-form-item>
          <a-form-item label="密码" :label-col="{ span: 3 }" :wrapper-col="{ span:10, offset:0}">
            <a-input-password v-model:value="user.password" placeholder="请输入密码"/>
          </a-form-item>
          <a-form-item label="覆刷模式" :label-col="{ span: 3 }" :wrapper-col="{ span:10, offset:0}">
            <a-switch :checked="user.overBrush==1?true:false" @change="function(){
              user.overBrush = user.overBrush==1?0:1
            }"/>
          </a-form-item>
          <a-form-item label="视频模式" :label-col="{ span: 3 }" :wrapper-col="{ span:3, offset:0}">
            <a-select v-model:value="user.coursesCustom.videoModel">
              <a-select-option :value=0>不刷</a-select-option>
              <a-select-option :value=1>普通模式</a-select-option>
              <a-select-option :value=2>暴力模式</a-select-option>
            </a-select>
          </a-form-item>
        </a-card>
      </a-col>
    </a-row>
    <a-button type="dashed" block @click="addUser" style="margin-bottom: 16px">
      <template #icon><PlusOutlined /></template>
      新增用户
    </a-button>
    <a-button
  type="primary"
  shape="circle"
  @click="exportYaml"
  :icon="h(DownloadOutlined)"
  style="width: 70px; height: 70px; position: fixed; bottom: 32px; right: 32px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"
>导出</a-button>
  </a-form>
</a-card>
</template>

<script setup lang="ts">
import { reactive, h } from 'vue'
import { saveAs } from 'file-saver'
import yaml from 'js-yaml'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'


interface CoursesCustom {
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
  overBrush: number
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
      ipProxySw: number
    }
    emailInform: {
      sw: number
      SMTPHost: string
      SMTPPort: string
      email: string
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

const form = reactive<FormData>({
  setting: {
    basicSetting: {
      completionTone: 1,
      colorLog: 1,
      logOutFileSw: 1,
      logLevel: 'INFO',
      logModel: 0,
      ipProxySw: 0,
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
      overBrush: 0,
      coursesCustom: {
        videoModel: 1,
        autoExam: 0,
        examAutoSubmit: 0,
        excludeCourses: [],
        includeCourses: []
      },
    },
  ],
})

function addUser(): void {
  form.users.push({
    accountType: 'YINGHUA',
    url: '',
    account: '',
    password: '',
    overBrush: 0,
    coursesCustom: {
      videoModel: 1,
      autoExam: 0,
      examAutoSubmit: 0,
      excludeCourses: [],
      includeCourses: []
    },
  })
}

function removeUser(index: number): void {
  form.users.splice(index, 1)
}

function exportYaml(): void {
  const yamlStr = yaml.dump(JSON.parse(JSON.stringify(form)))
  const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' })
  saveAs(blob, 'config.yaml')
}
</script>

<style scoped>
</style>
