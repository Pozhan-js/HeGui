<template>
  <el-dialog :visible="visible" :title="title" @closed="closed" @close="close">
    <el-form ref="form" :rules="rules" :label-width="labelWidth" :model="form">
      <el-form-item v-for="item in columns" label="账号密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="重要操作，需要验证您的登录密码" show-password />
      </el-form-item>
      <el-form-item v-if="showExcelPassword" label="文件密码" prop="excelPassword">
        <el-input v-model="form.excelPassword" type="password" placeholder="请设置文件密码" show-password />
      </el-form-item>
      <el-form-item v-if="showExcelPassword" label="再次输入" prop="passwordAgain">
        <el-input v-model="form.passwordAgain" type="password" placeholder="请再次输入文件密码" show-password />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确 认</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    title: String,
    rules: Array,
    labelWidth: {
      type: String,
      default: '130px'
    },
    form: Object,
    columns: Array
  },
  computed: {
    showExcelPassword() {
      return !this.options?.ignoreExcelPassword
    }
  },
  methods: {
    validatorAgain(rule, value, callback) {
      if (value !== this.form.excelPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    },
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
