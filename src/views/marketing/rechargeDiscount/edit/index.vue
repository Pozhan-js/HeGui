<template>
  <div style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="充值项" prop="fullReductionAmount">
        <el-input-number v-model="form.fullReductionAmount" :min="0" style="width: 30%" placeholder="请输入充值项" />
      </el-form-item>
      <el-form-item label="赠送方式" prop="presentationType">
        <el-select
          v-model="form.presentationType"
          style="width: 30%"
          placeholder="请选择赠送方式"
          clearable
          size="small"
          @change="(e) => {
            if (e == 3) getList()
          }"
        >
          <el-option
            v-for="dict in presentationTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.presentationType == 1 || form.presentationType == 2" :label="{ 1: '赠送余额', 2: '赠送积分' }[form.presentationType]" prop="presentationAmount">
        <el-input-number v-model="form.presentationAmount" :min="0" style="width: 30%" placeholder="请输入" />
      </el-form-item>
      <el-form-item v-if="form.presentationType == 3" label="选择优惠券">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item prop="couponName">
            <el-input
              v-model="queryParams.couponName"
              placeholder="优惠券名称"
            />
          </el-form-item>
          <el-form-item prop="type">
            <el-select
              v-model="queryParams.type"
              placeholder="请选择优惠券类型"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in couponTypeOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择优惠券状态"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table
          ref="multipleTable"
          v-loading="loading"
          :data="couponList"
          tooltip-effect="dark"
          style="width: 100%;margin-top: 20px;"
          height="500"
          :row-key="(row) => row.rechargeDiscountId"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="优惠券名称" align="center" property="couponName" />
          <el-table-column label="类型" align="center" property="type" :formatter="typeFormat" />
          <el-table-column label="总张数" align="center" property="totalNumberSheet" />
          <el-table-column label="剩余张数" align="center" property="remainingNum" />
          <el-table-column label="总限领" align="center" property="limitedNumberSheet" />
          <el-table-column label="内容" align="center" property="couponRule" />
          <el-table-column label="每日限领" align="center" property="dailyLimit" />
          <el-table-column label="开始时间" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.effectivePeriodType === 'time_limit'">
                {{ scope.row.effectiveBeginTime }}
              </span>
              <span v-else-if="scope.row.effectivePeriodType === 'received_effective'">
                领取后立即生效
              </span>
              <span v-else-if="scope.row.effectivePeriodType === 'received_specify_effective'">
                领取后{{ scope.row.effectiveReceivedDay }}天生效
              </span>
            </template>
          </el-table-column>
          <el-table-column label="结束时间" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.effectivePeriodType === 'time_limit'">
                {{ scope.row.effectiveEndTime }}
              </span>
              <span v-else>
                有效期领取后{{ scope.row.effectiveValidityDay }}天
              </span>
            </template>
          </el-table-column>
          <el-table-column label="每次赠送张数" align="center" width="200">
            <template slot-scope="scope">
              <el-input-number
                v-if="selectCoupon.map(item => item.couponId).includes(scope.row.couponId)"
                v-model="scope.row.giftNumber"
                :min="1"
                :max="scope.row.limitedNumberSheet"
                :precision="0"
                style="width: 100%;"
                placeholder="请输入每次赠送张数"
                @change="(e) => updateGiftNumber(e,scope.row.couponId)"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
        </el-table>
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

  </div>
</template>

<script>
import {
  addRechargeDiscount,
  getRechargeDiscount,
  updateRechargeDiscount,
  listCouponInfo
} from '@/api/marketing/rechargeDiscount'

