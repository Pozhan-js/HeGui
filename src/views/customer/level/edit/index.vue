<template>
  <div style="padding: 20px" v-loading="divLoading">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="4">

        <el-col :span="11" class="card">
          <div class="dw_title">会员卡设置</div>
          <el-form-item label="等级" prop="level">
            <el-input style="width: 50%" v-model="form.level" placeholder="请输入等级" />
          </el-form-item>
          <el-form-item label="等级名称" prop="levelName">
            <el-input style="width: 50%" v-model="form.levelName" placeholder="请输入等级名称" />
          </el-form-item>
          <el-form-item label="会员卡面" prop="levelBackgroundUrl">
            <ResourcePicker v-model="form.levelBackgroundUrl" size-hint="背景图片：430*230" />
          </el-form-item>
        </el-col>

        <el-col :span="11" class="card">
          <div class="dw_title">领取条件</div>
          <el-form-item label="成长值标准" prop="growthNum">
            <el-input-number style="width: 50%" v-model="form.growthNum" placeholder="请输入成长值标准"></el-input-number>
          </el-form-item>
          <el-form-item label="激活条件" prop="activation">
            <el-switch v-model="form.activation" />
          </el-form-item>
          <el-form-item>
          <div class="user-table">
            <div class="user-table__header">
              <div>基本信息</div>
              <div>是否必填</div>
            </div>
            <div>
              <div>姓名</div>
              <div>
                <el-switch v-model="form.receive.realName"/>
              </div>
            </div>
            <div>
              <div>性别</div>
              <div >
                <el-switch v-model="form.receive.sex"/>
              </div>
            </div>
            <div>
              <div>生日</div>
              <div >
                <el-switch v-model="form.receive.birthday"/>
              </div>
            </div>
            <div>
              <div>手机号</div>
              <div>
                <el-switch v-model="form.receive.phone"/>
              </div>
            </div>
          </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row style="margin-top: 20px">
        <el-col :span="11" class="card">
          <div class="dw_title">消费权益</div>
          <el-form-item label="消费权益" prop="consume">
            <el-radio-group v-model="form.rights.consume.check" class="radio-group-columns">
              <el-radio label="reduce">每月前
                <el-input-number :precision="0" :min="1" :disabled="form.rights.consume.check !== 'reduce'" class="rights" v-model="form.rights.consume.order" />
                单，直减
                <el-input-number class="rights" :precision="2" :disabled="form.rights.consume.check !== 'reduce'" v-model="form.rights.consume.reduce" />元
              </el-radio>
              <el-radio label="discount">每月前
                <el-input-number :precision="0" :min="1" :disabled="form.rights.consume.check !== 'discount'" class="rights" v-model="form.rights.consume.orderNumber" />
                单，
                <el-input-number class="rights" :precision="1" :min="0.1" :max="9.9" :disabled="form.rights.consume.check !== 'discount'" v-model="form.rights.consume.orderDiscount" />折
              </el-radio>
              <el-radio label="discount_order">下单<el-input-number :precision="1" class="rights" :min="1" :max="9.9" :disabled="form.rights.consume.check !== 'discount_order'" v-model="form.rights.consume.discount" />折</el-radio>
              <el-radio label="no">无权益</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="11" class="card">
          <div class="dw_title">配送权益</div>
          <el-form-item label="配送" prop="delivery">
            <el-radio-group v-model="form.rights.delivery.check" class="radio-group-columns">
                <el-radio label="reduce">
                  配送费每月前
                  <el-input-number :disabled="form.rights.delivery.check !== 'reduce'" :precision="0" :min="1" class="rights" v-model="form.rights.delivery.order" />
                  单，直减
                  <el-input-number class="rights" :disabled="form.rights.delivery.check !== 'reduce'" :precision="2" v-model="form.rights.delivery.reduce" />元
                </el-radio>
                <el-radio label="discount">
                  配送费
                  <el-input-number :precision="1" :min="0.1" :max="9.9" :disabled="form.rights.delivery.check !== 'discount'" class="rights" v-model="form.rights.delivery.discount" />
                  折
                  </el-radio>
                <el-radio label="free">免配送费</el-radio>
                <el-radio label="no">无权益</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row style="margin: 20px 0">
        <el-col :span="11" class="card">
          <div class="dw_title">卡券赠送</div>
          <el-form-item label="礼包" prop="giftBag">
            <el-radio-group v-model="form.giftBag.check">
              <el-radio label="coupon">送优惠券</el-radio>
              <el-radio :label="null">无权益</el-radio>
            </el-radio-group>
            <div v-if="form.giftBag.check === 'coupon'">
              <coupon-select :params="{ issueCouponFlag: 'member_privileges' }" v-model="selectCoupon">
                <template #trigger="{showSelectDialog}">
                  <el-button el-button type="text" @click="showSelectDialog">选择优惠券</el-button>
                </template>
              </coupon-select>
              <coupon-table v-model="selectCoupon" />
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="11" class="card">
          <div class="dw_title">其他权益</div>
          <el-form-item label="分销权益" prop="distribution">
            <el-radio-group v-model="form.rights.distribution.check">
              <el-radio label="free">推广返利</el-radio>
              <el-radio :label="null">无权益</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row style="margin: 20px 0">
        <el-col :span="11" class="card">
          <div class="dw_title">生日权益</div>
          <el-form-item label="会员生日权益" prop="birthdayCouponFlag">
            <el-switch v-model="form.birthdayCouponFlag"/>
          </el-form-item>
          <el-form-item label="赠送生日卡券" v-if="form.birthdayCouponFlag">
            <coupon-select :params="{ issueCouponFlag: 'member_privileges', effectivePeriodTypeList: 'received_effective,received_specify_effective' }" v-model="selectedBirthdayCoupons">
              <template #trigger="{showSelectDialog}">
                <el-button el-button type="text" @click="showSelectDialog">选择优惠券</el-button>
              </template>
            </coupon-select>
            <coupon-table v-model="selectedBirthdayCoupons" />
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

    <div class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="this.$store.state.isLoading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import { addLevel, getLevel, updateLevel, couponIssue, couponIdQuery } from "@/api/customer/level";
