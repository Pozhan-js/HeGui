<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="250px">
      <el-form-item label="配送费结算指定日期" prop="deliveryFeeSettlementDate">
        <el-col :span="9">
          <el-row>
            <el-col :span="3">每个月</el-col>
            <el-col :span="10">
              <el-select
                style="margin: 0 10px"
                v-model="form.deliveryFeeSettlementDate[0]"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in beforeMonthArr"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
            <el-col :span="11">号申请提现历史已结算配送员</el-col>
          </el-row>
          <el-row style="margin-top: 20px">
            <el-col :span="3">或每个月</el-col>
            <el-col :span="10">
              <el-select
                clearable
                style="margin: 0 10px"
                v-model="form.deliveryFeeSettlementDate[1]"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in rearMonthArr"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
            <el-col :span="11">号申请提现历史已结算配送员</el-col>
          </el-row>
        </el-col>
        <el-col :span="12" style="line-height: 80px; color: red">
          只填写一个日期，表示可对历史所有已结算金额可提现
        </el-col>
      </el-form-item>
      <el-form-item
        label="货款及促销费用结算指定日期"
        prop="loanAndPromotionFeeSettlementDate"
      >
        <el-col :span="9">
          <el-row>
            <el-col :span="3">每个月</el-col>
            <el-col :span="10">
              <el-select
                style="margin: 0 10px"
                v-model="form.loanAndPromotionFeeSettlementDate[0]"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in beforeMonthArra"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
            <el-col :span="11">号申请提现历史已结算货款</el-col>
          </el-row>
          <el-row style="margin-top: 20px">
            <el-col :span="3">或每个月</el-col>
            <el-col :span="10">
              <el-select
                clearable
                style="margin: 0 10px"
                v-model="form.loanAndPromotionFeeSettlementDate[1]"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in beforeMonthArrb"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
            <el-col :span="11">号申请提现历史已结算货款</el-col>
          </el-row>
          <el-row style="margin-top: 20px">
            <el-col :span="3">或每个月</el-col>
            <el-col :span="10">
              <el-select
                clearable
                style="margin: 0 10px"
                v-model="form.loanAndPromotionFeeSettlementDate[2]"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in beforeMonthArrc"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
            <el-col :span="11">号申请提现历史已结算货款</el-col>
          </el-row>
          <el-row style="margin-top: 20px">
            <el-col :span="3">或每个月</el-col>
            <el-col :span="10">
              <el-select
                clearable
                style="margin: 0 10px"
                v-model="form.loanAndPromotionFeeSettlementDate[3]"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in beforeMonthArrd"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
            <el-col :span="11">号申请提现历史已结算货款</el-col>
          </el-row>
        </el-col>
        <el-col :span="12" style="line-height: 80px; color: red">
          只填写一个日期，表示可对历史所有已结算金额可提现
        </el-col>
      </el-form-item>
      <el-form-item label="退质保金周期" prop="warrantyRefundPeriod">
        <el-input-number
          v-model="form.warrantyRefundPeriod"
          :min="1"
          :max="28"
          label="退质保金周期"
        />
        <span style="margin: 0 10px">天;</span>
        <span style="color: red">从申请到退成功周期</span>
      </el-form-item>
      <el-form-item label="关闭订单时间" prop="closeOrderTime">
        <span>下单后</span>
        <el-select
          style="margin: 0 10px"
          v-model="form.closeOrderTime"
          placeholder="请选择"
        >
          <el-option
            v-for="item in closeOrderTime"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <span>分钟内未支付自动关闭订单</span>
      </el-form-item>
      <el-form-item label="配送员推广有效期" prop="distributionPromoteValidityPeriod">
        <el-select
          style="margin-right: 10px"
          v-model="form.distributionPromoteValidityPeriod"
          placeholder="请选择"
        >
          <el-option
            v-for="item in [5,10,15,20,25,30]"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <span>分钟内有效</span>
      </el-form-item>
       <el-form-item label="支付完成到派单间隔时长" prop="warrantyRefundPeriod">
        <el-select
          style="margin: 0 10px"
          v-model="form.payedToDistributionDuration"
          placeholder="请选择"
        >
          <el-option
            v-for="item in dispatchTime"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <span style="margin: 0 10px">m;</span>
        <span style="color: red">自动派单间隔时长</span>
      </el-form-item>
      <el-form-item label="配送员待送达订单数量" prop="distributionOrderNumMax">
        <el-input-number
          v-model="form.distributionOrderNumMax"
          :min="1"
          :max="28"
          label="配送员待送达订单数量"
        />
        <span style="margin: 0 10px">单;</span>
      </el-form-item>
      <el-form-item label="消费者最大等待时间" prop="customerWaitTime">
        <el-input-number
          v-model="form.customerWaitTime"
          :min="1"
          :max="1440"
          label="消费者最大等待时间"
        />
        <span style="margin: 0 10px">分钟</span>
      </el-form-item>
      <el-form-item label="商城扣减库存方式" prop="mallDeductionMethod">
        <el-radio-group v-model="form.mallDeductionMethod">
          <el-radio
            v-for="dict in deductionMethod"
            :key="dict.dictValue"
            :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        type="primary"
        @click="submitForm"
        :loading="this.$store.state.isLoading"
        v-hasPermi="['system:commonSetting:edit']"
        >确 定</el-button
      >
    </div>
  </div>
