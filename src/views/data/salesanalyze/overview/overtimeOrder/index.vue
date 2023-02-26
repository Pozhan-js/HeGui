<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form"
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
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodTimeType">
        <el-select
          v-model="queryParams.periodTimeType"
          placeholder="请选择统计时间"
          size="small"
        >
          <el-option
            v-for="dict in periodTimeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          :type="{1 : 'date', 3: 'week', 2: 'month'}[queryParams.periodTimeType]"
          placeholder="选择日期"
        />
      </el-form-item>
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

    <div style="margin-top: 20px">
      <el-row>
        <el-col :span="3">总超时订单数：{{ totalData.totalTimeoutOrderNum }}</el-col>
        <el-col :span="3">总订单超时率：{{ totalData.totalTimeoutOrderRate }}%</el-col>
      </el-row>
    </div>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="visitorList"
    >
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="经销商名称" align="center" prop="shopName" />
      <el-table-column label="经销商手机号" align="center" prop="shopPhone" />
      <el-table-column label="总超时订单数" align="center" prop="totalTimeoutOrderNumber" />
      <el-table-column label="总推广超时订单数" align="center" prop="promoteTimeoutOrderNumber" />
      <el-table-column label="扫中奖码超时订单" align="center" prop="scanCodeTimeoutOrderNumber" />
      <el-table-column label="自然超时订单数" align="center" prop="initiativeTimeoutOrderNumber" />
      <el-table-column label="总超时率" align="center" prop="totalTimeoutRate">
        <template slot-scope="scope">
          {{ scope.row.totalTimeoutRate }}%
        </template>
      </el-table-column>
      <el-table-column label="推广超时率" align="center" prop="promoteTimeoutRate">
        <template slot-scope="scope">
          {{ scope.row.promoteTimeoutRate }}%
        </template>
      </el-table-column>
      <el-table-column label="扫中奖码超时率" align="center" prop="scanCodeTimeoutRate">
        <template slot-scope="scope">
          {{ scope.row.scanCodeTimeoutRate }}%
        </template>
      </el-table-column>
      <el-table-column label="自然超时率" align="center" prop="initiativeTimeoutRate">
        <template slot-scope="scope">
          {{ scope.row.initiativeTimeoutRate }}%
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <div id="A_chart" v-loading="chartLoading" class="echart-box" style="height: 500px" />
    <div id="B_chart" v-loading="chartLoading" class="echart-box" style="height: 500px" />
    <div id="C_chart" v-loading="chartLoading" class="echart-box" style="height: 500px" />
    <div id="D_chart" v-loading="chartLoading" class="echart-box" style="height: 500px" />
  </div>
</template>

<script>
import { getOrderList, getCount, lineChart, channelTypeChart, salesAmount, rateLineChart } from '@/api/data/overtimeOrder'
import { getOrgTree } from '@/api/utils'
import { Cascader, Calendar } from 'ant-design-vue'
import 'moment/locale/zh-cn'
import moment from 'moment'

