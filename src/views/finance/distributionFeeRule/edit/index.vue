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
          :disabled="form.distributionFeeType === '2' && nextStep"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          :disabled="isCheck || routerType === 'update' || (form.distributionFeeType === '2' && nextStep)"
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
          :disabled="form.distributionFeeType === '2' && nextStep"
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
          :disabled="routerType === 'update' || (form.distributionFeeType === '2' && nextStep) || !form.orgId"
          @change="handleFeeType"
        >
          <el-option
            v-for="dict in distributionFeeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.distributionFeeType === '1'">
        <p>
          基础配送费<el-input-number v-model="form.distributionFeeNatural.startFee" :min="0" @blur="handleFeeRound('startFee')" />元；
        </p>
        <p>
          <el-input-number v-model="form.distributionFeeNatural.defaultDistance" :min="0" :max="shopInfo.distance || Infinity" @blur="handleFeeFloor('defaultDistance')" />m内，
          配送时长<el-input-number v-model="form.distributionFeeNatural.defaultTime" :min="0" @blur="handleFeeFloor('defaultTime')" />min；
        </p>
        <p>
          {{ form.distributionFeeNatural.defaultDistance || '' }}m外
          每加<el-input-number v-model="form.distributionFeeNatural.defaultDistanceAdd" :min="0" @blur="handleFeeFloor('defaultDistanceAdd')" />m，
          配送时长增加<el-input-number v-model="form.distributionFeeNatural.defaultTimeAdd" :min="0" @blur="handleFeeFloor('defaultTimeAdd')" />min，
          配送费增加<el-input-number v-model="form.distributionFeeNatural.distanceTimeFeeAdd" :min="0" @blur="handleFeeRound('distanceTimeFeeAdd')" />元/单；
        </p>
        <p>
          <el-input-number
            v-model="form.distributionFeeNatural.limitDistance"
            :min="+form.distributionFeeNatural.defaultDistance + +form.distributionFeeNatural.defaultDistanceAdd"
            @change="handleFeeFloor('limitDistance')"
          />m之外，
          总配送时长<el-input-number v-model="form.distributionFeeNatural.limitTime" :min="+form.distributionFeeNatural.defaultTime" @blur="handleFeeFloor('limitTime')" />min，
          配送费增加<el-input-number v-model="form.distributionFeeNatural.limitFeeAdd" :min="0" @blur="handleFeeRound('limitFeeAdd')" />元/单；
        </p>
        <p>
          订单<el-input-number v-model="form.distributionFeeNatural.addDistributionFee" :min="1" @blur="handleFeeFloor('addDistributionFee')" />包起，
          加送费<el-input-number v-model="form.distributionFeeNatural.addDeliveryFee" :min="0" @blur="handleFeeRound('addDeliveryFee')" />元/包；
        </p>
        <p>
          准时达，奖励<el-input-number v-model="form.distributionFeeNatural.onTimeDeliveryAward" :min="0" @blur="handleFeeRound('onTimeDeliveryAward')" />元/包；
        </p>
        <p v-if="shopInfo.distance">小电子围栏外最长配送距离 {{ shopInfo.distance }} m。</p>
        <p>
          夜间奖励：<el-time-picker v-model="form.distributionFeeNatural.nightRewardStartTime" format="HH:mm" value-format="HH:mm" style="width: 120px" />
          —— <el-time-picker v-model="form.distributionFeeNatural.nightRewardEndTime" format="HH:mm" value-format="HH:mm" style="width: 120px" @blur="handleRightEndTime" /> 间，
          奖励<el-input-number v-model="form.distributionFeeNatural.nightFeeAdd" :min="0" @blur="handleFeeRound('nightFeeAdd')" />元/单；
        </p>
        <div v-if="feeNaturalTips.defaultArr.length" :class="$style.tipContainer">
          <p
            v-for="(item, i) in feeNaturalTips.defaultArr"
            :key="i"
            :class="$style.text"
            v-text="item"
          />
        </div>
        <div v-if="feeNaturalTips.distanceArr.length" :class="$style.tipContainer">
          <p
            v-for="(item, i) in feeNaturalTips.distanceArr"
            :key="i"
            :class="$style.text"
            v-text="item"
          />
        </div>
        <div v-if="feeNaturalTips.limitArr.length" :class="$style.tipContainer">
          <p
            v-for="(item, i) in feeNaturalTips.limitArr"
            :key="i"
            :class="$style.text"
            v-text="item"
          />
        </div>
      </el-form-item>
      <el-form-item v-if="form.distributionFeeType === '2' && !nextStep && form.orgId">
        <el-button type="primary" style="width: 30%;" @click="handleNextStep">保存，并下一步</el-button>
      </el-form-item>
      <el-form-item v-if="form.distributionFeeType === '2' && nextStep">
        <div v-loading="goodsLoading || this.$store.state.isLoading" style="width: 700px; border: 1px solid #e2e2e2;">
          <div style="display: flex; text-align: center;">
            <div style="width: 30%; border-right: 1px solid #e2e2e2;line-height: 73px;">产品名称</div>
            <div style="width: 20%;border-right: 1px solid #e2e2e2;line-height: 73px;">价格（元）</div>
            <div style="width: 50%">
              <div style="border-bottom: 1px solid #e2e2e2;">范围内</div>
              <div style="display: flex;">
                <div style="width: 50%;border-right: 1px solid #e2e2e2;">首包金额(元)</div>
                <div style="width: 50%;">复包金额（元）</div>
              </div>
            </div>
          </div>
          <div
            v-for="goods in goodsOptions"
            :key="goods.goodsId"
            style="
              display: flex;
              text-align: center;
              border-top: 1px solid #e2e2e2;
            "
          >
            <div style="width: 30%; padding: 5px 0; display: flex; border-right: 1px solid #e2e2e2;">
              <img style="width: 40px; height: 30px; margin: 0 10px" :src="goods.thumbnail">
              <div>{{ goods.goodsName }}</div>
            </div>
            <div
              style="width: 20%; border-right: 1px solid #e2e2e2; padding: 5px 0"
            >
              {{ goods.price && toDecimal2(goods.price / 100) }}
            </div>
            <div
              style="width: 25%; border-right: 1px solid #e2e2e2; padding: 5px 0"
            >
              <div v-if="isCheck">{{ goods.firstPackAmount }}</div>
              <el-input-number v-else v-model="goods.firstPackAmount" style="width: 180px;" :min="0" @change="(e) => goods.firstPackAmount = Math.round(e * 100) / 100" @blur="onSbumit(goods)" />
            </div>
            <div
              style="width: 25%; padding: 5px 0"
            >
              <div v-if="isCheck">{{ goods.repackAmount }}</div>
              <el-input-number v-else v-model="goods.repackAmount" style="width: 180px;" :min="0" @change="(e) => goods.repackAmount = Math.round(e * 100) / 100" @blur="onSbumit(goods)" />
            </div>
          </div>
        </div>
        <div style="width: 700px;">
          <pagination
            v-show="goodsTotle > 0"
            :total="goodsTotle"
            :page.sync="goodsQuery.pageNum"
            :limit.sync="goodsQuery.pageSize"
            @pagination="getGoods"
          />
        </div>
        <div style="color: red;">
          <div>一个订单中子订单中最高产品的价格按首包计算，其他包按 复包价格计算</div>
          <div>比如2包30的，2包20的： 6（30的价格）+2*1（20的产品）+2（30的第二包）=10元</div>
        </div>
      </el-form-item>
    </el-form>
    <div v-if="form.distributionFeeType === '1'" class="dialog-footer">
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
import {
  getDistributionFeeRule,
  goodsList,
  addNatural,
  addPopularize,
  getDistributionDistance
} from '@/api/finance/distributionFeeRule'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'
import Decimal from 'decimal.js'