import CouponSelect from './coupon-select.vue'
import CouponTable from './coupon-table.vue'
import ResourcePicker from "@/components/ResourcePicker";

export default {
  components: {
    ResourcePicker,
    CouponSelect,
    CouponTable,
  },
  data() {
    let deliveryValidate = (rule, value, callback) => {
      if (!this.form.rights.delivery.check) {
        callback(new Error("请选择配送权益"));
      } else {
        callback();
      }
    }
    let consumeValidate = (rule, value, callback) => {
      if (!this.form.rights.consume.check) {
        callback(new Error("请选择消费权益"));
      } else {
        callback();
      }
    }

    const couponValidate = (coupons, callback) => {
      if (!coupons.length) {
        return callback('请选择优惠券');
      }
      if (coupons.some(i => !i.giftNum || i.giftNum <= 0)) {
        return callback('请填写赠送优惠券张数')
      }
      callback()
    }

    const giftBagValidate = (rule, value, callback) => {
      if (this.form.giftBag.check) {
        couponValidate(this.selectCoupon, callback)
      } else {
        callback();
      }
    }
    const birthdayGiftValidate = (rule, value, callback) => {
      if (this.form.birthdayCouponFlag) {
        couponValidate(this.selectedBirthdayCoupons, callback)
      } else {
        callback();
      }
    }
    // let distributionValidate = (rule, value, callback) => {
    //   if (!this.form.rights.distribution.check) {
    //     callback(new Error("请选择分销权益"));
    //   } else {
    //     callback();
    //   }
    // }
    
    return {
      divLoading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 修改禁用
      disabled: this.$route.query.type === "update",
      // 表单参数
      form: {
        activation: false,
        receive: {
          realName: false,
          sex: false,
          birthday: false,
          phone: false
        },
        rights: {
          delivery: {
            check: null,
            order: 0,
            reduce: 0,
            discount: 0
          },
          consume: {
            check: null,
            order: 0,
            reduce: 0,
            orderNumber: 0,
            orderDiscount: 0,
            discount: 0
          },
          distribution: {
            check: null,
          }
        },
        giftBag: {
          check: null,
        }
      },
      selectCoupon: [],
      selectedBirthdayCoupons: [],
      modalLoading: false,
      modalqueryParams: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 表单校验
      rules: {
        level: [
          { required: true, message: "等级不能为空", trigger: "blur" },
        ],
        levelName: [
          { required: true, message: "等级名称不能为空", trigger: "blur" },
          { min: 1, max: 9, message: "长度在 1 到 9 个字符", trigger: "blur" },
        ],
        levelBackgroundUrl: [
          { required: true, message: "会员卡面不能为空", trigger: "blur" },
        ],
        growthNum: [
          { required: true, message: "成长值标准不能为空", trigger: "blur" },
        ],
        delivery: [
          {  validator: deliveryValidate, trigger: "blur" },
        ],
        consume: [
          {  validator: consumeValidate, trigger: "blur" },
        ],
        giftBag: [
          {  validator: giftBagValidate, trigger: "blur" },
        ],
        birthdayCouponFlag: [
          { validator: birthdayGiftValidate, trigger: 'blur' }
        ]
        // distribution: [
        //   {  validator: distributionValidate, trigger: "blur" },
        // ]
      },
      
    };
  },
  mounted() {
    if (this.$route.query.type === "update") {
      this.handleInfo(this.$route.query.levelId);
    }
  },
  methods: {
    // 查询详情
    handleInfo(levelId) { 
      getLevel(levelId).then(res => {
        const {
          customerLevelGiftList, 
          customerLevel,
          customerLevelBenefitsList,
          customerLevelActivationList
        } = res.data
        if (customerLevelGiftList?.length > 0) {
          couponIdQuery({ couponIdList: Array.from(new Set(customerLevelGiftList.map(i => i.resourceId))) }).then(couponRes => {
            this.selectedBirthdayCoupons = []
            this.selectCoupon = []
            customerLevelGiftList.forEach(item => {
              const couponItem = couponRes.data.find(i => i.couponId === item.resourceId)
              const giftItem = {
                ...couponItem,
                giftNum: item.giftNum 
              }
              if (item.businessType === 'birthday') {
                this.selectedBirthdayCoupons.push(giftItem)
              } else {
                this.selectCoupon.push(giftItem)
              }
            })
          })
        }
        this.form = {
          levelId: levelId,
          level: customerLevel.level,
          levelName: customerLevel.levelName,
          levelBackgroundUrl: customerLevel.levelBackgroundUrl,
          growthNum: customerLevel.growthNum,
          activation: customerLevel.activationConditionsFlag,
          birthdayCouponFlag: customerLevel.birthdayCouponFlag,
          receive: {
            realName: customerLevelActivationList.filter(item => item.baseInfo === 'realName')[0]?.required,
            sex: customerLevelActivationList.filter(item => item.baseInfo === 'sex')[0]?.required,
            birthday: customerLevelActivationList.filter(item => item.baseInfo === 'birthday')[0]?.required,
            phone: customerLevelActivationList.filter(item => item.baseInfo === 'phone')[0]?.required
          },
          rights: {
            delivery: {
              check: customerLevelBenefitsList.filter(item => item.benefitsType === 'deliver_fee' && item.checkFlag)[0]?.benefitsMode,
              order: customerLevelBenefitsList.filter(item => item.benefitsType === 'deliver_fee' && item.benefitsMode === 'reduce')[0]?.benefitsCondition,
              reduce: customerLevelBenefitsList.filter(item => item.benefitsType === 'deliver_fee' && item.benefitsMode === 'reduce')[0]?.benefitsNum / 100,
              discount: customerLevelBenefitsList.filter(item => item.benefitsType === 'deliver_fee' && item.benefitsMode === 'discount')[0]?.benefitsNum / 10
            },
            consume: {
              check: customerLevelBenefitsList.filter(item => item.benefitsType === 'consume' && item.checkFlag)[0]?.benefitsMode,
              order: customerLevelBenefitsList.filter(item => item.benefitsType === 'consume' && item.benefitsMode === 'reduce')[0]?.benefitsCondition,
              reduce: customerLevelBenefitsList.filter(item => item.benefitsType === 'consume' && item.benefitsMode === 'reduce')[0]?.benefitsNum / 100,
              orderNumber: customerLevelBenefitsList.filter(item => item.benefitsType === 'consume' && item.benefitsMode === 'discount')[0]?.benefitsCondition,
              orderDiscount: customerLevelBenefitsList.filter(item => item.benefitsType === 'consume' && item.benefitsMode === 'discount')[0]?.benefitsNum / 10,
              discount: customerLevelBenefitsList.filter(item => item.benefitsType === 'consume' && item.benefitsMode === 'discount_order')[0]?.benefitsNum / 10
            },
            distribution: {
              check: customerLevelBenefitsList.filter(item => item.benefitsType === 'distribution' && item.checkFlag)[0] ? 
                customerLevelBenefitsList.filter(item => item.benefitsType === 'distribution' && item.checkFlag)[0].benefitsMode : null, 
            }
          },
          giftBag: {
            check: res.data.customerLevelGiftList.some(item => item.businessType === 'upgrade') ? 'coupon' : null
          }
        }
      })
    },
    // 表单重置
    reset() {
      this.form = { };
      this.resetForm("form");
    },
    /** 提交按钮 */
    async submitForm() {
      await this.$refs.form.validate()
      await this.$confirm(`是否确定${this.form.levelId ? '修改' : '新增'}会员等级?`, "警告", { type: "warning" })
      await addLevel(this.dataFormat())
      this.msgSuccess(`${this.form.levelId ? '修改' : '新增'}成功`);
      this.cancel();
    },
    /** 格式化提交数据 */
    dataFormat() {
      return {
        customerLevel: {
          levelId: this.form.levelId ? this.form.levelId : undefined,
          activationConditionsFlag: this.form.activation,
          growthNum: this.form.growthNum,
          level: this.form.level,
          levelBackgroundUrl: this.form.levelBackgroundUrl,
          levelName: this.form.levelName,
          birthdayCouponFlag: this.form.birthdayCouponFlag,
          sendCouponFlag: true,
        },
        customerLevelActivationList: [
          {
            baseInfo: "realName",
            required: this.form.receive.realName
          },
          {
            baseInfo: "sex",
            required: this.form.receive.sex
          },
          {
            baseInfo: "phone",
            required: this.form.receive.phone
          },
          {
            baseInfo: "birthday",
            required: this.form.receive.birthday
          }
        ],
        customerLevelBenefitsList: [
          {
            benefitsType: "deliver_fee",
            benefitsMode: "reduce",
            benefitsCondition: this.form.rights.delivery.order,
            benefitsNum: this.form.rights.delivery.reduce * 100,
            checkFlag: this.form.rights.delivery.check === 'reduce',
            cycle: 1
          },
          {
            benefitsType: "deliver_fee",
            benefitsMode: "discount",
            benefitsCondition:0,
            benefitsNum: this.form.rights.delivery.discount * 10,
            checkFlag: this.form.rights.delivery.check === 'discount',
            cycle: 1
          },
          {
            benefitsType: "deliver_fee",
            benefitsMode: "free",
            benefitsCondition:0,
            benefitsNum: 0,
            checkFlag: this.form.rights.delivery.check === 'free',
            cycle:1
          },
          {
            benefitsType: "deliver_fee",
            benefitsMode: "no",
            benefitsCondition:0,
            benefitsNum: 0,
            checkFlag: this.form.rights.delivery.check === 'no',
            cycle:1
          },
          {
            benefitsType: "consume",
            benefitsMode: "reduce",
            benefitsCondition: this.form.rights.consume.order,
            benefitsNum: this.form.rights.consume.reduce * 100,
            checkFlag: this.form.rights.consume.check === 'reduce',
            cycle: 1
          },
          {
            benefitsType: "consume",
            benefitsMode: "discount",
            benefitsCondition: this.form.rights.consume.orderNumber,
            benefitsNum: this.form.rights.consume.orderDiscount * 10,
            checkFlag: this.form.rights.consume.check === 'discount',
            cycle: 1
          },
          {
            benefitsType: "consume",
            benefitsMode: "discount_order",
            benefitsCondition: 0,
            benefitsNum: this.form.rights.consume.discount * 10,
            checkFlag: this.form.rights.consume.check === 'discount_order',
            cycle:1
          },
          {
            benefitsType: "consume",
            benefitsMode: "no",
            benefitsCondition: 0,
            benefitsNum: 0,
            checkFlag: this.form.rights.consume.check === 'no',
            cycle:1
          },
          {
            benefitsType: "distribution",
            benefitsMode: "free",
            benefitsCondition: 0,
            benefitsNum: 0,
            checkFlag: this.form.rights.distribution.check === 'free',
            cycle:1
          }
        ],
        
        customerLevelGiftList: [
          ...(this.form.giftBag.check === 'coupon' ? this.selectCoupon.map(item => ({
            giftNum: item.giftNum,
            giftType: 'coupon',
            resourceId: item.couponId,
            businessType: 'upgrade'
          })) : []),
          ...(this.form.birthdayCouponFlag ? this.selectedBirthdayCoupons.map(item => ({
             giftNum: item.giftNum,
            giftType: 'coupon',
            resourceId: item.couponId,
            businessType: 'birthday'
          })) : [])
        ],

      }
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style scoped lang="scss">
.card {
  border: 1px solid #e1e1e1;
  padding-top: 40px;
  position: relative;
  &:nth-child(2) {
    margin-left: 30px;
  }
}
.radio-group-columns {
  display: flex; 
  flex-direction: column;
  .el-radio {
    margin-top: 15px;
  }
}
.user-table {
  width: 80%;
  border: 1px solid #e2e2e2;
  >div {
    display: flex;
    text-align: center;
    border-bottom: 1px solid #e2e2e2;
    >div {
      width: 50%;
      &:nth-child(1) {
        border-right: 1px solid #e2e2e2;
      }
    }
  }
  .user-table__header {
     background: #f8f8f9;
  }
}
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}

/deep/ .rights.el-input-number {
  width: 100px !important;
  .el-input__inner {
    padding: 0px;
    border-style: none;
    border-bottom: 1px solid;
    border-radius: 0px;
  }
}
/deep/ .rights .el-input-number__decrease {
  display: none;
}
/deep/ .rights .el-input-number__increase {
  display: none;
}

/deep/ .rights .el-input.is-disabled .el-input__inner {
  background: #fff;
}
.dw_title {
  position: absolute;
  top: -13px;
  left: 40px;
  font-size: 18px;
  background: #fff;
  padding: 0 10px;
}
</style>
