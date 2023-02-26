<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['wms:orderin:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增入库
        </el-button>
      </el-col>
    </el-row>
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
      <el-form-item label="商品名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入商品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="仓管员" prop="managerBy">
        <el-select v-model="queryParams.managerBy" clearable placeholder="请选择仓管员">
          <el-option
            v-for="item in managersOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
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
            v-hasPermi="['distribution:stock:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.warehouseId"
      class="tabContainer"
      style="margin-top: 20px"
      type="card"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="item in warehouseOptions"
        :key="item.warehouseId"
        :label="item.warehouseName"
        :name="item.warehouseId"
      />
    </el-tabs>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      max-height="650"
      style="margin-top: 20px"
      :data="stockList"
      :row-key="(row) => row.warehouseId + row.goodsId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="queryParams.warehouseId !== 'all'" type="selection" width="80" align="center" />
      <el-table-column label="组织机构" align="center" prop="orgName" />
      <el-table-column label="商品ID" align="center" prop="goodsId" />
      <el-table-column label="商品名称" align="center" prop="goodsName" />
      <el-table-column label="商品数量（小包）" align="center" prop="num" />
      <el-table-column label="最近入库日期" align="center" prop="lastInTime" :formatter="(row) => momentFormat(row.lastInTime)" />
      <el-table-column label="最近出库日期" align="center" prop="lastOutTime" :formatter="(row) => momentFormat(row.lastOutTime)" />
      <el-table-column label="仓管员" align="center" prop="managerName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['wms:orderin:add']"
            size="mini"
            type="text"
            @click="handleGoodsAdd(scope.row)"
          >入库
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col v-if="queryParams.warehouseId !== 'all'" :span="1.5" style="margin-top: 30px; margin-left: 30px">
        <el-checkbox
          v-model="checked"
          @change="toggleSelection"
        >当页全选</el-checkbox>
      </el-col>
      <el-col v-if="queryParams.warehouseId !== 'all'" :span="9" style="margin-top: 26px; margin-left: 10px">
        <el-button
          v-hasPermi="['wms:orderin:add']"
          size="mini"
          :disabled="multiple"
          @click="batchGoods"
        >批量入库
        </el-button>
      </el-col>
      <el-col :span="queryParams.warehouseId === 'all' ? 22 : 11">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改库存对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item v-if="type === 'add'" label="仓库" prop="warehouseId">
          <el-select
            v-model="form.warehouseId"
            clearable
            placeholder="请选择仓库"
            @change="(value) => {
              const warehouse = warehouseOptions.filter(item => item.warehouseId === value)[0]
              form = {
                ...form,
                operatorBy: warehouse.managerBy,
                operatorName: warehouse.managerName
              }
            }"
          >
            <el-option
              v-for="item in warehouseOptions"
              :key="item.warehouseId"
              :label="item.warehouseName"
              :value="item.warehouseId"
            />
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务批次">
              <div>{{ form.warehouseOrderInBathNo }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交接人">
              <div>{{ form.operatorName }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作类型" prop="inType">
              <el-select v-model="form.inType" clearable placeholder="请选择操作类型">
                <el-option
                  v-for="dict in orderTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号" prop="warehouseOrderInNo">
              <el-input v-model="form.warehouseOrderInNo" placeholder="请输入订单号" oninput="value=value.replace(/[^\d]/g,'')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-row style="margin-top: 20px;">
        <el-row style="border: 1px solid #efefef;text-align: center;padding: 10px 0;background: #e3e3e3;">
          <el-col :span="12">商品名称</el-col>
          <el-col :span="12">数量（小包）</el-col>
        </el-row>
        <el-row v-for="(item, index) in form.goods" :key="item.index">
          <el-col :span="12" style="padding: 10px;">
            <el-select v-model="form.goods[index].goodsId" filterable clearable :disabled="type === 'goodsAdd' || type === 'batchGoodsAdd'" placeholder="请选择商品" style="width: 100%;">
              <el-option
                v-for="dict in goodsOptions"
                :key="dict.goodsId"
                :label="dict.goodsName"
                :value="dict.goodsId"
                :disabled="goodsDisabled(dict.goodsId)"
              />
            </el-select>
          </el-col>
          <el-col :span="form.goods.length > 1 ? 11 : 12" style="padding: 10px;">
            <el-input
              v-model="form.goods[index].goodsNum"
              placeholder="请输入数量"
              oninput="value=value.replace(/[^\d]/g,'')"
              @change="(e) => {
                if (e > 999999) {
                  form.goods[index].goodsNum = 999999
                }
              }"
            />
          </el-col>
          <el-col v-if="form.goods.length > 1 && type !== 'batchGoodsAdd'" :span="1">
            <i class="el-icon-remove-outline" style="text-align: center;margin-top: 15px;font-size: 24px;cursor: pointer;" @click="onDelGoods(item.index)" />
          </el-col>
        </el-row>
        <div v-if="type !== 'goodsAdd' && type !== 'batchGoodsAdd'"><el-button
          style="width: 100%;"
          type="primary"
          icon="el-icon-plus"
          @click="onAddGoods"
        /></div>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addStock, delStock, getStock, listStock, updateStock, getBatchno } from '@/api/wms/stock'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getDropDown } from '@/api/selectUtils'
import moment from 'moment'

