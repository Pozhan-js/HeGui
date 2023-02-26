<template>
  <div class="activity-editor">
    <div class="phone-container">
      <img src="~@/assets/images/phone-bg.png">
      <div class="phone-iframe">
        <iframe v-if="linkUrl" ref="virtualPhone" :src="linkUrl" frameborder="0" @load="onLoad" />
      </div>
    </div>
    <div class="edit-container">
      <el-tabs type="border-card">
        <el-tab-pane label="基础规则设置">
          <el-form
            ref="formRef"
            v-loading="loading"
            :model="formData"
            :rules="formRules"
            :disabled="isLook"
            class="app-container"
            label-position="left"
            label-width="110px"
            size="small"
          >
            <el-form-item label="活动名称" prop="activityName">
              <el-input v-model="formData.activityName" :disabled="isStarted" maxlength="50" placeholder="请输入活动名称" style="width: 350px;" />
              <span style="color: #f75656">（注：活动开始后无法修改）</span>
            </el-form-item>
            <el-form-item label="活动区域" prop="orgId">
              <Cascader
                v-model="formData.orgId"
                :disabled="isStarted"
                :options="orgOptions"
                change-on-select
                expand-trigger="hover"
                placeholder="请选择活动区域"
                :field-names="{ value: 'id', label: 'label', children: 'children' }"
                style="width: 350px;"
              />
              <span style="color: #f75656">（注：活动开始后无法修改）</span>
            </el-form-item>
            <el-form-item label="活动有效期" prop="validType">
              <el-radio-group v-model="formData.validType" :disabled="isStarted" @change="handleChangeValidType">
                <el-radio label="forever">永久有效</el-radio>
                <el-radio label="range">指定日期</el-radio>
              </el-radio-group>
              <RangePicker
                :disabled="formData.validType !== 'range' || isStarted"
                clearable
                size="small"
                class="ml20"
                :s-time.sync="formData.startTime"
                :e-time.sync="formData.endTime"
                placeholder="选择活动有效期"
              />
              <span style="color: #f75656">（注：活动开始后无法修改）</span>
            </el-form-item>
            <el-form-item label="活动中奖滚屏">
              <div style="display: flex; flex-wrap: nowrap;">
                <el-form-item prop="scrollScreenFlag" :rules="{required: true, message: '滚屏类型不能为空'}">
                  <el-radio-group v-model="formData.scrollScreenFlag">
                    <el-radio label="0">隐藏中奖名单</el-radio>
                    <el-radio label="1" class="mr10">循环播放中奖名单，</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item
                  prop="scrollScreenInterval"
                  :rules="{required: formData.scrollScreenFlag === '1', message: '滚屏时间不能为空'}"
                >
                  <el-input-number
                    v-model="formData.scrollScreenInterval"
                    :disabled="formData.scrollScreenFlag !== '1'"
                    controls-position="right"
                    :precision="0"
                    :min="1"
                    :max="30"
                    style="width: 120px;"
                    class="ml10 mr10"
                  />秒一滚动
                </el-form-item>
              </div>
            </el-form-item>
            <el-divider />
            <h3 style="color: #f75656;">抽奖次数设置</h3>
            <el-form
              ref="ruleFormRef"
              :model="rulesData"
              label-position="left"
              label-width="110px"
              size="small"
            >
              <el-form-item
                label="支付"
                prop="0.rewardRules.rewardTimes"
                :rules="{ required: rulesData[0].rewardFlag == 1, message: '抽奖次数不能为空' }"
              >
                <el-switch v-model="rulesData[0].rewardFlag" active-value="1" :disabled="isLook" inactive-value="0" class="mr10" />
                订单成功支付，奖励
                <el-input-number
                  v-model="rulesData[0].rewardRules.rewardTimes"
                  :disabled="rulesData[0].rewardFlag === '0' || isLook"
                  controls-position="right"
                  :precision="0"
                  :min="1"
                  style="width: 120px;"
                /> 次抽奖机会。
              </el-form-item>
              <el-form-item
                label="评价"
                prop="1.rewardRules.rewardTimes"
                :rules="{ required: rulesData[1].rewardFlag == 1, message: '抽奖次数不能为空' }"
              >
                <el-switch v-model="rulesData[1].rewardFlag" :disabled="isLook" active-value="1" inactive-value="0" class="mr10" />
                完成一次订单评价，奖励
                <el-input-number
                  v-model="rulesData[1].rewardRules.rewardTimes"
                  :disabled="rulesData[1].rewardFlag === '0' || isLook"
                  controls-position="right"
                  :precision="0"
                  :min="1"
                  style="width: 120px;"
                /> 次抽奖机会。
              </el-form-item>
              <el-form-item label="签到">
                <div style="display: flex; flex-wrap: nowrap;">
                  <el-form-item>
                    <el-switch
                      v-model="rulesData[2].rewardFlag"
                      :disabled="isLook"
                      active-value="1"
                      inactive-value="0"
                      class="mr10"
                    />
                  </el-form-item>
                  <el-form-item
                    prop="2.rewardRules.rewardTimes"
                    :rules="{ required: rulesData[2].rewardFlag == 1, message: '抽奖次数不能为空' }"
                  >
                    每次签到得
                    <el-input-number
                      v-model="rulesData[2].rewardRules.rewardTimes"
                      :disabled="rulesData[2].rewardFlag === '0' || isLook"
                      controls-position="right"
                      :precision="0"
                      :min="0"
                      style="width: 120px;"
                    />
                    次抽奖机会。
                  </el-form-item>
                  <el-form-item
                    prop="2.rewardRules.seriesDay"
                    :rules="{ required: rulesData[2].rewardFlag == 1, message: '连续签到抽奖次数不能为空' }"
                  >
                    连续签到后的第
                    <el-input-number
                      v-model="rulesData[2].rewardRules.seriesDay"
                      :disabled="rulesData[2].rewardFlag === '0' || isLook"
                      controls-position="right"
                      :precision="0"
                      :min="0"
                      style="width: 120px;"
                    />
                    天，额外获得一次抽奖机会。
                  </el-form-item>

                </div>
              </el-form-item>
            </el-form>
            <el-form-item label="抽奖次数限制" prop="lotteryLimitNum">
              每
              <el-select v-model="formData.lotteryLimitPeriod" style="width: 120px;" :disabled="isUpdate">
                <el-option value="day" label="天" />
                <el-option value="week" label="周" />
                <el-option value="month" label="月" />
              </el-select>
              最高可获得
              <el-input-number
                v-model="formData.lotteryLimitNum"
                controls-position="right"
                :disabled="isUpdate"
                :precision="0"
                :min="1"
                style="width: 120px;"
              /> 次抽奖机会。
              <span style="color: #f75656">（注：活动创建后无法修改）</span>
            </el-form-item>
            <el-form-item label="活动规则" prop="ruleRemark">
              <el-input
                v-model="formData.ruleRemark"
                type="textarea"
                :disabled="isStarted"
                placeholder="请输入活动规则（1000字以内）"
                maxlength="1000"
                :autosize="{ minRows: 3 }"
                show-word-limit
              />
              <span style="color: #f75656">（注：活动开始后无法修改）</span>
            </el-form-item>
            <el-divider />
            <h3 style="color: #f75656;" class="mb10">
              奖品&抽奖规则设置
              <el-button style="float: right;" class="mr20 blue-btn" size="small" @click="handleOpenProbability()">设置概率
              </el-button>
              <el-button v-if="!isStarted" style="float: right;" class="mr20 blue-btn" size="small" @click="handleOpenAward()">+添加奖品
              </el-button>
            </h3>
            <el-table :data="awardsData">
              <el-table-column label="序号" align="center" prop="lotteryActivityAwardId" />
              <el-table-column label="奖品名" align="center" prop="awardName" />
              <el-table-column label="概率（总和100%）" align="center" prop="winRate" :formatter="row => row.winRate != null ? row.winRate / 100 + '%' : '未设置'" />
              <el-table-column label="总数量" align="center" prop="totalNum" :formatter="row => row.addTotalNum ? row.totalNum + ' + ' + row.addTotalNum + '(增补)': row.totalNum" />
              <el-table-column label="剩余数量" align="center" prop="num" :formatter="row => (row.totalNum || 0) - (row.usedNum || 0)" />
              <el-table-column label="抽取数量" align="center" prop="usedNum" />
              <el-table-column label="操作" align="center" prop="action">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleOpenAward(scope.row, scope.$index)">编辑</el-button>
                  <el-button v-if="!isStarted" type="text" @click="handleRemoveAward(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-divider />
            <h3 style="color: #f75656;">抽奖模板设置</h3>
            <el-form-item label="设置抽奖头部标题图片" label-width="170px" prop="headImageUrl">
              <ResourcePicker v-model="formData.headImageUrl" :disabled="isLook" size-hint="建议：634*130px, 最多上传1张" />
            </el-form-item>
            <el-form-item label="设置抽奖背景图片" label-width="170px" prop="backImageUrl">
              <ResourcePicker v-model="formData.backImageUrl" :disabled="isLook" size-hint="建议：1800*750px, 最多上传1张" />
            </el-form-item>
          </el-form>
          <el-button type="primary" :loading="submitLoading" :disabled="isLook" class="mt20" @click="handleSubmit">保存
          </el-button>
          <el-button style="margin-left: 15px;" @click="() => $router.back()">返回</el-button>
        </el-tab-pane>
        <!-- <el-tab-pane label="其它规则设置" disabled /> -->
      </el-tabs>
      <edit-award ref="editAwardRef" :is-started="isStarted" :coupon-list-params="couponListParams" @confirm="handleSaveAward" />
      <edit-probability ref="editProbabilityRef" :level-options="awardLevelOptions" @confirm="handleSaveProbability" />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import editAward from './edit-award'
