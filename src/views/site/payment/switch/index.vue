<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="250px">
      <el-form-item v-for="item in configArr" :key="item.code" :label="item.name" :prop="item.code">
        <el-select
          v-model="form[item.code]"
          style="width: 30%"
          placeholder="请选择支付渠道"
        >
          <el-option
            v-for="dict in paymentChannelOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        v-hasPermi="['system:commonSetting:edit']"
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
    </div>
  </div>
</template>

<script>
import { getSys, edit } from '@/api/site/payment/unionPay'

export default {
  name: 'Switch',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 支付渠道
      paymentChannelOptions: [],
      form: {},
      rules: {
        configName: [
          { required: true, message: '配置名称不能为空', trigger: 'blur' }
        ]
      },
      configArr: []
    }
  },
  created() {
    this.getConfigure()
    this.getDicts('sys_payment_channel').then((response) => {
      this.paymentChannelOptions = response.data
    })
  },
  methods: {
    getConfigure() {
      getSys().then(res => {
        this.configArr = JSON.parse(res.msg)
        const form = {}
        JSON.parse(res.msg).map(item => {
          form[item.code] = item.payType
        })
        this.form = form
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm('是否确定保存支付设置', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const params = this.configArr.map(item => {
                return { ...item, payType: this.form[item.code] }
              })
              return edit(params)
            })
            .then(() => {
              this.msgSuccess('支付设置修改成功')
            })
        }
      })
    }
  }
}
</script>
<style>
  .dialog-footer {
    padding-bottom: 40px;
    text-align: center;
  }
  .el-icon-question {
    padding: 6px;
  }
</style>
