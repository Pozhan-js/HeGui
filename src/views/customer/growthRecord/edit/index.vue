<template>
  <div v-loading="divLoading" style="padding: 20px">
    <el-form v-if="!divLoading" ref="form" :model="form" :rules="rules" label-width="120px">
      <div v-for="(key,index) in formKey" :key="index" class="border">
        <div class="title">{{ { consume: '消费', recharge: '充值', sign: '签到', share: '分享', score: '评价'}[key] }}</div>
        <div class="switch">
          <el-switch
            v-model="key === 'sign' ? false : form[key].strategyFlag"
            :width="90"
            :disabled="key === 'sign'"
            active-color="#13ce66"
          />
        </div>
        <el-form-item label="限额是否开启" prop="quotaFlag">
          <el-radio-group v-model="form[key].quotaFlag">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form[key].quotaFlag" label="限额设置" :prop="key+'Quota'">
          <span>每</span>
          <dict-select v-model="form[key].quotaDateType" style="width: 80px;margin: 0 5px;" dict="customer_quota_date_type" />
          <span>最大可增加</span>
          <el-input-number v-model="form[key].quotaGrowth" class="growth" placeholder="请输入成长值" :min="0" :precision="0" />
          <span>成长值</span>
        </el-form-item>
        <el-form-item v-if="key !== 'sign'" label="基本规则" :prop="key + 'Base'">
          <div v-if="key === 'share'">
            <span>每次分享，增加</span>
            <el-input-number v-model="form[key].baseGrowth" class="growth" placeholder="请输入成长值" :min="0" :precision="0" />
            <span>成长值 （顾客实获成长值：{{ toDecimal2(growthRatio * form[key].baseGrowth) }}）</span>
          </div>
          <div v-else-if="key === 'score'">
            <span>每次评价打分</span>
            <el-input-number v-model="form[key].baseNum" class="growth" :max="5" placeholder="请输入星级" :min="0" :precision="0" />
            <span>以上，增加</span>
            <el-input-number v-model="form[key].baseGrowth" class="growth" placeholder="请输入成长值" :min="0" :precision="0" />
            <span>成长值 （顾客实获成长值：{{ toDecimal2(growthRatio * form[key].baseGrowth) }}）</span>
          </div>
          <div v-else>
            <span v-if="key === 'recharge'">每充值</span>
            <span v-else>每消费</span>
            <el-input-number v-model="form[key].baseNum" class="growth" placeholder="请输入金额" :min="0" :precision="2" />
            <span>元，加</span>
            <el-input-number v-model="form[key].baseGrowth" class="growth" placeholder="请输入成长值" :min="0" :precision="0" />
            <span>成长值 （顾客实获成长值：{{ toDecimal2(growthRatio * form[key].baseGrowth) }}）</span>
          </div>
        </el-form-item>
        <el-form-item v-if="!['share', 'score'].includes(key)" label="额外奖励规则" :prop="key + 'List'">
          <el-button type="primary" size="mini" :disabled="form[key].list.length >= 5" @click="addList(key)">添加奖励规则</el-button>
          <div v-for="(item, index) in form[key].list" :key="index" style="padding: 10px 0;">
            <span v-if="key === 'sign'">连续签到满</span>
            <span v-else-if="key === 'recharge'">一次性充值</span>
            <span v-else>一次性消费</span>
            <el-input-number v-model="item.growthCondition" class="growth" placeholder="请输入金额" :min="0" :precision="key === 'sign' ? 0 : 2" />
            <span v-if="key === 'sign'">次，加</span>
            <span v-else>元，加</span>
            <el-input-number v-model="item.growth" class="growth" placeholder="请输入成长值" :min="0" :precision="0" />
            <span>成长值 （顾客实获成长值：{{ toDecimal2(growthRatio * item.growth) }}）</span>
            <el-button v-if="form[key].list.length > 1" type="text" @click="delList(key, index)">删除</el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <div class="dialog-footer">
      <el-button
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import { detail, growthRuleUpdate } from '@/api/customer/growthRecord'
import DictSelect from '@/components/DictSelect.vue'