import editProbability from './edit-probability'
import { flatten, searchSuperior } from '@/utils/array'
import ResourcePicker from '@/components/ResourcePicker'
import { Cascader } from 'ant-design-vue'
import { addActivity, updateActivity, getActivityInfo, getActivityLink } from '@/api/marketing/activity'
import { getOrgTree } from '@/api/utils'

export default {
  components: {
    editAward,
    editProbability,
    ResourcePicker,
    Cascader
  },
  data() {
    const validateValidType = (rule, value, callback) => {
      if (value === 'range' && !this.formData.startTime) {
        callback(new Error('活动有效期时间段不能为空'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      submitLoading: false,
      orgOptions: [],
      linkUrl: undefined,
      formData: {
        activityType: 'lucky_turntable',
        activityName: undefined,
        orgId: undefined,
        // 永久有效：forever，指定区间： range
        validType: undefined,
        startTime: undefined,
        endTime: undefined,
        // 滚屏：'1'：显示；'0'：不显示
        scrollScreenFlag: undefined,
        scrollScreenInterval: undefined,
        // 限制抽奖次数周期类型(day,week,month)
        lotteryLimitPeriod: 'day',
        lotteryLimitNum: undefined,
        ruleRemark: undefined,
        headImageUrl: undefined,
        backImageUrl: undefined
      },
      awardLevelOptions: [],
      awardsData: [],
      loaded: false,
      rulesData: [
        { rewardType: 'pay', rewardFlag: undefined, rewardRules: { rewardTimes: undefined }},
        { rewardType: 'evaluate', rewardFlag: undefined, rewardRules: { rewardTimes: undefined }},
        { rewardType: 'sign', rewardFlag: undefined, rewardRules: { rewardTimes: undefined, seriesDay: undefined }}
      ],
      formRules: {
        activityName: [{ required: true, message: '活动名不能为空' }],
        orgId: [{ required: true, message: '活动区域不能为空', trigger: 'change' }],
        validType: [{ validator: validateValidType, trigger: 'change' }],
        lotteryLimitNum: [{ required: true, message: '抽奖次数限制不能为空', trigger: 'blur' }],
        ruleRemark: [{ required: true, message: '活动规则不能为空', trigger: 'blur' }],
        headImageUrl: [{ required: true, message: '请上传抽奖头部标题图片', trigger: 'change' }],
        backImageUrl: [{ required: true, message: '请上传抽奖背景图片', trigger: 'change' }]
      }
    }
  },
  computed: {
    isStarted() {
      return this.formData.timeStatus !== 'unstart' && this.formData.timeStatus != null
    },
    isUpdate() {
      return !!this.formData.lotteryActivityId
    },
    isLook() {
      return this.$route.query.type === '1'
    },
    couponListParams() {
      const { startTime, endTime } = this.formData
      return {
        effectiveRangeBeginTime: startTime,
        effectiveRangeEndTime: endTime
      }
    },
    params() {
      const { orgId } = this.formData
      return {
        activity: {
          ...this.formData,
          orgId: Array.isArray(orgId) ? orgId.slice(-1)[0] : orgId
        },
        awards: this.awardsData.map(i => ({
          ...i,
          levelName: this.selectDictLabel(this.awardLevelOptions, i.awardLevel)
        })),
        rules: this.rulesData
      }
    }
  },
  watch: {
    params() {
      this.patchConfig()
    }
  },
  created() {
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
      this.getDicts('lottery_award_level').then(res => {
        this.awardLevelOptions = res.data
      })
      getActivityLink().then(res => {
        this.linkUrl = res.data
        if (this.$route.query.lotteryActivityId) {
          this.getInfo(this.$route.query.lotteryActivityId)
        // 如果没有活动ID，说明是新活动
        } else {
        // this.awardsData.push(
        //   { awardName: '参与奖', awardType: 'thanks', awardLevel: '99' },
        //   { awardName: '再来一次', awardType: 'one_more_time', awardLevel: '5' }
        // )
        }
      })
    })
  },
  methods: {
    onLoad() {
      setTimeout(() => {
        this.patchConfig()
      }, 500)
    },
    patchConfig() {
      const data = this.params
      this.$refs.virtualPhone?.contentWindow.postMessage({
        type: 'patch.config',
        data: {
          ...data.activity,
          ...data,
          domain: sessionStorage.getItem('prefix')
        }
      }, '*')
      this.$refs.virtualPhone?.contentWindow.postMessage({
        type: 'patch.notice',
        data: [
          { telephone: '测试用户A', awardName: '测试奖品' },
          { telephone: '测试用户B', awardName: '测试奖品' },
          { telephone: '测试用户C', awardName: '测试奖品' }
        ]
      }, '*')
    },
    handleOpenAward(row, i) {
      this.$refs.editAwardRef.openDialog({ ...row }, i)
    },
    handleOpenProbability() {
      const arr = this.awardsData.map(item => {
        const { awardName, awardLevel, totalNum, winRate } = item
        return {
          awardName,
          awardLevel,
          totalNum,
          winRate
        }
      })
      this.$refs.editProbabilityRef.openDialog(arr)
    },
    getInfo(lotteryActivityId) {
      this.loading = true
      getActivityInfo(lotteryActivityId)
        .then(res => {
          const { activity, awards, rules } = res.data
          const orgArr = flatten(this.orgOptions, 'children')
          const orgId = searchSuperior(activity.orgId, 'id', orgArr, 'parentId')
          this.formData = {
            ...activity,
            orgId
          }
          this.awardsData = awards
          this.rulesData = rules
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSaveAward(row, index) {
      console.log(row)
      if (typeof index !== 'undefined') {
        this.awardsData.splice(index, 1, row)
      } else {
        this.awardsData.push(row)
      }
    },
    handleSaveProbability(data) {
      this.awardsData = this.awardsData.map((item, i) => {
        return {
          ...item,
          winRate: data[i].winRate
        }
      })
    },
    handleChangeValidType(val) {
      if (val === 'forever') {
        this.formData.startTime = moment().startOf('day').format('yyyy-MM-DD HH:mm:ss')
        this.formData.endTime = moment('2099-12-31').endOf('day').format('yyyy-MM-DD HH:mm:ss')
      } else {
        this.formData.startTime = undefined
        this.formData.endTime = undefined
      }
    },
    handleRemoveAward(i) {
      this.awardsData.splice(i, 1)
    },
    async handleSubmit() {
      try {
        await this.$refs.ruleFormRef.validate()
        await this.$refs.formRef.validate()
        this.confirmSubmit()
      } catch {
        // Nothing
      }
    },
    confirmSubmit() {
      this.$confirm(`是否确定${this.isUpdate ? '修改' : '新增'}活动?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.submitLoading = true
          if (this.isUpdate) {
            return updateActivity(this.params)
          } else {
            return addActivity(this.params)
          }
        })
        .then(() => {
          this.msgSuccess(`${this.isUpdate ? '修改' : '新增'}活动成功`)
          this.$router.push('./record')
        })
        .finally(() => {
          this.submitLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-editor {
  display: flex;
  height: calc(100vh - 50px - 40px);
  align-items: center;
}

.phone-container {
  font-size: 0;
  margin: 10px 10px 0 20px;
  position: relative;
  height: 620px;
  width: 320px;

  .phone-iframe {
    position: absolute;
    top: 40px;
    left: 23px;
    right: 26px;
    bottom: 19px;
    z-index: 1;
    padding-right: 0;
    display: flex;

    iframe {
      width: 100%;
      height: 100%;
    }
  }

  img {
    height: 100%;
    pointer-events: none;
    position: relative;
    z-index: 2;
  }
}

.edit-container {
  flex: 1;
  overflow: scroll;
  height: 100%;
  min-width: 980px;

}
</style>
