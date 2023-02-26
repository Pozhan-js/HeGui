<template>
  <div v-loading="loading" class="app-container">
    <el-row :gutter="20" style="padding: 10px 0px;">
      <el-col :span="3" style="text-align: end;">
        <el-avatar :size="100" :src="data.avatar" />
      </el-col>
      <el-col :span="5" style="margin-top: 0px;">
        <div>昵称：{{ data.nickname }}</div>
        <div>姓名：{{ data.realName }}<el-button type="text" class="edit_but" icon="el-icon-edit" @click="handleUpdate('realName', data.realName)" /></div>
        <div>手机号：{{ data.phone }}<el-button type="text" class="edit_but" icon="el-icon-edit" @click="handleUpdate('phone', data.phone)" /></div>
      </el-col>
    </el-row>
    <el-row class="bor">
      <div class="title">会员资料</div>
      <el-row :gutter="20">
        <el-col :span="6" style="line-height: 40px;">会员ID：{{ data.memberCard }}</el-col>
        <el-col :span="6" style="line-height: 40px;">性别：{{ sexFormat(data.sex) }}</el-col>
        <el-col :span="6" style="line-height: 40px;">生日：{{ data.birthday }}<el-button type="text" class="edit_but" icon="el-icon-edit" @click="handleUpdate('birthday', data.birthday)" /></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">分销权益：{{ {active: '启用', inactive: '停用', disable: '禁用'}[data.distributionRebatesFlag] }}</el-col>
        <el-col :span="6">渠道：{{ customerAuthorizeFormat(data.channel) }}</el-col>
        <el-col :span="6">成为会员时间：{{ data.createTime }}</el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">当前收货地址：{{ data.lastAddress }}</el-col>
        <el-col :span="6">最近下单时间：{{ data.lastOrderTime }}</el-col>
      </el-row>
      <!-- <el-row>
        <el-col :span="3">地区：{{ data.region }}</el-col>
        <el-col :span="8">姓名：{{ data.realName }}<el-button type="text" class="edit_but" icon="el-icon-edit" @click="handleUpdate('realName', data.realName)" /></el-col>
        <el-col :span="8">手机号：{{ data.phone }}<el-button type="text" class="edit_but" icon="el-icon-edit" @click="handleUpdate('phone', data.phone)" /></el-col>
      </el-row> -->
    </el-row>
    <el-row class="bor">
      <div class="title">标签信息</div>
      <el-col :span="12">
        <el-tag v-for="(item,index) in data.customerLabelRelationList" :key="index" style="margin-right: 20px;" :class="{'system-preset': item.createBy === 'job'}" closable @close="deleteLabel(item.labelRelationId)">
          {{ item.labelName }}
        </el-tag>
        <el-button v-if="data.customerLabelRelationList" v-hasPermi="['customer:customerInfo:getLabel']" size="mini" type="text" @click="openDetailsModel()">添加标签</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="11" class="bor">
        <div class="title">资产信息</div>
        <el-row class="rows" style="text-align: center;">
          <el-col :span="6">成长值</el-col>
          <el-col :span="6">
            当前成长值
            <div><jump path="/customer/growthRecordDetails" :query="{ customerId: data.customerId}">{{ data.growth }}</jump></div>
          </el-col>
          <el-col :span="6">升级会员成长值<div><jump path="/customer/growthRecordDetails" :query="{ customerId: data.customerId}">{{ data.nextGrowth }}</jump></div></el-col>
          <el-col :span="6">还需获取成长值<div><jump path="/customer/growthRecordDetails" :query="{ customerId: data.customerId}">{{ data.toDoGrowth }}</jump></div></el-col>
        </el-row>
        <el-row class="rows" style="text-align: center;">
          <el-col :span="6">余额</el-col>
          <el-col :span="6">
            可用余额
            <div><jump v-if="data.accountAmount != null" path="/recharge/record" :query="{ customerId: data.customerId}">{{ data.accountAmount && toDecimal2(data.accountAmount / 100) }}</jump></div>
          </el-col>
          <el-col :span="6">
            累计充值余额
            <div>{{ data.rechargeAmountTotal && toDecimal2(data.rechargeAmountTotal / 100) }}</div>
          </el-col>
        </el-row>
        <el-row class="rows" style="text-align: center;">
          <el-col :span="6">积分</el-col>
          <el-col :span="6">
            可用积分
            <div><jump v-if="data.scoreTotal != null" path="/finance-affairs/score/change-record" :query="{ customerId: data.customerId}">{{ data.scoreTotal }}</jump></div>
          </el-col>
          <el-col :span="6">
            累计获取积分
            <div v-if="data.scoreObtainTotal != null">{{ data.scoreObtainTotal }}</div>
          </el-col>
          <el-col :span="6">
            累计消耗积分
            <div v-if="data.scoreUseTotal != null">{{ data.scoreUseTotal }}</div>
          </el-col>
        </el-row>
        <el-row class="rows" style="text-align: center;">
          <el-col :span="6">优惠券</el-col>
          <el-col :span="6">
            可用优惠券
            <div><el-button style="font-size: 15px;" type="text" @click="getHistoryCoupon(1)">{{ data.usableCoupon }}</el-button></div>
          </el-col>
          <el-col :span="6">
            已使用优惠券
            <div>
              <jump path="/finance-affairs/coupon" :query="{customerId: data.customerId, receiveStatusFlag: 2}">{{ data.usedCouponCount }}</jump>
            </div>
          </el-col>
          <el-col :span="6">
            已过期优惠券
            <div>
              <jump path="/finance-affairs/coupon" :query="{customerId: data.customerId, receiveStatusFlag: 4}">{{ data.expiredCouponCount }}</jump>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="11" class="bor" style="min-height: 342px;">
        <div class="title">交易记录</div>
        <el-row :gutter="20" class="rows">
          <el-col :span="6" class="tj_row">
            <div>累计消费金额（元）</div>
            <jump path="/order/delivery/allorder" :query="{customerId: data.customerId}">{{ data.consumeAmountTotal && toDecimal2(data.consumeAmountTotal / 100) }}</jump>
          </el-col>
          <el-col :span="6" class="tj_row">
            <div>累计购买订单数</div>
            <jump path="/order/delivery/allorder" :query="{customerId: data.customerId}">{{ data.consumeTimesTotal }}</jump>
          </el-col>
          <el-col :span="6" class="tj_row">
            <div>笔单价（元）</div>
            <div>{{ data.customerPrice && toDecimal2(data.customerPrice / 100) }}</div>
          </el-col>
          <el-col :span="6" class="tj_row">
            <div>累计退款金额（元）</div>
            <jump path="/order/delivery/afterSales" :query="{customerId: data.customerId}">{{ data.refundTotal ? toDecimal2(data.refundTotal / 100) : 0 }}</jump>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 添加或修改客户标签对话框 -->
    <el-dialog title="优惠券" :visible.sync="open" width="800px" append-to-body>
      <el-table
        v-loading="modelLoading"
        :data="couponList"
      >
        <el-table-column label="优惠券名称" align="center" prop="couponName" />
        <el-table-column label="获取来源" align="center" prop="origin" :formatter="couponOriginFormat" />
        <el-table-column label="发送时间" align="center" prop="sendTime" />
        <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
        <el-table-column label="消费总金额" align="center" prop="totalConsumption">
          <template slot-scope="scope">
            {{ scope.row.totalConsumption ? toDecimal2(scope.row.totalConsumption / 100) : 0 }}
          </template>
        </el-table-column>
        <el-table-column label="使用时间" align="center" prop="useTime" />
        <el-table-column label="到期时间" align="center" prop="expireDate" />
      </el-table>

      <pagination
        v-show="queryParams.total > 0"
        :total="queryParams.total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getHistoryCoupon(queryParams.status)"
      />
    </el-dialog>

    <el-dialog title="修改" :visible.sync="updateOpen" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="{ 'realName':'姓名', 'phone': '手机号', 'remark': '备注', 'birthday': '生日' }[updateField]" :prop="updateField">
          <el-input v-if="updateField === 'realName' || updateField === 'phone'" v-model="form[updateField]" :placeholder="'请输入' + { 'realName':'姓名', 'phone': '手机号' }[updateField]" />
          <el-input
            v-else-if="updateField === 'remark'"
            v-model="form[updateField]"
            type="textarea"
            placeholder="请输入备注"
            maxlength="30"
            show-word-limit
          />
          <el-date-picker
            v-else-if="updateField === 'birthday'"
            v-model="form[updateField]"
            type="date"
            placeholder="选择日期"
          />
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
    <el-dialog
      :visible.sync="lableOpen"
      title="客户标签信息"
      width="500px"
      append-to-body
      @close="() => getInfo()"
    >
      <div v-if="labelList.length > 0" class="lab_title">
        <div class="title">当前标签</div>
        <div>
          <el-tag
            v-for="(tag, index) in labelList"
            :key="index"
            closable
            style="margin: 5px"
            @close="handleCloseLable(tag)"
          >
            {{ tag.labelName }}
          </el-tag>
        </div>
      </div>
      <div
        v-if="
          labelOptions.filter(
            (item) =>
              !labelList
                .map((labItem) => labItem.labelId)
                .includes(item.labelId)
          ).length > 0
        "
        class="lab_title"
        style="margin-top: 20px"
      >
        <div class="title">可添加标签</div>
        <div>
          <el-tag
            v-for="(tag, index) in labelOptions.filter(
              (item) =>
                !labelList
                  .map((labItem) => labItem.labelId)
                  .includes(item.labelId)
            )"
            :key="index"
            style="cursor: pointer; margin: 5px"
            @click="postLabel(tag)"
          >
            {{ tag.labelName }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { historyCoupon } from '@/api/customer/customerInfo'
import { getCustomerInfo, updateCustomer, removeLabel, addLabel } from '@/api/customer/customerInfo'
import moment from 'moment'
import Jump from '@/components/Jump.vue'
import { getDropDown } from '@/api/selectUtils'

export default {
  name: 'Portrait',
  components: { Jump },
  data() {
    return {
      // 遮罩层
      loading: false,
      data: {},
      modelLoading: false,
      open: false,
      lableOpen: false,
      labelOptions: [],
      labelList: [],
      couponList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        customerId: this.$route.query.customerId
      },
      // 领取状态
      couponStatusOptions: [],
      // 获取来源
      couponOriginOptions: [],
      // 用户渠道
      customerAuthorizeOptions: [],
      // 性别
      sexOptions: [],
      // 来源方式
      entryMethodOptions: [],
      updateOpen: false,
      updateField: null,
      form: {},
      rules: {}
    }
  },
  created() {
    // 客户标签
    getDropDown('customerLabel', { labelStatus: 1 }).then((res) => {
      this.labelOptions = res.data
    })
    this.getDicts('coupon_receive_status').then((response) => {
      this.couponStatusOptions = response.data
    })
    this.getDicts('coupon_origin').then((response) => {
      this.couponOriginOptions = response.data
    })
    this.getDicts('customer_authorize_channel').then((response) => {
      this.customerAuthorizeOptions = response.data
    })
    this.getDicts('sys_user_sex').then((response) => {
      this.sexOptions = response.data
    })
    this.getDicts('customer_entry_method').then((response) => {
      this.entryMethodOptions = response.data
    })

    this.getInfo()
  },
  methods: {
    getInfo() {
      this.loading = true
      getCustomerInfo(this.$route.query.customerId).then(res => {
        this.data = res.data
        this.loading = false
      })
    },
    // 默认标志字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.couponStatusOptions, row.status)
    },
    // 获取来源
    couponOriginFormat(row, column) {
      return this.selectDictLabel(this.couponOriginOptions, row.origin)
    },
    // 用户渠道
    customerAuthorizeFormat(status) {
      return this.selectDictLabel(this.customerAuthorizeOptions, status)
    },
    // 性别
    sexFormat(status) {
      return this.selectDictLabel(this.sexOptions, status)
    },
    // 来源
    entryMethodFormat(status) {
      return this.selectDictLabel(this.entryMethodOptions, status)
    },
    // 重置表单
    reset() {
      this.form = {}
      this.resetForm('form')
    },
    // 取消按钮
    cancel() {
      this.updateOpen = false
      this.updateField = null
      this.reset()
    },
    // 修改字段
    handleUpdate(field, value) {
      // this.reset()
      this.form = {
        [field]: value || null
      }
      const keyName = { realName: '姓名', phone: '手机号', remark: '备注', birthday: '生日' }[field]
      this.rules = {
        [field]: [
          { required: true, message: `用户${keyName}不能为空`, trigger: 'blur' }
        ]
      }
      this.updateField = field
      this.updateOpen = true
    },
    // 修改提交
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const keyName = { realName: '姓名', phone: '手机号', remark: '备注', birthday: '生日' }[this.updateField]
          this.$confirm(
            `是否确认修改用户${keyName}信息`, '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            const params = {
              customerId: this.$route.query.customerId,
              [this.updateField]: this.form[this.updateField]
            }
            if (this.updateField === 'birthday') {
              params[this.updateField] = moment(this.form[this.updateField]).format('yyyy-MM-DD')
            }
            updateCustomer(params).then(res => {
              this.msgSuccess(`客户${keyName}修改成功~`)
              this.updateOpen = false
              this.getInfo()
            })
          })
        }
      })
    },
    // 删除客户标签
    deleteLabel(labelRelationIds) {
      this.$confirm(
        `是否确认删除客户标签信息`, '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        removeLabel(labelRelationIds).then(res => {
          this.msgSuccess(`删除客户标签成功~`)
          this.getInfo()
        })
      })
    },
    // 打开详情信息标签model框
    openDetailsModel() {
      this.lableOpen = true
      this.labelList = this.data.customerLabelRelationList || []
    },
    // 查询用户标签
    getCustomerLable(customerId) {
      getCustomerInfo(customerId).then((res) => {
        this.labelList = res.data.customerLabelRelationList
      })
    },
    /** 加标签 */
    postLabel(label) {
      const params = {
        customerId: this.$route.query.customerId,
        labelId: label.labelId
      }
      addLabel(params).then((res) => {
        this.getCustomerLable(params.customerId)
      })
    },
    // 删除客户标签
    handleCloseLable(tag) {
      this.$confirm('是否确认删除客户标签信息?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return removeLabel(tag.labelRelationId)
        })
        .then(() => {
          this.labelList = this.labelList.filter(
            (item) => item.labelRelationId !== tag.labelRelationId
          )
        })
    },
    /** 查询用户发券历史 */
    getHistoryCoupon(status = null) {
      this.modelLoading = true
      const params = {
        ...this.queryParams,
        ownFlag: status ? 'canUse' : null
      }
      this.queryParams = {
        ...this.queryParams,
        status
      }
      delete params.status
      delete params.total
      historyCoupon(params).then(res => {
        this.modelLoading = false
        this.couponList = res.rows
        this.queryParams.total = res.total
        this.open = true
      })
    }
  }
}
</script>
<style scoped lang="scss">
.system-preset {
  background: transparent;
}
.left_titile{
  border-left: 5px solid #333;
  padding: 5px 0 5px 10px;
}
.rows{
  font-size: 15px;
  line-height: 40px;
  padding: 10px 20px;
}
.edit_but {
  font-size: 18px;
  margin-left: 10px;
}
.tj_row{
  line-height: 30px;
  text-align: center;
}
.bor {
  color: #333;
  padding: 20px;
  margin-top: 40px;
  margin-left: 40px;
  line-height: 40px;
  border: 1px solid;
  position: relative;
  .title {
    top: -20px;
    padding: 0 10px;
    font-size: 18px;
    position: absolute;
    background: #fff;
  }
}
.lab_title {
  position: relative;
  padding: 20px 10px;
  border-radius: 5px;
  border: 1px solid #e2e2e2;
  .title {
    width: 120px;
    text-align: center;
    top: -12px;
    padding: 0 10px;
    font-size: 16px;
    background: #fff;
    position: absolute;
  }
}
</style>
