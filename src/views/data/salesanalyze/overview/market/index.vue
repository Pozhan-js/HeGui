<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form position-sticky mb20"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{
            value: 'id',
            label: 'label',
            children: 'children',
          }"
        />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodTimeType">
        <dict-select v-model="queryParams.periodTimeType" dict="data_period_time_type" />
      </el-form-item>
      <el-form-item label="日期" prop="time">
        <RangeCalendar
          :clearable="false"
          size="small"
          :time-type="queryParams.periodTimeType"
          :s-time.sync="queryParams.periodBeginTime"
          :e-time.sync="queryParams.periodEndTime"
          placeholder="统计时间"
        />
      </el-form-item>
      <el-form-item label="营销插件" prop="marketingPlugin">
        <dict-select v-model="queryParams.marketingPlugin" dict="marketing_plugin" clearable />
      </el-form-item>
      <el-row>
        <el-form-item label="活动">
          <el-tag
            v-for="item in selectedList"
            :key="item.couponId"
            class="mr10"
          >
            {{ item.couponName }}
          </el-tag>
          <el-button :disabled="queryParams.marketingPlugin !== 'coupon'" type="text" @click="showSelectCoupon">修改</el-button>
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <select-coupon
      ref="selectCoupon"
      :org-id="queryParams.orgId"
      :selected-list="selectedList"
      @confirm-select="handleSelectCoupon"
    />
    <el-card v-loading="overviewLoading" shadow="hover" class="mb20">
      <h3 slot="header">
        营销概况
        <el-popover placement="right-end">
          <i slot="reference" class="el-icon-question pointer fz18" />
          <p>营销支付金额：<br>统计时间内，营销活动带来的支付金额总和</p>
          <p>营销支付金额占比：<br>统计时间内，营销支付金额/店铺支付金额</p>
          <p>支付ROI：<br>统计时间内，营销总体投入产出比，营销支付金额 / 营销优惠金额</p>
          <p>营销支付人数：<br>统计时间内，通过营销插件下单并且支付成功的客户数</p>
        </el-popover>
      </h3>
      <el-row>
        <el-col :span="6">
          <p>营销支付金额（元）</p>
          <p>{{ toDecimal2(overviewInfo.marketingPayAmount / 100) }}</p>
        </el-col>
        <el-col :span="6">
          <p>营销支付金额占比</p>
          <p>{{ overviewInfo.marketingPayAmountRate }}%</p>
        </el-col>
        <el-col :span="6">
          <p>支付ROI</p>
          <p>{{ overviewInfo.payRoi }}</p>
        </el-col>
        <el-col :span="6">
          <p>营销支付人数</p>
          <p>{{ overviewInfo.payOrderUserNumber }}</p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <p>
            营销活动分布
            <el-popover placement="right-end">
              <i slot="reference" class="el-icon-question pointer fz18" />
              <div>当选择优惠券时（有折扣券、随机券、满减券）</div>
              <p>满减送：满减配送费</p>
              <p>满减券：在筛选时间段内，有效的满减券<br>如当前已经失效，但筛选日期的有效的记为有效</p>
              <p>折扣券：在筛选时间段内，有效的折扣券<br>如当前已经失效，但筛选日期的有效的记为有效</p>
              <p>随机券：在筛选时间段内，有效的随机券<br>如当前已经失效，但筛选日期的有效的记为有效</p>
              <p>满减配送费：未满多少需支付配送费</p>
            </el-popover>
          </p>
          <p>总计：{{ overviewInfo.totalActivityNum }}个</p>
        </el-col>
      </el-row>
      <div ref="A_chart" class="echart-box" style="height: 200px" />
      <el-row>
        <div style="position: relative; top: 20px;">支付金额</div>
        <div ref="B_chart" class="echart-box" style="height: 300px" />
      </el-row>
    </el-card>
    <el-card v-loading="effectAnalysisLoading" shadow="hover" class="mb20">
      <h3 slot="header">
        效果分析
        <el-popover placement="right-end">
          <i slot="reference" class="el-icon-question pointer fz18" />
          <p>营销支付金额：<br>统计时间内，营销活动带来的支付金额总和</p>
          <p>营销优惠金额：<br>统计选择活动中，通过营销插件活动实际产生的折扣金额之和</p>
          <p>支付ROI：<br>统计选择活动中，营销总体投入产出比，营销支付金额 / 营销优惠金额</p>
          <p>营销支付包数：<br>统计选择活动中，通过营销插件成功付款订单的商品包数之和</p>
          <p>营销支付订单数：<br>统计选择活动中，通过营销插件成功付款的订单数</p>
          <p>连带率：<br>统计选择活动中，营销支付包数/营销支付订单数</p>
        </el-popover>
      </h3>
      <el-row>
        <el-col :span="12">
          <el-tag class="mb20" type="info" effect="plain">投入产出</el-tag>
          <el-row>
            <el-col :span="8">
              <p>支付ROI</p>
              <p>{{ effectAnalysis.inputOutputResponse.payPoi }}</p>
            </el-col>
            <el-col :span="8">
              <p>营销支付金额（元）</p>
              <p>{{ toDecimal2(effectAnalysis.inputOutputResponse.marketingPayAmount / 100) }}</p>
            </el-col>
            <el-col :span="8">
              <p>营销优惠金额（元）</p>
              <p>{{ toDecimal2(effectAnalysis.inputOutputResponse.marketingDiscountAmount / 100) }}</p>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-tag class="mb20" type="info" effect="plain">销售连带</el-tag>
          <el-row>
            <el-col :span="8">
              <p>支付包数</p>
              <p>{{ effectAnalysis.inputOutputResponse.payPackageNum }}</p>
            </el-col>
            <el-col :span="8">
              <p>支付订单数</p>
              <p>{{ effectAnalysis.inputOutputResponse.payOrderNumber }}</p>
            </el-col>
            <el-col :span="8">
              <p>连带率</p>
              <p>{{ effectAnalysis.inputOutputResponse.associationRate }}%</p>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
    <el-card v-loading="effectAnalysisLoading" shadow="hover" class="mb20">
      <el-row slot="header" tag="h3">
        <el-col :span="12">
          拉新复购
          <el-popover placement="right-end">
            <i slot="reference" class="el-icon-question pointer fz18" />
            <p>总成交客户数：<br>统计选择活动中，营销活动支付人数</p>
            <p>新成交客户：<br>过去2年没有购买，在统计选择活动中通过营销插件首次在店铺付款的客户人数</p>
            <p>老成交客户：<br>过去2年在店铺购买过，在统计选择活动中通过营销插件再次付款的客户人数</p>
            <p>访客数：<br>统计选择活动中，网店营销插件页面的访客数</p>
            <p>浏览量：<br>统计选择活动中，网店营销插件页面的浏览量</p>
            <p>营销支付人数：<br>统计选择活动中，网店通过营销插件下单并且付款成功的客户数</p>
            <p>客单价(元)：<br>统计选择活动中，网店通过营销插件成交的支付金额/支付人数</p>
            <p>访问-支付转化率：<br>统计选择活动中，网店营销支付人数/网店营销访客数</p>
          </el-popover>
        </el-col>
        <el-col :span="12">流量转化</el-col>
      </el-row>
      <el-row>
        <el-col :span="9">
          <div ref="C_chart" class="echart-box" style="height: 300px" />
        </el-col>
        <el-col :span="12" :offset="3">
          <div ref="D_chart" class="echart-box" style="width: 50%; height: 300px; float: left;" />
          <div style="width: 45%; float: right; padding-top: 70px;">
            <el-row class="mb20">
              <el-col :span="12">
                <p>访客数</p>
                <p>{{ effectAnalysis.newRepurchaseResponse.visitorVolume }}</p>
              </el-col>
              <el-col :span="12">
                <p>浏览量</p>
                <p>{{ effectAnalysis.newRepurchaseResponse.pageViewVolume }}</p>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <p>营销支付人数</p>
                <p>{{ effectAnalysis.newRepurchaseResponse.marketingPayNumber }}</p>
              </el-col>
              <el-col :span="12">
                <p>客单价</p>
                <p>{{ effectAnalysis.newRepurchaseResponse.customerPrice }}</p>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card v-loading="dataTrendLoaing" shadow="hover" class="mb20">
      <h3 slot="header">数据趋势</h3>
      <el-checkbox-group
        v-model="checkedChartItems"
        :max="4"
        style="margin-bottom: 50px"
        @change="handleCheckChartItem"
      >
        <el-checkbox
          v-for="item in chartItems"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-checkbox-group>
      <div ref="E_chart" class="echart-box" style="height: 500px" />
    </el-card>
    <el-card v-loading="goodsEffectLoading" shadow="hover" class="mb20">
      <h3 slot="header">商品效果</h3>
      <el-table :data="goodsEffectList">
        <el-table-column label="营销活动" align="center" prop="marketingActivity" />
        <el-table-column label="浏览量" align="center" prop="pageViewVolume" />
        <el-table-column label="访客量" align="center" prop="visitorVolume" />
        <el-table-column label="营销支付包数" align="center" prop="marketingPayNum" />
        <el-table-column label="营销支付人数" align="center" prop="marketingPayCustomerNumber" />
        <el-table-column label="营销支付金额（元）" align="center" prop="marketingPayAmount" :formatter="(_, __, cellValue) => toDecimal2(cellValue / 100)" />
        <el-table-column label="营销优惠金额（元）" align="center" prop="marketingDiscountAmount" :formatter="(_, __, cellValue) => toDecimal2(cellValue / 100)" />
        <el-table-column label="访问-支付转化率" align="center" prop="payConversionRate" :formatter="(_, __, cellValue) => cellValue + '%'" />
        <el-table-column label="新客户成交金额（元）" align="center" prop="newCustomerTransactionAmount" :formatter="(_, __, cellValue) => toDecimal2(cellValue / 100)" />
        <el-table-column label="老客户成交金额（元）" align="center" prop="oldCustomerTransactionAmount" :formatter="(_, __, cellValue) => toDecimal2(cellValue / 100)" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { listOverview, listGoodsEffect, listAnalysis, listDataTrend } from '@/api/data/market'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import DictSelect from '@/components/DictSelect.vue'
