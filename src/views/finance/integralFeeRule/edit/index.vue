<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" :disabled="isCheck" label-width="120px">
      <el-form-item label="名称" prop="ruleName">
        <el-input
          v-model="form.ruleName"
          style="width: 30%"
          placeholder="请输入名称"
          clearable
          size="small"
          :disabled="form.distributionFeeType === '2'"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 30%"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          :disabled="isCheck || routerType === 'update'"
          :allow-clear="false"
          @change="getShopInfo"
        />
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="form.time"
          style="width: 30%"
          clearable
          size="small"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled="form.distributionFeeType === '2'"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="配送费类型" prop="distributionFeeType">
        <el-select
          v-model="form.distributionFeeType"
          style="width: 30%"
          placeholder="请选择配送费类型"
          clearable
          size="small"
          :disabled="routerType === 'update' || !form.orgId"
        >
          <el-option
            v-for="dict in distributionFeeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <div v-if="form.distributionFeeType === 'gift'">
        <el-form-item label="基础运费" prop="basicFreight">
          <el-input-number v-model="form.basicFreight" :min="0" placeholder="自定义费用" />
        </el-form-item>
        <el-form-item label="夜间奖励" prop="award">
          <el-time-picker v-model="form.awardBeginTime" format="HH:mm" value-format="HH:mm" placeholder="开始时间" style="width: 180px;" />
          <span style="margin: 0 10px;">——</span>
          <el-time-picker v-model="form.awardEndTime" format="HH:mm" value-format="HH:mm" placeholder="结束时间" style="width: 180px;" />
          间，奖励<el-input-number v-model="form.awardAmount" :min="0" />元/单；
        </el-form-item>
        <el-form-item v-if="fenceOptions.length > 0" label="额外运费奖励" prop="additional">
          <el-button type="primary" size="mini" :disabled="fenceOptions.length === form.mallDistributionFeeExtraList.length" @click="handleAddExtraAward">添加额外运费奖励规则</el-button>
          <span style="font-weight: bold;">（额外运费奖励新增条数无限制，额外奖励区域“小电子围栏”仅能选一次无法重复选择）</span>
          <div v-for="awardItem in form.mallDistributionFeeExtraList" :key="awardItem.key" style="margin-top: 20px;">
            <span>额外奖励区域</span>
            <el-select
              v-model="awardItem.extraGeofenceId"
              style="width: 250px;margin: 0 10px;"
              placeholder="请选择电子围栏名称"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in fenceOptions"
                :key="dict.geofenceId"
                :label="dict.name"
                :value="dict.geofenceId"
                :disabled="checkFenceSel(dict.geofenceId)"
              />
            </el-select>
            <span>每单额外加</span>
            <el-input-number v-model="awardItem.extraAmount" :min="0" />元；
            <el-button type="text" @click="handleDelExtraAward(awardItem.key)">删除</el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <div class="dialog-footer">
      <el-button
        v-if="!isCheck"
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import { getFence, addMall, getInfo } from '@/api/finance/integralFeeRule'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  components: {
    Cascader
  },
  data() {
    const awardValidator = (rule, value, callback) => {
      if (!this.form.awardBeginTime) {
        callback(new Error('请选择夜间奖励开始时间'))
      } else if (!this.form.awardEndTime) {
        callback(new Error('请选择夜间奖励结束时间'))
      } else {
        callback()
      }
    }

    const additionalValidator = (rule, value, callback) => {
      if (this.form.mallDistributionFeeExtraList.map(item => item.extraGeofenceId).filter(item => !item).length > 0) {
        callback(new Error('请选择额外奖励区域电子围栏'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 查看禁用按钮
      isCheck: this.$route.query.type === 'check',
      // 组织
      orgOptions: [],
      // 配送类型
      distributionFeeTypeOptions: [],
      // 电子围栏数据
      fenceOptions: [],
      // 表单参数
      form: {
        ruleName: null,
        orgId: null,
        time: null,
        distributionFeeType: null,
        basicFreight: 0,
        awardBeginTime: null,
        awardEndTime: null,
        awardAmount: 0,
        mallDistributionFeeExtraList: []
      },
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: '组织不能为空', trigger: 'blur' }
        ],
        ruleName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { max: 15, message: '名称不能超过15个字符', trigger: 'blur' }
        ],
        time: [{ required: true, message: '时间不能为空', trigger: 'blur' }],
        distributionFeeType: [
          { required: true, message: '配送费类型不能为空', trigger: 'blur' }
        ],
        award: [
          { required: true, trigger: 'blur', validator: awardValidator }
        ],
        additional: [
          { required: true, trigger: 'blur', validator: additionalValidator }
        ]
      }
    }
  },
  computed: {
    orgIdParam() {
      return Array.isArray(this.form.orgId) ? this.form.orgId.slice(-1)[0] : this.form.orgId
    }
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
      if (this.$route.query.type !== 'add') {
        this.handleInfo(this.$route.query.mallDistributionFeeRuleId)
      }
    })

    this.getDicts('mall_distribution_fee_type').then((response) => {
      this.distributionFeeTypeOptions = response.data
    })
  },
  methods: {
    // 查询详情
    handleInfo(mallDistributionFeeRuleId) {
      getInfo(mallDistributionFeeRuleId).then(res => {
        this.handleFence(res.data.orgId)
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.form = {
          mallDistributionFeeRuleId: res.data.mallDistributionFeeRuleId,
          ruleName: res.data.ruleName,
          orgId: orgId,
          time: [new Date(res.data.beginTime), new Date(res.data.endTime)],
          distributionFeeType: res.data.distributionFeeType,
          basicFreight: res.data.basicFreight / 100,
          awardBeginTime: res.data.awardBeginTime,
          awardEndTime: res.data.awardEndTime,
          awardAmount: res.data.awardAmount / 100,
          mallDistributionFeeExtraList: res.data.mallDistributionFeeExtraList.map(item => {
            return { key: item.mallDistributionFeeExtraId, extraGeofenceId: item.extraGeofenceId, extraAmount: item.extraAmount / 100 }
          })
        }
      })
    },
    // 查询店铺信息
    getShopInfo() {
      this.handleFence()
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null
      }
      this.resetForm('form')
    },
    /** 查询组织电子围栏 */
    handleFence(orgId = null) {
      getFence({ orgId: orgId || this.form.orgId }).then(res => {
        this.fenceOptions = res.rows || []
      })
    },
    /** 校验围栏是否选中 */
    checkFenceSel(id) {
      const geofenceId = this.form.mallDistributionFeeExtraList.map(item => item.extraGeofenceId)
      return geofenceId.includes(id)
    },
    /** 增加额外奖励 */
    handleAddExtraAward() {
      this.form = {
        ...this.form,
        mallDistributionFeeExtraList: this.form.mallDistributionFeeExtraList.concat([
          { key: moment().format('x'), extraGeofenceId: null, extraAmount: 0 }
        ])
      }
    },
    handleDelExtraAward(key) {
      this.form = {
        ...this.form,
        mallDistributionFeeExtraList: this.form.mallDistributionFeeExtraList.filter(item => item.key !== key)
      }
    },
    /** 提交自然订单 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const params = {
            ...this.form,
            ruleName: this.form.ruleName,
            orgId: this.orgIdParam,
            beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
            endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
            distributionFeeType: this.form.distributionFeeType,
            basicFreight: this.form.basicFreight * 100,
            awardAmount: this.form.awardAmount * 100,
            awardBeginTime: this.form.awardBeginTime + ':00',
            awardEndTime: this.form.awardEndTime + ':00',
            mallDistributionFeeExtraList: this.form.mallDistributionFeeExtraList.map(item => {
              return {
                extraGeofenceId: item.extraGeofenceId,
                extraAmount: item.extraAmount * 100
              }
            })
          }

          delete params.time

          this.$confirm(`是否确定${this.form.mallDistributionFeeRuleId ? '修改' : '新增'}礼品订单配送费规则?`, '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return addMall(params)
            })
            .then(() => {
              this.msgSuccess(`${this.form.mallDistributionFeeRuleId ? '修改' : '新增'}礼品订单配送费规则成功~`)
              this.cancel()
            })
        }
      })
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}

/deep/ .el-input-number {
  width: 100px !important;
  .el-input__inner {
    padding: 0px;
    border-style: none;
    border-bottom: 1px solid;
    border-radius: 0px;
  }
}
/deep/ .el-input-number__decrease {
  display: none;
}
/deep/ .el-input-number__increase {
  display: none;
}
</style>

<style lang="scss" module>
@import "~@/assets/styles/variables.scss";

  .tipContainer {
    margin-top: 15px;
    color: $red;
    .text {
      line-height: 24px;
      margin: 0;
      &:first-child {
        font-weight: bold;
      }
    }
  }
</style>
