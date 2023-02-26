<template>
  <div class="app-container">
    <el-form ref="queryForm" class="search-form" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户编码" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入客户编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户等级" prop="levelId">
        <el-select
          v-model="queryParams.levelId"
          placeholder="请选择客户等级"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in levelOptions"
            :key="dict.levelId"
            :label="dict.levelName"
            :value="dict.levelId"
          />
        </el-select>
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
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

    <el-tabs v-model="queryParams.distributionRebatesFlag" class="tabContainer" style="margin-top: 20px" type="card" @tab-click="tabCheck">
      <el-tab-pane label="有效" name="active" />
      <el-tab-pane label="禁用" name="disable" />
    </el-tabs>

    <el-table v-loading="loading" style="margin-top: 20px" :data="statisticsList" :row-key="(row) => row.customerId">
      <el-table-column label="分销客户编码" align="center" prop="customerId" />
      <el-table-column label="客户名称" align="center">
        <template slot-scope="scope">
          <div
            style="cursor: pointer"
            @click="handleDetails(scope.row.customerId)"
          >
            <img
              :src="scope.row.avatar ? scope.row.avatar : '/avatar.png'"
              style="width: 40px; height: 40px; border-radius: 100px"
            >
            <div style="color: #1890ff">{{ scope.row.customerName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="客户等级" align="center" prop="customerLevelName" />
      <el-table-column label="累计分销订单数" align="center" prop="promoteOrderNum" />
      <el-table-column label="累计返利金额（元）" align="center" prop="=income" :formatter="(_,row) => toDecimal2(_.income / 100)" />
      <el-table-column label="近三月分销订单数" align="center" prop="promoteOrderNum" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="queryParams.distributionRebatesFlag === 'disable'"
            v-hasPermi="['customer:customerAccount:updateDistributionFlag']"
            size="mini"
            type="text"
            @click="handleStates(scope.row, 'active')"
          >
            启用
          </el-button>
          <el-button
            v-if="queryParams.distributionRebatesFlag === 'active'"
            v-hasPermi="['customer:customerAccount:updateDistributionFlag']"
            size="mini"
            type="text"
            @click="handleStates(scope.row, 'inactive')"
          >
            停用
          </el-button>
          <el-button
            v-if="queryParams.distributionRebatesFlag === 'active'"
            v-hasPermi="['customer:customerAccount:updateDistributionFlag']"
            size="mini"
            type="text"
            @click="handleStates(scope.row, 'disable')"
          >
            禁用
          </el-button>
          <el-button
            v-hasPermi="['customer:qrcodeSale:get']"
            size="mini"
            type="text"
            @click="handleCode(scope.row.customerId)"
          >
            二维码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="24">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <el-dialog title="二维码" :visible.sync="visible" width="400">
      <el-row v-loading="loading">
        <el-col :span="12">
          <img class="qr_code" :src="form.qrSrc">
        </el-col>
        <el-col :span="12" class="text">
          <div>二维码生成后永久有效，停用该二维码需要手动进行关闭</div>
          <el-button v-hasPermi="['customer:qrcodeSale:gen']" type="primary" @click="handleGen">生成二维码</el-button>
          <el-button
            v-if="form.qrStatus"
            v-hasPermi="['customer:qrcodeSale:editStatus']"
            :type="form.qrStatus === 'disable' ? 'success' : 'danger'"
            @click="handleQrStatus(form.qrStatus === 'disable' ? 'enable' : 'disable')"
          >
            {{ form.qrStatus === 'disable' ? '启用二维码' : '禁用二维码' }}
          </el-button>
        </el-col>
      </el-row>
    </el-dialog>

  </div>
</template>

<script>
import { listCustomer, getQrCode, genQrCode, updateStatus } from '@/api/divideSale/customer'
import { getDropDown } from '@/api/selectUtils'
import { updateDistributionFlag } from '@/api/customer/customerInfo'

export default {
  name: 'Customer',
  components: { },
  data() {
    return {
      loading: false,
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      statisticsList: [],
      visible: false,
      form: {
        qrSrc: '',
        qrStatus: ''
      },
      // 等级
      levelOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerId: null,
        customerName: null,
        levelId: null,
        distributionRebatesFlag: 'active',
        isAsc: 'desc',
        orderByColumn: 'distribution_income_total'
      }
    }
  },
  created() {
    this.getList()
    // 客户等级
    getDropDown('customerLevel').then((res) => {
      this.levelOptions = res.data
    })
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询配送员考勤奖励明细列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      listCustomer(params).then(response => {
        this.statisticsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 跳转客户画像 */
    handleDetails(customerId) {
      const path = '/customer/customerInfo/portrait'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          customerId
        }
      })
    },
    // 状态修改
    handleStates(row, status) {
      this.$confirm(`是否确定${{ inactive: '停用', active: '启用', disable: '禁用' }[status]}"${row.customerName}"会员分销权限？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          accountId: row.accountId,
          customerId: row.customerId,
          distributionRebatesFlag: status
        }
        return updateDistributionFlag(params)
      }).then(() => {
        this.getList()
        this.msgSuccess(`分销权限设置成功~`)
      })
    },
    /** 二维码界面 */
    handleCode(customerId) {
      this.loading = true
      getQrCode(customerId).then(res => {
        this.form.customerId = customerId
        this.form.qrSrc = res.data?.status === 'enable' ? 'data:image/gif;base64,' + res.data.wxQrCodeUrl : ''
        this.form.qrStatus = res.data?.status
        this.form.qrcodeSaleId = res.data?.qrcodeSaleId
        this.visible = true
        this.loading = false
      })
    },
    /** 生成二维码 */
    handleGen() {
      this.loading = true
      genQrCode(this.form.customerId).then(res => {
        this.loading = false
        this.form.qrSrc = 'data:image/gif;base64,' + res.data.wxQrCodeUrl
        this.form.qrStatus = res.data.status
        this.form.qrcodeSaleId = res.data.qrcodeSaleId
      }).catch(() => {
        this.loading = false
      })
    },
    handleQrStatus(status) {
      this.$confirm(`是否确定${{ enable: '启用', overdue: '失效', disable: '禁用' }[status]}二维码？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return updateStatus({ qrcodeSaleId: this.form.qrcodeSaleId, status })
      }).then(() => {
        this.handleCode(this.form.customerId)
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('couponReceive/export', this.queryParams)
    }
  }
}
</script>
<style scoped>
  .qr_code {
    width: 400px;
    height: 400px;
  }
  .text {
    font-size: 16px;
    margin-top: 150px;
    color: #333;
    text-align: center;
    font-weight: 700;
    line-height: 50px;
  }
</style>