export default {
  components: {
    DictSelect
  },
  data() {
    const quotaValidate = (callback, type) => {
      if (!this.form[type].quotaDateType) {
        callback(new Error('请选择限额日期类型'))
      } else if (this.form[type].quotaGrowth === null || this.form[type].quotaGrowth === undefined) {
        callback(new Error('请输入成长值'))
      } else {
        callback()
      }
    }

    const baseValidate = (callback, type) => {
      if (!this.form[type].baseNum && ['consume', 'recharge', 'score'].includes(type)) {
        callback(new Error(`请输入${{ consume: '消费金额', recharge: '充值金额', score: '每次评价打分' }[type]}`))
      } else if (this.form[type].baseGrowth === null || this.form[type].baseGrowth === undefined) {
        callback(new Error('请输入成长值'))
      } else {
        callback()
      }
    }

    const listValidate = (callback, type) => {
      const conditionArr = this.form[type].list.map(item => item.growthCondition)
      const growthArr = this.form[type].list.map(item => item.growth)
      console.log(conditionArr)
      if (conditionArr.includes(0) || conditionArr.includes(null) || conditionArr.includes(undefined)) {
        callback(new Error(`请输入${{ consume: '一次性消费金额', recharge: '一次性充值金额', sign: '连续签到满次数' }[type]}`))
      } else if (growthArr.includes(null) || growthArr.includes(undefined)) {
        callback(new Error('请输入成长值'))
      } else {
        callback()
      }
    }

    return {
      divLoading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 时间类型
      dateType: [],
      // 成长值系数
      growthRatio: 0,
      // form表单KEY
      formKey: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        consumeQuota: [{ validator: (rule, value, callback) => quotaValidate(callback, 'consume'), trigger: 'blur' }],
        consumeBase: [{ validator: (rule, value, callback) => baseValidate(callback, 'consume'), trigger: 'blur' }],
        consumeList: [{ validator: (rule, value, callback) => listValidate(callback, 'consume'), trigger: 'blur' }],
        rechargeQuota: [{ validator: (rule, value, callback) => quotaValidate(callback, 'recharge'), trigger: 'blur' }],
        rechargeBase: [{ validator: (rule, value, callback) => baseValidate(callback, 'recharge'), trigger: 'blur' }],
        rechargeList: [{ validator: (rule, value, callback) => listValidate(callback, 'recharge'), trigger: 'blur' }],
        signQuota: [{ validator: (rule, value, callback) => quotaValidate(callback, 'sign'), trigger: 'blur' }],
        signBase: [{ validator: (rule, value, callback) => baseValidate(callback, 'sign'), trigger: 'blur' }],
        signList: [{ validator: (rule, value, callback) => listValidate(callback, 'sign'), trigger: 'blur' }],
        shareQuota: [{ validator: (rule, value, callback) => quotaValidate(callback, 'share'), trigger: 'blur' }],
        shareBase: [{ validator: (rule, value, callback) => baseValidate(callback, 'share'), trigger: 'blur' }],
        scoreQuota: [{ validator: (rule, value, callback) => quotaValidate(callback, 'score'), trigger: 'blur' }],
        scoreBase: [{ validator: (rule, value, callback) => baseValidate(callback, 'score'), trigger: 'blur' }]
      }
    }
  },
  mounted() {
    if (this.$route.query.growthStrategyId) {
      this.growthRatio = parseFloat(this.$route.query.growthRatio).toFixed(2)
      this.formKey = { consume: ['consume', 'recharge'], member: ['sign', 'share', 'score'] }[this.$route.query.type]
      this.handleInfo(this.$route.query.growthStrategyId)
    }
    this.getDicts('customer_quota_date_type').then((response) => {
      this.dateType = response.data
    })
  },
  methods: {
    // 查询详情
    handleInfo(growthStrategyId) {
      this.divLoading = true
      detail(growthStrategyId).then(res => {
        this.divLoading = false
        const form = {}
        res.data.map(item => {
          let baseNum = 0
          if (item.customerGrowthRule.strategyType === 'share') {
            baseNum = 1
          } else if (['score'].includes(item.customerGrowthRule.strategyType)) {
            baseNum = item.customerGrowthRule.baseNum
          } else {
            baseNum = item.customerGrowthRule.baseNum / 100
          }
          form[item.customerGrowthRule.strategyType] = {
            growthRuleId: item.customerGrowthRule.growthRuleId,
            growthStrategyId: item.customerGrowthRule.growthStrategyId,
            strategyFlag: item.customerGrowthRule.strategyFlag,
            quotaFlag: item.customerGrowthRule.quotaFlag,
            quotaDateType: item.customerGrowthRule.quotaDateType,
            quotaGrowth: item.customerGrowthRule.quotaGrowth,
            baseNum: baseNum,
            baseGrowth: item.customerGrowthRule.baseGrowth,
            list: !['share', 'score'].includes(item.customerGrowthRule.strategyType) ? item.customerGrowthExtraList.map(listItem => {
              return {
                growth: listItem.growth,
                growthCondition: ['sign'].includes(item.customerGrowthRule.strategyType) ? listItem.growthCondition : listItem.growthCondition / 100
              }
            }) : []
          }
          if (['share', 'score'].includes(item.customerGrowthRule.strategyType)) {
            delete form[item.customerGrowthRule.strategyType].list
          }
        })
        this.form = form
      })
    },
    // 表单重置
    reset() {
      this.form = {}
      this.resetForm('form')
    },
    /** 增加额外奖励 */
    addList(type) {
      this.form = {
        ...this.form,
        [type]: {
          ...this.form[type],
          list: this.form[type].list.concat([{ growth: 0, growthCondition: 0 }])
        }
      }
    },
    delList(type, index) {
      this.form = {
        ...this.form,
        [type]: {
          ...this.form[type],
          list: this.form[type].list.filter((item, listIndex) => listIndex !== index)
        }
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const params = Object.keys(this.form).map(item => {
            return {
              customerGrowthRule: {
                strategyFlag: this.form[item].strategyFlag,
                quotaFlag: this.form[item].quotaFlag,
                quotaDateType: this.form[item].quotaDateType,
                quotaGrowth: this.form[item].quotaGrowth,
                baseNum: ['score', 'share'].includes(item) ? this.form[item].baseNum : this.form[item].baseNum * 100,
                baseGrowth: this.form[item].baseGrowth,
                growthRuleId: this.form[item].growthRuleId,
                growthStrategyId: this.form[item].growthStrategyId
              },
              customerGrowthExtraList: ['share', 'score'].includes(item) ? [] : this.form[item].list.map(listItem => {
                return {
                  growth: listItem.growth,
                  growthCondition: ['sign'].includes(item) ? listItem.growthCondition : listItem.growthCondition * 100
                }
              })
            }
          })
          this.$confirm(`是否确定保存${this.routerType === 'member' ? '会员活跃' : '消费激励'}策略?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              return growthRuleUpdate(params)
            })
            .then(() => {
              this.msgSuccess(`保存成功`)
              this.cancel()
            })
        }
      })
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped lang="scss">
.dialog-footer {
	margin-top: 30px;
  padding-bottom: 40px;
  text-align: center;
}
.border {
  width: 100%;
	position: relative;
	padding: 20px 10px;
  padding-bottom: 50px;
  margin-top: 40px;
  border: 1px solid #333;
  .title {
    width: 60px;
		font-size: 22px;
    font-weight: 600;
		position: absolute;
    left: 23px;
    top: -17px;
    background: #fff;
    text-align: center;
  }
	.switch{
    position: absolute;
		right: 40px;
    top: -10px;
    background: #fff;
  }
}
/deep/ .el-switch__core{
	height: 30px;
}
/deep/ .el-switch.is-checked .el-switch__core::after {
	margin-left: -27px;
}
/deep/ .el-switch__core {
	border-radius: 30px;
}
/deep/ .el-switch__core:after {
	width: 27px;
	height: 27px;
}
.growth{
	width: 100px;
	margin: 0 5px;
}
/deep/ .growth .el-input__inner{
	padding: 0;
}
/deep/ .growth .el-input-number__decrease {
	display: none;
}
/deep/ .growth .el-input-number__increase {
	display: none;
}
</style>
