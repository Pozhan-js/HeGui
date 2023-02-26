<template>
<div>
  <el-form
    ref="form"
    :model="fields"
    size="small"
    label-width="auto"
    style="width: 1000px; margin: 20px 0 0 20px"
    :rules="rules"
    :disabled="readonly"
  >
    <el-form-item label="活动名称" prop="activityName">
      <el-input v-model="fields.activityName" :disabled="isUpdate" />
    </el-form-item>

    <el-form-item label="活动区域" prop="orgId">
      <org-select v-model="fields.orgId" style="width: 100%" useElem :disabled="isUpdate" @input="resetGoods"/>
    </el-form-item>

    <el-form-item label="活动时间" prop="activityEndTime">
      <div v-if="isUpdate">
        <el-date-picker v-model="fields.activityStartTime" disabled type="datetime" />
        <span> 至 </span>
        <el-date-picker v-model="fields.activityEndTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime" :picker-options="{ disabledDate }" />
      </div>
      <range-picker
        v-else
        :s-time.sync="fields.activityStartTime"
        :e-time.sync="fields.activityEndTime"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="砍价商品">
      <table-select v-model="fields.goodsId" @select="handleSelectGoods" :orgId="fields.orgId" v-if="isCreate">
        <template #trigger="{ showSelectDialog }">
          <el-button type="text" @click="showSelectDialog" icon="el-icon-plus">选择商品</el-button>
          <!-- <el-button type="text" @click="toShopGoods">管理店铺商品</el-button> -->
        </template>
      </table-select>
    </el-form-item>

    <el-form-item v-if="selectedGoods != null">
      <el-table :data="[selectedGoods]">
        <el-table-column label="分组" align="center" prop="groupNameList">
          <template slot-scope="{ row }" v-if="row.groupNameList">
            <el-form-item>
              {{ row.groupNameList.map((i) => i.groupName || i).join("，") }}
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="商品" align="center" prop="goodsId" width="200">
          <template slot-scope="{ row }">
            <el-form-item>
              <cover :name="row.goodsName" type="goods" :cover="row.thumbnail" />
            </el-form-item>
          </template>
        </el-table-column>
        <!-- <el-table-column label="库存" align="center" prop="totalStock"/> -->
        <el-table-column label="零售价（元）" align="center" prop="price" width="100">
          <template slot-scope>
            <el-form-item>
              <div v-if="selectedGoodsPrice">{{ selectedGoodsPrice.toFixed(2) }}</div>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="库存" align="center" width="150">
          <el-form-item prop="activityInventoryNum">
            <el-input v-model="fields.activityInventoryNum" @change="setShareMaxNum" />
          </el-form-item>
        </el-table-column>
        <el-table-column label="发起次数比例" align="center" width="180">
          <el-form-item prop="shareRatio">
            <el-input-number v-model="fields.shareRatio" @change="setShareMaxNum" style="width: 130px" :min="0" :max="999" :step="1" :precision="0"/>
            <span class="hint">%</span>
          </el-form-item>
        </el-table-column>
        <el-table-column label="可发起次数" align="center">
          <template slot-scope>
            <el-form-item>
              {{ fields.shareMaxNum }}
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item label="购买条件" prop="buyCondition">
      <el-radio-group v-model="fields.buyCondition" :disabled="isUpdate">
        <el-radio label="any_time">砍到任意价格可购买</el-radio>
        <el-radio label="fixed">必须砍到底价才可购买</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="发起砍价次数" prop="userActivityNum">
      <el-input-number v-model="fields.userActivityNum" :min="1" :max="999" :step="1" :precision="0"/>
      <span class="hint">次/人</span>
    </el-form-item>

    <el-form-item label="砍价底价" prop="floorPrice">
      <el-input-number :disabled="isUpdate" v-model="fields.floorPrice" @change="setBargainPriceRange" :min="0" :max="selectedGoodsPrice - 0.01" :step="1" :precision="2"/>
      <span class="hint">元</span>
    </el-form-item>

    <el-form-item label="参与人数" prop="effectUserNum">
      <el-input-number
        v-model="fields.effectUserNum"
        :step="1"
        :min="1"
        :disabled="isUpdate"
        @change="setBargainPriceRange"
        :max="maxEffectUserNum"
        :precision="0"
      />
    </el-form-item>

    <el-form-item label="每次可砍金额">
      <div style="display: flex">
        <el-form-item
          prop="bargainType"
          style="width: 150px; margin-right: 20px"
        >
          <el-select v-model="fields.bargainType" :disabled="isUpdate" @change="setBargainPriceRange">
            <el-option label="固定" value="fixed"/>
            <el-option label="随机" value="rand"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="bargainMinPrice" style="width: 156px">
          <el-input-number v-model="fields.bargainMinPrice" disabled :precision="2"/>
          <span class="hint">元</span>
        </el-form-item>
        <div style="padding: 0 10px">至</div>
        <el-form-item prop="bargainMaxPrice" style="width: 170px">
          <el-input-number v-model="fields.bargainMaxPrice" disabled :precision="2"/>
          <span class="hint">元</span>
        </el-form-item>
      </div>
    </el-form-item>

    <el-form-item label="砍价链接有效期" prop="shareEffectHour">
      <el-input-number v-model="fields.shareEffectHour" :disabled="isUpdate" :min="0" :max="maxShareEffectHour" :precision="0"/>
      <span class="hint">小时</span>

      <span class="hint">*自用户发起砍价到砍价截止的时间</span>
    </el-form-item>

    <el-form-item label="到期提醒" prop="shareRemindMinute">
      <div style="display: flex; align-items: center">
        <div>砍价链接有效期前</div>
        <el-select v-model="fields.shareRemindMinute" style="margin: 0 10px" :disabled="isUpdate">
          <el-option v-for="minute in remindMinutes" :key="minute" :label="`${minute}分钟`" :value="minute" :disabled="minute >= fields.shareEffectHour * 60" />
        </el-select>
        <div>提醒</div>
      </div>
    </el-form-item>

    <el-form-item label="优惠叠加" prop="discountFlag">
      <el-radio-group v-model="fields.discountFlag" @change="fields.overlayList = []" :disabled="isUpdate">
        <el-radio label="0">不叠加其他营销活动</el-radio>
        <el-radio label="1">叠加其他营销活动</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="可叠加活动" prop="overlayList" v-if="fields.discountFlag === '1'">
      <el-checkbox-group v-model="fields.overlayList" :disabled="isUpdate">
        <el-checkbox :label="item.dictValue" v-for="item in bargain_overlay_type" :key="item.dictValue">{{item.dictLabel}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item label="分享标题" prop="shareText">
      <el-input v-model="fields.shareText" type="textarea" :disabled="isUpdate" />
    </el-form-item>

    <el-form-item label="分享图片" prop="shareImg">
      <resource-picker
       :disabled="isUpdate || readonly"
        v-model="fields.shareImg"
        size-hint="建议：210*168, 最大5m"
      />
    </el-form-item>

    <el-form-item label="是否启用" prop="status">
      <el-radio-group v-model="fields.status" :disabled="isUpdate">
        <el-radio label="disable">禁用</el-radio>
        <el-radio label="enable">启用</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
    <div style="margin: 20px 140px">
      <el-button v-if="readonly" @click="handleCancel" :disabled="false">返回</el-button>
      <template v-else>
        <el-button
          type="primary"
          :loading="$store.state.isLoading"
          @click="handleSubmit"
          >确 定</el-button
        >
        <el-button @click="handleCancel">取 消</el-button>
      </template>
    </div>
</div>
</template>

<script>
import OrgSelect from "@/components/OrgSelect.vue";
import RangePicker from "@/components/RangePicker.vue";
import ResourcePicker from "@/components/ResourcePicker";
import TableSelect from "./goods-select.vue";
import ProTable from "@/components/ElProComponents/ProTable";
import Cover from "@/views/marketing/score/mall/cover";
import { createAct, updateAct, queryActDetail } from "@/api/marketing/bargain";
import Decimal from 'decimal.js'
import moment from 'moment'

const moneyValidator = {
  pattern: /^\d+(\.\d{1,2})?$/,
  trigger: "blur",
  message: "请输入正确的金额",
};

// 每人最少可砍的金额
const USER_MIN_BARGAIN_AMOUNT = 0.01

export default {

  components: {
    OrgSelect,
    RangePicker,
    ResourcePicker,
    TableSelect,
    ProTable,
    Cover,
  },

  data() {
    return {
      fields: {
        overlayList: [],
      },
      bargain_overlay_type: [],
      USER_MIN_BARGAIN_AMOUNT,
      selectedGoods: undefined,
      remindMinutes: ['30', '60', '90'],
      rules: {
        activityName: [
          { required: true, message: "活动名不能为空" },
          { min: 1, max: 20, message: "请输入1-20个字符" },
        ],
        orgId: [
          { required: true, message: "活动区域不能为空", trigger: "change" },
        ],
        activityEndTime: [
          { required: true, message: "活动时间不能为空" },
          { 
            validator: (rule, value, callback) => {
              if (this.original?.activityEndTime) {
                if (new Date(this.original?.activityEndTime).getTime() > new Date(value).getTime()) {
                  callback('活动结束时间只能延长')
                  return
                }
              }
              callback()
            }
          }
        ],
        goodsId: [{ required: true, message: "砍价商品不能为空" }],
        activityInventoryNum: [
          { required: true, message: "砍价商品库存不能为空" },
          { 
            validator: (rule, value, callback) => {
              if (this.original?.activityInventoryNum && +value < +this.original?.activityInventoryNum) {
                callback('商品库存只能增加')
                return
              }
              callback()
            }
          }
        ],
        shareRatio: [
          { required: true, message: "发起次数比例不能为空" },
          { 
            validator: (rule, value, callback) => {
              if (this.original?.shareRatio && +value < +this.original?.shareRatio) {
                callback('发起次数比例只能增加')
                return
              }
              callback()
            }
          }
        ],
        buyCondition: [{ required: true, message: "购买条件不能为空" }],
        userActivityNum: [
          { required: true, message: "发起砍价次数不能为空" },
          { 
            validator: (rule, value, callback) => {
              if (this.original?.userActivityNum && +value < +this.original?.userActivityNum) {
                callback('发起砍价次数只能增加')
                return
              }
              callback()
            }
          }
        ],
        floorPrice: [
          { required: true, message: "砍价底价不能为空" },
          moneyValidator,
          {
            validator: (rule, value, callback) => {
              if (value  >= this.selectedGoodsPrice) {
                return callback("砍价低价必须小于商品零售价");
              }
              if (value < 0) {
                return callback("砍价低价不能小于0元");
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        effectUserNum: [
          { required: true, message: "参与人数不能为空" },
          {
            validator: (rule, value, callback) => {
              if (+value > this.maxEffectUserNum) {
                return callback("参与人数不能大于" + this.maxEffectUserNum + '位');
              }
              callback();
            },
            trigger: "blur",
          }
        ],
        bargainType: [{ required: true, message: "砍价类型不能为空" }],
        bargainMinPrice: [{ required: true, message: "砍价最小金额不能为空" }],
        bargainMaxPrice: [{ required: true, message: "砍价最大金额不能为空" }],
        shareEffectHour: [
          { required: true, message: "砍价链接有效期不能为空" },
          { 
            validator: (rule, value, callback) => {
              if (value > this.maxShareEffectHour) {
                return callback("不能超出活动时长");
              }
              callback();
            }
          }
        ],
        discountFlag: [{ required: true, message: "优惠是否可叠加不能为空" }],
        overlayList: [{ required: false }],
        shareText: [{min: 2, max: 30, message: '请输入2-30个字符'}],
        status: [{ required: true, message: "启用状态不能为空" }],
        shareRemindMinute: [
          { required: true, message: "到期提醒时间不能为空" },
          { 
            validator: (rule, value, callback) => {
              if (value >= this.fields.shareEffectHour * 60) {
                return callback("到期提醒时间不能超出砍价链接有效期");
              }
              callback();
            }
          }
        ],
      },
    };
  },

  computed: {
    isCreate() {
      return this.$route.path.includes("/create");
    },
    isUpdate() {
      return this.$route.path.includes("/update");
    },
    readonly() {
      return this.$route.path.includes("/preview");
    },

    // 最大可参与人数（可砍金额除0.01）
    maxEffectUserNum() {
      if (this.maxDiscountMoney <= 0) {
        return undefined
      }
      return Math.min(5, this.maxDiscountMoney / USER_MIN_BARGAIN_AMOUNT)
    },

    isFixedBargainType() {
      return this.fields.bargainType === 'fixed'
    },

    selectedGoodsPrice() {
      if (this.fields.goodsPrice == null) return null
      return new Decimal(this.fields.goodsPrice).div(100).toNumber()
    },

    maxDiscountMoney() {
      if (this.selectedGoodsPrice == null || this.fields.floorPrice == null) {
        return 0
      }
      return new Decimal(this.selectedGoodsPrice).sub(this.fields.floorPrice).toNumber()
    },

    // 活动总有效时长
    maxShareEffectHour() {
      const { activityEndTime, activityStartTime } = this.fields

      if (!activityEndTime) return undefined
      const diffMillSecond = moment(activityEndTime) - moment(activityStartTime)
      const aHourOfMillSecond = 1000 * 60 * 60
      return Math.floor(diffMillSecond / aHourOfMillSecond)
    },

    maxBargainValue() {
      const minBargainAmount = new Decimal(USER_MIN_BARGAIN_AMOUNT)
        .mul(this.fields.effectUserNum - 1)
      
      return new Decimal(this.maxDiscountMoney).sub(minBargainAmount).toNumber()
    },

    // 平均可砍金额
    averageBargainValue() {
      if (!this.maxDiscountMoney || !this.fields.effectUserNum) {
        return undefined
      }
      const userLimit = new Decimal(this.maxDiscountMoney).div(this.fields.effectUserNum)
      return userLimit.toFixed(2, Decimal.ROUND_DOWN)
    },
  },

  created() {
    if (!this.isCreate) {
      this.queryActDetail();
    }
    this.getDicts('bargain_overlay_type').then(res => {
      this.bargain_overlay_type = res.data
    })
  },

  methods: {

    disabledDate(time) {
      return time.getTime() < new Date(this.original?.activityEndTime).getTime();
    },

    setBargainPriceRange(value) {
      if (value == null) return
      if (this.isFixedBargainType) {
        this.fields.bargainMinPrice = this.averageBargainValue
        this.fields.bargainMaxPrice = this.averageBargainValue
      } else if (this.fields.bargainType != null) {
        this.fields.bargainMinPrice = USER_MIN_BARGAIN_AMOUNT
        this.fields.bargainMaxPrice = this.maxBargainValue
      }
    },

    resetGoods() {
      this.$set(this.fields, 'goodsId', undefined)
      this.$set(this.fields, 'goodsPrice', undefined)
      this.$set(this.fields, 'bargainMinPrice', undefined)
      this.$set(this.fields, 'bargainMaxPrice', undefined)
      this.$set(this.fields, 'floorPrice', undefined)
      this.selectedGoods = undefined;
    },
    
    // 可分享最大次数为 库存 * 发起次数比例
    setShareMaxNum() {
      const { activityInventoryNum, shareRatio } = this.fields
      const maxNum = activityInventoryNum * (shareRatio / 100)
      if (!Number.isNaN(maxNum)) {
        this.$set(this.fields, 'shareMaxNum', Math.round(maxNum))
      }
    },

    async queryActDetail() {
      const result = await queryActDetail(this.$route.query.activityBargainId);
      this.fields = this.httpBeanToFields(result.data);
      this.original = { ... this.fields }
      this.setGoodsDetail()
    },

    async setGoodsDetail() {
      this.selectedGoods = {
        goodsId: this.fields.goodsId,
        goodsName: this.fields.goodsName,
        thumbnail: this.fields.thumbnail,
        groupNameList: this.fields.groupNameList,
      }
    },

    async handleCreate(fields) {
      await this.$confirm(`是否确定新增活动?`, "警告", { type: "warning" });
      await createAct(fields);
      this.$router.back();
      this.msgSuccess("新增成功！");
    },

    async handleUpdate(fields) {
      await this.$confirm(`是否确定修改活动?`, "警告", { type: "warning" });
      await updateAct(fields);
      this.$router.back();
      this.msgSuccess("修改成功！");
    },

    handleSelectGoods(goods) {
      if (+goods.price <= 0) {
        this.$message.error('砍价所选商品售价必须大于0元!')
        return
      }
      this.resetGoods()
      this.$set(this.fields, 'goodsId', goods.goodsId)
      this.$set(this.fields, 'goodsPrice', goods.price)
      this.selectedGoods = goods;
      this.setBargainPriceRange(this.selectedGoods);
    },

    fieldsToHttpBean(fields) {
      return {
        ...fields,
        floorPrice: fields.floorPrice * 100,
        bargainMinPrice: fields.bargainMinPrice * 100,
        bargainMaxPrice: fields.bargainMaxPrice * 100,
      }
    },

    httpBeanToFields(httpBean) {
      return {
        ...httpBean,
        floorPrice: httpBean.floorPrice / 100,
        bargainMinPrice: httpBean.bargainMinPrice / 100,
        bargainMaxPrice: httpBean.bargainMaxPrice / 100,
        overlayList: httpBean.overlayList ?? [],
      }
    },

    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const fields = this.fieldsToHttpBean(this.fields);
          if (this.isCreate) {
            this.handleCreate(fields);
          } else if (this.isUpdate) {
            this.handleUpdate(fields);
          }
        }
      });
    },

    handleCancel() {
      this.$router.back();
    },
  },
};
</script>

<style lang="scss" scoped>
.hint {
  color: #979797;
  margin-left: 10px;
}
</style>

