<style lang="scss" scoped>
.bar-container {
  padding-top: 20px;
  min-height: 600px;
  min-width: 400px;
}
</style>

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
        <OrgSelect v-model="queryParams.orgId" @query="handleQuery"/>
      </el-form-item>
      <el-form-item label="时间维度" prop="periodBeginTime">
        <RangePicker
          :clearable="false"
          size="small"
          :sTime.sync="queryParams.periodBeginTime"
          :eTime.sync="queryParams.periodEndTime"
          placeholder="选择时间维度"
        />
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
          >筛选
          </el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <div ref="leftBar" class="bar-container">
    </div>
  </div>
</template>

<script>
import { goodsStatistics } from '@/api/data/goods'
import OrgSelect from '@/components/OrgSelect'
import { toDecimal2 } from '@/utils/self'
import { reduce } from 'lodash'
import moment from 'moment'

const colors = ['#C33531', '#EFE42A', '#64BD3D', '#EE9201', '#29AAE3', '#B74AE5', '#0AAF9F', '#E89589', '#16A085', '#4A235A', '#C39BD3', '#F9E79F', '#BA4A00', '#ECF0F1', '#616A6B', '#EAF2F8', '#4A235A', '#3498DB']

export default {
  name: 'CustomerBuyStatistics',
  components: {
    OrgSelect
  },
  data() {
    return {
      // 查询参数
      queryParams: {
        orgId: null,
        periodBeginTime: moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        periodEndTime: moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      },
      options: {
        title: [{
          gridIndex: 0,
          top: 10,
          left: '25%'
        }, {
          top: 10,
          gridIndex: 1,
          right: '25%'
        }],
        yAxis: [
          { type: 'category', gridIndex: 0 },
          { type: 'category', gridIndex: 1 }
        ],
        xAxis: [
          { gridIndex: 0, type: 'value' },
          { gridIndex: 1, type: 'value' }
        ],
        grid: [{ right: '55%' }, { left: '55%' }],
        series: [
          {
            type: 'bar',
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
              normal: {
                color: ({ dataIndex }) => colors[dataIndex]
              }
            }
          },
          {
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: ({ dataIndex }) => colors[dataIndex]
              }
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.barChart = this.$echarts.init(this.$refs.leftBar)
    this.barChart.setOption(this.options)
    this.getList()
  },
  methods: {
    /** 查询客户购买统计列表 */
    getList() {
      this.loading = true
      goodsStatistics(this.queryParams).then((response) => {
        this.loading = false
        const { goodsPackDataStatisticsList, goodsSalesDataStatisticsList } = response.data
        const goodsName = goodsSalesDataStatisticsList.map(i => i.goodsName)
        const packs = goodsPackDataStatisticsList.map(i => i.packNumber)
        const sells = goodsSalesDataStatisticsList.map(i => toDecimal2(i.salesAmount / 100))
        const add = (a, b) => (+a || 0) + (+b || 0)
        const totalPacks = reduce(packs, add)
        const totalSells = reduce(sells, add)
        this.barChart.setOption({
          tooltip: {
            gridIndex: 0,
            trigger: 'axis',
            formatter: ([e]) => {
              const isLeftBar = e.axisIndex === 0
              const unit = isLeftBar ? '包' : '元'
              const total = isLeftBar ? totalPacks : totalSells
              const value = toDecimal2((e.value || 0) / total * 100)
              return `${e.name} ${(e.value || 0)}${unit} ${value}%`
            }
          },
          title: [{
            gridIndex: 0,
            text: '总包数 ' + (totalPacks || 0) + ' 包'
          }, {
            gridIndex: 1,
            text: '总销售额 ' + (toDecimal2(totalSells) || 0) + ' 元'
          }],
          yAxis: [{
            data: goodsName,
            gridIndex: 0
          }, {
            data: goodsName,
            gridIndex: 1
          }],
          series: [{ data: packs, gridIndex: 0 }, { data: sells, gridIndex: 1 }]
        })
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
