<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="250px">
      <el-form-item label="营业开始时间" prop="openTime">
        <el-col :span="3">
          <el-time-picker
            v-model="form.openTime"
            style="width: 100%"
            format="HH:mm"
            @input="refreshForm"
          />
        </el-col>
        <el-col class="line" style="text-align: center" :span="1">-</el-col>
        <el-col :span="3">
          <el-time-picker
            v-model="form.closeTime"
            style="width: 100%"
            format="HH:mm"
          />
        </el-col>
      </el-form-item>
      <!--      <el-form-item label="打烊提示图片" prop="closeReminderPicture">-->
      <!--        <ResourcePicker v-model="form.closeReminderPicture" size-hint="建议：360*360" />-->
      <!--      </el-form-item>-->
      <el-form-item label="小程序启动图" prop="defaultBannerPicture">
        <ResourcePicker
          v-model="form.customerSplashScreenPicture"
          size-hint="建议：414*896"
          style="display: inline-flex"
          ref="uploader"
          timestamp
          :showDialog="false"
          @select="handleUpload"
        />
      </el-form-item>
      <el-form-item label="默认Banner图" prop="defaultBannerPicture">
        <ResourcePicker
          v-model="form.defaultBannerPicture"
          size-hint="建议：680*250"
        />
      </el-form-item>
      <el-form-item label="不在电子围栏内Banner" prop="notInElectricFenceBanner">
        <ResourcePicker
          v-model="form.notInElectricFenceBanner"
          size-hint="建议：680*250"
        />
      </el-form-item>
      <!-- <el-form-item label="未开区域显示内容" prop="unopenedAreaDisplayContent">
            <ResourcePicker v-model="form.unopenedAreaDisplayContent" size-hint="建议：360*360" />
          </el-form-item> -->
      <el-form-item label="商城logo" prop="mallLogo">
        <ResourcePicker v-model="form.mallLogo" size-hint="建议：360*360" />
      </el-form-item>
      <el-form-item label="会员权益图片" prop="customerBenefitsPicture">
        <ResourcePicker v-model="form.customerBenefitsPicture" size-hint="建议：360*360" />
      </el-form-item>
      <el-form-item label="会员生日规则图片" prop="customerBirthdayPicture">
        <ResourcePicker v-model="form.customerBirthdayPicture" size-hint="建议：360*360" />
      </el-form-item>
      <el-form-item label="充值活动图片" prop="rechargeActivityPicture">
        <ResourcePicker v-model="form.rechargeActivityPicture" size-hint="建议：360*360" />
      </el-form-item>
      <el-form-item label="推广中心图片" prop="customerPromotePicture">
        <ResourcePicker v-model="form.customerPromotePicture" size-hint="建议：360*360" />
      </el-form-item>
      <el-form-item label="积分商城规则图片" prop="scoreMallRulePicture">
        <ResourcePicker v-model="form.scoreMallRulePicture" size-hint="建议：360*360" />
      </el-form-item>
      <el-form-item label="配送员出实线后的允许时间" prop="allowTime">
        <el-input-number v-model="form.commonDefaultForcedSignOutRequest.allowTime" :min="0" :precision="0" /> 分钟
      </el-form-item>
      <el-form-item label="是否执行强制签退" prop="forcedSignOutTag">
        <el-switch v-model="form.commonDefaultForcedSignOutRequest.forcedSignOutTag" />
      </el-form-item>
      <el-form-item label="实线电子围栏扩大范围" prop="virtualHasShelves">
        <el-input-number v-model="form.commonDefaultForcedSignOutRequest.virtualHasShelves" :min="0" :precision="0" /> m
      </el-form-item>
      <el-form-item label="配送员出电子围栏返回时间" prop="returnTime">
        <el-input-number v-model="form.commonDefaultForcedSignOutRequest.returnTime" :min="0" :precision="0" /> 分钟
      </el-form-item>
      <el-form-item label="积分订单无响应时长" prop="noResponseTime">
        <el-input-number v-model="form.commonScoreOrderRequest.noResponseTime" placeholder="自定义时间" :min="0" :precision="0" /> 分钟
        <el-popover
          placement="right"
          width="400"
          trigger="click"
        >
          <span class="text-red">订单支付成功后，礼品订单无人抢单，需人工调度的预警阈值</span>
          <i slot="reference" class="el-icon-question" />
        </el-popover>
      </el-form-item>
      <el-form-item label="礼品订单，消费者最大等待时间" prop="maxiWaitingTime">
        <el-input-number v-model="form.commonScoreOrderRequest.maxiWaitingTime" placeholder="自定义时间" :min="0" /> 小时
        <el-popover
          placement="right"
          width="400"
          trigger="click"
        >
          <span class="text-red">消费者下单后，配送员有效配送时间</span>
          <i slot="reference" class="el-icon-question" />
        </el-popover>
      </el-form-item>
      <el-form-item label="积分商城订单超时前提醒，距超时剩" prop="reminderBeforeTimeout">
        <el-input-number v-model="form.commonScoreOrderRequest.reminderBeforeTimeout" placeholder="自定义时间" :min="0" /> 小时， 预警提醒
        <el-popover
          placement="right"
          width="400"
          trigger="click"
        >
          <span class="text-red">订单开始配送后，仅剩{{ form.commonScoreOrderRequest.reminderBeforeTimeout ? form.commonScoreOrderRequest.reminderBeforeTimeout : 'x' }}小时配超时， 预警阈值</span>
          <i slot="reference" class="el-icon-question" />
        </el-popover>
      </el-form-item>
      <!-- <el-form-item label="积分商城订单退/转单时间限制" prop="refundTransferTimeLimit">
        <el-input-number v-model="form.commonScoreOrderRequest.refundTransferTimeLimit" placeholder="自定义时间" :min="0" :precision="0" /> 分钟
        <el-popover
          placement="right"
          width="400"
          trigger="click"
        >
          <span class="text-red">配送员成功分配到礼品订单后，超过该时限后配送员不可退单、转单</span>
          <i slot="reference" class="el-icon-question" />
        </el-popover>
      </el-form-item>
      <el-form-item label="积分商城订单转单次数限制" prop="transferOrderLimit">
            <el-input-number placeholder="自定义次数" v-model="form.commonScoreOrderRequest.transferOrderLimit" :min="0" :precision="0" /> 次
            <el-popover
              placement="right"
              width="400"
              trigger="click">
              <span class="text-red">礼品订单经过配送员退单，可转给其他配送员的最大次数限制</span>
              <i class="el-icon-question" slot="reference"></i>
            </el-popover>
          </el-form-item> -->
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
import ResourcePicker from '@/components/ResourcePicker'
import { getSetting, edit } from '@/api/site/universal'
import moment from 'moment'
import { uploadByKey } from '@/api/resource/picture'

