<template>
  <div class="app-container">
    <el-form ref="form" v-loading="loading" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="类型" prop="scoreGoodsType">
        <div>
          <el-radio v-model="formData.scoreGoodsType" :disabled="isUpdate" label="coupon" style="width: 55px">优惠券</el-radio>
          <el-button :disabled="isUpdate && isGoodType" type="text" @click="handleOpen('coupon')">修改优惠券</el-button>
        </div>
        <div>
          <el-radio v-model="formData.scoreGoodsType" :disabled="isUpdate" label="goods" style="width: 55px">商品</el-radio>
          <el-button :disabled="isUpdate && !isGoodType" type="text" @click="handleOpen('goods')">修改商品</el-button>
        </div>
        <div class="table-container" style="max-width: 600px">
          <el-row class="table-header">
            <el-col :span="8">{{ isGoodType ? '商品' : '优惠券' }}名称</el-col>
            <el-col :span="6">{{ isGoodType ? '价格（元）' : '优惠金额' }}</el-col>
            <el-col :span="5">库存（可用）</el-col>
            <el-col :span="5">操作</el-col>
          </el-row>
          <el-row v-if="checkedItem">
            <el-col :span="8">
              <cover :name="checkedItem.goodsName" :type="checkedItem.type" :cover="checkedItem.cover"/>
            </el-col>
            <el-col :span="6">{{ checkedItem.price || checkedItem.couponRule }}</el-col>
            <el-col :span="5">{{ checkedItem.limitsGoodsTotal }}</el-col>
            <el-col :span="5"><el-button type="text" @click="checkedItem = null">移除</el-button></el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item label="有效期" prop="expiryBeginTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="formData.expiryBeginTime"
          :e-time.sync="formData.expiryEndTime"
        />
      </el-form-item>
      <el-form-item label="兑换总量" prop="limitsGoodsTotal">
        <el-input-number v-model="formData.limitsGoodsTotal" :max="checkedItem && checkedItem.limitsGoodsTotal" :step="1" step-strictly />
      </el-form-item>
      <el-form-item label="每人总限兑量" prop="limitsUserTotal">
        <el-input-number v-model="formData.limitsUserTotal" :min="1" :max="checkedItem && checkedItem.limitsUserTotal || formData.limitsGoodsTotal" :step="1" step-strictly />
      </el-form-item>
      <el-form-item label="需要积分" prop="amountNum">
        <el-input-number v-model="formData.scoreNum" :step="1" step-strictly />
        <label class="el-form-item__label" style="float: none"> + 需要现金（元）</label>
        <el-input-number v-model="formData.amountNum" :precision="2" />
      </el-form-item>
      <el-form-item label="每人每日限兑量" prop="limitsUserDayTotal">
        <el-input-number v-model="formData.limitsUserDayTotal" :min="1" :max="checkedItem && checkedItem.limitsUserDayTotal || formData.limitsGoodsTotal" :step="1" step-strictly />
      </el-form-item>
      <el-form-item label="成本价（元）" prop="cost">
        <el-input-number v-model="formData.cost" :precision="2" />
      </el-form-item>
      <el-form-item label="是否启用" prop="status">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="2" />
      </el-form-item>
    </el-form>
    <div>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="() => $router.back()">取 消</el-button>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="isGoodType ? '选择可用商品' : '选择可用优惠券'">
      <pro-table
        ref="proTableRef"
        :api-config="{ url: tableUrl }"
        :params="tableParams"
        :columns="columns"
        manual-request
        :row-key="rowKey"
        container-class-name="pro-table-container"
        @selection-change="handleTableSelection"
      >
        <template #table-footer-btns="{checkedList}">
          <el-button :disabled="!checkedList.length" type="primary" size="small" style="position: absolute; left: 15px" @click="handleConfirmDialog(checkedList)">确定</el-button>
          <el-button size="small" @click="dialogVisible = false">取消</el-button>
        </template>
      </pro-table>
    </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import RangePicker from '@/components/RangePicker.vue'
import Cover from './cover.vue'
import { addScoreGoods, getScoreGoodsInfo } from '@/api/marketing/scoreMall'
import Decimal from 'decimal.js'
import { filterNoUndefined } from '@/utils'

