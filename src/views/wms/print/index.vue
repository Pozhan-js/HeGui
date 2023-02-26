<template>
  <div class="app-container">
    <div v-if="type === 'warehousing'">
      <el-row>
        <div style="font-size: 20px;font-weight: bold;">出入库任务-入库</div>
      </el-row>
      <el-row style="margin: 10px 0;font-size: 16px;font-weight: bold;">
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
    </div>

    <div v-else>
      <div style="text-align: center;font-size: 24px;font-weight: bold;margin-bottom: 20px;">出库交接单</div>
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

      <el-row style="border: 1px solid #efefef;text-align: center;color: #333;font-size: 16px;">
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">订单号</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">配送员</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">产品名称</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">数量</el-col>
        <el-col :span="4" style="border-right: 1px solid #efefef;padding: 10px 0;">赋码</el-col>
        <el-col :span="4" style="padding: 10px 0;">备注</el-col>
      </el-row>

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
                  {{ code.outCode }}
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

      <!-- <el-table
        :data="form.orderDetails"
        border
      >
        <el-table-column prop="purcharseOrderNo" align="center" label="订单号" />
        <el-table-column prop="distributionName" align="center" label="配送员" />
        <el-table-column v-for="item in goodsTitle" :key="item.goodsId" :prop="item.goodsId" align="center" :label="item.goodsName">
          <template slot-scope="scope">
            <el-row v-for="(goodsItem, index) in scope.row[item.goodsId]" :key="goodsItem.outCode + index">
              <el-col :span="16">{{ goodsItem.outCode }}</el-col>
              <el-col :span="8">{{ goodsItem.num }}</el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column prop="remark" align="center" label="备注" />
      </el-table> -->
    </div>
    <el-row style="text-align: center;">
      <el-col :span="14" :offset="6">
        <el-button
          class="print"
          type="primary"
          block
          @click="print()"
        >
          打 印
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getOrderIN, warehousePrint } from '@/api/wms/OrderIN'
import { getOrderOut, outPrint } from '@/api/wms/out'

export default {
  name: 'Print',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      orderTypeOptions: [],
      outTypeOptions: [],
      goodsTitle: [],
      form: {},
      type: this.$route.query.type
    }
  },
  created() {
    if (this.$route.query.type) {
      if (this.$route.query.type === 'warehousing') {
        this.warehouseDetails(this.$route.query.warehouseOrderInId)
      } else if (this.$route.query.type === 'out') {
        this.outDetails(this.$route.query.purchaseId)
      }
    }
    this.getDicts('warehouse_order_in_type').then((response) => {
      this.orderTypeOptions = response.data
    })
    this.getDicts('warehouse_order_out_type').then((response) => {
      this.outTypeOptions = response.data
    })
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
    // 参数系统内置字典翻译
    typeFormat(val, column) {
      return this.selectDictLabel(this.orderTypeOptions, val)
    },
    outTypeFormat(outType) {
      return this.selectDictLabel(this.outTypeOptions, outType)
    },
    /** 查询详情 */
    warehouseDetails(warehouseOrderInId) {
      getOrderIN(warehouseOrderInId).then(response => {
        this.form = response.data
      })
    },
    outDetails(purchaseOrderId) {
      getOrderOut(purchaseOrderId).then((response) => {
        // this.goodsTitle = response.data.orderDetails.map(item => {
        //   return item.goodsList.map(goodsItem => {
        //     return {
        //       goodsId: goodsItem.goodsId,
        //       goodsName: goodsItem.goodsName
        //     }
        //   })
        // }).flat(Infinity)
        // const orderDetails = response.data.orderDetails.map(item => {
        //   const dataItem = {
        //     purcharseOrderNo: item.purcharseOrderNo,
        //     distributionName: item.distributionName,
        //     remark: item.remark
        //   }
        //   item.goodsList.map(goodsItem => {
        //     dataItem[goodsItem.goodsId] = goodsItem.codeResponses
        //   })
        //   return dataItem
        // })
        // this.form = {
        //   orderDetails,
        //   warehouseName: response.data.warehouseName,
        //   warehouseOrderOutBathNo: response.data.warehouseOrderOutBathNo,
        //   outType: response.data.outType,
        //   outTime: response.data.outTime,
        //   operatorName: response.data.operatorName,
        //   distributionInfos: response.data.distributionInfos.map(item => item.distributionName).toString()
        // }
        this.form = {
          ...response.data,
          distributionInfos: response.data.distributionInfos.map(item => item.distributionName).toString()
        }
        this.openDetails = true
      })
    },
    print() {
      if (this.type === 'out') {
        outPrint(this.$route.query.purchaseId).then(res => {
          window.print()
        })
      } else if (this.type === 'warehousing') {
        warehousePrint(this.$route.query.warehouseOrderInId).then(res => {
          window.print()
        })
      }
    }
  }
}
</script>
<style scoped lang="scss">
.print {
  width: 600px;
  margin-top: 50px;
  @media print {
    display: none;
  }
}
</style>
