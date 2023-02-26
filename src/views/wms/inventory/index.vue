<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['wms:inventory:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >发起盘点
        </el-button>
      </el-col>
    </el-row>
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
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
      <el-form-item label="盘点批次" prop="warehouseInventoryBatchNo">
        <el-input
          v-model="queryParams.warehouseInventoryBatchNo"
          placeholder="请输入盘点批次"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人" prop="operationBy">
        <el-select
          v-model="queryParams.operationBy"
          clearable
          placeholder="请选择操作人"
        >
          <el-option
            v-for="item in managersOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期选择" prop="commitTime">
        <el-date-picker
          v-model="queryParams.commitTime"
          clearable
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>

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
            v-hasPermi="['wms:inventory:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      max-height="650"
      style="margin-top: 20px"
      :data="inventoryList"
      :row-key="(row) => row.warehouseInventoryId"
    >
      <el-table-column
        label="盘点批次"
        align="center"
        prop="warehouseInventoryBatchNo"
      />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column
        label="盘点类型"
        align="center"
        prop="inventoryType"
        :formatter="typeFormat"
      />
      <el-table-column
        label="盘点情况"
        align="center"
        prop="inventoryResult"
        :formatter="resultFormat"
      />
      <el-table-column
        label="盘点状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="操作时间" align="center" prop="commitTime" />
      <el-table-column label="操作人" align="center" prop="operationName" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status ==='checking'"
            v-hasPermi="['wms:inventory:add']"
            size="mini"
            type="text"
            @click="handleContinue(scope.row)"
          >继续盘点
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleInfo(scope.row.warehouseInventoryId)"
          >详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>

    <!-- 添加或修改盘点记录 对话框 -->
    <el-dialog
      title="发起盘点"
      :visible.sync="open"
      :width=" type === 'start' ? '800px' : '1200px'"
      append-to-body
      @close="() => {
        if (type !== 'calcuate') return
        getList()
      }"
    >
      <el-row>
        <el-col
          :span="2"
          style="
            text-align: end;
            font-size: 15px;
            color: #333;
            padding-top: 5px;
          "
        >仓库： </el-col>
        <el-col
          v-if="type === 'details' || type === 'calcuate'"
          :span="8"
          style="font-size:15px;color: #333;padding-top:5px;"
        >{{ form.warehouseName }}</el-col>
        <el-col :span="8">
          <el-select
            v-if="type !== 'details' && type !== 'calcuate'"
            v-model="form.warehouseId"
            clearable
            placeholder="请选择仓库"
            @change="(e) => handleStart(e)"
          >
            <el-option
              v-for="item in warehouseOptions"
              :key="item.warehouseId"
              :label="item.warehouseName"
              :value="item.warehouseId"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-row v-if="form.warehouseInventoryBatchNo" style="margin-top: 10px">
        <el-col
          :span="8"
          style="
            font-size: 15px;
            color: #333;
            padding-top: 5px;
            padding-left: 15px;
          "
        >操作批次：{{ form.warehouseInventoryBatchNo }}</el-col>
        <el-col :span="10">
          <el-col
            :span="8"
            style="
              text-align: end;
              font-size: 15px;
              color: #333;
              padding-top: 5px;
            "
          >操作类型：<span v-if="type === 'details' || type === 'calcuate'">{{ typeFormat({inventoryType: form.inventoryType}) }}</span></el-col>
          <el-col :span="13">
            <el-select
              v-if="type !== 'details' && type !== 'calcuate'"
              v-model="form.inventoryType"
              placeholder="请选择操作类型"
            >
              <el-option
                v-for="item in inventoryTypeOptions"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-col>
        </el-col>
        <el-col
          :span="6"
          style="font-size: 15px; color: #333; padding-top: 5px"
        >操作人：{{ form.operationName }}</el-col>
      </el-row>
      <el-row v-if="type === 'start'">
        <el-table
          v-if="form.warehouseInventoryBatchNo"
          ref="modalTable"
          style="margin-top: 10px"
          max-height="550"
          :data="form.details"
          :row-key="(row) => `${row.goodsId}-start`"
        >
          <el-table-column label="商品编码" align="center" prop="goodsId" />
          <el-table-column label="商品名称" align="center" prop="goodsName" />
          <el-table-column label="锁库库存" align="center" prop="stockNum" />
          <el-table-column label="锁库时间" align="center">
            <template slot-scope>
              {{ form.lockTime }}
            </template>
          </el-table-column>
          <el-table-column
            :width="180"
            label="实盘库存"
            align="center"
            prop="realNum"
          >
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.realNum"
                style="width: 160px"
                :min="0"
                :precision="0"
                :max="999999"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-row v-else>
        <el-table
          v-if="form.warehouseInventoryBatchNo"
          ref="calcuateTable"
          style="margin-top: 10px"
          max-height="550"
          :data="form.details"
          :row-key="(row) => `${row.goodsId}-calcuate`"
        >
          <el-table-column label="商品编码" align="center" prop="goodsId" />
          <el-table-column label="商品名称" align="center" prop="goodsName" />
          <el-table-column label="锁库库存" align="center" prop="stockNum" />
          <el-table-column label="锁库时间" align="center" prop="lockTime">
            <template slot-scope>
              {{ form.lockTime }}
            </template>
          </el-table-column>
          <el-table-column label="实盘库存" align="center" prop="realNum">
            <template slot-scope="scope">{{ scope.row.realNum }}</template>
          </el-table-column>
          <el-table-column label="过程入库" align="center" prop="inNum" />
          <el-table-column label="过程出库" align="center" prop="outNum" :formatter="(row) => row.outNum ? Math.abs(row.outNum) : null" />
          <el-table-column label="库存结果" align="center">
            <template slot-scope="scope">{{ parseInt(scope.row.stockNum) + parseInt(scope.row.inNum) + parseInt(scope.row.outNum) }}</template>
          </el-table-column>
          <el-table-column label="结束时间" align="center" prop="endTime">
            <template slot-scope>
              {{ form.endTime }}
            </template>
          </el-table-column>
          <el-table-column label="盘点结果" :width="150" align="center" prop="inventoryResult">
            <template slot-scope="scope">
              <span v-if="type === 'details'">{{ goodsResultFormat(scope.row.inventoryResult) }}</span>
              <el-select
                v-else
                v-model="scope.row.inventoryResult"
                placeholder="请选择盘点结果"
              >
                <el-option
                  v-for="item in goodsResultOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :width="180" label="调整" align="center" prop="changeNum">
            <template slot-scope="scope">
              <span v-if="type === 'details'">{{ scope.row.changeNum }}</span>
              <el-input-number
                v-else
                v-model="scope.row.changeNum"
                :disabled="scope.row.inventoryResult === 'consistent'"
                style="width: 160px"
                :precision="0"
                :max="999999"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <div
        v-if="form.warehouseInventoryBatchNo && type !== 'details'"
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          v-if=" type === 'start'"
          v-hasPermi="['wms:inventory:remove']"
          type="danger"
          :loading="this.$store.state.isLoading"
          @click="delInventory(form.warehouseInventoryId)"
        >取 消</el-button>
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button
          @click="() => {
            if (type === 'start') {
              getList()
            }
            cancel()
          }"
        >{{ type === 'start' ? '挂 起' : '取 消' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  commit,
  getStart,
  listInventory,
  calcuate,
  delInventory,
  getInfo
} from '@/api/wms/inventory'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getDropDown } from '@/api/selectUtils'
import moment from 'moment'