export default {
  components: {},
  data() {
    return {
      // 赠送类型
      presentationTypeOptions: [],
      // 优惠券状态
      statusOptions: [],
      // 优惠券类型
      couponTypeOptions: [],
      // 优惠券
      couponList: [],
      // 选中优惠券
      selectCoupon: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        fullReductionAmount: [
          { required: true, message: '充值项不能为空', trigger: 'blur' }
        ],
        presentationType: [
          { required: true, message: '请选择赠送方式', trigger: 'blur' }
        ],
        presentationAmount: [
          { required: true, message: '赠送不能为空', trigger: 'blur' }
        ]
      },
      loading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 100,
        couponName: null,
        type: null,
        status: null
      }
    }
  },
  mounted() {
    if (this.$route.query.type === 'update') {
      this.handleUpdate(this.$route.query.rechargeDiscountId)
    }
    this.getDicts('recharge_presentation_type').then(response => {
      this.presentationTypeOptions = response.data
    })
    this.getDicts('coupon_pck_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('coupon_type').then((response) => {
      this.couponTypeOptions = response.data
    })
  },
  methods: {
    typeFormat(row, column) {
      return this.selectDictLabel(this.couponTypeOptions, row?.type)
    },
    // 优惠券打包状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          setTimeout(() => {
            this.$refs.multipleTable.toggleRowSelection(row)
          }, 500)
        })
      }
    },
    getList() {
      this.loading = true
      listCouponInfo({
        ...this.queryParams
      }).then((res) => {
        this.loading = false
        if (this.selectCoupon.length === 0) {
          this.couponList = res.rows
        } else {
          const selectCouponId = this.selectCoupon.map(item => item.couponId)
          this.couponList = res.rows.map(rItem => {
            if (selectCouponId.includes(rItem.couponId)) {
              return {
                ...rItem,
                giftNumber: selectCouponId.includes(rItem.couponId) ? this.selectCoupon.filter(fitem => fitem.couponId === rItem.couponId)[0].giftNumber : 0
              }
            }
            return rItem
          })
          this.toggleSelection(this.couponList.filter((fItem) => selectCouponId.includes(fItem.couponId)))
        }
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectCoupon = selection
    },
    // 修改赠送张数
    updateGiftNumber(val, id) {
      this.selectCoupon = this.selectCoupon.map(item => {
        return {
          ...item,
          giftNumber: id === item.couponId ? val : item.giftNumber
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(rechargeDiscountId) {
      this.loading = true
      listCouponInfo({
        ...this.queryParams
      }).then((dataRes) => {
        this.loading = false
        getRechargeDiscount(rechargeDiscountId).then((res) => {
          this.form = {
            rechargeDiscountId,
            fullReductionAmount: res.data.fullReductionAmount / 100,
            presentationType: res.data.presentationType + '',
            presentationAmount: res.data.presentationType == 1 ? res.data.presentationAmount / 100 : res.data.presentationAmount
          }
          this.selectCoupon = res.data.rechargeCouponList
          const selectCouponId = res.data.rechargeCouponList.map(item => item.couponId)
          this.couponList = dataRes.rows.map(rItem => {
            if (selectCouponId.includes(rItem.couponId)) {
              return {
                ...rItem,
                giftNumber: selectCouponId.includes(rItem.couponId) ? res.data.rechargeCouponList.filter(fitem => fitem.couponId === rItem.couponId)[0].giftNumber : 0
              }
            }
            return rItem
          })
          this.toggleSelection(this.couponList.filter((fItem) => selectCouponId.includes(fItem.couponId)))
        })
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.presentationType == 3 && this.selectCoupon.length === 0) {
            return this.msgInfo('请选择优惠券')
          } else if (this.form.presentationType == 3 && this.selectCoupon.map(item => item.giftNumber).includes(undefined)) {
            return this.msgInfo('请输入每次赠送张数')
          }
          const params = {
            rechargeDiscountId: this.form.rechargeDiscountId,
            presentationType: this.form.presentationType,
            fullReductionAmount: this.form.fullReductionAmount * 100,
            presentationAmount: this.form.presentationType == 1 ? this.form.presentationAmount * 100 : this.form.presentationAmount,
            rechargeDiscountCouponList: this.selectCoupon.map(item => {
              return {
                couponId: item.couponId,
                giftNumber: item.giftNumber
              }
            })
          }
          const type = this.form.rechargeDiscountId != null ? '修改' : '新增'
          this.$confirm(`是否确认${type}充值优惠信息?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              return this.form.rechargeDiscountId != null
                ? updateRechargeDiscount(params)
                : addRechargeDiscount(params)
            })
            .then(() => {
              this.msgSuccess(`${type}充值优惠信息成功`)
              this.cancel()
            })
        }
      })
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped lang="scss">
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}
.table_div {
  width: 80%;
  border: 1px solid #e2e2e2;
  .title_div {
    display: flex;
    background: #fafafa;
    border-bottom: 1px solid #e2e2e2;
  }
  .block {
    padding: 5px 0;
    width: 25%;
    text-align: center;
    border-right: 1px solid #e2e2e2;
  }
}
</style>