export default {
  components: {
    RangePicker,
    ProTable,
    Cover
  },
  data() {
    const scoreGoodsTypeValidate = (rule, value, callback) => {
      if (!this.checkedItem) {
        const text = this.isGoodType ? '请先选择一个商品' : '请先选择一张优惠券'
        callback(new Error(text))
      } else {
        callback()
      }
    }

    const limitsGoodsTotalValidate = (rule, value, callback) => {
      const max = this.isGoodType ? +this.checkedItem?.totalStock : +this.checkedItem?.remainingNum
      if (value > max) {
        callback(new Error('兑换总量不能大于可用库存'))
      } else {
        callback()
      }
    }

    const amountNumValidate = (rule, value, callback) => {
      if (!this.formData.scoreNum && !value) {
        callback(new Error('积分或现金不能为空'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      submitLoading: false,
      formData: {
        scoreGoodsType: 'coupon',
        expiryBeginTime: undefined,
        expiryEndTime: undefined,
        limitsGoodsTotal: undefined,
        limitsUserTotal: undefined,
        scoreNum: undefined,
        amountNum: undefined,
        limitsUserDayTotal: undefined
      },
      formRules: {
        scoreGoodsType: [{ validator: scoreGoodsTypeValidate, trigger: 'change' }],
        expiryBeginTime: [{ required: true, message: '有效期不能为空', trigger: 'blur' }],
        limitsUserTotal: [{required: true, message: '每人总限兑量不能为空', trigger: 'blur'}],
        limitsUserDayTotal: [{required: true, message: '每人每日限兑量不能为空', trigger: 'blur'}],
        limitsGoodsTotal: [{ required: true, message: '兑换总量不能为空', trigger: 'blur' }, { validator: limitsGoodsTotalValidate, trigger: 'blur' }],
        amountNum: [{ validator: amountNumValidate, trigger: 'blur' }]
      },
      dialogVisible: false,
      checkedItem: null
    }
  },
  computed: {
    // name, price, stock, userLimit, userDailyLimit, goodsId, goodsType
    // normalizedExtendGoods() {
    //   if (this.isUpdate) {
    //     return {
    //       name: this.checkedItem.goodsName,
    //       price: this.checkedItem.price,
    //       stock: this.checkedItem.limitsGoodsTotal,
    //       userLimit: this.checkedItem.limitsUserDayTotal,
    //     }
    //   }
    //   if (this.isGoodsType) {
    //     return {
    //       name: t  his.checkedItem?.name,
    //       price: this.checkedItem?.price,
    //       stock: this.checkedItem?.totalStock,
    //       userLimit: this.checkedItem?.userLimit,
    //       userDailyLimit: this.checkedItem?.userDailyLimit,
    //       goodsId: this.checkedItem?.id,
    //       goodsType: this.checkedItem?.type
    //     }
    //   } else {
    //     return {
    //       name: this.checkedItem?.name,
    //       price: this.checkedItem?.price,
    //       stock: this.checkedItem?.remainingNum,
    //       userLimit: this.checkedItem?.userLimit,
    //       userDailyLimit: this.checkedItem?.userDailyLimit,
    //       goodsId: this.checkedItem?.id,
    //       goodsType: this.checkedItem?.type
    //     }
    //   }
    // },
    isGoodType() {
      return this.formData.scoreGoodsType === 'goods'
    },
    isUpdate() {
      return !!this.formData.scoreGoodsId
    },
    tableUrl() {
      if (this.isGoodType) {
        return '/goods/selectGoodsInfoListCoupon'
      } else {
        return '/marketing/couponInfo/can/issue/list'
      }
    },
    rowKey() {
      if (this.isGoodType) {
        return 'goodsId'
      } else {
        return 'couponId'
      }
    },
    tableParams() {
      if (this.isGoodType) {
        return {
          isShelves: 1,
          issueCouponFlag: undefined
        }
      } else {
        return {
          isShelves: undefined,
          issueCouponFlag: 'score_mall'
        }
      }
    },
    columns() {
      if (this.isGoodType) {
        const renderGroup = ({ record }) => {
          return record.goodsGroupList?.map(i => i.groupName).join('，')
        }
        const renderActivityList = (h) => (
          <RouterLink to='/marketing/coupons/marketing'>
            <ElButton type='text'>优惠券</ElButton>
          </RouterLink>
        )

        return [
          { prop: 'selection', width: 55, hideInSearch: true, tableColumnProps: { type: 'selection' }},
          { label: '商品名称', prop: 'goodsName', span: 8 },
          { label: '商品分组', prop: 'groupId', hideInSearch: true, renderText: renderGroup },
          { label: '库存', prop: 'totalStock', hideInSearch: true },
          { label: '价格（元）', prop: 'price', valueType: 'money', hideInSearch: true },
          { label: '已参加的优惠', prop: '', hideInSearch: true, render: renderActivityList }
        ]
      } else {
        const renderThreshold = ({ record }) => {
          if (record.useThreshold === 'full_yuan') {
            return `满${this.toDecimal2(record.orderFull / 100)}元`
          } else {
            return '无门槛'
          }
        }
        const renderActivityList = (h, { record }) => (
          <div>
            {
              record.activityList?.map(item => (<div>{item.activityName}</div>))
            }
          </div>
        )

        return [
          { prop: 'selection', width: 55, hideInSearch: true, tableColumnProps: { type: 'selection' }},
          { label: '优惠券名称', prop: 'couponName', span: 8 },
          { label: '类型', prop: 'type', valueType: 'dictSelect', hideInSearch: true, fieldProps: { dict: 'coupon_type' }},
          { label: '门槛', prop: 'useThreshold', hideInSearch: true, renderText: renderThreshold },
          { label: '优惠', prop: 'couponDiscountFlag', hideInSearch: true },
          { label: '总张数', prop: 'totalNumberSheet', hideInSearch: true },
          { label: '可兑换张数', prop: 'remainingNum', hideInSearch: true },
          { label: '总限领', prop: 'limitedNumberSheet', hideInSearch: true },
          { label: '每日限领', prop: 'dailyLimit', hideInSearch: true },
          { label: '已参加的活动', prop: 'activityList', hideInSearch: true, render: renderActivityList }
        ]
      }
    },
  },
  watch: {
    checkedItem(item) {
      // 如果清空值，需要把这几个字段从表单中清除
      if (item == null) {
        this.setCheckedForForm()
        this.formData.goodsId = undefined
      }
    },
    'formData.scoreGoodsType'(next, prev) {
      if (!this.isUpdate) {
        this.checkedItem = null
        
      }
    }
  },
  created() {
    if (this.$route.name === 'Update') {
      this.getInfo(this.$route.query.scoreGoodsId)
    }
  },
  methods: {
    setCheckedForForm(item) {
      this.formData.limitsGoodsTotal =  item?.limitsGoodsTotal
      this.formData.limitsUserTotal = item?.limitsUserTotal
      this.formData.limitsUserDayTotal = item?.limitsUserDayTotal
    },
    getInfo(scoreGoodsId) {
      this.loading = true
      getScoreGoodsInfo(scoreGoodsId)
        .then(res => {
          const { goodsName, price, totalStock, limitedNumberSheet, dailyLimit, thumbnail, scoreGoodsType } = res.data
          this.checkedItem = {
            goodsName,
            price: res.data.scoreGoodsType === 'goods' ? this.toDecimal2(price / 100) : price,
            limitsGoodsTotal: totalStock,
            limitsUserTotal: limitedNumberSheet,
            limitsUserDayTotal: dailyLimit,
            cover: thumbnail,
            type: scoreGoodsType
          }
          this.formData = {
            ...res.data,
            amountNum: res.data.amountNum / 100,
            cost: res.data.cost / 100
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const {
            limitsUserDayTotal = 0,
            limitsUserTotal = 0,
            limitsGoodsTotal = 0,
          } = this.formData
          if (+limitsUserTotal > +limitsGoodsTotal) {
            return this.msgError('每人总限兑量不能大于兑换总量')
          }
          if (+limitsUserDayTotal > +limitsGoodsTotal) {
            return this.msgError('每人每日限兑量不能大于兑换总量')
          }
          const { scoreNum, amountNum } = this.formData
          if (scoreNum && amountNum) {
            this.confirmForm()
          } else {
            this.$confirm(`是否只使用 ${scoreNum || amountNum} ${scoreNum ? '积分' : '现金（元）'}购买?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                this.confirmForm()
              })
          }
        }
      })
    },
    confirmForm() {
      this.$confirm(`是否确定${this.isUpdate ? '修改' : '新增'}活动?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.submitLoading = true
          const params = { ...this.formData }
          if (params.amountNum != null) {
            params.amountNum = new Decimal(params.amountNum).mul(100).toNumber()
          }
          if (params.cost != null) {
            params.cost = new Decimal(params.cost).mul(100).toNumber()
          }
          return addScoreGoods(filterNoUndefined(params))
        })
        .then(() => {
          this.msgSuccess(`${this.isUpdate ? '修改' : '新增'}活动成功`)
          this.$router.back()
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    handleOpen(type) {
      const scoreGoodsType = this.formData.scoreGoodsType
      this.dialogVisible = true
      this.formData.scoreGoodsType = type
      // type未切换时/ref未挂载 刷新数据
      if (scoreGoodsType === type || !this.$refs.proTableRef) {
        this.$nextTick(() => this.$refs.proTableRef?.reload())
      }
    },
    handleTableSelection(selection) {
      if (!this.tableCompRef) {
        this.tableCompRef = this.$refs.proTableRef.getComponentRef('table')
      }
      if (selection.length > 1) {
        // 强制单选
        this.tableCompRef?.toggleRowSelection(selection[0], false)
      }
    },
    handleConfirmDialog(checked) {
      const item = checked[0]
      this.dialogVisible = false
      this.checkedItem = {
        // 可能有优惠券和商品
        ...item,
        goodsName: item.couponName || item.goodsName,
        limitsGoodsTotal: item.remainingNum || item.totalStock,
        limitsUserTotal: item.limitedNumberSheet,
        limitsUserDayTotal: item.dailyLimit,
        price: this.isGoodType ? this.toDecimal2(item.price / 100) : item.price,
        cover: item.thumbnail,
        type: this.isGoodType ? 'goods' : 'coupon'
      }
      this.formData.goodsId = item.goodsId || item.couponId
      this.setCheckedForForm(this.checkedItem)
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-container {
    .table-header {
      margin: 10px 0;
      .el-col {
        background: #e4e4e4;
      }
    }
    .el-col {
      padding-left: 20px;
    }
  }
  /deep/ .pro-table-container {
    .el-table__header-wrapper .el-checkbox {
      display: none;
    }
    .table-footer {
      position: relative;
      .el-checkbox {
        display: none;
      }
    }
  }
</style>
