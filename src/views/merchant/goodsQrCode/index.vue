<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['merchant:goodsQrCode:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增二维码商品
        </el-button>
      </el-col>
    </el-row>
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="110px"
    >
      <el-form-item label="二维码商品ID" prop="prodId">
        <el-input
          v-model="queryParams.prodId"
          placeholder="请输入二维码商品ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="快乐达商品名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入快乐达商品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="prodName">
        <el-input
          v-model="queryParams.prodName"
          placeholder="请输入商品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品类别" prop="prodCategory">
        <el-input
          v-model="queryParams.prodCategory"
          placeholder="请输入商品类别"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
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
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['merchant:goodsQrCode:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      style="margin-top: 20px"
      :data="goodsQrCodeList"
      :row-key="(row) => row.goodsQrCodeId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="60" label="ID" align="center" prop="goodsQrCodeId" />
      <el-table-column min-width="100" label="快乐达商品" align="center" prop="goodsName" />
      <el-table-column min-width="100" label="二维码商品Id" align="center" prop="prodId" />
      <el-table-column min-width="100" label="商品名称" align="center" prop="prodName" />
      <el-table-column min-width="100" label="价格" align="center" prop="price">
        <template slot-scope="scope">
          {{ scope.row.price && toDecimal2(scope.row.price / 100) }}
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="erp编码" align="center" prop="erpCode" />
      <el-table-column min-width="100" label="商品类别" align="center" prop="prodCategory" />
      <el-table-column min-width="100" label="商品品牌" align="center" prop="prodBrand" />
      <el-table-column min-width="100" label="属性名称" align="center" prop="attrName" />
      <el-table-column min-width="100" label="状态" align="center" prop="onOffStatus" />
      <el-table-column min-width="100" label="banner" align="center" prop="banner">
        <template slot-scope="scope">
          <img style="width: 40px" :src="scope.row.banner">
        </template>
      </el-table-column>
      <el-table-column
        min-width="60"
        label="操作"
        align="center"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['merchant:goodsQrCode:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['merchant:goodsQrCode:remove']"
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
          v-hasPermi="['merchant:goodsQrCode:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
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

    <!-- 添加或修改二维码商品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="快乐达商品" prop="goodsId">
          <el-select
            v-model="form.goodsId"
            filterable
            placeholder="请选择快乐达商品"
            style="width: 100%"
          >
            <el-option
              v-for="dict in goodsList"
              :key="dict.goodsId"
              :label="dict.goodsName"
              :value="dict.goodsId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="二维码商品id" prop="prodId">
          <el-input v-model="form.prodId" placeholder="请输入二维码商品id" />
        </el-form-item>
        <el-form-item label="商品名称" prop="prodName">
          <el-input v-model="form.prodName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="erp编码" prop="erpCode">
          <el-input v-model="form.erpCode" placeholder="请输入erp编码" />
        </el-form-item>
        <el-form-item label="商品类别" prop="prodCategory">
          <el-input v-model="form.prodCategory" placeholder="请输入商品类别" />
        </el-form-item>
        <el-form-item label="商品品牌" prop="prodBrand">
          <el-input v-model="form.prodBrand" placeholder="请输入商品品牌" />
        </el-form-item>
        <el-form-item label="属性名称" prop="attrName">
          <el-input v-model="form.attrName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-date-picker
            v-model="form.time"
            clearable
            size="small"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="状态" prop="onOffStatus">
          <el-select
            v-model="form.onOffStatus"
            filterable
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option
              v-for="dict in qrcodeStatusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="banner" prop="banner">
          <el-input v-model="form.banner" placeholder="请输入banner" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addGoodsQrCode,
  delGoodsQrCode,
  getGoodsQrCode,
  listGoodsQrCode,
  updateGoodsQrCode
} from '@/api/merchant/goodsQrCode'
import { getDropDown } from '@/api/selectUtils'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'GoodsQrCode',
  components: { },
  mixins: [SetTableMaxHeight],
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
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 二维码商品表格数据
      goodsQrCodeList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prodId: null,
        goodsName: null,
        prodName: null,
        prodCategory: null
      },
      // 状态
      qrcodeStatusOptions: [],
      // 商品数组
      goodsList: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        goodsId: [
          { required: true, message: '快乐达商品不能为空', trigger: 'blur' }
        ],
        prodId: [
          { required: true, message: '二维码商品ID不能为空', trigger: 'blur' }
        ],
        prodName: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
        time: [{ required: true, message: '时间不能为空', trigger: 'blur' }],
        onOffStatus: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    getDropDown('goodsList').then((res) => {
      this.goodsList = res.data
    })
    this.getDicts('merchant_goods_qrcode_status').then((response) => {
      this.qrcodeStatusOptions = response.data
    })
  },
  methods: {
    /** 查询二维码商品列表 */
    getList() {
      this.loading = true
      listGoodsQrCode(this.queryParams).then((response) => {
        this.goodsQrCodeList = response.rows
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
      this.form = {
        goodsQrCodeId: null,
        goodsId: null,
        prodId: null,
        prodName: null,
        price: undefined,
        erpCode: null,
        prodCategory: null,
        prodBrand: null,
        attrName: null,
        onOffStatus: null,
        time: null,
        banner: null
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
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.goodsQrCodeId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.goodsQrCodeList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加二维码商品'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const goodsQrCodeId = row.goodsQrCodeId || this.ids
      getGoodsQrCode(goodsQrCodeId).then((response) => {
        this.form = {
          goodsQrCodeId: response.data.goodsQrCodeId,
          goodsId: response.data.goodsId,
          prodId: response.data.prodId,
          prodName: response.data.prodName,
          erpCode: response.data.erpCode,
          prodCategory: response.data.prodCategory,
          prodBrand: response.data.prodBrand,
          attrName: response.data.attrName,
          onOffStatus: response.data.onOffStatus,
          banner: response.data.banner,
          price: parseInt(response.data.price) / 100,
          time: [response.data.beginTime, response.data.endTime]
        }
        this.open = true
        this.title = '修改二维码商品'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const type = this.form.goodsQrCodeId != null ? '修改' : '新增'
          this.$confirm(`是否确认${type}二维码商品?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const params = {
                ...this.form,
                price: this.form.price * 100,
                beginTime: this.form.time[0],
                endTime: this.form.time[1]
              }
              return this.form.goodsQrCodeId != null
                ? updateGoodsQrCode(params)
                : addGoodsQrCode(params)
            })
            .then(() => {
              this.msgSuccess(`${type}二维码商品成功`)
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const goodsQrCodeIds = row.goodsQrCodeId || this.ids
      const type =
        typeof goodsQrCodeIds === 'object'
          ? '批量删除'
          : '删除"' + row.prodName + '"'
      this.$confirm(`是否确认${type}二维码商品?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delGoodsQrCode(goodsQrCodeIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'merchant/goodsQrCode/export',
        {
          ...this.queryParams
        },
        `merchant_goodsQrCode.xlsx`
      )
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.goodsQrCodeList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