export default {
  name: 'Stock',
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
      // 仓库数组
      warehouseOptions: [],
      // 管理员数组
      managersOptions: [],
      // 入库类型
      orderTypeOptions: [],
      // 商品
      goodsOptions: [],
      // 总条数
      total: 0,
      // 库存表格数据
      stockList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      type: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        goodsName: null,
        warehouseId: 'all',
        managerBy: null
      },
      // 表单参数
      form: {
        warehouseId: null,
        warehouseOrderInBathNo: null,
        inType: null,
        warehouseOrderInNo: null,
        operatorBy: null,
        goods: [{
          index: 1,
          goodsId: null,
          goodsNum: null,
          goodsSkuId: 0
        }]
      },
      // 表单校验
      rules: {
        warehouseId: [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ],
        inType: [
          { required: true, message: '操作类型不能为空', trigger: 'blur' }
        ]
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
    getDropDown('goodsList').then(res => {
      if (res.code === 200) {
        this.goodsOptions = res.data
      }
    })
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    keyPress(event) {
      const keyCode = event.keyCode
      if ((keyCode >= 48 && keyCode <= 57)) {
        event.returnValue = true
      } else {
        event.returnValue = false
      }
    },
    momentFormat(time) {
      if (!time) return null
      return moment(time).format('YYYY-MM-DD')
    },
    /** 查询库存列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (params.warehouseId === 'all') delete params.warehouseId
      listStock(params).then(response => {
        this.stockList = response.rows
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
    reset(form) {
      this.form = {
        warehouseId: null,
        warehouseOrderInBathNo: null,
        inType: null,
        warehouseOrderInNo: null,
        operatorBy: null,
        goods: [{
          index: 1,
          goodsId: null,
          goodsNum: null,
          goodsSkuId: 0
        }],
        ...form
      }
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
        orgId: null,
        goodsName: null,
        warehouseId: 'all',
        managerBy: null
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.goodsId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.stockList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      getBatchno().then(res => {
        if (res.code !== 200) return
        let form = {}
        if (this.queryParams.warehouseId === 'all') {
          form = {
            warehouseOrderInBathNo: res.data.batchNo
          }
        } else {
          form = {
            warehouseOrderInBathNo: res.data.batchNo,
            warehouseId: this.queryParams.warehouseId,
            operatorBy: this.warehouseOptions.filter(item => item.warehouseId === this.queryParams.warehouseId)[0].managerBy,
            operatorName: this.warehouseOptions.filter(item => item.warehouseId === this.queryParams.warehouseId)[0].managerName
          }
        }
        this.reset(form)
        this.open = true
        this.type = this.queryParams.warehouseId === 'all' ? 'add' : 'warehouseAdd'
        this.title = '添加入库'
      })
    },
    handleGoodsAdd(row) {
      getBatchno().then(res => {
        if (res.code !== 200) return
        this.form = {
          warehouseId: row.warehouseId,
          warehouseOrderInBathNo: res.data.batchNo,
          inType: null,
          warehouseOrderInNo: null,
          operatorBy: row.managerBy,
          operatorName: row.managerName,
          goods: [{
            index: 1,
            goodsId: row.goodsId,
            goodsNum: null,
            goodsSkuId: 0
          }]
        }
        this.open = true
        this.type = 'goodsAdd'
        this.title = '添加入库'
      })
    },
    batchGoods(row) {
      getBatchno().then(res => {
        if (res.code !== 200) return
        this.form = {
          warehouseId: this.queryParams.warehouseId,
          warehouseOrderInBathNo: res.data.batchNo,
          inType: null,
          warehouseOrderInNo: null,
          operatorBy: this.stockList[0].managerBy,
          operatorName: this.stockList[0].managerName,
          goods: this.ids.map(item => {
            return {
              index: item,
              goodsId: item,
              goodsNum: null,
              goodsSkuId: 0
            }
          })
        }
        this.open = true
        this.type = 'batchGoodsAdd'
        this.title = '批量添加入库'
      })
    },
    goodsDisabled(goodsId) {
      return this.form.goods.map(item => item.goodsId).includes(goodsId)
    },
    /** 新增商品 */
    onAddGoods() {
      this.form = {
        ...this.form,
        goods: this.form.goods.concat({
          index: moment().unix(),
          goodsId: null,
          goodsNum: null,
          goodsSkuId: 0
        })
      }
    },
    /** 删除商品 */
    onDelGoods(val) {
      this.form = {
        ...this.form,
        goods: this.form.goods.filter(item => item.index !== val)
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const goods = this.form.goods.map(item => item.goodsId)
          const goodsNum = this.form.goods.map(item => item.goodsNum)
          if (goods.includes(null) || goods.includes('')) {
            return this.warning('请选择商品')
          } else if (goodsNum.includes(null) || goodsNum.includes('')) {
            return this.warning('请输入商品数量')
          }
          const params = {
            ...this.form,
            goodsList: this.form.goods.map(item => {
              delete item.index
              return item
            })
          }
          delete params.goods
          delete params.operatorName
          this.$confirm(`是否确认新增入库?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            return addStock(params)
          }).then((res) => {
            this.msgSuccess(`新增入库成功`)
            this.open = false
            this.getList()
            this.$confirm('是否跳转打印界面，打印本次入库任务?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              const path = `/wmsPrint`
              this.$router.push({
                path,
                query: {
                  type: 'warehousing',
                  warehouseOrderInId: res.data
                }
              })
            })
          })
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('distribution/stock/export', this.queryParams)
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.stockList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