export default {
  name: 'OvertimeOrder',
  components: {
    Cascader,
    Calendar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      chartLoading: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 访客量表格数据
      visitorList: [],
      // 时间类型
      periodTimeTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        periodTimeType: '1',
        time: moment().subtract(1, 'days')
      },
      totalData: {},
      chartsValue: {
        tooltip: {
          trigger: 'axis',
          formatter: (item) => {
            let child = ''
            item.map(childItem => {
              child += `<div>${childItem.marker}${childItem.seriesName}：${childItem.value}%</div>`
            })
            return `<div>
                      <div>${item[0].axisValue}</div>
                      ${child}
                    </div>`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        legend: {},
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
    }
  },
  created() {
    this.getList()
    this.getChart()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('data_period_time_type').then((response) => {
      this.periodTimeTypeOptions = response.data
    })
  },
  methods: {
    /** 查询客户购买统计列表 */
    getList() {
      this.loading = true
      getOrderList(this.formatQuery(this.queryParams, 'list')).then((response) => {
        this.visitorList = response.rows
        this.total = response.total
        this.loading = false
      })
      getCount(this.formatQuery(this.queryParams, 'list')).then(res => {
        this.totalData = res.data
      })
    },
    /** 查询列表数据 */
    getChart() {
      this.chartLoading = true
      const params = {
        ...this.formatQuery(this.queryParams)
      }
      delete params.pageNum
      delete params.pageSize
      Promise.all([
        lineChart(params),
        channelTypeChart(params),
        salesAmount(params),
        rateLineChart(params)
      ]).then(res => {
        this.drawLine(res)
        this.chartLoading = false
      })
    },
    /**
     * 查询格式化
     */
    formatQuery(param, type) {
      const params = {
        ...param
      }
      delete params.time
      if (param.periodTimeType == 1) {
        params.periodBeginTime = type === 'list' ? moment(param.time).format('YYYY-MM-DD') : moment(param.time).subtract(1, 'months').format('YYYY-MM-DD')
        params.periodEndTime = moment(param.time).format('YYYY-MM-DD')
      } else if (param.periodTimeType == 2) {
        params.periodBeginTime = type === 'list' ? moment(param.time).startOf('month').format('YYYY-MM-DD') : moment(param.time).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
        params.periodEndTime = moment(param.time).endOf('month').format('YYYY-MM-DD')
      } else if (param.periodTimeType == 3) {
        params.periodBeginTime = moment(param.time).subtract(moment(param.time).format('E') - 1, 'days').format('YYYY-MM-DD')
        params.periodEndTime = moment(param.time).add(7 - moment(param.time).format('E'), 'days').format('YYYY-MM-DD')
      }
      return params
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
      this.getChart()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        periodTimeType: '1',
        time: moment().subtract(1, 'days')
      }
      this.handleQuery()
    },
    drawLine(data) {
      const oneChart = this.$echarts.init(document.getElementById('A_chart'))
      const twoChart = this.$echarts.init(document.getElementById('B_chart'))
      const threeChart = this.$echarts.init(document.getElementById('C_chart'))
      const fourChart = this.$echarts.init(document.getElementById('D_chart'))

      const Aoptions = {
        ...this.chartsValue,
        tooltip: {
          trigger: 'axis',
          formatter: (item) => {
            let child = ''
            item.map(childItem => {
              child += `<div>${childItem.marker}${childItem.seriesName}：${childItem.value}</div>`
            })
            return `<div>
                      <div>${item[0].axisValue}</div>
                      ${child}
                    </div>`
          }
        },
        xAxis: {
          ...this.chartsValue.xAxis,
          data: data[0].data.totalOrder.map(item => item.date)
        },
        yAxis: {
          ...this.chartsValue.yAxis,
          name: '数量'
        },

        series: [
          {
            name: '总超时订单',
            data: data[0].data.totalOrder.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均总超时订单',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[0].data.averageOrder }]
            }
          }
        ]
      }
      const Boptions = {
        ...this.chartsValue,
        xAxis: {
          ...this.chartsValue.xAxis,
          data: data[1].data.totalTimeoutRate.map(item => item.date)
        },
        yAxis: {
          ...this.chartsValue.yAxis,
          name: '%'
        },
        series: [
          {
            name: '总超时率',
            data: data[1].data.totalTimeoutRate.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均总超时率',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[1].data.averageTimeoutRate }]
            }
          }
        ]
      }
      const Coptions = {
        ...this.chartsValue,
        xAxis: {
          ...this.chartsValue.xAxis,
          data: data[2].data.promoteSalesAmount.totalSalesAmounts.map(item => item.date)
        },
        yAxis: {
          ...this.chartsValue.yAxis,
          name: '元'
        },
        series: [
          {
            name: '推广订单销售额',
            data: data[2].data.promoteSalesAmount.totalSalesAmounts.map(item => item.number / 100),
            type: 'line'
          },
          {
            name: '平均推广订单销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[2].data.promoteSalesAmount.averageSalesAmount / 100 }]
            }
          },
          {
            name: '扫中奖码销售额',
            data: data[2].data.scanCodeSalesAmount.totalSalesAmounts?.map(item => item.number / 100),
            type: 'line'
          },
          {
            name: '平均扫中奖码销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[2].data.scanCodeSalesAmount.averageSalesAmount / 100 }]
            }
          },
          {
            name: '自然订单销售额',
            data: data[2].data.initiativeSalesAmount.totalSalesAmounts.map(item => item.number / 100),
            type: 'line'
          },
          {
            name: '平均自然订单销售额',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[2].data.initiativeSalesAmount.averageSalesAmount / 100 }]
            }
          }
        ]
      }

      const Doptions = {
        ...this.chartsValue,
        xAxis: {
          ...this.chartsValue.xAxis,
          data: data[3].data.promoteOrders.totalTimeoutRate.map(item => item.date)
        },
        yAxis: {
          ...this.chartsValue.yAxis,
          name: '%'
        },
        series: [
          {
            name: '推广订单超时率',
            data: data[3].data.promoteOrders.totalTimeoutRate.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均推广订单超时率',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[3].data.promoteOrders.averageTimeoutRate }]
            }
          },
          {
            name: '扫中奖码超时率',
            data: data[3].data.scanCodeOrders.totalTimeoutRate?.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均扫中奖码超时率',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[3].data.scanCodeOrders.averageTimeoutRate }]
            }
          },
          {
            name: '自然订单超时率',
            data: data[3].data.initiativeOrders.totalTimeoutRate.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均自然订单超时率',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[3].data.initiativeOrders.averageTimeoutRate }]
            }
          }
        ]
      }
      oneChart.setOption(Aoptions)
      twoChart.setOption(Boptions)
      threeChart.setOption(Coptions)
      fourChart.setOption(Doptions)
    }
  }
}
</script>
