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
      title=""
      ref="orderTable"
      :params="queryParams"
      api="/orderSalesDataStatistics/salesAnalysis"
      :columns="columns"
    />
    <div ref="orderLimitChart" style="height: 400px; margin-top: 40px" />
    <div ref="orderTypeChart" style="height: 400px; margin-top: 40px" />
    <div ref="incomeChart" style="height: 400px; margin-top: 40px" />
  </div>
</template>

<script>
import ProTable from '@/components/ProTable'
import OrgSelect from '@/components/OrgSelect'
import RangeCalendar from '@/components/RangeCalendar'
import {
  orderSalesDataStatisticsIncomeAmount,
  orderSalesDataStatisticsSalesAmount,
  orderSalesDataStatisticsSalesAmountChannelType
} from '@/api/data/sales'
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
      },
      columns: {
        orgName: '组织',
        shopName: '经销商名称',
        shopPhone: '经销商手机号',
        totalSalesAmount: {
          label: '总销售额(元)',
          formatter: this.fen2yuan
        },
        promoteSalesAmount: {
          label: '推广销售额(元)',
          formatter: this.fen2yuan
        },
        scanCodeSalesAmount: {
          label: '扫中奖码销售额(元)',
          formatter: this.fen2yuan
        },
        initiativeSalesAmount: {
          label: '自然销售额(元)',
          formatter: this.fen2yuan
        },
        receivableAmount: {
          label: '应收货款(元)',
          formatter: this.fen2yuan
        },
        promotionAmount: {
          label: '促销费用(元)',
          formatter: this.fen2yuan
        },
        paymentAmount: {
          label: '实收货款(元)',
          formatter: this.fen2yuan
        },
      }
    }
  },
  mounted() {
    this.orderLimitChart = this.$echarts.init(this.$refs.orderLimitChart)
    this.orderTypeChart = this.$echarts.init(this.$refs.orderTypeChart)
    this.incomeChart = this.$echarts.init(this.$refs.incomeChart)
    this.drawCharts()
  },
  methods: {
    fen2yuan(value) {
      return this.toDecimal2(+value / 100)
    },
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
    drawCharts: function () {
      const params = {
        ...this.queryParams,
        periodBeginTime: this.queryParams.periodTimeType === '1'
        ? moment(this.queryParams.periodEndTime).subtract(1, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : moment(this.queryParams.periodEndTime).subtract(1, 'year').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      }
      orderSalesDataStatisticsSalesAmount(params).then(res => {
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
            data: data.totalSalesAmounts.map(i => i.date)
          },
          yAxis: {
            type: 'value',
            name: '元'
          },
          series: [{
            name: '总销售额',
            data: data.totalSalesAmounts.map(i => this.fen2yuan(i.number)),
            type: 'line'
          }, {
            name: '平均销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.averageSalesAmount || 0) }]
            }
          }]
        }, true)
      })

      orderSalesDataStatisticsSalesAmountChannelType(params).then(res => {
        const data = res.data
        const max = [
          data.initiativeSalesAmount.totalSalesAmounts || [],
          data.promoteSalesAmount.totalSalesAmounts || [],
          data.scanCodeSalesAmount.totalSalesAmounts || []
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
            name: '元'
          },
          series: [{
            name: '推广订单销售额',
            data: data.promoteSalesAmount.totalSalesAmounts?.map?.(i => this.fen2yuan(i.number)) ?? [],
            type: 'line'
          }, {
            name: '自然订单销售额',
            data: data.initiativeSalesAmount.totalSalesAmounts?.map?.(i => this.fen2yuan(i.number)) ?? [],
            type: 'line'
          }, {
            name: '扫中奖码订单销售额',
            data: data.scanCodeSalesAmount.totalSalesAmounts?.map?.(i => this.fen2yuan(i.number)) ?? [],
            type: 'line'
          }, {
            name: '平均推广订单销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.promoteSalesAmount.averageSalesAmount || 0) }]
            }
          }, {
            name: '平均自然订单销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.initiativeSalesAmount.averageSalesAmount || 0) }]
            }
          }, {
            name: '平均扫中奖码订单销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.scanCodeSalesAmount.averageSalesAmount || 0) }]
            }
          }]
        }, true)
      })

      orderSalesDataStatisticsIncomeAmount(params).then(res => {
        const data = res.data
        const max = [
          data.receivableAmount.totalSalesAmounts || [],
          data.promotionAmount.totalSalesAmounts || [],
          data.paymentAmount.totalSalesAmounts || []
        ].sort((i, j) => i.length - j.length).pop()
        this.incomeChart.setOption({
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
            name: '元'
          },
          series: [{
            name: '应收收益',
            data: data.receivableAmount.totalSalesAmounts?.map?.(i => this.fen2yuan(i.number)) ?? [],
            type: 'line'
          }, {
            name: '促销费用',
            data: data.promotionAmount.totalSalesAmounts?.map?.(i => this.fen2yuan(i.number)) ?? [],
            type: 'line'
          }, {
            name: '实际收益',
            data: data.paymentAmount.totalSalesAmounts?.map?.(i => this.fen2yuan(i.number)) ?? [],
            type: 'line'
          }, {
            name: '平均应收收益',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.receivableAmount.averageSalesAmount || 0) }]
            }
          }, {
            name: '平均促销费用',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.promotionAmount.averageSalesAmount || 0) }]
            }
          }, {
            name: '平均实际收益',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: this.fen2yuan(data.paymentAmount.averageSalesAmount || 0) }]
            }
          }]
        }, true)
      })
    }
  }
}
</script>
