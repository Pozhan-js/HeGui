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
      <el-form-item label="统计时间" prop="time">
        <el-date-picker
            clearable
            size="small"
            v-model="queryParams.time"
            :picker-options="pickerOptions"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
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
    <div v-loading="loading">
      <div ref="orderChart" style="height: 400px; margin-top: 20px" />
      <div ref="customerChart" style="height: 400px; margin-top: 20px" /> 
    </div>
  </div>
</template>

<script>
import { getCustomerList, getOrderList } from '@/api/data/consumeFrequency'
import OrgSelect from '@/components/OrgSelect'
import moment from 'moment'

export default {
  name: 'CustomerBuyStatistics',
  components: {
    OrgSelect,
  },
  data() {
    return {
      loading: false,
      // 查询参数
      queryParams: {
        orgId: null,
        time: [new Date(moment().subtract(1, 'days').startOf("day")), new Date(moment().subtract(1, 'days').endOf("day"))]
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf("day"));
              const end = new Date(moment(new Date()).endOf("day"));
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(end).endOf("day")),
              ]);
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(start).endOf("day")),
              ]);
            },
          },
          {
            text: "近七天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(end).endOf("day")),
              ]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(end).endOf("day")),
              ]);
            },
          },
        ],
      },
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.getList()
    },
    // 查询数据
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams,
      }
      console.log(this.queryParams)
      if (this.queryParams.time && this.queryParams.time.length === 2) {
        params.orderBeginTime = moment(this.queryParams.time[0]).format('YYYY-MM-DD HH:mm:ss');
        params.orderEndTime =  moment(this.queryParams.time[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      delete params.time

      Promise.all([getOrderList(params), getCustomerList(params)]).then(res => {
        this.loading = false
        this.drawCharts(res)
      })
    },
    drawCharts(data) {
      const orderData = data[0].data[0] ? data[0].data[0] : []
      const customerData = data[1].data[0] ? data[1].data[0] : []
      
      let orderChart = this.$echarts.init(this.$refs.orderChart);
      let customerChart = this.$echarts.init(this.$refs.customerChart);
      orderChart.setOption({
        grid: {
          left: '3%',
          right: '8%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'shadow'
          },
        },
        xAxis: {
          type: 'category',
          name: "单个订单金额（元）",
          data: Object.keys(orderData)
        },
        yAxis: {
          type: 'value',
          name: "订单量（个）",
        },
        series: [
          {
            data: Object.keys(orderData).map(item => orderData[item]),
            type: 'bar'
          }
        ]
      }, true)
      customerChart.setOption({
        grid: {
          left: '3%',
          right: '8%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'shadow'
          },
        },
        xAxis: {
          type: 'category',
          name: "订单量（个）",
          data: Object.keys(customerData)
        },
        yAxis: {
          type: 'value',
          name: "人数",
        },
        series: [
          {
            data: Object.keys(customerData).map(item => customerData[item]),
            type: 'bar'
          }
        ]
      }, true)
    }
  }
}
</script>
