<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="110px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="缴纳编号" prop="insuranceOrderCode">
        <el-input
          v-model="queryParams.insuranceOrderCode"
          placeholder="请输入缴纳编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单凭证号" prop="thirdOrderCode">
        <el-input
          v-model="queryParams.thirdOrderCode"
          placeholder="请输入订单凭证号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="配送员编号" prop="distributionId">
        <el-input
          v-model="queryParams.distributionId"
          placeholder="请输入配送员编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员姓名" prop="makiName">
        <el-input
          v-model="queryParams.makiName"
          placeholder="请输入配送员姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员手机号" prop="telephone">
        <el-input
          v-model="queryParams.telephone"
          placeholder="请输入配送员手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="缴纳时间" prop="paySTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.paySTime"
          :e-time.sync="queryParams.payETime"
          placeholder="选择缴纳时间"
        />
      </el-form-item>
      <el-form-item label="保险费到期时间" prop="expireSTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.expireSTime"
          :e-time.sync="queryParams.expireETime"
          placeholder="选择保险费到期时间"
        />
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 105px; margin-top: 5px"
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:insuranceorder:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      style="margin-top: 20px"
      :max-height="maxHeight"
      :data="insuranceorderList"
    >
      <el-table-column
        min-width="110"
        label="缴纳编号"
        align="center"
        prop="insuranceOrderCode"
      />
      <el-table-column
        min-width="110"
        label="订单凭证号"
        align="center"
        prop="thirdOrderCode"
      />
      <el-table-column align="center" width="120" label="业务凭证号" prop="thirdOrderCode"/>
      <el-table-column
        min-width="110"
        label="配送员编号"
        align="center"
        prop="distributionId"
      />
      <el-table-column min-width="100" label="配送员名称" align="center" prop="makiName" />
      <el-table-column min-width="110" label="配送员手机号" align="center" prop="telephone" />
      <el-table-column min-width="110" label="身份证号" align="center" prop="idCard" />
      <el-table-column min-width="80" label="缴纳月数" align="center" prop="mountNum" />
      <el-table-column
        min-width="110"
        label="缴纳金额(元)"
        align="center"
        prop="amount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="缴纳时间"
        align="center"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.completionTime" />
        </template>
      </el-table-column>
      <el-table-column
        min-width="130"
        label="缴纳前保险到期时间"
        align="center"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.beforeExpiryDate" />
        </template>
      </el-table-column>
      <el-table-column
        min-width="130"
        label="缴纳后保险到期时间"
        align="center"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.afterExpiryDate" />
        </template>
      </el-table-column>
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        min-width="80"
        label="投保状态"
        align="center"
      >
        <template slot-scope="{row}">
          <el-button type="text" @click="handleInsuredStatus(row)">{{insuredStatusFormat(row)}}</el-button>
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
    <el-dialog title="保险状态" :visible.sync="open" width="800px" append-to-body>
      <canvas id="canvas" width="700" height="400"></canvas>
      <div v-if="insuredStatus == 'insurance_fail_effect' || insuredStatus == 'insurance_repeat_effect'" class="fail-info-box" >
        <div class="fail-info-title">
          <i class="el-icon-warning text-red"></i>
          <span>投保失败</span>
        </div>
        <div class="fail-info-content">{{insuredFaildReason}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrgTree } from '@/api/utils'
import {
  addInsuranceorder,
  delInsuranceorder,
  getInsuranceorder,
  listInsuranceorder,
  updateInsuranceorder,
  statusLogInsuranceorder,
} from "@/api/distribution/insuranceorder";
import { Cascader } from 'ant-design-vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'
import InsuredStatusProgress from './InsuredStatusProgress.js'

export default {
  name: 'Insuranceorder',
  components: {
    Cascader,
    InsuredStatusProgress,
  },
  mixins: [SetTableMaxHeight, InsuredStatusProgress],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 保险金订单记录表格数据
      insuranceorderList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      statusOptions: [],
      insuredStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        distributionId: this.$route.query.distributionId,
        isAsc: 'desc',
        orderByColumn: 'completion_time'
      },
      // 表单校验
      rules: {},
      insuredStatus: '',
      insuredFaildReason: ''
    };
  },
  created() {
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    });
    this.getDicts("pay_status").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("insured_status").then((response) => {
      this.insuredStatusOptions = response.data;
    })
  },
  methods: {
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    insuredStatusFormat(row, column) {
      return this.selectDictLabel(this.insuredStatusOptions, row.insuredStatus);
    },
    /** 查询保险金订单记录列表 */
    getList() {
      this.loading = true
      listInsuranceorder(this.queryParams).then((response) => {
        this.insuranceorderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 查看状态详情
    handleInsuredStatus({insuredStatus, insuranceOrderId}) {
      this.open = true
      this.insuredStatus = insuredStatus
      this.$nextTick(()=>{
        this.drawProgress()
      })
      if(insuredStatus == 'insurance_fail_effect' || insuredStatus == 'insurance_repeat_effect') {
        statusLogInsuranceorder(insuranceOrderId).then(res=>{
          this.insuredFaildReason = res.data?.reason
        })
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        isAsc: 'desc',
        orderByColumn: 'completion_time'
      }
      this.$router.push({ query: {}})
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/insuranceorder/export',
        {
          ...this.queryParams
        },
        `distribution_insuranceorder.xlsx`
      )
    }
  }
}
</script>
<style lang="scss" scoped>
.fail-info {
  &-box {
    position:absolute;
    left: 630px;
    top: 240px;
    padding: 10px;
    background: rgba(0,0,0,0.1);
  }
  &-title {
    display: flex;
    align-items: center;
    .text-red {
      font-size: 24px;
      margin-right: 20px;
    }
  }
  &-content {
    margin-top: 10px;
  }
}
</style>
