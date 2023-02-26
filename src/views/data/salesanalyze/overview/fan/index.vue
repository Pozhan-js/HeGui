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

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="fanList"
    >
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="总新增粉丝数" align="center" prop="totalAddNumber" />
      <el-table-column label="推广新增粉丝数" align="center" prop="promoteAddNumber" />
      <el-table-column label="扫中奖码新增粉丝数" align="center" prop="scanCodeAddNumber" />
      <el-table-column label="自然新增粉丝数" align="center" prop="initiativeAddNumber" />
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
  </div>
</template>

<script>
import { getFanList, lineChart, channelTypeChart } from '@/api/data/fan'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import 'moment/locale/zh-cn'
import moment from 'moment'

export default {
  name: 'FanAnalyze',
  components: {
    Cascader
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
      // 新增粉丝表格数据
      fanList: [],
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
      chartsValue: {
        tooltip: {
          trigger: 'axis'
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
          type: 'value',
          name: '数量'
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
      getFanList(this.formatQuery(this.queryParams, 'list')).then((response) => {
        this.fanList = response.rows
        this.total = response.total
        this.loading = false
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
      Promise.all([lineChart(params), channelTypeChart(params)]).then(res => {
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
      const Aoptions = {
        ...this.chartsValue,
        xAxis: {
          ...this.chartsValue.xAxis,
          data: data[0].data.fansNumberList.map(item => item.date)
        },
        series: [
          {
            name: '总新增粉丝数',
            data: data[0].data.fansNumberList.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均总新增粉丝数',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[0].data.averageAddNumber }]
            }
          }
        ]
      }
      const Boptions = {
        ...this.chartsValue,
        xAxis: {
          ...this.chartsValue.xAxis,
          data: data[1].data.initiativeAddFans.fansNumberList.map(item => item.date)
        },
        series: [
          {
            name: '推广新增粉丝',
            data: data[1].data.promoteAddFans.fansNumberList.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均推广新增粉丝',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[1].data.promoteAddFans.averageAddNumber }]
            }
          },
          {
            name: '扫码新增粉丝',
            data: data[1].data.scanCodeAddFans.fansNumberList?.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均扫码新增粉丝',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[1].data.scanCodeAddFans.averageAddNumber }]
            }
          },
          {
            name: '自然新增粉丝',
            data: data[1].data.initiativeAddFans.fansNumberList.map(item => item.number),
            type: 'line'
          },
          {
            name: '平均自然新增粉丝',
            type: 'line',
            markLine: {
              data: [{ type: 'average', yAxis: data[1].data.initiativeAddFans.averageAddNumber }]
            }
          }
        ]
      }
      oneChart.setOption(Aoptions)
      twoChart.setOption(Boptions)
    }
  }
}
</script>