export default {
  name: 'Universal',
  components: {
    ResourcePicker
  },
  data() {
    return {
      form: {
        commonDefaultForcedSignOutRequest: {},
        commonScoreOrderRequest: {}
      },
      rules: {
        noResponseTime: [{validator: (rule, value, callback) => {
          if(this.form.commonScoreOrderRequest.noResponseTime == undefined || this.form.commonScoreOrderRequest.noResponseTime == null) {
            return callback(new Error("请设置积分订单无响应时长"))
          } else {
            return callback()
          }
        }, required: true, trigger: 'blur'}],
        maxiWaitingTime: [{validator: (rule, value, callback) => {
          if(this.form.commonScoreOrderRequest.maxiWaitingTime == undefined || this.form.commonScoreOrderRequest.maxiWaitingTime == null) {
            return callback(new Error("请设置礼品订单，消费者最大等待时间"))
          } else {
            return callback()
          }
        }, required: true, trigger: 'blur'}],
        reminderBeforeTimeout: [{validator: (rule, value, callback) => {
          if(this.form.commonScoreOrderRequest.reminderBeforeTimeout == undefined || this.form.commonScoreOrderRequest.reminderBeforeTimeout == null) {
            return callback(new Error("请设置积分商城订单超时前提醒时间"))
          } else {
            return callback()
          }
        }, required: true, trigger: 'blur'}]
      }
    }
  },
  created() {
    getSetting().then((res) => {
      this.form = {
        openTime: new Date(
          2000,
          1,
          1,
          parseInt(res.data.commonDefaultShopTimeRequest.openTimeHour),
          parseInt(res.data.commonDefaultShopTimeRequest.openTimeMinute)
        ),
        closeTime: new Date(
          2000,
          1,
          1,
          parseInt(res.data.commonDefaultShopTimeRequest.closeTimeHour),
          parseInt(res.data.commonDefaultShopTimeRequest.closeTimeMinute)
        ),
        // closeReminderPicture: res.data.closeReminderPicture,
        // unopenedAreaDisplayContent: res.data.unopenedAreaDisplayContent,
        notInElectricFenceBanner: res.data.notInElectricFenceBanner,
        defaultBannerPicture: res.data.defaultBannerPicture,
        customerBenefitsPicture: res.data.customerBenefitsPicture,
        rechargeActivityPicture: res.data.rechargeActivityPicture,
        customerPromotePicture: res.data.customerPromotePicture,
        customerBirthdayPicture: res.data.customerBirthdayPicture,
        scoreMallRulePicture: res.data.scoreMallRulePicture,
        customerSplashScreenPicture: res.data.customerSplashScreenPicture,
        mallLogo: res.data.mallLogo,
        commonDefaultForcedSignOutRequest: {
          allowTime: res.data.commonDefaultForcedSignOutRequest.allowTime,
          forcedSignOutTag: res.data.commonDefaultForcedSignOutRequest.forcedSignOutTag,
          virtualHasShelves: res.data.commonDefaultForcedSignOutRequest.virtualHasShelves,
          returnTime: res.data.commonDefaultForcedSignOutRequest.returnTime
        },
        commonScoreOrderRequest: {
          noResponseTime: res.data.commonScoreOrderRequest.noResponseTime,
          maxiWaitingTime: res.data.commonScoreOrderRequest.maxiWaitingTime,
          reminderBeforeTimeout: res.data.commonScoreOrderRequest.reminderBeforeTimeout,
          refundTransferTimeLimit: res.data.commonScoreOrderRequest.refundTransferTimeLimit,
          transferOrderLimit: res.data.commonScoreOrderRequest.transferOrderLimit
        }
      }
    })
  },
  methods: {
    /**
     * 刷新Form数据对象
     */
    refreshForm() {
      this.form = { ...this.form }
    },
    // 重置表单
    reset() {
      this.form = {
        openTime: null,
        closeTime: null,
        closeReminderPicture: null,
        unopenedAreaDisplayContent: null,
        mallDeductionMethod: null,
        mallLogo: null,
        deliveryFeeSettlementDate: [],
        loanAndPromotionFeeSettlementDate: [],
        warrantyRefundPeriod: null,
        customerWaitTime: null,
        distributionOrderNumMax: null,
        closeOrderTime: null,
        shareLinkOrQRCodeValidPeriod: null
      }
    },
    async handleUpload(file) {
      const params = new FormData();
      params.append("file", file);
      params.append("key", 'static/mini/openscreen.jpg');

      const loading = this.$loading({
        lock: true,
        text: "上传中",
        background: "rgba(0, 0, 0, 0.7)",
      });

      try {
        const result = await uploadByKey(params);
        if (result.code == 200) {
          this.form.customerSplashScreenPicture = result.data.fileKey 
        }
      } finally {
        loading.close()
      }
    },
    // 保存
    submitForm() {
      const openTime = this.form.openTime
        ? moment(this.form.openTime).format('HH:mm').split(':')
        : null
      const closeTime = this.form.closeTime
        ? moment(this.form.closeTime).format('HH:mm').split(':')
        : null
      const params = {
        ...this.form,
        commonDefaultShopTimeRequest: {
          openTimeHour: openTime ? openTime[0] : null,
          openTimeMinute: openTime ? openTime[1] : null,
          closeTimeHour: closeTime ? closeTime[0] : null,
          closeTimeMinute: closeTime ? closeTime[1] : null
        }
      }
      delete params.openTime
      delete params.closeTime
      this.$refs["form"].validate((valid) => {
        console.log(valid)
        if (valid) {
          this.$confirm('是否确定保存通用设置', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(function() {
              return edit(params)
            })
            .then(() => {
              this.msgSuccess('通用设置修改成功')
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
