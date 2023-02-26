<template>
  <div style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="原因" prop="giveReason">
        <el-select
          v-model="form.giveReason"
          style="width: 30%"
          placeholder="请选择原因"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in customerTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="type === 'customer'" label="订单号" prop="giveNote">
        <el-input v-model="form.giveNote" style="width: 30%" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item v-else label="备注" prop="giveNote">
        <el-input
          v-model="form.giveNote"
          type="textarea"
          :rows="2"
          style="width: 30%"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item label="选择优惠券">
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
              placeholder="优惠券类型"
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
              placeholder="优惠券状态"
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
        >
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
          <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-checkbox :value="selectCoupon.includes(scope.row.couponId)" @change="(e) => handleCheck(e, scope.row.couponId)">选择</el-checkbox>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="() => type === 'customer' ? handleCheckOrder() : submitForm()"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

  </div>
</template>

<script>
import { customerCoupon, listCouponInfo, operationCouponBatch, operationCoupon, checkOrderNo } from '@/api/customer/operationCoupon'

export default {
  components: {},
  data() {
    return {
      // 原因类型
      customerTypeOptions: [],
      // 优惠券状态
      statusOptions: [],
      // 优惠券类型
      couponTypeOptions: [],
      // 优惠券
      couponList: [],
      // 选中优惠券
      selectCoupon: [],
      // 类型
      type: this.$route.query.type,
      // 客户ID
      customerId: this.$route.query.customerId,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        giveReason: [
          { required: true, message: '原因不能为空', trigger: 'blur' }
        ],
        giveNote: [
          { required: true, message: `${this.type === 'customer' ? '订单号' : '备注'}不能为空`, trigger: 'blur' }
        ]
      },
      loading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 100,
        issueCouponFlag: this.$route.query.type === 'customer' ? 'customer_give' : 'operation_give',
        couponName: null,
        type: null,
        status: null
      }
    }
  },
  mounted() {
    this.getDicts(this.$route.query.type === 'customer' ? 'customer_issue_coupon_reason' : 'operation_issue_coupon_reason').then(response => {
      this.customerTypeOptions = response.data
    })
    this.getDicts('coupon_pck_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('coupon_type').then((response) => {
      this.couponTypeOptions = response.data
    })
    this.getList()
  },
  methods: {
    typeFormat(row, column) {
      return this.selectDictLabel(this.couponTypeOptions, row.type)
    },
    // 优惠券打包状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    getList() {
      this.loading = true
      listCouponInfo({
        ...this.queryParams,
        customerIdList: this.customerId.split(',')
      }).then((res) => {
        this.couponList = res.rows
        this.loading = false
      })
    },
    handleCheck(even, couponId) {
      if (even) {
        this.selectCoupon = [couponId]
        // this.selectCoupon = this.selectCoupon.concat([couponId])
      } else {
        this.selectCoupon = []
        // this.selectCoupon = this.selectCoupon.filter(item => couponId != item)
      }
    },
    handleCheckOrder() {
      checkOrderNo({ orderNo: this.form.giveNote, customerId: this.customerId }).then(res => {
        if (!res.data) return this.msgError('请输入正确订单号~')
        this.submitForm()
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.selectCoupon.length === 0) {
            return this.msgInfo('请选择优惠券')
          }
          const params = {
            ...this.form,
            couponId: this.selectCoupon.toString()
          }
          this.$confirm(`是否确认${this.type === 'customer' ? '客服' : '运营'}发券?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              switch (this.type) {
                case 'operation':
                  return this.customerId.indexOf(',') > 0 ? operationCouponBatch({ ...params, customerIds: this.customerId.split(',') }) : operationCoupon({ ...params, customerId: this.customerId })
                case 'customer':
                  return customerCoupon({ ...params, customerId: this.customerId })
              }
            })
            .then(res => {
              console.log(res)
              if (this.type === 'operation' && this.customerId.indexOf(',') > 0) {
                if (res.data.failCustomerList.length) {
                  this.msgInfo(`${res.data.failCustomerList.length}个用户已超过限领张数~`)
                } else {
                  this.msgSuccess(`批量发送优惠券成功~`)
                }
              } else {
                this.msgSuccess(`发券成功`)
              }
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
