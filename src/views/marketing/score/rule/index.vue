<template>
  <div class="app-container">
    <h1 class="mt5">会员积分规则设置</h1>
    <el-form ref="form" v-loading="loading" :model="formModel" :rules="formRules" :disabled="!savePermi" hide-required-asterisk size="small" label-position="top" class="score-rule-form">
      <el-form-item label="生效设置" prop="effectHour">
        <el-radio-group v-model="isDeferrable" @change="handleIsDeferrableChange">
          <el-radio :label="false">确认收货后立即生效</el-radio>
          <el-radio :label="true">
            确认收货后
            <el-input-number v-if="isDeferrable" v-model="formModel.effectHour" :disabled="!isDeferrable" :min="isDeferrable ? 1 : 0" :step="1" step-strictly class="ml5 mr5" />
            <el-input-number v-else disabled class="ml5 mr5" />小时后生效
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="到期设置" prop="clearTime">
        <el-radio-group v-model="isFixedPeriod" @change="handleIsFixedPeriodChange">
          <el-radio :label="false">永久有效</el-radio>
          <el-radio :label="true">
            固定周期
            ：每年的<el-date-picker v-model="formModel.clearTime" :disabled="!isFixedPeriod" type="month" :clearable="false" format="M月" value-format="MM-dd" popper-class="hide-datepicker-header" class="w130 ml5 mr5" />
            1日凌晨清空积分池内创建时间超过一年的所有积分
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="积分到期消息提醒设置" prop="cleanRemindType">
        <el-checkbox-group v-model="formModel.cleanRemindType" :disabled="!!'消息提醒功能暂未上线'">
          <el-checkbox label="" @change="handleNoReminder">无提醒</el-checkbox>
          <el-checkbox label="wx_service" @change="handleReminder">微信服务通知消息提醒</el-checkbox>
          <el-checkbox label="wx_mp" @change="handleReminder">微信公众号消息提醒</el-checkbox>
          <el-checkbox label="sms" @change="handleReminder">短信消息提醒</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item prop="startFlag" style="margin: 0">
        <div slot="label">
          消费送积分
          <el-switch
            v-model="formModel.startFlag"
            active-value="1"
            inactive-value="0"
            class="ml10"
          />
        </div>
      </el-form-item>
      <el-form-item prop="quotaFlag" class="mb10">
        限额是否开启：
        <el-radio-group v-model="formModel.quotaFlag" :disabled="disableConsume" class="mr20">
          <el-radio label="1" class="mr10">是</el-radio>
          <el-radio label="0">否</el-radio>
        </el-radio-group>
        限额设置：每
        <el-select v-model="formModel.quotaDateType" :disabled="disableConsume || !+formModel.quotaFlag" clearable class="w130 ml5 mr5" placeholder="年/月/日">
          <el-option label="年" value="year" />
          <el-option label="月" value="month" />
          <el-option label="日" value="day" />
        </el-select>

        最大可增加<el-input-number v-model="formModel.quotaScore" :disabled="disableConsume || !+formModel.quotaFlag" :min="1" :step="1" step-strictly class="ml5 mr5" />积分
      </el-form-item>
      <el-form-item prop="minConsume">
        <span>基本规则 * 单笔订单金额满</span>
        <el-input-number v-model="formModel.minConsume" :disabled="disableConsume" class="ml5 mr5" :min="1" :precision="2" />
        <span>,每消费</span>
        <el-input-number v-model="formModel.baseNum" :disabled="disableConsume" class="ml5 mr5" :min="1" :precision="2" />
        <span>元，加</span>
        <el-input-number v-model="formModel.baseScore" :disabled="disableConsume" class="ml5 mr5" :min="0" :step="1" step-strictly />
        <span>积分</span>
        <!-- TODO 会员日积分赠送 -->
        <div class="mt10">
          <span>每月</span>
          <el-input-number v-model="formModel.gainStartDay" :controls="false" :disabled="disableConsume" class="ml5 mr5" :min="1" :max="31" :step="1" step-strictly />
          <span>-</span>
          <el-input-number v-model="formModel.gainEndDay" :controls="false" :disabled="disableConsume" class="ml5 mr5" :min="1" :max="31" :step="1" step-strictly />
          <span>为会员日，会员日期间下单得</span>
          <el-input-number v-model="formModel.gainNumber" :controls="false" class="ml5 mr5"  :min="0" :step="1" step-strictly />
          <span>倍积分</span>
        </div>
      </el-form-item>
      <el-form-item>
        额外奖励规则 <el-button :disabled="disableConsume || formModel.scoreRuleExtraList.length >= 5" class="blue-btn ml10 mr5" @click="addExtraReward">添加奖励规则</el-button>
      </el-form-item>
      <el-form-item
        v-for="(item, index) in formModel.scoreRuleExtraList"
        :key="item.scoreExtraId || index"
        :prop="'scoreRuleExtraList.' + index"
        :rules="scoreRuleExtraListRule"
        style="margin-left: 110px"
      >
        <el-tag effect="plain" type="info">{{ index + 1 }}</el-tag>
        一次性消费<el-input-number v-model="item.scoreCondition" :disabled="disableConsume" class="ml5 mr5" :min="1" :precision="2" />元，
        加<el-input-number v-model="item.score" :disabled="disableConsume" class="ml5 mr5" :min="1" :step="1" step-strictly />积分
        <i v-if="savePermi && !disableConsume" class="el-icon-delete deleteIcon ml20" @click="deleteExtraeReward(index)" />
      </el-form-item>
      <el-form-item label="签到送积分" prop="signType">
        <el-radio-group v-model="formModel.signType">
          <el-radio label="continuou" class="mr10">
            <span>连续签到积分：每</span>
            <el-input-number v-model="formModel.signPeriodDay" :disabled="formModel.signType === 'fixed'" class="ml5 mr5" :min="0" :step="1" step-strictly />
            <span>天固定周期，首次签到</span>
            <el-input-number v-if="formModel.signType === 'continuou'" v-model="formModel.signOneScore" class="ml5 mr5" :min="0" :step="1" step-strictly />
            <el-input-number v-else disabled class="ml5 mr5" />
            <span>积分，连续签到则为 {{ formModel.signType === 'continuou' ? formModel.signOneScore : '' }}+ </span>
            <el-input-number v-model="formModel.signContinuouScore" :disabled="formModel.signType === 'fixed'" class="ml5 mr5" :min="0" :step="1" step-strictly :controls="false" style="width: 50px" />
            <span>* n天，周期结束后重新计算连续签到获得积分。</span>
            <div style="margin-top: 20px; font-size: 14px">
              <span>连续签到送券：</span>
              <el-button class="blue-btn ml5 mr5" @click="addCouponRule">添加送券规则</el-button>

              <el-form-item style="margin: 20px 0 0 110px;" prop="signRuleCouponExtraList">
                <div v-for="item in formModel.signRuleCouponExtraList" :key="item.uuid || item.signExtraId" class="mb10">
                  <span>连续签到</span>
                  <el-input-number v-model="item.continuousSignDay" :disabled="formModel.signType === 'fixed'" class="ml5 mr5" :min="0" :max="formModel.signPeriodDay" :step="1" step-strictly :controls="false" style="width: 50px" />
                  <span>天</span>
                  <span>送</span>
                  <coupon-select v-model="item.signRuleCouponList">
                    <template #trigger="{showSelectDialog}">
                      <span v-if="item.signRuleCouponList">
                        <el-tag class="mr5 ml5" v-for="coupon in item.signRuleCouponList" :key="coupon.couponId" closable @close="handleRemoveCoupon(item, coupon)">
                          {{coupon.couponName}}
                        </el-tag>
                      </span>
                      <el-button class="blue-btn ml5 mr5" size="mini" @click="showSelectDialog">选择卡券</el-button>
                    </template>
                  </coupon-select>
                  <span>，周期结束后重新计算连续签到次数。</span>
                  <i v-if="formModel.signType !== 'fixed'" class="el-icon-delete deleteIcon ml20" @click="deleteCouponRule(item)" />
                </div>
              </el-form-item>
            </div>
          </el-radio>
          <br>
          <el-radio label="fixed" style="margin-top: 15px">
            固定签到积分：每次签到<el-input-number v-if="formModel.signType === 'fixed'" v-model="formModel.signOneScore" class="ml5 mr5" :min="0" :step="1" step-strictly />
            <el-input-number v-else disabled class="ml5 mr5" />积分。
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="签到规则描述" prop="ruleRemark">
        <el-input type="textarea" style="width: 500px;" v-model="formModel.ruleRemark"/>
      </el-form-item>
      <el-form-item size="medium">
        <el-button v-if="savePermi" type="primary" :loading="submitLoading" @click="submitForm">确认</el-button>
        <el-button :disabled="submitLoading" @click="() => $router.back()">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { listScoreRule, updateScoreRule } from '@/api/marketing/scoreRule'