import RangeCalendar from '@/components/RangeCalendar.vue'
import 'moment/locale/zh-cn'
import moment from 'moment'
import SelectCoupon from './selectCoupon.vue'

const defaultChartItems = [
  { label: '支付ROI', value: 'payPoi' },
  { label: '营销支付金额', value: 'marketingPayAmount' },
  { label: '营销优惠金额', value: 'marketingDiscountAmount' },
  { label: '营销支付包数', value: 'marketingPayNum' },
  { label: '营销支付订单数', value: 'payOrderNumber' },
  { label: '营销支付人数', value: 'marketingPayCustomerNumber' },
  { label: '连带率', value: 'associationRate', suffix: '%' },
  { label: '新客户成交', value: 'newCustomerTransactionNumber' },
  { label: '老客户成交', value: 'oldCustomerTransactionNumber' },
  { label: '浏览量', value: 'pageViewVolume' },
  { label: '访客量', value: 'visitorVolume' },
  { label: '访问-支付 转化率', value: 'payConversionRate', suffix: '%' }
]
const getDefaultCheckedChartItems = () => [defaultChartItems[10].label, defaultChartItems[9].label, defaultChartItems[3].label, defaultChartItems[5].label]

export default {
  name: 'MarketAnalyze',
  components: {
    Cascader,
    DictSelect,
    RangeCalendar,
    SelectCoupon
  },
  data() {
    return {
      // 组织数据
      orgOptions: [],
      // 查询参数
      queryParams: {
        orgId: null,
        marketingPlugin: null,
        periodTimeType: '1',
        periodBeginTime: moment().subtract(1, 'd').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        periodEndTime: moment().subtract(1, 'd').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      },
      overviewInfo: {},
      overviewLoading: false,
      goodsEffectList: [],
      goodsEffectLoading: false,
      effectAnalysis: { inputOutputResponse: {}, newRepurchaseResponse: {}},
      effectAnalysisLoading: false,
      dataTrend: {},
      dataTrendLoaing: false,
      selectedList: [],
      chartItems: defaultChartItems,
      checkedChartItems: getDefaultCheckedChartItems()
    }
  },
  watch: {
    'queryParams.marketingPlugin'(newVal) {
      if (newVal !== 'coupon') {
        this.selectedList = []
      }
    },
    overviewInfo(newVal) {
      const isMonth = this.queryParams.periodTimeType === '2'
      const A_chart = this.$echarts.init(this.$refs.A_chart)
      A_chart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: '{b} <br>有效活动数量 {c}个'
        },
        xAxis: {
          type: 'value',
          max: value => value.max * 2
        },
        yAxis: {
          type: 'category',
          data: ['满减送', '优惠券']
        },
        series: [{
          type: 'bar',
          data: [
            { name: '满减送', value: newVal.fullReductionValidActivityNum, itemStyle: { color: '#48cfae' }},
            { name: '优惠券', value: newVal.couponValidActivityNum, itemStyle: { color: '#fb6e52' }}
          ]
        }]
      })

      const B_chart = this.$echarts.init(this.$refs.B_chart)
      B_chart.setOption({
        color: ['#48cfae', '#fb6e52'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: { data: ['营销活动金额', '非营销活动金额'] },
        xAxis: {
          type: 'category',
          data: newVal.marketingActivityAmount.numberList.map(i => isMonth ? moment(i.date).format('YYYY-MM') : i.date)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          { name: '营销活动金额', type: 'bar', stack: 'all', data: newVal.marketingActivityAmount.numberList.map(i => i.number) },
          { name: '非营销活动金额', type: 'bar', stack: 'all', data: newVal.nonMarketingActivityAmount.numberList.map(i => i.number) }
        ]
      })
    },
    effectAnalysis(newVal) {
      const C_chart = this.$echarts.init(this.$refs.C_chart)
      const D_chart = this.$echarts.init(this.$refs.D_chart)

      C_chart.setOption({
        color: ['#48cfae', '#fb6e52'],
        title: {
          text: `总成交客户数\n ${+newVal.newRepurchaseResponse.newTransactionNewCustomer + +newVal.newRepurchaseResponse.newTransactionOldCustomer}`,
          left: 'center',
          top: 'middle',
          textStyle: {
            fontSize: 14,
            fontWeight: 500
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          top: '40%',
          right: 10,
          data: ['新成交客户', '老成交客户']
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            label: {
              show: false
            },
            data: [
              { value: newVal.newRepurchaseResponse.newTransactionNewCustomer, name: '新成交客户' },
              { value: newVal.newRepurchaseResponse.newTransactionOldCustomer, name: '老成交客户' }
            ]
          }
        ]
      })
      D_chart.setOption({
        color: ['#165bd4', '#409fff'],
        title: {
          text: `支付转化率 ${newVal.newRepurchaseResponse.payConversionRate}%`,
          right: 0,
          top: 'middle',
          textStyle: {
            fontSize: 16,
            fontWeight: 500
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人'
        },
        series: [
          {
            type: 'funnel',
            minSize: '5%',
            maxSize: '80%',
            sort: 'none',
            gap: 2,
            label: {
              position: 'center'
            },
            data: [
              { value: newVal.newRepurchaseResponse.visitorVolume, name: '访客数' },
              { value: newVal.newRepurchaseResponse.marketingPayNumber, name: '支付人数' }
            ]
          }
        ]
      })
    }
  },
  mounted() {
    this.getChart()
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
  },
  methods: {
    getChart() {
      this.overviewLoading = true
      this.goodsEffectLoading = true
      this.effectAnalysisLoading = true

      const params = this.formatQuery()
      listOverview(params)
        .then(res => {
          this.overviewInfo = res.data
          this.overviewLoading = false
        })
      listGoodsEffect(this.queryParams)
        .then(res => {
          this.goodsEffectList = res.data
          this.goodsEffectLoading = false
        })
      listAnalysis(this.queryParams)
        .then(res => {
          this.effectAnalysis = res.data
          this.effectAnalysisLoading = false
        })

      this.dataTrendLoaing = true
      this.dataTrend = {}
      const dataTrendParams = this.formatDataTrendQuery()
      listDataTrend({ ...params, keyList: dataTrendParams.first })
        .then(res => {
          this.dataTrend = { ...this.dataTrend, ...res.data }
          this.drawLine(this.dataTrend, this.checkedChartItems)
          this.dataTrendLoaing = false
        })
    },
    // 起止转换为 最近一个月/最近一年/最近一星期
    formatQuery() {
      const params = {
        ...this.queryParams,
        couponIdList: this.selectedList.map(i => i.couponId).join(',') || void 0
      }
      const formatStr = 'YYYY-MM-DD HH:mm:ss'
      if (params.periodTimeType === '1') {
        params.periodBeginTime = moment(params.periodBeginTime).subtract(1, 'M').startOf('day').format(formatStr)
        params.periodEndTime = moment(params.periodEndTime).endOf('day').format(formatStr)
      } else if (params.periodTimeType === '2') {
        params.periodBeginTime = moment(params.periodBeginTime).subtract(1, 'y').startOf('month').format(formatStr)
        params.periodEndTime = moment(params.periodEndTime).endOf('month').format(formatStr)
      } else if (params.periodTimeType === '3') {
        params.periodBeginTime = moment(params.periodBeginTime).subtract(1, 'w').startOf('week').format(formatStr)
        params.periodEndTime = moment(params.periodEndTime).endOf('week').format(formatStr)
      }

      return params
    },
    formatDataTrendQuery() {
      const first = []
      const secondary = []
      this.chartItems.forEach(item => {
        if (this.checkedChartItems.includes(item.label)) {
          first.push(item.value)
        } else {
          secondary.push(item.value)
        }
      })

      return {
        first: first.join(','),
        secondary: secondary.join(',')
      }
    },
    handleCheckChartItem(checked) {
      // 获取选中且未加载的选项
      const keyList = checked.reduce((arr, label) => {
        const val = this.chartItems.find(i => i.label === label)?.value
        if (!Object.prototype.hasOwnProperty.call(this.dataTrend, val)) {
          arr.push(val)
        }
        return arr
      }, [])
      if (keyList.length) {
        this.dataTrendLoaing = true
        listDataTrend({ ...this.formatQuery(), keyList: keyList.join(',') })
          .then(res => {
            this.dataTrend = { ...this.dataTrend, ...res.data }
            this.drawLine(this.dataTrend, checked)
            this.dataTrendLoaing = false
          })
      } else {
        this.drawLine(this.dataTrend, checked)
      }
    },
    drawLine(dataTrend, checkedItem) {
      const isMonth = this.queryParams.periodTimeType === '2'
      const firstKey = Object.keys(dataTrend)[0]
      const E_chart = this.$echarts.init(this.$refs.E_chart)

      E_chart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return params.reduce((val, item) => {
              const suffix = this.chartItems.find(i => i.label === item.seriesName)?.suffix || ''
              return val + `<br/>${item.marker}${item.seriesName}: ${item.data}${suffix}`
            }, params[0].name)
          }
        },
        legend: {
          textStyle: {
            fontSize: 16
          },
          data: checkedItem
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dataTrend[firstKey].numberList.map(i => isMonth ? moment(i.date).format('YYYY-MM') : i.date)
        },
        yAxis: {
          type: 'value'
        },
        series: checkedItem.map(label => {
          const item = this.chartItems.find(i => i.label === label)
          return {
            name: item.label,
            type: 'line',
            data: dataTrend[item.value].numberList.map(i => i.number)
          }
        })
      }, { notMerge: true })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      if (!this.checkedChartItems.length) {
        this.checkedChartItems = getDefaultCheckedChartItems()
      }
      this.getChart()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.periodBeginTime = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
      this.queryParams.periodEndTime = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
      this.checkedChartItems = getDefaultCheckedChartItems()
      this.handleQuery()
    },
    showSelectCoupon() {
      this.$refs.selectCoupon.showDialog({
        effectiveRangeBeginTime: this.queryParams.periodBeginTime,
        effectiveRangeEndTime: this.queryParams.periodEndTime
      })
    },
    handleSelectCoupon(ids) {
      this.selectedList = ids
    }
  }
}
</script>
