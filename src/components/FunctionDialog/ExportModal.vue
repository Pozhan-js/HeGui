<template>
  <el-dialog :visible="visible" title="导出报表" @closed="closed" @close="close">
    <el-form :rules="rules" ref="form" labelWidth="130px" :model="form">
      <el-form-item label="账号密码" prop="password">
        <el-input type="password" v-model="form.password" placeholder="重要操作，需要验证您的登录密码" show-password/>
      </el-form-item>
      <el-form-item v-if="showExcelPassword" label="文件密码" prop="excelPassword">
        <el-input type="password" v-model="form.excelPassword" placeholder='请设置文件密码' show-password/>
      </el-form-item>
      <el-form-item v-if="showExcelPassword" label="再次输入" prop="passwordAgain">
        <el-input type="password" v-model="form.passwordAgain" placeholder='请再次输入文件密码' show-password/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type='primary' @click="confirm">确 认</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { encrypt } from '@/utils/jsencrypt'

export default {
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    showExcelPassword() {
      return !this.options?.ignoreExcelPassword;
    }
  },
  data() {
    return {
      visible: true,
      form: {
        excelPassword: null,
        password: null
      },
      rules: {
        password: [
          { required: true, message: '请输入当前账号登录密码' }
        ],
        excelPassword: [
          { required: true, message: '请输入 Excel 解密密码' },
        ],
        passwordAgain: [
          { required: true, message: '请再次确认 Excel 解密密码' },
          { validator: this.validatorAgain }
        ]
      }
    }
  },
  methods: {
    validatorAgain(rule, value, callback) {
      if (value !== this.form.excelPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    ,
    confirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.visible = false
          this.$emit('complete', {
            password: encrypt(this.form.password),
            excelPassword: encrypt(this.form.excelPassword)
          })
        }
      })
    },
    close() {
      this.visible = false
      this.$emit('cancel')
    },
    closed() {
      this.$emit('closed')
    }
  }
}
</script>