import moment from 'moment'
import CouponSelect from './coupon-select'
import Decimal from 'decimal.js'
import { checkPermi } from '@/utils/permission.js'

export default {
  components: { CouponSelect },
  data() {
    const effectHourValidate = (rule, value, callback) => {
      if (this.isDeferrable && typeof value === 'undefined') {
        callback(new Error('生效时间不能为空'))
      } else if (typeof value !== 'number') {
        callback(new Error('请选择生效设置'))
      } else {
        callback()
      }
    }

    const clearTimeValidate = (rule, value, callback) => {
      if (typeof value !== 'string') {
        callback(new Error('请选择固定周期月份'))
      } else {
        callback()
      }
    }

    const quotaFlagValidate = (rule, value, callback) => {
      if (typeof value !== 'string') {
        return callback(new Error('请选择限额是否开启'))
      } else if (value === '0') {
        return callback()
      }
      const errorArr = []
      if (!this.formModel.quotaDateType) {
        errorArr.push('请选择日期类型')
      }
      if (!this.formModel.quotaScore) {
        errorArr.push('请输入限额积分')
      }
      if (errorArr.length) {
        callback(new Error(errorArr.join(',')))
      } else {
        callback()
      }
    }

    const minConsumeValidate = (rule, value, callback) => {
      const errorArr = []
      if (!value) {
        errorArr.push('请输入最低消费金额')
      }
      if (!this.formModel.baseNum) {
        errorArr.push('请输入每消费金额')
      }
      if (!this.formModel.gainStartDay) {
        errorArr.push('请输入每月开始会员日')
      }
      if (!this.formModel.gainEndDay) {
        errorArr.push('请输入每月结束会员日')
      } else if(this.formModel.gainEndDay < this.formModel.gainStartDay) {
        errorArr.push('结束会员日不能小于开始会员日')
      }
      if (errorArr.length) {
        callback(new Error(errorArr.join(',')))
      } else {
        callback()
      }
    }

    const scoreRuleExtraListValidate = (rule, value, callback) => {
      const errorArr = []
      const repeatArr = this.formModel.scoreRuleExtraList.filter(i => i.scoreCondition === value.scoreCondition)
      if (value.scoreCondition && repeatArr.length > 1) {
        errorArr.push('一次性消费金额不能重复')
      }
      if (!value.scoreCondition) {
        errorArr.push('请输入一次性消费金额')
      }
      if (!value.score) {
        errorArr.push('请输入积分')
      }
      if (errorArr.length) {
        callback(new Error(errorArr.join(',')))
      } else {
        callback()
      }
    }

    const signRuleCouponValidate = (rule, value, callback) => {
      if (value) {
        const daysSet = new Set()
        value.forEach(item => {
          daysSet.add(item.continuousSignDay)
          if (item.continuousSignDay == null || item.continuousSignDay.length == 0) {
            return callback('请输入签到天数')
          }
          if (!item.signRuleCouponList?.length) {
            return callback('请选择赠送的优惠券')
          }
        })
        if (daysSet.size !== value.length) {
          return callback('连续签到天数不能相同')
        }
      }
      callback()
    }

    return {
      savePermi: checkPermi(['marketing:scoreRule:add']),
      loading: false,
      submitLoading: false,
      isDeferrable: undefined,
      isFixedPeriod: undefined,
      formModel: {
        effectHour: undefined,
        clearTime: undefined,
        cleanRemindType: [],
        quotaFlag: undefined,
        quotaDateType: undefined,
        quotaScore: undefined,
        minConsume: undefined,
        baseNum: undefined,
        baseScore: undefined,
        scoreRuleExtraList: [{ scoreCondition: undefined, score: undefined }],
        signType: undefined,
        signPeriodDay: undefined,
        signOneScore: undefined,
        signContinuouScore: 1,
        startFlag: '1',
        gainStartDay: null,
        gainEndDay: null,
        gainNumber: null,
      },
      formRules: {
        effectHour: [{ validator: effectHourValidate, trigger: 'change' }],
        clearTime: [{ validator: clearTimeValidate, trigger: 'change' }],
        cleanRemindType: [{ required: true, message: '请选择积分到期消息提醒设置', trigger: 'change' }],
        quotaFlag: [{ validator: quotaFlagValidate, trigger: 'change' }],
        minConsume: [{ validator: minConsumeValidate, trigger: 'change' }],
        signRuleCouponExtraList: [{ validator: signRuleCouponValidate, trigger: 'submit' }]
      },
      scoreRuleExtraListRule: { validator: scoreRuleExtraListValidate, trigger: 'blur' }
    }
  },
  computed: {
    disableConsume() {
      return this.formModel.startFlag === '0'
    }
  },
  created() {
    this.getInfo()
  },
  methods: {
    getInfo() {
      this.loading = true
      listScoreRule()
        .then(res => {
          this.formModel = {
            ...this.formModel,
            ...this.handleFeeData(res.data, 'div')
          }
          const { effectHour, clearTime, cleanRemindType } = res.data
          if (effectHour === 0) {
            this.isDeferrable = false
          } else if (effectHour > 0) {
            this.isDeferrable = true
          }
          if (clearTime === '') {
            this.isFixedPeriod = false
          } else if (clearTime) {
            this.isFixedPeriod = true
          }
          if (typeof cleanRemindType === 'string') {
            this.formModel.cleanRemindType = cleanRemindType.split(',')
          }
          this.loading = false
        })
    },
    handleIsDeferrableChange(val) {
      if (val) {
        this.formModel.effectHour = 1
      } else {
        this.formModel.effectHour = 0
      }
      this.$refs.form.validateField('effectHour')
    },
    handleIsFixedPeriodChange(val) {
      this.formModel.clearTime = val ? moment().startOf('M').format('MM-DD') : ''
    },
    handleReminder(val) {
      if (val) {
        const noRemindIndex = this.formModel.cleanRemindType.findIndex(i => i === '')
        noRemindIndex !== -1 && this.formModel.cleanRemindType.splice(noRemindIndex, 1)
      }
    },
    handleNoReminder(val) {
      if (val && this.formModel.cleanRemindType.length > 1) {
        this.formModel.cleanRemindType = ['']
      }
    },
    addExtraReward() {
      this.formModel.scoreRuleExtraList.push({ scoreCondition: undefined, score: undefined })
    },
    deleteExtraeReward(i) {
      this.formModel.scoreRuleExtraList.splice(i, 1)
    },
    // 金额参数 提交时 * 100，返回时 / 100
    handleFeeData(obj, action) {
      const params = ['minConsume', 'baseNum']

      const result = {}
      Object.entries(obj).forEach(([key, value]) => {
        if (params.includes(key) && value) {
          result[key] = new Decimal(value)[action](100).toNumber()
        } else {
          result[key] = value
        }
      })
      if (Array.isArray(obj.scoreRuleExtraList)) {
        result.scoreRuleExtraList = obj.scoreRuleExtraList.map(item => {
          if (item.scoreCondition) {
            return {
              ...item,
              scoreCondition: new Decimal(item.scoreCondition)[action](100).toNumber()
            }
          }
          return item
        })
      }

      return result
    },
    addCouponRule() {
      const newItem = { uuid: Date.now() }
      const list = this.formModel.signRuleCouponExtraList || []
      list.push(newItem)
      this.$set(this.formModel, 'signRuleCouponExtraList', list)
    },
    deleteCouponRule(current) {
      const list = this.formModel.signRuleCouponExtraList.filter(item => item != current)
      this.$set(this.formModel, 'signRuleCouponExtraList', list)
    },
    handleRemoveCoupon(target, coupon) {
      const item = this.formModel.signRuleCouponExtraList.find(item => item == target)
      item.signRuleCouponList = item.signRuleCouponList.filter(item => item != coupon)
      this.$set(this.formModel, 'signRuleCouponExtraList', this.formModel.signRuleCouponExtraList)
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm('是否确认修改积分规则设置?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.submitLoading = true
              const { cleanRemindType } = this.formModel
              return updateScoreRule({
                ...this.handleFeeData(this.formModel, 'mul'),
                cleanRemindType: cleanRemindType && cleanRemindType.join(','),
              })
            })
            .then(() => {
              this.submitLoading = false
              this.msgSuccess('修改积分规则设置成功')
              this.getInfo()
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";
  .app-container {
    padding-left: 30px;
  }
  .score-rule-form {
    .w130 {
      width: 130px;
    }
    .deleteIcon {
      font-size: 20px;
      vertical-align: middle;
      color: $red;
      cursor: pointer;
    }
  }
</style>

<style>
  .hide-datepicker-header .el-date-picker__header {
    display: none;
  }
</style>
