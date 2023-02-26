<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <org-select v-model="queryParams.orgId" @query="handleQuery" />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodTimeType">
        <dict-select dict="data_period_time_type" v-model="queryParams.periodTimeType" />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodBeginTime">
        <range-calendar
          :time-type="queryParams.periodTimeType"
          :s-time.sync="queryParams.periodBeginTime"
          :e-time.sync="queryParams.periodEndTime"
        />
      </el-form-item>
      <el-row :gutter="10" class="mb8" style="margin-left: 95px; margin-top: 5px">
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery">筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <pro-table
      ref="orderTable"
      :params="queryParams"
      title=""
      api="/orderSalesDataStatistics/order/analysis"
      :columns="{
        orgName: '组织',
        shopName: '经销商名称',
        shopPhone: '经销商手机号',
        totalOrderNumber: '总订单数',
        promoteOrderNumber: '推广订单数',
        initiativeOrderNumber: '自然订单数',
        scanCodeOrderNumber: '扫中奖码订单数'
      }"
    />
    <div ref="orderLimitChart" style="height: 400px; margin-top: 40px" />
    <div ref="orderTypeChart" style="height: 400px; margin-top: 40px" />
  </div>
</template>

<script>
import ProTable from '@/components/ProTable'
import OrgSelect from '@/components/OrgSelect'
import RangeCalendar from '@/components/RangeCalendar'
import {
  orderSalesDataStatisticsOrderAnalysis,
  orderSalesDataStatisticsOrderAnalysisChannelType
} from '@/api/data/order'
import DictSelect from '@/components/DictSelect.vue'
import moment from 'moment'

export default {
  name: 'CustomerBuyStatistics',
  components: {
    RangeCalendar,
    OrgSelect,
    ProTable,
    DictSelect
  },
  data() {
    return {
      // 查询参数
      queryParams: {
        periodTimeType: '1',
        periodBeginTime: moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        periodEndTime: moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
    }
  },
  mounted() {
    this.orderLimitChart = this.$echarts.init(this.$refs.orderLimitChart)
    this.orderTypeChart = this.$echarts.init(this.$refs.orderTypeChart)
    this.drawCharts()
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.$refs.orderTable.refresh()
      this.drawCharts()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.$refs.orderTable.refresh()
      this.drawCharts()
    },
    drawCharts() {
      const params = {
        ...this.queryParams,
        periodBeginTime: this.queryParams.periodTimeType === '1'
        ? moment(this.queryParams.periodEndTime).subtract(1, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : moment(this.queryParams.periodEndTime).subtract(1, 'year').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      }
      orderSalesDataStatisticsOrderAnalysis(params).then(res => {
        const data = res.data
        this.orderLimitChart.setOption({
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          tooltip: {
            trigger: 'item',
          },
          legend: {},
          xAxis: {
            axisPointer: {
              show: true,
              type: 'line',
              label: {
                show: false
              },
              lineStyle: {
                width: 0.5
              }
            },
            type: 'category',
            boundaryGap: false,
            data: data.totalOrder.map(i => i.date)
          },
          yAxis: {
            type: 'value',
            name: '单量'
          },
          series: [{
            name: '总订单',
            data: data.totalOrder.map(i => i.number),
            type: 'line',
          }, {
            name: '平均订单',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data.averageOrder || 0 }]
            }
          }]
        }, true)
      })

      orderSalesDataStatisticsOrderAnalysisChannelType(params).then(res => {
        const data = res.data
        const max = [
          data.promoteOrders.totalOrder || [],
          data.initiativeOrders.totalOrder || [],
          data.scanCodeOrders.totalOrder || []
        ].sort((i, j) => i.length - j.length).pop()
        this.orderTypeChart.setOption({
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          tooltip: {
            trigger: 'item',
          },
          legend: {},
          xAxis: {
            axisPointer: {
              show: true,
              type: 'line',
              label: {
                show: false
              },
              lineStyle: {
                width: 0.5
              }
            },
            type: 'category',
            boundaryGap: false,
            data: max?.map?.(i => i.date) ?? []
          },
          yAxis: {
            type: 'value',
            name: '单量'
          },
          series: [{
            name: '推广订单',
            data: data.promoteOrders.totalOrder?.map?.(i => i.number) ?? [],
            type: 'line',
          }, {
            name: '自然订单',
            data: data.initiativeOrders.totalOrder?.map?.(i => i.number) ?? [],
            type: 'line',
          }, {
            name: '扫中奖码订单',
            data: data.scanCodeOrders.totalOrder?.map?.(i => i.number) ?? [],
            type: 'line',
          }, {
            name: '平均推广订单',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data.promoteOrders.averageOrder || 0 }]
            }
          }, {
            name: '平均自然订单',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data.initiativeOrders.averageOrder || 0 }]
            }
          }, {
            name: '平均扫中奖码订单',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data.scanCodeOrders.averageOrder || 0 }]
            }
          }]
        }, true)
      })
    }
  }
}
</script>
