<style lang="scss" scoped>
.bar-container {
  padding-top: 30px;
  min-height: 700px;
  min-width: 400px;
}

.orders {
  padding: 10px 0;
  font-size: 18px;
  font-weight: 700;
}
</style>

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
        <OrgSelect v-model="queryParams.orgId" @query="handleQuery" />
      </el-form-item>
      <el-form-item label="订单时间" prop="periodBeginTime">
        <RangePicker
          :clearable="false"
          size="small"
          :s-time.sync="queryParams.periodBeginTime"
          :e-time.sync="queryParams.periodEndTime"
          placeholder="选择时间维度"
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
          >筛选
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <div>
      <div class="orders">总订单数：{{ totalOrder }}单</div>
      <div ref="leftBar" class="bar-container" />
    </div>
  </div>
</template>

<script>
import OrgSelect from '@/components/OrgSelect'
import { scoreStatistics } from '@/api/data/services'
import { getDicts } from '@/api/system/dict/data'
import { reduce } from 'lodash'
import moment from 'moment'

export default {
  name: 'Services',
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
      totalOrder: 0,
      options: {
        tooltip: {
          formatter: '{b} {c}单 {d}%'
        },
        title: [
          {
            text: '商品评价',
            left: '25%',
            textAlign: 'center'
          },
          {
            text: '售后',
            left: '75%',
            textAlign: 'center'
          },
          {
            text: '配送员评价',
            left: '50%',
            top: '34%',
            textAlign: 'center'
          }
        ],
        series: [
          {
            type: 'pie',
            radius: '45%',
            center: ['25%', '30%']
          },
          {
            type: 'pie',
            radius: '45%',
            center: ['75%', '30%']
          },
          {
            type: 'pie',
            radius: '45%',
            center: ['50%', '70%']
          }
        ]
      }
    }
  },
  mounted() {
    this.barChart = this.$echarts.init(this.$refs.leftBar)
    this.barChart.setOption(this.options)
    Promise.all([
      getDicts('data_score_type').then(res => {
        this.data_score_type = res.data
      }),
      getDicts('data_after_sales_type').then(res => {
        this.after_sales_type = res.data
      })
    ]).then(() => {
      this.getList()
    })
  },
  methods: {
    /** 查询客户购买统计列表 */
    getList() {
      this.loading = true
      scoreStatistics(this.queryParams).then((response) => {
        this.loading = false
        const {
          distributionScoreDataStatisticsList,
          goodsScoreDataStatisticsList,
          orderDataStatisticsList
        } = response.data
        this.totalOrder = reduce(distributionScoreDataStatisticsList.map(i => +i.orderNumber || 0), (a, b) => a + b)
        this.barChart.setOption({
          label: {
            formatter: arg => {
              let result = arg.value / this.totalOrder * 100
              if (isNaN(result)) {
                result = 0
              }
              if (result !== 0) {
                result = result.toFixed(2)
              }
              return arg.name + '率 ' + result + '%'
            }
          },
          series: [
            {
              data: goodsScoreDataStatisticsList.map(i => ({
                value: i.orderNumber,
                name: this.selectDictLabel(this.data_score_type, i.scoreType)
              }))
            },
            {
              data: orderDataStatisticsList.map(i => ({
                value: i.orderNumber,
                name: this.selectDictLabel(this.after_sales_type, i.afterSalesType)
              }))
            },
            {
              data: distributionScoreDataStatisticsList.map(i => ({
                value: i.orderNumber,
                name: this.selectDictLabel(this.data_score_type, i.scoreType)
              }))
            }
          ]
        })
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
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