</template>

<script>
import ResourcePicker from "@/components/ResourcePicker";
import { getOrderSetting, orderEdit } from "@/api/site/universal";
import moment from "moment";

export default {
  name: "Universal",
  components: {
    ResourcePicker,
  },
  data() {
    return {
      // 商城折扣方式
      deductionMethod: [],
      form: {
        deliveryFeeSettlementDate: [],
        loanAndPromotionFeeSettlementDate: [],
      },
      rules: {},
      beforeMonthArr: [1, 2, 3, 4, 5],
      beforeMonthArra: [1, 2, 3, 4, 5, 6, 7, 8],
      beforeMonthArrb: [9, 10, 11, 12, 13, 14, 15, 16],
      beforeMonthArrc: [17, 18, 19, 20, 21, 22, 23, 24],
      beforeMonthArrd: [25, 26, 27, "月末"],
      rearMonthArr: [16, 17, 18, 19, 20],
      closeOrderTime: [30, 60, 90, 120],
      shareTime: [5, 15, 20, 25, 30],
      deliveryFeeSettlementDate: [],
      loanAndPro: [],
      dispatchTime: [1, 2, 3, 4, 5],
    };
  },
  created() {
    this.getDicts("mall_deduction_method").then((response) => {
      this.deductionMethod = response.data;
    });

    getOrderSetting().then((res) => {
      this.form = {
        closeReminderPicture: res.data.closeReminderPicture,
        unopenedAreaDisplayContent: res.data.unopenedAreaDisplayContent,
        mallDeductionMethod: parseInt(res.data.mallDeductionMethod),
        deliveryFeeSettlementDate: JSON.parse(
          res.data.deliveryFeeSettlementDate
        ),
        loanAndPromotionFeeSettlementDate: JSON.parse(
          res.data.loanAndPromotionFeeSettlementDate
        ),
        distributionPromoteValidityPeriod: res.data.distributionPromoteValidityPeriod,
        warrantyRefundPeriod: res.data.warrantyRefundPeriod,
        distributionOrderNumMax: res.data.distributionOrderNumMax,
        customerWaitTime: res.data.customerWaitTime,
        closeOrderTime: res.data.closeOrderTime,
        shareLinkOrQRCodeValidPeriod: res.data.shareLinkOrQRCodeValidPeriod,
        payedToDistributionDuration: res.data.payedToDistributionDuration,
      };
    });
  },
  methods: {
    /**
     * 刷新Form数据对象
     */
    refreshForm() {
      this.form = { ...this.form };
    },
    // 重置表单
    reset() {
      this.form = {
        closeTime: null,
        closeReminderPicture: null,
        unopenedAreaDisplayContent: null,
        mallDeductionMethod: null,
        deliveryFeeSettlementDate: [],
        loanAndPromotionFeeSettlementDate: [],
        warrantyRefundPeriod: null,
        customerWaitTime: null,
        distributionOrderNumMax: null,
        closeOrderTime: null,
        shareLinkOrQRCodeValidPeriod: null,
      };
    },
    // 保存
    submitForm() {
      const params = {
        ...this.form,
        deliveryFeeSettlementDate: JSON.stringify(
          this.form.deliveryFeeSettlementDate
        ),
        loanAndPromotionFeeSettlementDate: JSON.stringify(
          this.form.loanAndPromotionFeeSettlementDate
        ),
      };
      this.$confirm("是否确定保存通用设置", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return orderEdit(params);
        })
        .then(() => {
          this.msgSuccess("通用设置修改成功");
        });
    },
  },
};
</script>
<style>
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}
</style>
