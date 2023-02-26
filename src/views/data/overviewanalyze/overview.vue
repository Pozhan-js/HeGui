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
        <org-select v-model="queryParams.orgId" @query="queryList" />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodTimeType">
        <dict-select v-model="queryParams.periodTimeType" dict="data_period_time_type" />
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
          <el-button type="primary" size="mini" @click="queryList">筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <div class="content" style="margin-top: 40px;">
      <el-row style="margin-bottom: 50px">
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/sales">
            <el-card shadow="hover">
              应付销售额（元）
              <div class="text">{{ data.receivableAmount | fen2yuan }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/sales">
            <el-card shadow="hover">
              实付销售额（元）
              <div class="text">{{ data.paymentAmount | fen2yuan }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/orderSales">
            <el-card shadow="hover">
              订单数
              <div class="text">{{ data.totalOrderNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/overview/visitor">
            <el-card shadow="hover">
              访客量
              <div class="text">{{ data.visitorVolume }}</div>
            </el-card>
          </jump>
        </el-col>
        <!-- <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/people">
            <el-card shadow="hover">
              下单人数
              <div class="text">{{ data.orderUserNumber }}</div>
            </el-card>
          </jump>
        </el-col> -->
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/people">
            <el-card shadow="hover">
              自然下单人数
              <div class="text">{{ data.initiativeOrderUserNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/people">
            <el-card shadow="hover">
              推广下单人数
              <div class="text">{{ data.promoteOrderUserNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/overview/fan">
            <el-card shadow="hover">
              新增粉丝数
              <div class="text">{{ data.addNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/overview/distributionAnalyze">
            <el-card shadow="hover">
              配送员在线人数
              <div class="text">{{ data.onlineNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/traffic">
            <el-card shadow="hover">
              浏览量
              <div class="text">{{ data.pageViewVolume }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/overview/overtimeOrder">
            <el-card shadow="hover">
              订单超时率
              <div class="text">{{ data.timeoutOrderRate || 0 }}%</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/customerPrice">
            <el-card shadow="hover">
              客单价
              <div class="text">{{ data.customerPrice | fen2yuan }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/overview/distributionAnalyze">
            <el-card shadow="hover">
              新注册配送员
              <div class="text">{{ data.registerNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/conversionRates">
            <el-card shadow="hover">
              支付转换率
              <div class="text">{{ data.paymentConversionRate || 0 }}%</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/conversionRates">
            <el-card shadow="hover">
              点击转换率
              <div class="text">{{ data.clickConversionRate || 0 }}%</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/orderSales">
            <el-card shadow="hover">
              推广订单数
              <div class="text">{{ data.promoteOrderNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump path="/data/orderSales">
            <el-card shadow="hover">
              自然订单数
              <div class="text">{{ data.initiativeOrderNumber }}</div>
            </el-card>
          </jump>
        </el-col>
        <el-col style="margin-bottom: 40px" :span="5" :offset="1">
          <jump>
            <el-card shadow="hover">
              订单平均配送时长
              <div class="text">{{ formatSeconds(data.averageDistributionTime) }}</div>
            </el-card>
          </jump>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import OrgSelect from '@/components/OrgSelect'
import { dataOverview } from '@/api/data/overview'
import RangeCalendar from '@/components/RangeCalendar.vue'
import DictSelect from '@/components/DictSelect.vue'
import moment from 'moment'

export default {
  name: 'CustomerBuyStatistics',
  components: {
    OrgSelect,
    RangeCalendar,
    DictSelect
  },
  filters: {
    fen2yuan(value) {
      return (value / 100).toFixed(2)
    }
  },
  data() {
    return {
      queryParams: {
        periodTimeType: '1',
        periodBeginTime: moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        periodEndTime: moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      },
      data: {}
    }
  },
  mounted() {
    this.queryList()
  },
  methods: {
    queryList() {
      const { date, ...arg } = this.queryParams
      dataOverview(arg).then(res => {
        this.data = res.data
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      setTimeout(this.queryList)
    }

  }
}
</script>

<style lang="scss" scoped>
.text {
  line-height: 50px;
  font-size: 20px;
}
</style>

