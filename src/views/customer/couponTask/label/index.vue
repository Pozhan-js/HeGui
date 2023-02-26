<template>
  <div style="padding: 20px">
    <el-form ref="queryForm" :model="queryParams" label-width="150px">
      <el-form-item
        label="标签"
        prop="labelId"
        :rules="{ required: true, message: '请选择标签' }"
      >
        <el-select v-model="queryParams.labelId" :disabled="routeType === 'check'">
          <el-option
            v-for="label in labels"
            :key="label.labelId"
            :value="label.labelId"
            :label="label.labelName"
          />
        </el-select>
      </el-form-item>

      <el-row
        v-if="routeType === 'add'"
        :gutter="10"
        class="mb8"
        style="margin-left: 75px"
      >
        <el-col :span="1.5" :offset="7">
          <el-button
            class="blue-btn"
            type="primary"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <pro-table
      ref="vipListTable"
      :params="queryParams"
      title="客群会员"
      :init-when-mounted="false"
      api="/customer/wide/list"
      :total.sync="userGroupNumber"
      method="get"
      :columns="{
        nickname: '会员名称',
        levelName: '会员等级',
        consumeAmountTotal: {
          label: '消费金额',
          formatter: (value) => toDecimal2(+value / 100),
        },
        consumeTimesTotal: '购买订单总数',
        createTime: '注册时间',
        updateBy: '最后编辑人',
      }"
    />
    <el-form
      v-if="userGroupNumber > 0"
      ref="form"
      :model="form"
      :rules="rules"
      label-width="150px"
      style="margin-top: 5px; border-top: 1px solid; padding-top: 10px"
    >
      <el-form-item label="客群总数">
        <div>{{ userGroupNumber }}</div>
      </el-form-item>
      <el-form-item v-if="routeType !== 'check'" label="发放优惠券">
        <el-button type="text" @click="open = true">选择</el-button>
        <el-button type="text" @click="onJump">新建优惠券</el-button>
      </el-form-item>
      <el-form-item label="券名">
        <el-tag
          v-for="tag in selectCoupon"
          :key="tag.couponId"
          :closable="routeType !== 'check'"
          style="margin-right: 10px"
          @close="onSelectCoupon(false, tag)"
        >
          {{ tag.couponName }}
        </el-tag>
      </el-form-item>
      <el-form-item label="发放时间" prop="couponTime">
        <el-date-picker
          v-model="form.couponTime"
          :disabled="routeType === 'check'"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期"
        />
      </el-form-item>
    </el-form>
    <div v-if="userGroupNumber > 0" slot="footer" class="dialog-footer">
      <el-button
        v-if="routeType !== 'check'"
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">返 回</el-button>
    </div>
    <el-dialog
      title="发优惠券"
      :visible.sync="open"
      width="1000px"
      append-to-body
    >
      <pro-table
        ref="couponTable"
        :params="{ issueCouponFlag: 'customer_group_give' }"
        title=""
        api="/marketing/couponInfo/can/issue"
        method="get"
        :columns="{
          couponName: '优惠券名称',
          totalNumberSheet: '总张数',
          remainingNum: '剩余张数',
          effectiveBeginTime: '开始时间',
          effectiveEndTime: '结束时间',
        }"
      >
        <el-table-column align="center" prop="couponId">
          <template #default="{row}">
            <el-checkbox :value="onIsCheck(row)" @change="(e) => onSelectCoupon(e, row)">选择</el-checkbox>
          </template>
        </el-table-column>
      </pro-table>
    </el-dialog>
  </div>
</template>

<script>
import { addCouponTask, getCouponTask, updateCouponTask } from '@/api/customer/couponTask'
import ProTable from '@/components/ProTable.vue'
import { listLabelDropdownList } from '@/api/customer/label'
import { couponIdQuery } from '@/api/customer/level'

export default {
  components: { ProTable },
  data() {
    return {
      labels: [],
      // 组织数据
      queryParams: {},
      // 表单参数
      form: {},
      viveType: this.$route.query.viveType,
      routeType: this.$route.query.type,
      // 客群总数
      userGroupNumber: 0,
      open: false,
      // 选中优惠券
      selectCoupon: [],
      // 表单校验
      rules: {
        couponTime: [
          { required: true, message: '发放时间不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    listLabelDropdownList({ labelStatus: 1 }).then((res) => {
      this.labels = res.data
    })
    this.queryDetail()
  },
  methods: {
    /** 搜索按钮操作 */
    async handleQuery() {
      await this.$refs.queryForm.validate()
      this.$refs.vipListTable.refresh()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {}
      this.resetForm('queryForm')
    },
    /** 跳转优惠券列表 */
    onJump() {
      const path = '/marketing/coupons/marketing'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CouponTask', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path
      })
    },
    queryDetail() {
      if (this.$route.query.couponTaskId) {
        getCouponTask(this.$route.query.couponTaskId).then(res => {
          this.queryParams = res.data
          this.form = {
            couponTime: res.data.couponTime
          }
          couponIdQuery({ couponIdList: res.data.couponId.split(',') }).then(res => {
            this.selectCoupon = res.data
            this.$refs.vipListTable.refresh()
          })
        })
      }
    },
    /** 是否被选中 */
    onIsCheck(coupon) {
      return this.selectCoupon.find((item) => item.couponId === coupon.couponId) != null
    },
    /** checkBox 改变事件 */
    onSelectCoupon(check, coupon) {
      if (check) {
        this.selectCoupon = [coupon]
      } else {
        this.selectCoupon = []
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const couponId = this.selectCoupon.map((item) => item.couponId)
          if (couponId.length === 0) {
            return this.warning('请选择优惠券~')
          }

          this.$confirm(
            `是否确认${
              this.$route.query.type === 'update' ? '修改' : '新增'
            }会员标签发券?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const params = {
                ...this.queryParams,
                ...this.form,
                couponTotal: this.userGroupNumber,
                couponId: couponId.toString(),
                taskType: 4
              }
              delete params.time
              return this.$route.query.type === 'update'
                ? updateCouponTask(params)
                : addCouponTask(params)
            })
            .then(() => {
              this.msgSuccess(
                `${
                  this.$route.query.type === 'update' ? '修改' : '新增'
                }会员标签发券~`
              )
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
/deep/ .el-input-number {
  .el-input__inner {
    padding: 0px;
    border-radius: 0px;
  }
}
/deep/ .el-input-number__decrease {
  display: none;
}
/deep/ .el-input-number__increase {
  display: none;
}
</style>
