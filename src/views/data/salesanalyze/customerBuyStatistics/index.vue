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
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
        <el-form-item label="入驻时间" prop="settleTime">
          <el-date-picker
            v-model="queryParams.settleTime"
            clearable
            size="small"
            :picker-options="pickerOptions"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
      </el-row>
      <el-form-item label="购买订单数">
        <el-col :span="10">
          <el-input
            v-model="queryParams.buyOrderBeginNum"
            placeholder="请输入购买订单数"
            clearable
            size="small"
            @change="(value) => inputChange(value, 'buyOrderBeginNum')"
          />
        </el-col>
        <el-col :span="2" style="text-align: center">—</el-col>
        <el-col :span="10">
          <el-input
            v-model="queryParams.buyOrderEndNum"
            placeholder="请输入购买订单数"
            clearable
            size="small"
            @change="(value) => inputChange(value, 'buyOrderEndNum')"
          />
        </el-col>
      </el-form-item>
      <el-row>
        <el-form-item label="消费总金额">
          <el-col :span="10">
            <el-input
              v-model="queryParams.buyBeginAmount"
              placeholder="请输入消费总金额"
              clearable
              size="small"
              @change="(value) => inputChange(value, 'buyBeginAmount')"
            />
          </el-col>
          <el-col :span="2" style="text-align: center">—</el-col>
          <el-col :span="10">
            <el-input
              v-model="queryParams.buyEndAmount"
              placeholder="请输入消费总金额"
              clearable
              size="small"
              @change="(value) => inputChange(value, 'buyEndAmount')"
            />
          </el-col>
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['data:customerBuyStatistics:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="customerBuyStatisticsList"
    >
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="图像/昵称" align="center" prop="customerId">
        <template slot-scope="scope">
          <img
            :src="scope.row.avatar ? scope.row.avatar : '/avatar.png'"
            style="width: 40px; height: 40px; border-radius: 100px"
          >
          <div>{{ scope.row.nickname }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="等级"
        align="center"
        prop="levelId"
        :formatter="levelFormat"
      />
      <el-table-column
        label="性别"
        align="center"
        prop="sex"
        :formatter="sexFormat"
      />
      <el-table-column label="购买订单数" align="center" prop="buyOrderNum" />
      <el-table-column
        label="消费总金额"
        align="center"
        prop="consumerTotalAmount"
      >
        <template slot-scope="scope">
          {{
            scope.row.consumerTotalAmount &&
              toDecimal2(scope.row.consumerTotalAmount / 100)
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="入驻时间"
        align="center"
        prop="settleTime"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listCustomerBuyStatistics } from '@/api/data/customerBuyStatistics'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'
import { getDropDown } from '@/api/selectUtils'

export default {
  name: 'CustomerBuyStatistics',
  components: {
    Cascader
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 客户购买统计表格数据
      customerBuyStatisticsList: [],
      // 性别字典
      sexOptions: [],
      // 客户等级
      levelOptions: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'))
              const end = new Date(moment(new Date()).endOf('day'))
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(start).endOf('day'))
              ])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        settleTime: null,
        buyOrderBeginNum: null,
        buyOrderEndNum: null,
        buyBeginAmount: null,
        buyEndAmount: null
      }
    }
  },
  created() {
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('customerLevel').then((res) => {
      this.levelOptions = res.data.map((item) => {
        return {
          dictValue: item.levelId,
          dictLabel: item.levelName
        }
      })
    })
    this.getDicts('sys_user_sex').then((response) => {
      this.sexOptions = response.data
    })
  },
  methods: {
    // 输入框值改变
    inputChange(value, key) {
      if (key === 'buyEndAmount' && parseInt(this.queryParams.buyBeginAmount) > parseInt(value.replace(/[^\d]/g, ''))) {
        this.queryParams[key] = this.queryParams.buyBeginAmount
      } else if (key === 'buyOrderEndNum' && parseInt(this.queryParams.buyOrderBeginNum) > parseInt(value.replace(/[^\d]/g, ''))) {
        this.queryParams[key] = this.queryParams.buyOrderBeginNum
      } else {
        this.queryParams[key] = value.replace(/[^\d]/g, '')
      }
    },
    /** 查询客户购买统计列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams,
        buyBeginAmount: this.queryParams.buyBeginAmount ? this.queryParams.buyBeginAmount * 100 : null,
        buyEndAmount: this.queryParams.buyEndAmount ? this.queryParams.buyEndAmount * 100 : null
      }
      if (
        this.queryParams.settleTime &&
        this.queryParams.settleTime.length > 0
      ) {
        params.settleBeginTime = this.queryParams.settleTime[0]
        params.settleEndTime = this.queryParams.settleTime[1]
        delete params.settleTime
      }
      listCustomerBuyStatistics(params).then((response) => {
        this.customerBuyStatisticsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 性别字典翻译
    sexFormat(row, column) {
      return this.selectDictLabel(this.sexOptions, row.sex)
    },
    // 客户等级字典翻译
    levelFormat(row, column) {
      return this.selectDictLabel(this.levelOptions, row.levelId)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        settleTime: null,
        buyOrderBeginNum: null,
        buyOrderEndNum: null,
        buyBeginAmount: null,
        buyEndAmount: null
      }
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'data/customerBuyStatistics/export',
        {
          ...this.queryParams
        },
        `data_customerBuyStatistics.xlsx`
      )
    }
  }
}
</script>
