<template>
  <div class="app-container">
    <el-form ref="queryForm" class="search-form" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="组织机构" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="warehouseOrderInBathNo">
        <el-input
          v-model="queryParams.warehouseOrderInBathNo"
          placeholder="请输入批次号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseId">
        <el-select v-model="queryParams.warehouseId" clearable placeholder="请选择仓库">
          <el-option
            v-for="item in warehouseOptions"
            :key="item.warehouseId"
            :label="item.warehouseName"
            :value="item.warehouseId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人" prop="operator">
        <el-select v-model="queryParams.operator" clearable placeholder="请选择操作人">
          <el-option
            v-for="item in managersOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="日期选择" prop="time">
          <el-date-picker
            v-model="queryParams.time"
            clearable
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
      </el-row>

      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            v-hasPermi="['wms:OrderIN:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table ref="multipleTable" v-loading="loading" max-height="650" style="margin-top: 20px" :data="OrderINList" :row-key="(row) => row.warehouseOrderInId">
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="操作批次" align="center" prop="warehouseOrderInBathNo" />
      <el-table-column label="商品名称" align="center">
        <template slot-scope="scope">
          <div v-for="(item,index) in scope.row.goodsList" :key="scope.row.warehouseOrderInId + item.goodsId + index">{{ item.goodsName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="商品数量（小包）" align="center">
        <template slot-scope="scope">
          <div v-for="(item,index) in scope.row.goodsList" :key="scope.row.warehouseOrderInId + item.goodsId + index">{{ item.goodsNum }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="inTime" />
      <el-table-column label="操作人" align="center" prop="operatorName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >批次详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handlePrint(scope.row)"
          >打印
          </el-button>
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

    <!-- 添加或修改入库记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body>
      <el-row style="color: #333;font-size: 16px;margin-bottom: 20px;">
        <el-col :span="6">任务批次：{{ form.warehouseOrderInBathNo }}</el-col>
        <el-col :span="6">操作类型：{{ typeFormat(form.inType) }}</el-col>
        <el-col :span="6">订单号：{{ form.warehouseOrderInNo }}</el-col>
        <el-col :span="6">交接人： {{ form.managerName }}</el-col>
      </el-row>
      <el-row style="border: 1px solid #efefef;text-align: center;padding: 10px 0;background: #e3e3e3;color: #333;font-size: 16px;">
        <el-col :span="6">商品名称</el-col>
        <el-col :span="6">数量（小包）</el-col>
        <el-col :span="6">操作时间</el-col>
        <el-col :span="6">操作人</el-col>
      </el-row>
      <el-row v-for="item in form.goodsList" :key="item.goodsId" style="color: #333;font-size: 15px;">
        <el-col :span="6" style="text-align: center;padding: 20px 0;">{{ item.goodsName }}</el-col>
        <el-col :span="6" style="text-align: center;padding: 20px 0;">{{ item.goodsNum }}</el-col>
        <el-col :span="6" style="text-align: center;padding: 20px 0;">{{ form.inTime }}</el-col>
        <el-col :span="6" style="text-align: center;padding: 20px 0;">{{ form.operatorName }}</el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { addOrderIN, delOrderIN, getOrderIN, listOrderIN, updateOrderIN } from '@/api/wms/OrderIN'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getDropDown } from '@/api/selectUtils'
import moment from 'moment'

export default {
  name: 'OrderIN',
  components: {
    Cascader
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织机构数据
      orgOptions: [],
      // 仓库数组
      warehouseOptions: [],
      // 管理员数组
      managersOptions: [],
      // 操作类型
      orderTypeOptions: [],
      // 总条数
      total: 0,
      // 入库记录表格数据
      OrderINList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseOrderInBathNo: null,
        warehouseId: null,
        operator: null,
        orgId: null,
        time: null,
        orderByColumn: 'warehouse_order_in_id',
        isAsc: 'desc'
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
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
    this.getDicts('warehouse_order_in_type').then((response) => {
      this.orderTypeOptions = response.data
    })
    getDropDown('managers').then(res => {
      if (res.code === 200) {
        this.managersOptions = res.data
      }
    })
    getDropDown('warehouse').then(res => {
      if (res.code === 200) {
        this.warehouseOptions = res.data
      }
    })
  },
  methods: {
    // 参数系统内置字典翻译
    typeFormat(val, column) {
      return this.selectDictLabel(this.orderTypeOptions, val)
    },
    /** 查询入库记录列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (params.time) {
        params.params = {
          beginTime: moment(params.time).startOf('days').format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment(params.time).endOf('days').format('YYYY-MM-DD HH:mm:ss')
        }
      }
      listOrderIN(params).then(response => {
        this.OrderINList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {}
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        warehouseOrderInBathNo: null,
        warehouseId: null,
        operator: null,
        orgId: null,
        time: null,
        orderByColumn: 'warehouse_order_in_id',
        isAsc: 'desc'
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const warehouseOrderInId = row.warehouseOrderInId || this.ids
      getOrderIN(warehouseOrderInId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '批次详情'
      })
    },
    /** 跳转打印 */
    handlePrint(row) {
      const path = `/wmsPrint`
      this.$router.push({
        path,
        query: {
          type: 'warehousing',
          warehouseOrderInId: row.warehouseOrderInId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wms/OrderIN/export', this.queryParams)
    }
  }
}
</script>