export default {
  name: 'Inventory',
  components: {
    Cascader
  },
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
      // 组织机构数据
      orgOptions: [],
      // 仓库
      warehouseOptions: [],
      // 操作人
      managersOptions: [],
      // 盘点类型
      inventoryTypeOptions: [],
      // 盘点情况
      inventoryResultOptions: [],
      // 盘点状态
      inventoryStatusOptions: [],
      goodsResultOptions: [],
      // 总条数
      total: 0,
      // 盘点记录 表格数据
      inventoryList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      type: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseInventoryBatchNo: null,
        commitTime: null,
        operationBy: null,
        orderByColumn: 'warehouse_inventory_id',
        isAsc: 'desc'
      },
      // 表单参数
      form: {}
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
    getDropDown('managers').then((res) => {
      if (res.code === 200) {
        this.managersOptions = res.data
      }
    })
    getDropDown('warehouse').then((res) => {
      if (res.code === 200) {
        this.warehouseOptions = res.data
      }
    })
    this.getDicts('wms_inventory_type').then((response) => {
      this.inventoryTypeOptions = response.data
    })
    this.getDicts('wms_inventory_result').then((response) => {
      this.inventoryResultOptions = response.data
    })
    this.getDicts('wms_inventory_status').then((response) => {
      this.inventoryStatusOptions = response.data
    })
    this.getDicts('wms_inventory_goods_result').then((response) => {
      this.goodsResultOptions = response.data
    })
  },
  methods: {
    // 参数系统内置字典翻译
    typeFormat(val, column) {
      return this.selectDictLabel(this.inventoryTypeOptions, val.inventoryType)
    },
    // 参数系统内置字典翻译
    resultFormat(val, column) {
      return this.selectDictLabel(
        this.inventoryResultOptions,
        val.inventoryResult
      )
    },
    goodsResultFormat(val, column) {
      return this.selectDictLabel(this.goodsResultOptions, val)
    },
    // 参数系统内置字典翻译
    statusFormat(val, column) {
      return this.selectDictLabel(this.inventoryStatusOptions, val.status)
    },
    /** 查询盘点记录 列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }

      if (params.commitTime) {
        params.params = {
          beginTime: moment(params.commitTime).startOf('days').format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment(params.commitTime).endOf('days').format('YYYY-MM-DD HH:mm:ss')
        }
      }
      delete params.commitTime
      listInventory(params).then((response) => {
        this.inventoryList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 详情 */
    handleInfo(warehouseInventoryId) {
      getInfo(warehouseInventoryId).then(res => {
        this.open = true
        this.form = res.data
        this.type = 'details'
        console.log(res.data)
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      // this.reset()
    },
    // 表单重置
    reset() {
      this.form = {}
      this.type = ''
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
        warehouseInventoryBatchNo: null,
        commitTime: null,
        operationBy: null,
        orderByColumn: 'warehouse_inventory_id',
        isAsc: 'desc'
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.warehouseInventoryId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.inventoryList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.type = 'start'
      this.open = true
    },
    handleStart(warehouseId) {
      if (!warehouseId) {
        this.form = {}
        return
      }
      getStart(warehouseId).then((res) => {
        this.form = {
          ...res.data,
          details: res.data.details.map(item => {
            return {
              ...item,
              realNum: undefined
            }
          })
        }
      })
    },
    /** 继续盘点 */
    handleContinue(row) {
      getStart(row.warehouseId).then((res) => {
        this.type = 'start'
        this.open = true
        this.form = {
          ...res.data
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {},
    /** 删除盘点 */
    delInventory(id) {
      this.$confirm(
        `是否确认取消盘点 ?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        return delInventory(id)
      }).then(() => {
        this.open = false
        this.getList()
        this.msgSuccess(`取消盘点成功~`)
      })
    },
    /** 提交按钮 */
    submitForm() {
      if (this.type === 'start') {
        const realNumArr = this.form.details.map(item => item.realNum).filter(item => item === undefined)
        if (!this.form.inventoryType) {
          return this.warning('请选择操作类型')
        } else if (realNumArr.length > 0) {
          return this.warning('请输入实盘库存')
        }
      }

      this.$confirm(
        `是否确认${this.type === 'start' ? '计算' : '提交'}盘点 ?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return this.type === 'start'
            ? calcuate(this.form)
            : commit(this.form)
        })
        .then((res) => {
          this.msgSuccess(
            `盘点${this.type === 'start' ? '计算' : '提交'}成功~`
          )
          if (this.type === 'start') {
            this.form = {
              ...res.data
            }
            this.type = 'calcuate'
            return
          }
          this.type = ''
          this.open = false
          this.getList()
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wms/inventory/export', this.queryParams)
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.inventoryList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
