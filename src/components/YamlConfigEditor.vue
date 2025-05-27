<template>
  <a-card title="YAML 配置生成器" style="max-width: 800px; margin: 20px auto">
    <a-form :model="form" layout="vertical">
      <a-divider>基础设置</a-divider>
      <a-form-item label="完成提示音">
        <a-switch v-model:checked="form.setting.basicSetting.completionTone" />
      </a-form-item>
      <a-form-item label="彩色日志">
        <a-switch v-model:checked="form.setting.basicSetting.colorLog" />
      </a-form-item>
      <a-form-item label="日志输出到文件">
        <a-switch v-model:checked="form.setting.basicSetting.logOutFileSw" />
      </a-form-item>
      <a-form-item label="日志等级">
        <a-select v-model:value="form.setting.basicSetting.logLevel">
          <a-select-option value="DEBUG">DEBUG</a-select-option>
          <a-select-option value="INFO">INFO</a-select-option>
          <a-select-option value="WARNING">WARNING</a-select-option>
          <a-select-option value="ERROR">ERROR</a-select-option>
        </a-select>
      </a-form-item>

      <a-divider>邮箱通知</a-divider>
      <a-form-item label="开启">
        <a-switch v-model:checked="form.setting.emailInform.sw" />
      </a-form-item>
      <a-form-item label="SMTP Host">
        <a-input v-model:value="form.setting.emailInform.SMTPHost" />
      </a-form-item>
      <a-form-item label="SMTP Port">
        <a-input v-model:value="form.setting.emailInform.SMTPPort" />
      </a-form-item>
      <a-form-item label="Email">
        <a-input v-model:value="form.setting.emailInform.email" />
      </a-form-item>
      <a-form-item label="密码">
        <a-input-password v-model:value="form.setting.emailInform.password" />
      </a-form-item>

      <a-divider>AI 设置</a-divider>
      <a-form-item label="AI 类型">
        <a-select v-model:value="form.setting.aiSetting.aiType">
          <a-select-option value="TONGYI">TONGYI</a-select-option>
          <a-select-option value="OPENAI">OPENAI</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="AI URL">
        <a-input v-model:value="form.setting.aiSetting.aiUrl" />
      </a-form-item>
      <a-form-item label="模型">
        <a-input v-model:value="form.setting.aiSetting.model" />
      </a-form-item>
      <a-form-item label="API KEY">
        <a-input-password v-model:value="form.setting.aiSetting.API_KEY" />
      </a-form-item>

      <a-divider>API 问题设置</a-divider>
      <a-form-item label="接口地址">
        <a-input v-model:value="form.setting.apiQueSetting.url" />
      </a-form-item>

      <a-divider>用户设置</a-divider>
      <a-button type="dashed" block @click="addUser" style="margin-bottom: 16px">
        <template #icon><PlusOutlined /></template>
        新增用户
      </a-button>

      <a-row gutter="[16, 16]">
        <a-col :span="24" v-for="(user, index) in form.users" :key="index">
          <a-card :title="'用户 ' + (index + 1)" :extra="index > 0 ? h(DeleteOutlined, { onClick: () => removeUser(index), style: 'color:red;cursor:pointer' }) : null">
            <a-form-item label="账户类型">
              <a-input v-model:value="user.accountType" />
            </a-form-item>
            <a-form-item label="URL">
              <a-input v-model:value="user.url" />
            </a-form-item>
            <a-form-item label="账户">
              <a-input v-model:value="user.account" />
            </a-form-item>
            <a-form-item label="密码">
              <a-input-password v-model:value="user.password" />
            </a-form-item>
          </a-card>
        </a-col>
      </a-row>

      <a-button type="primary" @click="exportYaml">导出 YAML</a-button>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, h } from 'vue'
import { saveAs } from 'file-saver'
import yaml from 'js-yaml'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'

interface CoursesCustom {
  videoModel: number
  autoExam: number
  examAutoSubmit: number
  excludeCourses: string[]
  includeCourses: string[]
  coursesSettings: any[]
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
      completionTone: boolean
      colorLog: boolean
      logOutFileSw: boolean
      logLevel: string
      logModel: number
      ipProxySw: boolean
    }
    emailInform: {
      sw: boolean
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
      completionTone: true,
      colorLog: true,
      logOutFileSw: true,
      logLevel: 'INFO',
      logModel: 0,
      ipProxySw: false,
    },
    emailInform: {
      sw: false,
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
      accountType: 'XUEXITONG',
      url: '',
      account: '',
      password: '',
      overBrush: 0,
      coursesCustom: {
        videoModel: 0,
        autoExam: 0,
        examAutoSubmit: 0,
        excludeCourses: [],
        includeCourses: [],
        coursesSettings: [],
      },
    },
  ],
})

function addUser(): void {
  form.users.push({
    accountType: 'XUEXITONG',
    url: '',
    account: '',
    password: '',
    overBrush: 0,
    coursesCustom: {
      videoModel: 0,
      autoExam: 0,
      examAutoSubmit: 0,
      excludeCourses: [],
      includeCourses: [],
      coursesSettings: [],
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
