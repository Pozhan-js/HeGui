<template>
  <div class="app-container">
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
      <el-form-item label="订单号" prop="purchaseNo">
        <el-input
          v-model="queryParams.purchaseNo"
          placeholder="请输入订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货品编码" prop="outCode">
        <el-input
          v-model="queryParams.outCode"
          placeholder="请输入货品编码"
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
            v-hasPermi="['wms:record:export']"
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
      :data="recordList"
      :row-key="(row) => row.purchaseNo"
    >
      <el-table-column label="采购订单号" align="center" prop="purchaseNo" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="仓库" align="center" fixed prop="warehouseName" />
      <el-table-column label="赋码日期" align="center" prop="codeDate" />
      <el-table-column label="配送员" align="center" prop="distributionName" />
      <el-table-column label="商品名称" align="center" prop="goodsName">
        <template slot-scope="scope">
          <div v-for="goodsItem in scope.row.goodsList" :key="scope.row.purchaseNo + goodsItem.goodsId" :style="`line-height: ${goodsItem.codeList.length * 25}px;height:${goodsItem.codeList.length * 25}px`">{{ goodsItem.goodsName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="num">
        <template slot-scope="scope">
          <div v-for="goodsItem in scope.row.goodsList" :key="scope.row.purchaseNo + goodsItem.goodsId" style="`line-height: 25px;height:25px`">
            <div v-for="(code, index) in goodsItem.codeList" :key="index">{{ code.num }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="赋码" align="center" prop="outCode">
        <template slot-scope="scope">
          <div v-for="goodsItem in scope.row.goodsList" :key="scope.row.purchaseNo + goodsItem.goodsId" style="`line-height: 25px;height:25px`">
            <div v-for="(code, index) in goodsItem.codeList" :key="index">{{ code.outCode }}</div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column v-for="item in goodsTitle" :key="item.goodsId" :prop="item.goodsId" align="center" :label="item.goodsName" width="300">
        <template slot-scope="scope">
          <div v-if="scope.row[item.goodsId]">
            <el-row v-for="goodsItem in scope.row[item.goodsId].codeList" :key="goodsItem.outCode">
              <el-col :span="16">{{ goodsItem.outCode }}</el-col>
              <el-col :span="8">{{ goodsItem.num }}</el-col>
            </el-row>
          </div>
        </template>
      </el-table-column> -->
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['wms:orderout:edit']"
            size="mini"
            type="text"
            @click="handleDetails(scope.row, 'update')"
          >修改编码
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleDetails(scope.row, 'details')"
          >出库详情
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
            <div v-for="(goods,goodsIndex) in item.goodsList" :key="item.purcharseOrderNo + goods.goodsId" :style="`display: flex;width: 100%;${goodsIndex < item.goodsList.length - 1? 'border-bottom: 1px solid #efefef;': ''}`">
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
            <el-row v-for="goods in sumNumber()" :key="goods.goodsId">
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
import { Cascader } from 'ant-design-vue'
import { listRecord } from '@/api/wms/record'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { getOut, updateOut } from '@/api/wms/out'

export default {
  name: 'Record',
  components: {
    Cascader
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织机构数据
      orgOptions: [],
      outTypeOptions: [],
      // 总条数
      total: 0,
      // 出库详情表格数据
      recordList: [],
      // 商品标题
      goodsTitle: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        purchaseNo: null,
        outCode: null,
        distribution: null,
        time: null,
        orderByColumn: 'warehouse_order_out_purchase_relation_id',
        isAsc: 'desc'
      },
      openDetails: false,
      type: null,
      // 表单参数
      form: {}
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('warehouse_order_out_type').then((response) => {
      this.outTypeOptions = response.data
    })
    this.getList()
  },
  methods: {
    sumNumber() {
      if (!this.form.orderDetails || this.form.orderDetails.length === 0) return
      return this.arrGroup(this.form.orderDetails.map(item => {
        return item.goodsList.map(goodsItem => {
          return goodsItem.codeResponses.map(codeItem => {
            return {
              num: parseInt(codeItem.num),
              goodsId: goodsItem.goodsId,
              goodsName: goodsItem.goodsName
            }
          })
        })
      }).flat(Infinity))
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
    outTypeFormat(outType) {
      return this.selectDictLabel(this.outTypeOptions, outType)
    },
    /** 查询出库详情列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (params.time && params.time.length > 0) {
        params.params = {
          beginTime: moment(params.time[0]).startOf('days').format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment(params.time[1]).endOf('days').format('YYYY-MM-DD HH:mm:ss')
        }
      }
      delete params.time
      listRecord(params).then((response) => {
        const goodsTitle = response.rows.map(item => {
          return item.goodsList.map(goodsItem => {
            return {
              goodsId: goodsItem.goodsId,
              goodsName: goodsItem.goodsName
            }
          })
        }).flat(Infinity)
        const goodsIdArr = Array.from(new Set(goodsTitle.map(item => item.goodsId)))
        this.goodsTitle = goodsIdArr.map(item => {
          return goodsTitle.filter(fItem => fItem.goodsId === item)[0]
        })
        this.recordList = response.rows
        // .map(item => {
        //   const dataParams = {
        //     purchaseNo: item.purchaseNo,
        //     purchaseId: item.purchaseId,
        //     codeDate: item.codeDate,
        //     orgName: item.orgName,
        //     distributionName: item.distributionName
        //   }
        //   goodsIdArr.map(goodsItem => {
        //     dataParams[goodsItem] = item.goodsList.filter(fItem => fItem.goodsId === goodsItem)[0]
        //   })
        //   return dataParams
        // })
        this.total = response.total
        this.loading = false
      })
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
        purchaseNo: null,
        outCode: null,
        distribution: null,
        time: null,
        orderByColumn: 'warehouse_order_out_purchase_relation_id',
        isAsc: 'desc'
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 跳转打印 */
    handlePrint(warehouseOrderOutId) {
      const routeData = this.$router.resolve({ path: `/wmsPrint?type=out&purchaseId=${warehouseOrderOutId}` })
      window.open(routeData.href, '_blank')
    },
    /** 修改按钮操作 */
    handleDetails(row, type) {
      getOut(row.purchaseId).then((response) => {
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
      this.download('wms/record/export', this.queryParams)
    }
  }
}
</script>
