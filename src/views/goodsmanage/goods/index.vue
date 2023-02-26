<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['goodsmanage:goods:add']"
            type="primary"
            size="mini"
            @click="handleAdd"
          >新增商品
          </el-button>
        </el-col>
      </el-row>
      <el-form
        v-show="showSearch"
        ref="queryForm"
        class="search-form"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="queryParams.goodsName"
            placeholder="请输入商品名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品分组" prop="groupId">
          <el-select
            v-model="queryParams.groupId"
            style="width: 100%"
            placeholder="请选择商品分组"
          >
            <el-option
              v-for="group in groupOptions"
              :key="group.groupId"
              :label="group.groupName"
              :value="group.groupId"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="上下架状态" prop="isShelves">
          <el-select
            v-model="queryParams.isShelves"
            placeholder="请选择上下架状态"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in shelvesOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物流信息" prop="logisticsType">
          <el-select
            v-model="queryParams.logisticsType"
            placeholder="请选择物流信息"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in logisticsTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态" prop="goodsStatus">
          <el-select
            v-model="queryParams.goodsStatus"
            placeholder="请选择商品状态"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in goodsStatusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        -->
        <el-row
          :gutter="10"
          class="mb8"
          style="margin-left: 95px; margin-top: 5px"
        >
          <el-col :span="1.5">
            <el-button
              class="blue-btn"
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
              v-hasPermi="['goodsmanage:goods:export']"
              >导出
            </el-button>
          </el-col> -->
        </el-row>
      </el-form>

      <el-tabs
        v-model="queryParams.salesStatus"
        class="tabContainer"
        type="card"
        style="margin-top: 20px"
        @tab-click="tabCheck"
      >
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane
          v-for="dict in salesStatusOptions"
          :key="dict.dictValue"
          :label="dict.dictLabel"
          :name="dict.dictValue"
        />
      </el-tabs>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        :max-height="maxHeight"
        :data="goodsList"
        :row-key="(row) => row.goodsId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80" align="center" />
        <el-table-column label="商品主图" align="center" prop="thumbnail" min-width="100">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.thumbnail"
              style="width: 80px; height: 80px"
              :src="prefix + scope.row.thumbnail"
              :preview-src-list="
                scope.row.thumbnail.split(',').map((item) => prefix + item)
              "
            />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center" prop="goodsName" min-width="100" />
        <el-table-column label="序号" align="center" prop="hotSaleSort" min-width="90">
          <template slot-scope="scope">
            {{ scope.row.hotSaleSort }}
            <el-button
              v-hasPermi="['merchant:sku:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              style="font-size: 18px"
              @click="openModel(scope.row, 'sort')"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column label="商品id" align="center" prop="goodsId" /> -->
        <el-table-column label="价格（元）" align="center" prop="price" min-width="90">
          <template slot-scope="scope">
            {{ scope.row.price && toDecimal2(scope.row.price / 100) }}
            <el-button
              v-hasPermi="['merchant:sku:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              style="font-size: 18px"
              @click="openModel(scope.row, 'price')"
            />
          </template>
        </el-table-column>
        <el-table-column label="访客量/浏览量" align="center" prop="goodsId" min-width="130">
          <template slot-scope="scope">
            <div>访客量：{{ scope.row.visitorVolume }}</div>
            <div>浏览量：{{ scope.row.pageViewVolume }}</div>
          </template></el-table-column>
        <el-table-column label="库存" align="center" prop="totalStock" min-width="80" />
        <el-table-column label="销量" align="center" prop="salesStock" min-width="80" />
        <el-table-column
          label="状态"
          align="center"
        >
          <template slot-scope="scope">
            <div>{{ isShelvesFormat(scope.row) }}</div>
            <el-button
              v-hasPermi="['goodsmanage:goods:shelves']"
              size="mini"
              type="text"
              @click="
                handleStandGoods(scope.row, scope.row.isShelves === 1 ? 2 : 1)
              "
            >
              {{ scope.row.isShelves === 1 ? "下架" : "上架" }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
          min-width="80"
        >
          <template slot-scope="scope">

            <!-- <el-button
              size="mini"
              type="text"
              @click="handleDateils(scope.row.goodsId)"
              v-hasPermi="['goodsmanage:goods:details']"
            >
              详情信息
            </el-button> -->
            <el-button
              v-hasPermi="['goodsmanage:goods:edit']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-if="scope.row.isShelves === 2"
              v-hasPermi="['goodsmanage:goods:remove']"
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
          <el-checkbox
            v-model="checked"
            @change="toggleSelection"
          >当页全选</el-checkbox>
        </el-col>
        <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
          <el-button
            v-hasPermi="['goodsmanage:goods:shelves']"
            size="mini"
            :disabled="multiple"
            @click="handleStandGoods({}, 2)"
          >下架
          </el-button>
          <el-button
            v-hasPermi="['goodsmanage:goods:shelves']"
            size="mini"
            :disabled="multiple"
            @click="handleStandGoods({}, 1)"
          >上架
          </el-button>
          <el-button
            v-hasPermi="['goodsmanage:goods:remove']"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
          >删除</el-button>
        </el-col>
        <el-col :span="11">
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />
        </el-col>
      </el-row>

      <el-dialog
        :title="openPriceType === 'price' ? '修改商品价格' : '修改商品排序'"
        :visible.sync="openPrice"
        width="400px"
        append-to-body
      >
        <el-form ref="form" :model="priceForm" label-width="100px">
          <el-form-item
            v-if="openPriceType === 'sort'"
            label="商品排序"
            prop="hotSaleSort"
          >
            <el-input-number
              v-model="priceForm.hotSaleSort"
              :min="0"
              placeholder="请输入商品排序"
            />
          </el-form-item>
          <el-form-item
            v-if="openPriceType === 'price'"
            label="商品价格"
            prop="price"
          >
            <el-input-number
              v-model="priceForm.price"
              :min="0"
              placeholder="请输入商品编码"
              @change="(e) => priceForm.price = Math.round(e * 100) / 100"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            :loading="this.$store.state.isLoading"
            @click="handlePrice"
          >确 定</el-button>
          <el-button @click="cancelPrice">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  delGoods,
  listGoods,
  enabled,
  disabled,
  updatePrice,
  updateSort
} from '@/api/goodsmanage/goods'
import { getDropDown } from '@/api/selectUtils'
import ResourcePicker from '@/components/ResourcePicker'
import Decimal from 'decimal.js'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Goods',
  components: { ResourcePicker },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length === 4,
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
      // 总条数
      total: 0,
      // 商品信息表格数据
      goodsList: [],
      // 全选
      checked: false,
      // 修改价格modal
      openPrice: false,
      // modal 类型
      openPriceType: null,
      // 详情信息
      details: {},
      // 上下架字典
      shelvesOptions: [],
      // 物流信息字典
      logisticsTypeOptions: [],
      // 销售状态(销售中，仓库中，已售罄)字典
      salesStatusOptions: [],
      // 商品状态(草稿，已提交)字典
      goodsStatusOptions: [],
      // 商品分组
      groupOptions: [],
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: null,
        groupId: null,
        salesStatus: 'all'
      },
      priceForm: {},
      // 搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Goods')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Goods'))
      }
    }
    this.getList()
    getDropDown('goodsGroup').then((res) => {
      this.groupOptions = res.data
    })
    this.getDicts('merchant_logistics_type').then((response) => {
      this.logisticsTypeOptions = response.data
    })
    this.getDicts('merchant_sales_status').then((response) => {
      this.salesStatusOptions = response.data
    })
    this.getDicts('merchant_goods_status').then((response) => {
      this.goodsStatusOptions = response.data
    })
    this.getDicts('merchant_is_shelves').then((response) => {
      this.shelvesOptions = response.data
    })
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询商品信息列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (params.salesStatus === 'all') delete params.salesStatus
      listGoods(params).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.goodsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 物流信息字典翻译
    logisticsTypeFormat(row, column) {
      return this.selectDictLabel(this.logisticsTypeOptions, row.logisticsType)
    },
    // 销售状态(销售中，仓库中，已售罄)字典翻译
    salesStatusFormat(row, column) {
      return this.selectDictLabel(this.salesStatusOptions, row.salesStatus)
    },
    // 商品状态(草稿，已提交)字典翻译
    goodsStatusFormat(row, column) {
      return this.selectDictLabel(this.goodsStatusOptions, row.goodsStatus)
    },
    // 上下架状态
    isShelvesFormat(row, column) {
      return this.selectDictLabel(this.shelvesOptions, row.isShelves)
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
        goodsName: null,
        groupId: null,
        salesStatus: 'all'
      }
      localStorage.removeItem('Goods')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.goodsId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.goodsList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/goodsmanage/goods/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Goods', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          activeName: 'info'
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/goodsmanage/goods/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Goods', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          goodsId: row.goodsId || this.ids,
          type: 'update',
          activeName: 'info'
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const goodsIds = row.goodsId || this.ids
      this.$confirm(
        `是否确认${
          typeof goodsIds === 'object' ? '批量删除' : '删除"' + row.goodsName +
        '"'}商品信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delGoods(goodsIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /**
     * 商品上下架
     */
    handleStandGoods(rows, isShelves) {
      const goodsIds = rows.goodsId || this.ids
      this.$confirm(
        `是否确认${typeof goodsIds === 'object' ? '批量' : ''}${
          isShelves === 1 ? '上架' : '下架'
        }
        ${
  typeof goodsIds === 'object' ? '' : '"' + rows.goodsName + '"'
}商品信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return isShelves === 1 ? enabled(goodsIds) : disabled(goodsIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`商品${isShelves === 1 ? '上架' : '下架'}成功`)
        })
    },
    // 编辑详情
    handleDateils(id) {
      const path = '/goodsmanage/goods/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Goods', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          goodsId: id,
          type: 'update',
          activeName: 'details'
        }
      })
    },
    // 打开修改框
    openModel(rows, type) {
      this.openPriceType = type
      this.priceForm = {
        skuId: rows.skuId,
        goodsId: rows.goodsId,
        price: rows.price / 100,
        hotSaleSort: rows.hotSaleSort
      }
      this.openPrice = true
    },
    // 修改价格
    handlePrice() {
      this.$confirm(
        `是否确认修改商品${this.openPriceType === 'price' ? '价格' : '排序'}？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          const sortParams = {
            goodsId: this.priceForm.goodsId,
            hotSaleSort: this.priceForm.hotSaleSort
          }
          const priceParams = {
            ...this.priceForm,
            price: new Decimal(this.priceForm.price).mul(100).toNumber()
          }
          delete priceParams.hotSaleSort
          return this.openPriceType === 'price'
            ? updatePrice(priceParams)
            : updateSort(sortParams)
        })
        .then(() => {
          this.cancelPrice()
          this.getList()
          this.msgSuccess(
            `修改商品${this.openPriceType === 'price' ? '价格' : '排序'}成功~`
          )
        })
    },
    // 修改价格取消
    cancelPrice() {
      this.openPrice = false
      this.priceForm = {}
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'merchant/goods/export',
        {
          ...this.queryParams
        },
        `merchant_goods.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.goodsList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
<style>
.img {
  width: 50px;
  height: 50px;
}
</style>