export default {
  components: {
    Cascader
  },
  data() {
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
      // 表单参数
      form: {
        distributionFeeNatural: {
          startFee: 0,
          defaultDistance: 0,
          defaultTime: 0,
          defaultDistanceAdd: 0,
          defaultTimeAdd: 0,
          distanceTimeFeeAdd: 0,
          limitDistance: 0,
          limitTime: 0,
          limitFeeAdd: 0,
          addDistributionFee: 1,
          addDeliveryFee: 0,
          onTimeDeliveryAward: 0,
          nightRewardStartTime: null,
          nightRewardEndTime: null,
          nightFeeAdd: 0
        }
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
        ]
      },
      shopInfo: {},
      // 是否开始下一步
      nextStep: false,
      // 商品信息
      goodsOptions: [],
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      goodsLoading: false,
      goodsQuery: {
        pageNum: 1,
        pageSize: 10
      },
      goodsTotle: 0
    }
  },
  computed: {
    orgIdParam() {
      return Array.isArray(this.form.orgId) ? this.form.orgId.slice(-1)[0] : this.form.orgId
    },
    feeNaturalTips() {
      const obj = this.form.distributionFeeNatural
      const defaultArr = []
      const distanceArr = []
      const limitArr = []
      const num = obj.addDistributionFee + 2
      const numStr = `（${num} - ${obj.addDistributionFee} + 1）* ${obj.addDeliveryFee}`
      const numFee = new Decimal(num - obj.addDistributionFee + 1).mul(obj.addDeliveryFee).toNumber()
      const onTimeStr = `${num} * ${obj.onTimeDeliveryAward}`
      const onTimeFee = new Decimal(num).mul(obj.onTimeDeliveryAward).toNumber()

      if (obj.defaultDistance && obj.defaultTime) {
        const totalOnTimeFee = new Decimal(obj.startFee).plus(numFee).plus(onTimeFee).toNumber()
        const totalFee = new Decimal(obj.startFee).plus(numFee).toNumber()
        defaultArr.push(`距离 ${obj.defaultDistance}m`)
        defaultArr.push(`在${obj.defaultTime}分钟内完成：一个订单是${num}包，配送费为：${obj.startFee} +${numStr} + ${onTimeStr} = ${obj.startFee} + ${numFee} + ${onTimeFee} = ${totalOnTimeFee}`)
        defaultArr.push(`在${obj.defaultTime}分钟外完成：一个订单是${num}包，配送费为：${obj.startFee} +${numStr} = ${obj.startFee} + ${numFee} = ${totalFee}`)
      }

      if (obj.defaultDistance && obj.defaultDistanceAdd && obj.defaultTimeAdd) {
        const totalDistance = obj.defaultDistance + Math.round(obj.defaultDistanceAdd * 0.5)
        const distanceN = (totalDistance - obj.defaultDistance) / obj.defaultDistanceAdd
        const distanceNCeil = Math.ceil(distanceN)
        const timeFeeAdd = new Decimal(distanceNCeil).mul(obj.distanceTimeFeeAdd).toNumber()
        const timeAdd = distanceNCeil * obj.defaultTimeAdd
        const totalTimeStr = `（${obj.defaultTime} + ${timeAdd}）`
        const baseFeeStr = `${obj.startFee} + ${timeFeeAdd}`
        const baseFee = new Decimal(obj.startFee).plus(timeFeeAdd).toNumber()
        const totalOnTimeFee = new Decimal(baseFee).plus(numFee).plus(onTimeFee).toNumber()
        const totalFee = new Decimal(baseFee).plus(numFee).toNumber()
        distanceArr.push(`距离 ${totalDistance}m`)
        distanceArr.push(`判断阶梯：（${totalDistance} - ${obj.defaultDistance}）/ ${obj.defaultDistanceAdd} = ${distanceN.toFixed(2)}，向上取整为 ${distanceNCeil}`)
        distanceArr.push(`加距离费：${distanceNCeil} * ${obj.distanceTimeFeeAdd} = ${timeFeeAdd}`)
        distanceArr.push(`加配送时长：${distanceNCeil} * ${obj.defaultTimeAdd} = ${timeAdd}`)
        distanceArr.push(`在${totalTimeStr}分钟内完成：一个订单是${num}包，配送费为：${baseFeeStr} +${numStr} + ${onTimeStr} = ${baseFeeStr} + ${numFee} + ${onTimeFee} = ${totalOnTimeFee}`)
        distanceArr.push(`在${totalTimeStr}分钟外完成：一个订单是${num}包，配送费为：${baseFeeStr} +${numStr} = ${baseFeeStr} + ${numFee} = ${totalFee}`)
      }

      if (obj.limitDistance && obj.limitTime) {
        const baseFeeStr = `${obj.startFee} + ${obj.limitFeeAdd}`
        const baseFee = new Decimal(obj.startFee).plus(obj.limitFeeAdd).toNumber()
        const totalOnTimeFee = new Decimal(baseFee).plus(numFee).plus(onTimeFee).toNumber()
        const totalFee = new Decimal(baseFee).plus(numFee).toNumber()
        limitArr.push(`距离 ${obj.limitDistance}m 外`)
        limitArr.push(`在${obj.limitTime}分钟内完成：一个订单是${num}包，配送费为：${baseFeeStr}（加的配送费） +${numStr} + ${onTimeStr} = ${baseFeeStr} + ${numFee} + ${onTimeFee} = ${totalOnTimeFee}`)
        limitArr.push(`在${obj.limitTime}分钟内完成：一个订单是${num}包，配送费为：${baseFeeStr}（加的配送费） +${numStr} = ${baseFeeStr} + ${numFee} = ${totalFee}`)
      }

      return {
        defaultArr,
        distanceArr,
        limitArr
      }
    }
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
      if (this.$route.query.type !== 'add') {
        this.handleInfo(this.$route.query.distributionFeeId)
      }
    })

    this.getDicts('finance_distribution_fee_type').then((response) => {
      this.distributionFeeTypeOptions = response.data
    })
  },
  methods: {
    // 查询详情
    handleInfo(distributionFeeId) {
      getDistributionFeeRule(distributionFeeId).then((res) => {
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.form = {
          distributionFeeId: res.data.distributionFeeId,
          ruleName: res.data.ruleName,
          orgId: orgId,
          time: [new Date(res.data.beginTime), new Date(res.data.endTime)],
          distributionFeeType: res.data.distributionFeeType
        }
        if (res.data.distributionFeeType === '1') {
          this.$set(this.form, 'distributionFeeNatural', this.handleFeeNaturalData(res.data.distributionFeeNatural, 'div'))
          this.getShopInfo()
        }
        if (this.isCheck && res.data.distributionFeeType !== '1') {
          setTimeout(() => {
            this.getGoods()
          }, 500)
        }
      })
    },
    // 查询店铺信息
    getShopInfo() {
      if (this.form.distributionFeeType !== '1') {
        return
      }
      getDistributionDistance(this.orgIdParam)
        .then(res => {
          this.shopInfo = res.data || {}
        })
    },
    /** 下一步 */
    handleNextStep() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const params = {
            distributionFeeId: this.form.distributionFeeId,
            ruleName: this.form.ruleName,
            orgId: this.orgIdParam,
            beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
            endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
            distributionFeeType: this.form.distributionFeeType
          }
          addPopularize(params).then(res => {
            this.form.distributionFeeId = res.data
            this.getGoods()
          })
        }
      })
    },
    /** 查询商品 */
    getGoods() {
      this.nextStep = true
      this.goodsLoading = true
      goodsList({ ...this.goodsQuery, orgId: this.form.orgId, distributionFeeId: this.form.distributionFeeId }).then((res) => {
        this.goodsOptions = res.rows.map((item) => {
          return {
            ...item,
            thumbnail: this.prefix + item.thumbnail,
            firstPackAmount: item.firstPackAmount ? item.firstPackAmount / 100 : 0,
            repackAmount: item.repackAmount ? item.repackAmount / 100 : 0
          }
        })
        this.goodsTotle = res.total
        this.goodsLoading = false
      })
    },
    // 提交推广订单
    onSbumit(data) {
      const params = {
        distributionFeeId: this.form.distributionFeeId,
        ruleName: this.form.ruleName,
        orgId: this.orgIdParam,
        beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
        endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
        distributionFeeType: this.form.distributionFeeType,
        distributionFeePopularizeList: [{
          ...data,
          firstPackAmount: new Decimal(data.firstPackAmount).mul(100).toNumber(),
          repackAmount: new Decimal(data.repackAmount).mul(100).toNumber()
        }]
      }
      addPopularize(params).then(res => {
        this.form.distributionFeeId = res.data
      })
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null
      }
      this.resetForm('form')
    },
    handleFeeType(val) {
      this.nextStep = val === '1'
      this.getShopInfo()
    },
    handleFeeRound(key) {
      const val = Math.round(this.form.distributionFeeNatural[key] * 100) / 100
      this.form.distributionFeeNatural[key] = val || 0
    },
    handleFeeFloor(key) {
      const val = Math.floor(this.form.distributionFeeNatural[key])
      this.form.distributionFeeNatural[key] = val || 0
    },
    // 夜间奖励结束时间 不能大于 店铺打烊时间+1小时
    handleRightEndTime() {
      const { closeTime } = this.shopInfo
      const { nightRewardEndTime } = this.form.distributionFeeNatural
      if (!closeTime || !nightRewardEndTime) {
        return
      }

      let closeSeconds = moment.duration(closeTime).asSeconds()
      let endSeconds = moment.duration(nightRewardEndTime).asSeconds()
      const halfDay = 12 * 60 * 60
      const oneHour = 60 * 60
      // 如果早于12点则视为第二天凌晨,加上一天的秒数
      if (closeSeconds < halfDay) {
        closeSeconds += halfDay * 2
      }
      if (endSeconds < halfDay) {
        endSeconds += halfDay * 2
      }
      if (endSeconds > closeSeconds + oneHour) {
        this.form.distributionFeeNatural.nightRewardEndTime = moment(closeTime, 'HH:mm').add(1, 'h').format('HH:mm')
      }
    },
    // 金额参数 提交时 * 100，返回时 / 100
    handleFeeNaturalData(obj, action) {
      const params = ['startFee', 'distanceTimeFeeAdd', 'limitFeeAdd', 'addDeliveryFee', 'onTimeDeliveryAward', 'nightFeeAdd']
      const result = {}
      Object.entries(obj).forEach(([key, value]) => {
        if (params.includes(key)) {
          result[key] = new Decimal(value || 0)[action](100).toNumber()
        } else {
          result[key] = value
        }
      })

      return result
    },
    /** 提交自然订单 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { nightRewardStartTime, nightRewardEndTime, nightFeeAdd } = this.form.distributionFeeNatural
          if (nightFeeAdd && (!nightRewardStartTime || !nightRewardEndTime)) {
            return this.warning('夜间奖励必须设置起止时间')
          }

          this.$confirm(`是否确定${this.form.distributionFeeId ? '修改' : '新增'}自然订单配送费规则?`, '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const params = {
                distributionFeeId: this.form.distributionFeeId,
                ruleName: this.form.ruleName,
                orgId: this.orgIdParam,
                beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
                endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
                distributionFeeType: this.form.distributionFeeType,
                distributionFeeNatural: this.handleFeeNaturalData(this.form.distributionFeeNatural, 'mul')
              }
              return addNatural(params)
            })
            .then(() => {
              this.msgSuccess(`${this.form.distributionFeeId ? '修改' : '新增'}自然订单配送费规则成功~`)
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
