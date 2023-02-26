<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['wms:orderout:add']"
          type="primary"
          size="mini"
          :disabled="ids.length === 0"
          @click="handleAdd"
        >新增出库记录
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
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="distribution">
        <el-input
          v-model="queryParams.distribution"
          placeholder="请输入配送员姓名或电话"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送组长" prop="leader">
        <el-input
          v-model="queryParams.params.leader"
          placeholder="请输入组长姓名或电话"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
        <el-form-item label="日期选择" prop="time">
          <el-date-picker
            v-model="queryParams.time"
            clearable
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
            v-hasPermi="['system:out:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-tabs v-model="queryParams.orderStatus" class="tabContainer" style="margin-top: 20px" type="card" @tab-click="tabCheck">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane v-for="dict in outStatusOptions" :key="dict.dictValue" :label="dict.dictLabel" :name="dict.dictValue" />
    </el-tabs>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      max-height="650"
      style="margin-top: 20px"
      :data="outList"
      :row-key="(row) => row.purchaseOrder.purchaseOrderId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" :selectable="(row) => row.purchaseOrder.orderStatus === 'confirm'" align="center" />
      <el-table-column label="采购订单号" align="center" prop="orderNo">
        <template slot-scope="scope">
          {{ scope.row.purchaseOrder.orderNo }}
        </template>
      </el-table-column>
      <el-table-column label="商品" align="center" prop="warehouseOrderOutBathNo">
        <template slot-scope="scope">
          <el-row v-for="item in scope.row.purchaseOrderGoodsList" :key="item.goodsId">
            <el-col :span="14">{{ item.goodsName }}</el-col>
            <el-col :span="8">{{ item.num }}</el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="下单日期 " align="center" prop="orderTiem">
        <template slot-scope="scope">
          {{ scope.row.purchaseOrder.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="所属区域" align="center" prop="shopName" />
      <el-table-column label="配送组长" align="center" prop="leadName" />
      <el-table-column label="配送员" align="center" prop="distribution">
        <template slot-scope="scope">
          {{ scope.row.purchaseOrder.distributionName }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template slot-scope="scope">
          {{ statusFormat(scope.row.purchaseOrder.orderStatus) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.purchaseOrder.orderStatus !== 'confirm'"
            v-hasPermi="['wms:orderout:edit']"
            size="mini"
            type="text"
            @click="handleDetails(scope.row, 'update')"
          >修改编码
          </el-button>
          <el-button
            v-if="scope.row.purchaseOrder.orderStatus !== 'confirm'"
            size="mini"
            type="text"
            @click="handleDetails(scope.row, 'details')"
          >出库详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <el-row>
      <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
        <el-checkbox
          v-model="checked"
          @change="toggleSelection"
        >当页全选</el-checkbox>
      </el-col>
      <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
        <el-button
          v-hasPermi="['system:out:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="11"> -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- </el-col>
    </el-row> -->

    <!-- 添加或修改出库记录对话框 -->
    <el-dialog title="出入库任务-拣货赋码" :visible.sync="open" width="1400px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="form.warehouseId"
            clearable
            placeholder="请选择仓库"
          >
            <el-option
              v-for="item in warehouseOptions"
              :key="item.warehouseId"
              :label="item.warehouseName"
              :value="item.warehouseId"
            />
          </el-select>
        </el-form-item>
        <el-row style="margin-top: 10px">
          <el-col
            :span="6"
            style="
            font-size: 15px;
            color: #333;
            padding-top: 5px;
            padding-left: 15px;
          "
          >操作批次：{{ form.batchNo }}</el-col>
          <!-- <el-col :span="8">
            <el-form-item label="操作类型" prop="outType">
              <el-select
                v-model="form.outType"
                placeholder="请选择操作类型"
              >
                <el-option
                  v-for="item in outTypeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col
            :span="8"
            style="font-size: 15px;color: #333;padding-top: 5px;padding-left: 15px;"
          >操作类型：订单出库</el-col>
          <el-col
            :span="4"
            style="font-size: 15px; color: #333; padding-top: 5px"
          >操作人：{{ form.operationName }}</el-col>
          <el-col :span="6">
            <el-form-item label="交接人" prop="distributionIds">
              <el-select
                v-model="form.distributionIds"
                clearable
                multiple
                placeholder="请选择交接人"
              >
                <el-option
                  v-for="item in formDistributionIds"
                  :key="item.distributionId"
                  :label="item.makiName"
                  :value="item.distributionId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-row style="border: 1px solid #efefef;text-align: center;padding: 10px 0;background: #e3e3e3;color: #333;font-size: 16px;">
        <el-col :span="4">订单号</el-col>
        <el-col :span="4">配送员</el-col>
        <el-col :span="4">产品名称</el-col>
        <el-col :span="4">数量</el-col>
        <el-col :span="4">赋码</el-col>
        <el-col :span="4">备注</el-col>
      </el-row>
      <div style="overflow-y: auto;height: 500px;">
        <div v-for="item in formData" :key="item.purchaseId" style="text-align: center;display: flex;border: 1px solid #efefef;border-top-style: none;">
          <div style="width: 16.66%;border-right: 1px solid #efefef;display: flex;">
            <div style="margin: auto;word-break: break-all;padding: 0 10px;">{{ item.purchaseId }}</div>
          </div>
          <div style="width: 16.66%;border-right: 1px solid #efefef;display: flex;">
            <div style="margin: auto;word-break: break-all;padding: 0 10px;">{{ item.distributionName }}</div>
          </div>
          <div style="width: 50%;">
            <div v-for="goods in item.goodsInfoList" :key="item.purchaseId + goods.goodsId" style="display: flex;flex-flow: wrap;border-right: 1px solid #efefef;border-bottom: 1px solid #efefef;">
              <div style="width: 33.33%;margin: auto 0;">{{ goods.goodsName }}</div>
              <div style="width: 66.66%;border-left: 1px solid #efefef;padding-bottom: 5px;">
                <div v-for="code in goods.codeList" :key="code.key" style="border-bottom: 1px solid #efefef;padding-left: 5px;">
                  <div style="display: flex;width: 100%;">
                    <div style="width: 50%;padding: 10px 0;">
                      <InputNumber v-model="code.num" style="width: 100%;" placeholder="数量" :min="0" :max="goods.num" :precision="0" />
                    </div>
                    <div :style="`${goods.codeList.length > 1 ? 'width: 40%' : 'width: 50%'};padding: 10px 0;`">
                      <el-input v-model="code.outCode" style="width: 78%;" placeholder="编码" />
                    </div>
                    <div v-if="goods.codeList.length > 1" style="width: 10%;padding: 10px 0;text-align: left;">
                      <i style="font-size: 22px; margin-top: 8px;cursor: pointer;" class="el-icon-remove-outline" @click="delCoding(item.purchaseId, goods.goodsId, code.key)" />
                    </div>
                  </div>
                </div>
                <div style="width: 100%;text-align: center;margin-top: 10px;">
                  <el-button
                    style="width: 95%;"
                    type="primary"
                    icon="el-icon-plus"
                    size="mini"
                    @click="addCoding(item.purchaseId, goods.goodsId)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div style="width: 16.66%;margin: auto 0;padding: 0 10px;">
            <el-input
              v-model="item.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注"
            /></div>
        </div>
        <el-row style="padding: 20px;border: 1px solid #efefef;border-top-style: none;color: #333;font-size: 15px;">
          <el-col :offset="4" :span="4" style="font-weight: bold;text-align: center;">合计</el-col>
          <el-col :span="8" style="text-align: center;line-height: 30px;">
            <el-row v-for="goods in sumNumber('form')" :key="goods.goodsId">
              <el-col :span="12">
                {{ goods.goodsName }}
              </el-col>
              <el-col :span="12">
                {{ goods.num }}
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="type === 'details' ? '出库详情' : '修改商品赋码'" :visible.sync="openDetails" width="1200px" append-to-body>
      <div style="font-size: 16px;color: #333;line-height: 40px;">
        <el-row>
          <el-col :span="8">仓库： {{ form.warehouseName }}</el-col>
          <el-col :span="8">任务批次：{{ form.warehouseOrderOutBathNo }}</el-col>
          <el-col :span="8">操作类型：{{ outTypeFormat(form.outType) }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="8">操作人：{{ form.operatorName }}</el-col>
          <el-col :span="8">交接人：{{ form.distributionInfos }}</el-col>
          <el-col :span="8">日期：{{ form.outTime }}</el-col>
        </el-row>
      </div>
      <el-row style="border: 1px solid #efefef;text-align: center;color: #333;font-size: 16px;width: calc(100% - 17px);">
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">订单号</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">配送员</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">产品名称</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">数量</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">赋码</el-col>
        <el-col :span="4" style="padding: 10px 0;">备注</el-col>
      </el-row>
      <div style="overflow-y: scroll;height: 500px;">
        <el-row v-for="item in form.orderDetails" :key="item.purcharseOrderNo" style="color: #333;font-size: 15px;display: flex;border: 1px solid #efefef;border-top-style: none;">
          <div style="width: 16.66%;border-right: 1px solid #efefef;display: flex;">
            <div style="margin: auto;word-break: break-all;padding: 0 10px;">{{ item.purcharseOrderNo }}</div>
          </div>
          <div style="width: 16.66%;border-right: 1px solid #efefef;display: flex;">
            <div style="margin: auto;padding: 0 10px;">{{ item.distributionName }}</div>
          </div>
          <div style="text-align: center;width: 50%;border-right: 1px solid #efefef;">
            <div v-for="(goods,goodsIndex) in item.goodsList" :key="item.purcharseOrderNo + goods.goodsId" :style="`display: flex;width: 100%;${goodsIndex < item.goodsList.length - 1 ? 'border-bottom: 1px solid #efefef;': ''}`">
              <div style="text-align: center;width: 33.33%;margin: auto;">{{ goods.goodsName }}</div>
              <div style="width: calc(66.66% + 1px);">
                <div v-for="(code,codeIndex) in goods.codeResponses" :key="item.purcharseOrderNo + goods.goodsId + codeIndex" style="display: flex;">
                  <div :style="`width: 50%;border-left: 1px solid #efefef;padding: 10px 0;${codeIndex < goods.codeResponses.length - 1 ? 'border-bottom: 1px solid #efefef;': ''}`">{{ code.num }}</div>
                  <div :style="`width: 50%;border-left: 1px solid #efefef;padding: 10px 0;word-break: break-all;${codeIndex < goods.codeResponses.length - 1 ? 'border-bottom: 1px solid #efefef;': ''}`">
                    <el-input v-if="type === 'update'" v-model="code.outCode" style="width: 80%;" placeholder="编码" />
                    <span v-else>{{ code.outCode }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="width: 16.66%;display: flex;">
            <div style="margin: auto;white-space: pre-wrap;word-break: break-all;">{{ item.remark }}</div>
          </div>
        </el-row>
        <el-row style="padding: 20px;border: 1px solid #efefef;border-top-style: none;color: #333;font-size: 15px;">
          <el-col :offset="4" :span="4" style="font-weight: bold;text-align: center;">合计</el-col>
          <el-col :span="8" style="text-align: center;line-height: 30px;">
            <el-row v-for="goods in sumNumber('details')" :key="goods.goodsId">
              <el-col :span="12">
                {{ goods.goodsName }}
              </el-col>
              <el-col :span="12">
                {{ goods.num }}
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>

      <div v-if="type === 'details'" style="text-align: center;margin-top: 20px;">
        <el-button
          style="width: 300px;"
          type="primary"
          @click="handlePrint(form.warehouseOrderOutId)"
        >打印
        </el-button>
      </div>
      <div v-else slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitUpdate"
        >确 定</el-button>
        <el-button @click="detailsCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Cascader, InputNumber } from 'ant-design-vue'
import { addOut, delOut, getOut, listOut, updateOut, batchno, distributions } from '@/api/wms/out'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'
import moment from 'moment'

export default {
  name: 'Out',
  components: {
    Cascader,
    InputNumber
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
      // 配送员
      distributionOptions: [],
      // 出库状态
      outStatusOptions: [],
      // 操作类型
      outTypeOptions: [],
      // 订单状态
      orderStatusOptions: [],
      // 表单交接人
      formDistributionIds: [],
      // 总条数
      total: 0,
      // 出库记录表格数据
      outList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      openDetails: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        params: {
          leader: null
        },
        orgId: null,
        orderNo: null,
        distribution: null,
        time: null,
        orderStatus: 'all',
        orderByColumn: 'order_time',
        isAsc: 'desc'
      },
      // 表单参数
      form: {},
      formData: [],
      // 表单校验
      rules: {
        warehouseId: [
          { required: true, message: '出库仓库不能为空', trigger: 'blur' }
        ],
        outType: [
          { required: true, message: '操作类型不能为空', trigger: 'blur' }
        ],
        distributionIds: [
          { required: true, message: '交接人不能为空', trigger: 'blur' }
        ]
      },
      type: null
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('warehouse').then((res) => {
      if (res.code === 200) {
        this.warehouseOptions = res.data
      }
    })
    getDropDown('distributionList').then((res) => {
      if (res.code === 200) {
        this.distributionOptions = res.data
      }
    })
    this.getDicts('warehouse_order_out_status').then((response) => {
      this.outStatusOptions = response.data
    })
    this.getDicts('warehouse_order_out_type').then((response) => {
      this.outTypeOptions = response.data
    })
    this.getDicts('purchase_status').then((response) => {
      this.orderStatusOptions = response.data
    })
    this.getList()
  },
  methods: {
    sumNumber(type) {
      let numberArr = []
      if (type === 'details') {
        if (!this.form.orderDetails || this.form.orderDetails.length === 0) return
        numberArr = this.form.orderDetails.map(item => {
          return item.goodsList.map(goodsItem => {
            return goodsItem.codeResponses.map(codeItem => {
              return {
                num: parseInt(codeItem.num),
                goodsId: goodsItem.goodsId,
                goodsName: goodsItem.goodsName
              }
            })
          })
        }).flat(Infinity)
      } else if (type === 'form') {
        if (this.formData.length === 0) return
        numberArr = this.formData.map(item => {
          return item.goodsInfoList.map(goodsItem => {
            return goodsItem.codeList.map(codeItem => {
              return {
                num: parseInt(codeItem.num),
                goodsId: goodsItem.goodsId,
                goodsName: goodsItem.goodsName
              }
            })
          })
        }).flat(Infinity)
      }
      return this.arrGroup(numberArr)
    },
    arrGroup(arr) {
      const id = Array.from(new Set(arr.map(item => item.goodsId)))
      return id.map(item => {
        const goodsArr = arr.filter(fItem => item === fItem.goodsId)
        const num = goodsArr.map(gItem => gItem.num).reduce((acr, cur) => {
          return acr + cur
        })
        return {
          ...goodsArr[0],
          num
        }
      })
    },
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 订单状态
    statusFormat(status) {
      return this.selectDictLabel(this.orderStatusOptions, status)
    },
    outTypeFormat(outType) {
      return this.selectDictLabel(this.outTypeOptions, outType)
    },
    /** 查询出库记录列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (!params.params.leader) {
        delete params.params
      }
      if (params.time && params.time.length > 0) {
        params['orderBeginTime'] = moment(params.time[0]).startOf('days').format('YYYY-MM-DD HH:mm:ss')
        params['orderEndTime'] = moment(params.time[1]).endOf('days').format('YYYY-MM-DD HH:mm:ss')
      }
      if (params.orderStatus === 'all') {
        delete params.orderStatus
      }
      delete params.time
      listOut(params).then((response) => {
        this.outList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 跳转打印 */
    handlePrint(warehouseOrderOutId) {
      const routeData = this.$router.resolve({ path: `/wmsPrint?type=out&purchaseId=${warehouseOrderOutId}` })
      window.open(routeData.href, '_blank')
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {}
      this.formData = []
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
        params: {
          leader: null
        },
        orgId: null,
        orderNo: null,
        distribution: null,
        time: null,
        orderStatus: 'all',
        orderByColumn: 'order_time',
        isAsc: 'desc'
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.purchaseOrder.purchaseOrderId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.outList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      const selData = this.outList.filter(item => this.ids.includes(item.purchaseOrder.purchaseOrderId))
      this.formData = selData.map(item => {
        return {
          purchaseId: item.purchaseOrder.purchaseOrderId,
          distributionName: item.purchaseOrder.distributionName,
          goodsInfoList: item.purchaseOrderGoodsList.map(goodsItem => {
            return {
              goodsId: goodsItem.goodsId,
              goodsName: goodsItem.goodsName,
              num: goodsItem.num,
              goodsSkuId: 0,
              codeList: [{ key: this.randomNumber(10), num: goodsItem.num, outCode: null }]
            }
          }),
          remark: null
        }
      })
      Promise.all([batchno(), distributions(this.ids)]).then(res => {
        this.form = {
          ...res[0].data
        }
        this.formDistributionIds = res[1].data
        this.open = true
      })
    },
    // 增加多个编码
    addCoding(purchaseId, goodsId) {
      this.formData = this.formData.map(item => {
        if (purchaseId !== item.purchaseId) return item
        return {
          ...item,
          goodsInfoList: item.goodsInfoList.map(goodsItem => {
            if (goodsId !== goodsItem.goodsId) return goodsItem
            return {
              ...goodsItem,
              codeList: goodsItem.codeList.concat([{ key: this.randomNumber(10), num: goodsItem.num, outCode: null }])
            }
          })
        }
      })
    },
    // 删除编码
    delCoding(purchaseId, goodsId, key) {
      this.formData = this.formData.map(item => {
        if (purchaseId !== item.purchaseId) return item
        return {
          ...item,
          goodsInfoList: item.goodsInfoList.map(goodsItem => {
            if (goodsId !== goodsItem.goodsId) return goodsItem
            return {
              ...goodsItem,
              codeList: goodsItem.codeList.filter(codingItem => codingItem.key !== key)
            }
          })
        }
      })
    },
    // 计算当前最大输入数值
    countNumber(data, index) {
      // 总数值
      const total = data.total
      // 已用数值
      let usedNumber = 0
      data.coding.map(item => {
        if (item.number) {
          usedNumber += item.number
        }
      })
      // 已输入数值控件个数
      let alreadyEnter = 0
      data.coding.map(item => {
        if (item.number) {
          alreadyEnter += 1
        }
      })
      // 可用数值
      const available = total - usedNumber
      if (available === 0) {
        return data.coding[index].number
      }
      // 空值控件
      const noControls = data.coding.length - alreadyEnter
      // 多余数值
      const overNumber = available > 0 ? available % noControls : 0
      // 每个控件最大值
      let max = (available - overNumber) / noControls
      if (index === data.coding.length - 1) {
        max += overNumber
      }
      return data.coding.length === 1 ? total : max
    },
    /** 修改按钮操作 */
    handleDetails(row, type) {
      // this.reset()
      getOut(row.purchaseOrder.purchaseOrderId).then((response) => {
        this.form = {
          orderDetails: response.data.orderDetails,
          warehouseOrderOutId: response.data.warehouseOrderOutId,
          warehouseName: response.data.warehouseName,
          warehouseOrderOutBathNo: response.data.warehouseOrderOutBathNo,
          outType: response.data.outType,
          outTime: response.data.outTime,
          operatorName: response.data.operatorName,
          distributionInfos: response.data.distributionInfos.map(item => item.distributionName).toString()
        }
        this.openDetails = true
        this.type = type
      })
    },
    detailsCancel() {
      this.form = {}
      this.type = null
      this.openDetails = false
    },
    // 生产随机数
    randomNumber(len) {
      const chars = '0123456789'
      const maxPos = chars.length
      let str = ''
      for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return str
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const codeCheck = this.formData.map(item => {
            return item.goodsInfoList.map(goodsItem => {
              return goodsItem.codeList.map(codeItem => codeItem.outCode ? codeItem.outCode.replace(/\s+/g, '') : '')
            }).flat(Infinity)
          }).flat(Infinity)
          const numCheck = this.formData.map(item => {
            return item.goodsInfoList.map(goodsItem => {
              return goodsItem.codeList.map(codeItem => codeItem.num)
            }).flat(Infinity)
          }).flat(Infinity)
          const beyondArr = []
          this.formData.map(item => {
            item.goodsInfoList.map(goodsItem => {
              const total = goodsItem.codeList.map(codeItem => codeItem.num).reduce((acr, cur) => {
                return acr + cur
              })
              if (goodsItem.num < total) {
                beyondArr.push(goodsItem.goodsId)
              }
            })
          })
          if (codeCheck.includes('')) {
            return this.msgError('存在未输入code商品~')
          } else if (numCheck.includes(0)) {
            return this.msgError('存在未填写数量商品~')
          } else if (beyondArr.length > 0) {
            return this.msgError('存在超出总数量商品~')
          }

          const params = {
            ...this.form,
            outType: 'order_out',
            warehouseOrderOutBathNo: this.form.batchNo,
            detailList: this.formData
          }
          delete params.batchNo
          delete params.operationName

          this.$confirm(`是否确认新增出库记录?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              return addOut(params)
            })
            .then((res) => {
              this.msgSuccess(`新增出库记录成功`)
              this.open = false
              this.getList()
              this.$confirm('是否跳转打印界面，打印本次出库任务?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                const path = `/wmsPrint`
                this.$router.push({
                  path,
                  query: {
                    type: 'out',
                    purchaseId: res.data
                  }
                })
              })
            })
        }
      })
    },
    submitUpdate() {
      const codeCheck = this.form.orderDetails.map(item => {
        return item.goodsList.map(goodsItem => {
          return goodsItem.codeResponses.map(codeItem => codeItem.outCode ? codeItem.outCode.replace(/\s+/g, '') : '')
        }).flat(Infinity)
      }).flat(Infinity)
      if (codeCheck.includes('')) {
        return this.msgError('存在未输入code商品~')
      }
      this.$confirm(`是否确认修改商品编码?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          warehouseOrderOutId: this.form.warehouseOrderOutId,
          goodsCodes: this.form.orderDetails.map(item => {
            return item.goodsList.map(goodsItem => {
              return goodsItem.codeResponses.map(codeItem => {
                return {
                  outCode: codeItem.outCode,
                  warehouseOrderOutDetailCodeId: codeItem.warehouseOrderOutDetailCodeId
                }
              }).flat(Infinity)
            }).flat(Infinity)
          }).flat(Infinity)
        }
        return updateOut(params)
      }).then(() => {
        this.msgSuccess(`修改商品编码成功`)
        this.detailsCancel()
        this.getList()
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/out/export', this.queryParams)
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.outList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
<style scoped lang="scss">
 .table_title {
    display: flex;
    text-align: center;
    padding: 10px 0;
    background: #e3e3e3;
 }
</style>
