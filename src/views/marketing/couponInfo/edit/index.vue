<template>
  <div v-loading="divLoading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :disabled="disabled || disabledCheck"
          :options="orgOptions"
          style="width: 30%"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="onDefaultGoodsInfo"
        />
      </el-form-item>
      <el-form-item label="展示顺序" prop="sort">
        <el-input-number
          v-model="form.sort"
          style="width: 30%"
          :disabled="disabled || disabledCheck"
          :min="0"
          placeholder="请输入展示顺序"
        />
      </el-form-item>
      <el-form-item label="优惠券名称" prop="couponName">
        <el-input
          v-model="form.couponName"
          style="width: 30%"
          :disabled="disabledCheck"
          placeholder="请输入优惠券名称"
        />
      </el-form-item>
      <el-form-item label="总张数" prop="totalNumberSheet">
        <el-col :span="3.5">
          <el-input-number
            v-model="form.totalNumberSheet"
            :min="minTotalNumber"
            :disabled="disabledCheck"
            placeholder="请输入总张数"
          />
        </el-col>
        <el-col :span="1" style="padding-left: 20px">张</el-col>
      </el-form-item>
      <el-form-item label="兑换门槛" prop="useThreshold">
        <el-radio-group v-model="form.useThreshold" :disabled="disabledCheck">
          <el-row style="margin-bottom: 10px;">
            <el-radio label="no_threshold">无门槛</el-radio>
          </el-row>
          <el-radio label="full_yuan">满<el-input-number
            v-model="form.orderFull"
            :min="0"
            style="margin: 0 10px;"
            :disabled="form.useThreshold === 'no_threshold' || disabledCheck"
            :precision="2"
            placeholder="请输入满多少元"
          />元</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="couponType === 'discount'" label="优惠折扣" prop="discount">
        <el-input-number
          v-model="form.discount"
          :min="1"
          :max="9.99"
          style="margin-right: 10px;"
          :disabled="disabled || disabledCheck"
          :precision="1"
          placeholder="请输入优惠折扣"
        />折
        <el-row>
          <el-checkbox v-model="form.maxRadio" :disabled="disabled">最多优惠<el-input-number
            v-model="form.maximumDiscount"
            :min="0"
            style="margin: 10px 10px 0px 10px;"
            :disabled="disabled || !form.maxRadio || disabledCheck"
            :precision="2"
            placeholder="请输入最多优惠金额"
          />
            元
          </el-checkbox>
        </el-row>
      </el-form-item>
      <el-form-item v-if="couponType === 'random'" label="优惠金额" prop="random">
        随机：
        <el-input-number
          v-model="form.randomDiscountLower"
          :min="0"
          style="margin-right: 10px;"
          :disabled="disabled || disabledCheck"
          :precision="2"
          placeholder="请输入优惠金额"
        />
        元
        <span style="margin: 0 10px;">——</span>
        <el-input-number
          v-model="form.randomDiscountUpper"
          :min="form.randomDiscountLower"
          style="margin-right: 10px;"
          :disabled="disabled || disabledCheck"
          :precision="2"
          placeholder="请输入优惠金额"
        />
        元
      </el-form-item>
      <el-form-item v-if="couponType === 'full_reduction'" label="优惠金额" prop="discountedPrice">
        <el-row>
          <el-col
            :span="1"
            style="
              font-size: 14px;
              color: #606266;
              text-align: center;
              font-weight: 700;
            "
          >经销商:</el-col>
          <el-col :span="4" style="text-align: center">
            <el-input-number
              v-model="form.discountedPrice"
              :min="0"
              :disabled="disabled || disabledCheck"
              :precision="2"
              placeholder="请输入优惠金额"
            />
          </el-col>
          <el-col :span="1">元</el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="访问渠道" prop="channel">
        <dict-select v-model="form.channel" dict="coupon_channel" :disabled="disabledCheck" />
      </el-form-item>
      <el-form-item label="产品分组">
        <div>
          <el-button
            :disabled="disabled || disabledCheck"
            icon="el-icon-plus"
            type="text"
            @click="handleModel('group')"
          >添加商品分组</el-button>
        </div>
        <div v-if="form.groupId && form.groupId.length > 0">
          <el-tag
            v-for="group in groupList.filter((item) =>
              form.groupId.includes(item.groupId)
            )"
            :key="group.groupId"
            style="margin-right: 10px"
            size="small"
            :closable="routerType !== 'update' && routerType !== 'check'"
            @close="onDelInfo(group.groupId, 'group')"
          >
            {{ group.groupName }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="产品">
        <div>
          <el-button
            icon="el-icon-plus"
            type="text"
            :disabled="disabled || disabledCheck"
            @click="handleModel('goods')"
          >添加商品</el-button>
        </div>
        <div v-if="form.goodsId && form.goodsId.length > 0">
          <el-tag
            v-for="goods in goodsList.filter((item) =>
              form.goodsId.includes(item.goodsId)
            )"
            :key="goods.goodsId"
            style="margin-right: 10px"
            size="small"
            :closable="routerType !== 'update' && routerType !== 'check'"
            @close="onDelInfo(goods.goodsId, 'goods')"
          >
            {{ goods.goodsName }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="有效期" prop="effective">
        <el-radio-group v-model="form.effectivePeriodType" :disabled="disabledCheck">
          <el-radio label="time_limit">
            <el-date-picker
              v-model="form.effectiveTime"
              size="small"
              :disabled="form.effectivePeriodType !== 'time_limit' || disabledCheck"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-radio>
          <el-row style="margin: 10px 0;">
            <el-radio label="received_effective">
              领取后立即生效，有效期
              <el-input-number
                v-model="form.effectiveValidityDay"
                style="margin: 0 10px;"
                :disabled="form.effectivePeriodType !== 'received_effective' || disabledCheck"
                :precision="0"
                placeholder="请输入有效期"
              />天
            </el-radio>
          </el-row>
          <el-radio label="received_specify_effective">
            领取后<el-input-number
              v-model="form.effectiveReceivedDay"
              style="margin: 0 10px;"
              :disabled="form.effectivePeriodType !== 'received_specify_effective' || disabledCheck || disabled"
              :precision="0"
              placeholder="请输入有效期"
            />天生效，有效期
            <el-input-number
              v-model="form.effectiveValidityDay"
              style="margin: 0 10px;"
              :disabled="form.effectivePeriodType !== 'received_specify_effective' || disabledCheck"
              :precision="0"
              placeholder="请输入有效期"
            />天
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="优惠叠加" prop="overlaySetting">
        <el-radio-group v-model="form.overlaySetting" :disabled="disabledCheck">
          <el-radio label="no_overlay">不与其他优惠叠加</el-radio>
          <el-row style="margin-top: 10px;">
            <el-radio label="overlay" :disabled="disabledCheck">与其他优惠叠加</el-radio>
            <el-checkbox-group v-if="form.overlaySetting === 'overlay'" v-model="form.couponInfoOverlayList" style="margin-top: 10px;">
              <el-checkbox v-for="item in couponOverlayType" :key="item.dictValue" :label="item.dictValue">{{ item.dictLabel }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分享图片" prop="sharePicture">
        <ResourcePicker
          v-model="form.sharePicture"
          :disabled="disabledCheck"
          size-hint="建议：210*168, 最大5m"
        />
      </el-form-item>
      <el-form-item label="使用说明" prop="useDirections">
        <el-input
          v-model="form.useDirections"
          :disabled="disabled || disabledCheck"
          style="width: 40%"
          :autosize="{ minRows: 3, maxRows: 4 }"
          type="textarea"
          maxlength="200"
          show-word-limit
          placeholder="请输入内容"
        />
      </el-form-item>
      <div class="title_coupon">发放和领取规则</div>
      <el-form-item label="领取人限制" prop="recipientLimit">
        <el-radio-group v-model="form.recipientLimit" :disabled="disabledCheck">
          <el-radio v-for="item in recipientLimitType" :key="item.dictValue" :label="item.dictValue">{{ item.dictLabel }}</el-radio>
        </el-radio-group>
        <el-row v-if="form.recipientLimit === 'limit_user'">
          <el-col>
            <el-tag
              v-for="level in clientData.filter(item => selectionClient.includes(item.levelId))"
              :key="level.levelId"
              style="margin-right: 10px"
              size="small"
              :closable="routerType !== 'check'"
              @close="onDelClient(level.levelId)"
            >
              {{ level.levelName }}
            </el-tag>
            <el-button type="text" :disabled="routerType === 'check'" @click="handaleClientOpen">选择</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="限领张数" prop="limitedNumberSheet">
        <el-col :span="3.5">
          <el-input-number
            v-model="form.limitedNumberSheet"
            :min="0"
            :disabled="disabledCheck"
            placeholder="请输入限领张数"
          />
        </el-col>
        <el-col :span="1" style="padding-left: 20px">张</el-col>
      </el-form-item>
      <el-form-item label="每日限领张数" prop="dailyLimit">
        <el-col :span="3.5">
          <el-input-number
            v-model="form.dailyLimit"
            :min="0"
            :disabled="disabledCheck"
            placeholder="请输入每日限领张数"
          />
        </el-col>
        <el-col :span="1" style="padding-left: 20px">张</el-col>
      </el-form-item>
      <el-form-item label="分享设置" prop="sharingSetting">
        <el-switch
          v-model="form.sharingSetting"
          :disabled="disabled || disabledCheck"
          :active-value="1"
          :inactive-value="0"
          @change="form.couponInfoActivityList = []"
        />
        <!-- <el-radio-group :disabled="disabled" v-model="form.sharingSetting">
          <el-radio
            v-for="dict in sharingSettingOptions"
            :key="dict.dictValue"
            :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group> -->
      </el-form-item>
      <el-form-item label="公开设置" prop="publicSetting">
        <el-switch
          v-model="form.publicSetting"
          :disabled="disabled || disabledCheck"
          :active-value="1"
          :inactive-value="0"
          @change="form.couponInfoActivityList = []"
        />
        <!-- <el-radio-group :disabled="disabled" v-model="form.publicSetting">
          <el-radio
            v-for="dict in publicSettingOptions"
            :key="dict.dictValue"
            :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group> -->
      </el-form-item>
      <el-form-item label="是否礼包" prop="isGiftPackage">
        <el-switch
          v-model="form.isGiftPackage"
          :disabled="disabled || disabledCheck"
          :active-value="1"
          :inactive-value="0"
        />
        <!-- <el-radio-group :disabled="disabled" v-model="form.isGiftPackage">
          <el-radio
            v-for="dict in isGiftPackageOptions"
            :key="dict.dictValue"
            :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group> -->
      </el-form-item>

      <el-form-item label="活动专享" prop="couponInfoActivityList">
        <el-checkbox-group v-model="form.couponInfoActivityList" :disabled="disabledCheck || form.isGiftPackage == 1">
          <el-checkbox v-if="form.publicSetting" label="home_page">首页弹窗</el-checkbox>
          <el-checkbox v-if="form.publicSetting" label="coupon_center">优惠券中心</el-checkbox>
          <el-checkbox v-if="form.publicSetting" label="promote_activity">推广活动</el-checkbox>

          <el-checkbox v-if="!form.publicSetting" label="member_privileges">会员专享</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="promote">中奖码</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="customer_give">客服发券</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="operation_give">运营发券</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="customer_group_give">客群维护</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="recharge_gift">充值赠送</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="score_mall">积分商城</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="marketing_activity">营销活动</el-checkbox>
          <el-checkbox v-if="!form.publicSetting" label="activity_share">分享活动</el-checkbox>
          <!-- <el-checkbox v-for="item in couponActivityType" :key="item.dictValue" :label="item.dictValue">{{ item.dictLabel }}</el-checkbox> -->
        </el-checkbox-group>
      </el-form-item>

      <div class="title_coupon">提醒</div>
      <el-form-item label="过期提醒" prop="expirationReminder">
        优惠券过期前
        <el-select
          v-model="form.expirationReminder"
          style="width: 80px;margin: 0 10px;"
          :disabled="disabledCheck"
          size="small"
        >
          <el-option
            v-for="item in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        天提醒
      </el-form-item>
      <div class="title_coupon">状态</div>
      <el-form-item label="是否启用" prop="isEnable">
        <el-radio-group v-model="form.isEnable" :disabled="disabled || disabledCheck">
          <el-radio
            v-for="dict in isEnableOptions"
            :key="dict.dictValue"
            :label="parseInt(dict.dictValue)"
          >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

    </el-form>
    <div class="dialog-footer">
      <el-button
        v-if="!disabledCheck"
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
    <el-dialog
      v-if="open"
      :title="type === 'group' ? '商品分组' : '商品'"
      :visible.sync="open"
      width="600px"
      append-to-body
      @close="onClose"
    >
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item v-if="type === 'group'" label="分组名称">
          <el-input
            v-model="queryParams.groupName"
            placeholder="分组名称"
          />
        </el-form-item>
        <el-form-item v-else label="商品名称">
          <el-input
            v-model="queryParams.goodsName"
            placeholder="商品名称"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="type === 'group' ? groupList : goodsList"
        tooltip-effect="dark"
        style="width: 100%"
        height="500"
        :row-key="(row) => row.couponId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          v-if="type === 'group'"
          label="分组名称"
          align="center"
          property="groupName"
        />
        <el-table-column
          v-else
          label="商品名称"
          align="center"
          property="goodsName"
        />
      </el-table>
      <div style="text-align: right; margin-top: 20px">
        <el-button type="primary" @click="modelSub">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择客户" :visible.sync="openClient" width="600px" append-to-body @close="onClientClose">
      <el-row style="height: 600px;border: 1px solid #e2e2e2;">
        <el-col :span="6" style="height: 100%;border-right: 1px solid #e2e2e2;">
          <div class="select_back">等 级</div>
        </el-col>
        <el-col :span="18" style="height: 100%;">
          <el-table
            ref="multipleClientTable"
            v-loading="clientLoading"
            :data="clientData"
            max-height="600"
            style="width: 100%"
            @selection-change="handleClientSelection"
          >
            <el-table-column type="selection" width="80" />
            <el-table-column label="客户等级" prop="levelName" align="center" />
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  addCouponInfo,
  getCouponInfo,
  updateCouponInfo,
  defaultGoodsInfo,
  getGroupList,
  getGoodsList
} from '@/api/marketing/couponInfo'
import { listLevel } from '@/api/customer/level'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'

import ResourcePicker from '@/components/ResourcePicker'
import DictSelect from '@/components/DictSelect.vue'

import { flatten, searchSuperior } from '@/utils/array'
import moment from 'moment'

export default {
  components: {
    ResourcePicker,
    Cascader,
    DictSelect
  },
  data() {
    const useThresholdValidate = (rule, value, callback) => {
      if (this.form.useThreshold === 'full_yuan' && (this.form.orderFull === undefined || this.form.orderFull === null)) {
        callback(new Error('请选输入满多少元'))
      } else {
        callback()
      }
    }

    const randomValidate = (rule, value, callback) => {
      if (this.form.randomDiscountLower === undefined || this.form.randomDiscountLower === null) {
        callback(new Error('请选输入随机优惠金额下限'))
      } else if (this.form.randomDiscountUpper === undefined || this.form.randomDiscountUpper === null) {
        callback(new Error('请选输入随机优惠金额上限'))
      } else if (this.form.randomDiscountLower > this.form.randomDiscountUpper) {
        callback(new Error('优惠金额上限必须大于优惠金额下限'))
      } else {
        callback()
      }
    }

    const discountValidate = (rule, value, callback) => {
      if (this.form.maxRadio && (this.form.maximumDiscount === undefined || this.form.maximumDiscount === null)) {
        callback(new Error('请选输入最多优惠多少元'))
      } else {
        callback()
      }
    }

    const effectiveTypeValidate = (rule, value, callback) => {
      if (this.form.effectivePeriodType === 'time_limit' && !this.form.effectiveTime) {
        callback(new Error('有效期限时间不能为空'))
      } else if (this.form.effectivePeriodType === 'received_effective' && !this.form.effectiveValidityDay) {
        callback(new Error('请输入有效期天数'))
      } else if (this.form.effectivePeriodType === 'received_specify_effective' && (this.form.effectiveReceivedDay === undefined || this.form.effectiveReceivedDay === null)) {
        callback(new Error('请输入生效天数'))
      } else if (this.form.effectivePeriodType === 'received_specify_effective' && (this.form.effectiveValidityDay === undefined || this.form.effectiveValidityDay === null)) {
        callback(new Error('请输入有效期天数'))
      } else {
        callback()
      }
    }

    const overlaySettingValidate = (rule, value, callback) => {
      if (this.form.overlaySetting === 'overlay' && this.form.couponInfoOverlayList.length === 0) {
        callback(new Error('请选择叠加优惠'))
      } else {
        callback()
      }
    }

    const activityValidate = (rule, value, callback) => {
      if (this.form.couponInfoActivityList.length < 1 && this.form.isGiftPackage == 0) {
        callback(new Error('请选择活动专享'))
      } else {
        callback()
      }
    }

    return {
      divLoading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 修改禁用
      disabled: this.$route.query.type === 'update',
      // 查看
      disabledCheck: this.$route.query.type === 'check',
      // 优惠券类型
      couponType: this.$route.query.couponType,
      // 组织
      orgOptions: [],
      // 商品分类
      groupList: [],
      // 商品列
      goodsList: [],
      // 客户等级
      customerLevel: [],
      // 是否启用
      isEnableOptions: [],
      // 分享设置
      sharingSettingOptions: [],
      // 公开设置
      publicSettingOptions: [],
      // 是否是礼包
      isGiftPackageOptions: [],
      // 叠加优惠
      couponOverlayType: [],
      // 活动专享
      couponActivityType: [],
      // 领取人限制
      recipientLimitType: [],
      // 弹出层类型
      type: null,
      // 是否显示弹出层
      open: false,
      // 选中数据
      modelSelect: [],
      loading: false,
      // 查询参数
      queryParams: {
        groupName: null,
        goodsName: null
      },
      // 选择客户modal
      openClient: false,
      // modal数据
      clientData: [],
      clientLoading: false,
      queryClientParams: {
        pageNum: 1,
        pageSize: 999,
        status: 1
      },
      // 选中客户等级
      selectionClient: [],
      // 表单参数
      form: {
        groupId: [],
        goodsId: [],
        isEnable: 0,
        sharingSetting: 1,
        publicSetting: 1,
        isGiftPackage: 0,
        useThreshold: 'no_threshold',
        effectivePeriodType: 'time_limit',
        overlaySetting: 'no_overlay',
        couponInfoOverlayList: [],
        recipientLimit: 'no_limit',
        couponInfoActivityList: [],
        expirationReminder: 1
      },
      // 总张数最小值
      minTotalNumber: 0,
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: '组织ID不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '展示顺序不能为空', trigger: 'change' }
        ],
        couponName: [
          { required: true, message: '优惠券名称不能为空', trigger: 'blur' }
        ],
        totalNumberSheet: [
          { required: true, message: '总张数不能为空', trigger: 'change' }
        ],
        useThreshold: [
          { validator: useThresholdValidate, trigger: 'blur' }
        ],
        discount: [
          { required: true, message: '优惠折扣不能为空', trigger: 'blur' },
          { validator: discountValidate, trigger: 'blur' }
        ],
        random: [
          { validator: randomValidate, trigger: 'blur' }
        ],
        overlaySetting: [
          { validator: overlaySettingValidate, trigger: 'blur' }
        ],
        channel: [
          { required: true, message: '访问渠道不能为空', trigger: 'blur' }
        ],
        effective: [
          { validator: effectiveTypeValidate, trigger: 'blur' }
        ],
        limitedNumberSheet: [
          { required: true, message: '限领张数不能为空', trigger: 'blur' }
        ],
        dailyLimit: [
          { required: true, message: '每日限领张数不能为空', trigger: 'blur' }
        ],
        orderFull: [
          { required: true, message: '订单满多少元不能为空', trigger: 'blur' }
        ],
        discountedPrice: [
          { required: true, message: '优惠金额不能为空', trigger: 'blur' }
        ],
        effectiveTime: [
          { required: true, message: '有效期限时间不能为空', trigger: 'blur' }
        ],
        couponInfoActivityList: [
          { validator: activityValidate, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    if (['update', 'copy', 'check'].includes(this.$route.query.type)) {
      this.handleInfo(this.$route.query.couponId)
    }
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('coupon_is_enable').then((response) => {
      this.isEnableOptions = response.data
    })
    this.getDicts('coupon_sharing_setting').then((response) => {
      this.sharingSettingOptions = response.data
    })
    this.getDicts('coupon_public_setting').then((response) => {
      this.publicSettingOptions = response.data
    })
    this.getDicts('coupon_is_gift_package').then((response) => {
      this.isGiftPackageOptions = response.data
    })
    getDropDown('customerLevel').then((response) => {
      this.customerLevel = response.data
    })
    this.getDicts('coupon_overlay_type').then((response) => {
      this.couponOverlayType = response.data
    })
    this.getDicts('coupon_activity_type').then((response) => {
      this.couponActivityType = response.data
    })
    this.getDicts('coupon_recipient_limit').then((response) => {
      this.recipientLimitType = response.data
    })
  },
  methods: {
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
      if (this.type === 'group') {
        getGroupList({
          ...this.queryParams,
          orgId:
            typeof this.form.orgId === 'string'
              ? this.form.orgId
              : this.form.orgId.slice(-1)[0]
        }).then((response) => {
          this.groupList = response.data
          if (this.form.groupId.length > 0) {
            this.toggleSelection(
              response.data.filter((item) =>
                this.form.groupId.includes(item.groupId)
              )
            )
          }
          this.loading = false
        })
      } else if (this.type === 'goods') {
        getGoodsList({
          ...this.queryParams,
          groupIds:
            typeof this.form.groupId === 'string'
              ? this.form.groupId
              : this.form.groupId.toString()
        }).then((response) => {
          this.goodsList = response.data
          if (this.form.goodsId.length > 0) {
            this.toggleSelection(
              response.data.filter((item) =>
                this.form.goodsId.includes(item.goodsId)
              )
            )
          }
          this.loading = false
        })
      }
    },
    // 刷新商品
    getGoodsList() {
      getGoodsList({
        ...this.queryParams,
        orgId: this.form.orgId,
        groupIds: this.form.groupId
      }).then((response) => {
        this.goodsList = response.data
      })
    },
    // 查询详情
    handleInfo(couponId) {
      this.divLoading = true
      getCouponInfo(couponId).then((response) => {
        const apiArr = [
          getGroupList({ orgId: response.data.orgId }),
          getGoodsList({
            groupIds: response.data.couponGroupList.map((item) => item.groupId)
          })
        ]
        if (response.data.couponInfoCustomerLevelList?.length > 0) {
          apiArr.push(getDropDown('customerLevel'))
        }
        Promise.all(apiArr).then((res) => {
          const orgArr = flatten(this.orgOptions, 'children')
          const orgId = searchSuperior(response.data.orgId, 'id', orgArr, 'parentId')
          this.divLoading = false
          this.groupList = res[0].data
          this.goodsList = res[1].data
          this.couponType = response.data.type
          this.form = {
            couponId: response.data.couponId,
            orgId: orgId,
            sort: response.data.sort,
            couponName: response.data.couponName,
            totalNumberSheet: response.data.totalNumberSheet,
            limitedNumberSheet: response.data.limitedNumberSheet,
            dailyLimit: response.data.dailyLimit,
            useThreshold: response.data.useThreshold,
            orderFull: response.data.orderFull / 100,
            discount: response.data.discount / 10,
            channel: response.data.channel,
            randomDiscountLower: response.data.randomDiscountLower / 100,
            randomDiscountUpper: response.data.randomDiscountUpper / 100,
            maximumDiscount: response.data.maximumDiscount / 100,
            maxRadio: response.data.maximumDiscount != -1,
            discountedPrice: response.data.discountedPrice && response.data.discountedPrice / 100,
            effectivePeriodType: response.data.effectivePeriodType,
            effectiveTime: response.data.effectivePeriodType === 'time_limit' && response.data.effectiveBeginTime ? [
              response.data.effectiveBeginTime,
              response.data.effectiveEndTime
            ] : null,
            effectiveReceivedDay: response.data.effectiveReceivedDay,
            effectiveValidityDay: response.data.effectiveValidityDay,
            overlaySetting: response.data.overlaySetting,
            couponInfoOverlayList: response.data.couponInfoOverlayList.map(item => item.overlayType),
            sharePicture: response.data.sharePicture,
            recipientLimit: response.data.recipientLimit,
            userLevel: response.data.userLevel,
            useDirections: response.data.useDirections ? response.data.useDirections : null,
            isEnable: response.data.isEnable,
            sharingSetting: response.data.sharingSetting,
            publicSetting: response.data.publicSetting,
            isGiftPackage: response.data.isGiftPackage,
            type: response.data.type,
            couponInfoActivityList: response.data.couponInfoActivityList.map(item => item.activityType),
            expirationReminder: response.data.expirationReminder,
            goodsId: response.data.couponGoodsList.map((item) => item.goodsId),
            groupId: response.data.couponGroupList.map((item) => item.groupId)
          }
          this.clientData = res[2] ? res[2].data : []
          this.selectionClient = response.data.couponInfoCustomerLevelList ? response.data.couponInfoCustomerLevelList.map(item => item.levelId) : []
          this.minTotalNumber = parseInt(response.data.totalNumberSheet)
        })
      })
    },
    // 选择区域后默认商品及分组
    onDefaultGoodsInfo(value) {
      if (value) {
        const orgId = value.slice(-1)[0]
        defaultGoodsInfo({ orgId }).then((res) => {
          this.groupList = res.data.goodsGroupList
          this.form.groupId = res.data.goodsGroupList.map(
            (item) => item.groupId
          )
          this.goodsList = res.data.goodsInfoList
          this.form.goodsId = res.data.goodsInfoList.map(
            (item) => item.goodsId
          )
        })
      }
    },
    // 删除分组
    onDelInfo(value, type) {
      if (type === 'group') {
        this.form.groupId = this.form.groupId.filter((item) => item !== value)
        const deleteGoodsId = this.goodsList.filter(item => item.groupId === value).map(item => item.goodsId)
        this.form.goodsId = this.form.goodsId.filter((item) => !deleteGoodsId.includes(item))
      } else if (type === 'goods') {
        this.form.goodsId = this.form.goodsId.filter((item) => item !== value)
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.modelSelect = selection.map((item) => {
        if (this.type === 'group') {
          return item.groupId
        } else if (this.type === 'goods') {
          return item.goodsId
        }
      })
    },
    // model打开
    handleModel(type) {
      if (type === 'group') {
        if (!this.form.orgId) return this.msgError('请先选择组织~')
      } else if (type === 'goods') {
        if (this.form.groupId.length === 0) { return this.msgError('请先选择商品分组~') }
      }
      this.type = type
      this.open = true
      this.getList()
    },
    // model关闭
    onClose() {
      this.queryParams = {
        groupName: null,
        goodsName: null
      }
    },
    // 打开选择客户modal
    handaleClientOpen() {
      this.getClientList()
    },
    // 关闭客户modal
    onClientClose() {
      this.queryClientParams = {
        pageNum: 1,
        pageSize: 9999,
        status: 1
      }
    },
    // 查询客户等级
    getClientList() {
      this.clientLoading = true
      listLevel(this.queryClientParams).then((response) => {
        this.clientData = response.rows
        this.clientLoading = false
        this.openClient = true
        if (this.selectionClient.length === 0) return
        response.rows.filter(item => this.selectionClient.includes(item.levelId)).forEach((row) => {
          setTimeout(() => {
            this.$refs.multipleClientTable.toggleRowSelection(row)
          }, 500)
        })
      })
    },
    // 选中客户等级
    handleClientSelection(selection) {
      this.selectionClient = selection.map(item => item.levelId)
    },
    // 删除选中客户等级
    onDelClient(levelId) {
      this.selectionClient = this.selectionClient.filter(item => item !== levelId)
    },
    // model确定
    modelSub() {
      if (this.type === 'group') {
        this.form.groupId = this.modelSelect
      } else if (this.type === 'goods') {
        this.form.goodsId = this.modelSelect
      }
      this.queryParams = {
        groupName: null,
        goodsName: null
      }
      this.open = false
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.recipientLimit === 'limit_user' && this.selectionClient.length === 0) {
            return this.warning('请选择指定人~')
          }
          const params = {
            ...this.form,
            type: this.couponType,
            orgId: typeof this.form.orgId === 'object'
              ? this.form.orgId.slice(-1)[0]
              : this.form.orgId,
            couponGoodsList: this.form.goodsId,
            couponGroupList: this.form.groupId,
            randomDiscountLower: this.form.randomDiscountLower ? this.form.randomDiscountLower * 100 : 0,
            randomDiscountUpper: this.form.randomDiscountUpper ? this.form.randomDiscountUpper * 100 : 0,
            discount: this.form.discount ? this.form.discount * 10 : this.form.discount,
            orderFull: this.form.useThreshold === 'full_yuan' ? this.form.orderFull * 100 : 0,
            discountedPrice: this.form.discountedPrice ? this.form.discountedPrice * 100 : 0
          }
          if (this.form.sGiftPackage) {
            params.couponInfoActivityList = []
          } else {
            if (this.form.publicSetting) {
              params.couponInfoActivityList = params.couponInfoActivityList.filter(item => !['member_privileges', 'promote', 'customer_give', 'operation_give', 'customer_group_give', 'recharge_gift'].includes(item))
            }
            if (!this.form.publicSetting) {
              params.couponInfoActivityList = params.couponInfoActivityList.filter(item => !['home_page', 'coupon_center'].includes(item))
            }
          }
          if (this.couponType === 'discount' && !this.form.maxRadio) {
            params.maximumDiscount = -1
          } else if (this.couponType === 'discount' && this.form.maxRadio) {
            params.maximumDiscount = this.form.maximumDiscount * 100
          }
          if (this.form.effectivePeriodType === 'time_limit' && this.form.effectiveTime && this.form.effectiveTime.length === 2) {
            params.effectiveBeginTime = moment(
              this.form.effectiveTime[0]
            ).format('YYYY-MM-DD HH:mm:ss')
            params.effectiveEndTime = moment(this.form.effectiveTime[1]).format(
              'YYYY-MM-DD HH:mm:ss'
            )
          } else if (this.form.effectivePeriodType === 'received_effective') {
            params.effectiveReceivedDay = 0
          }
          if (this.form.recipientLimit === 'limit_user') {
            params.customerLevelIdList = this.selectionClient
          }
          delete params.effectiveTime
          delete params.goodsId
          delete params.groupId
          this.$confirm(
            `是否确定${{ update: '修改', add: '新增', copy: '复制' }[this.routerType]}优惠券信息?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            switch (this.routerType) {
              case 'update':
                return updateCouponInfo(params)
              case 'add':
              case 'copy':
                return addCouponInfo(params)
            }
          }).then(() => {
            this.msgSuccess(`${{ update: '修改', add: '新增', copy: '复制' }[this.routerType]}成功`)
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
.title_coupon {
  color: #333;
  padding: 18px 0;
  font-size: 20px;
  font-weight: 600;
}
.back{
  text-align: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e2e2;
}
.select_back{
  text-align: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e2e2;
  background: #F6953C;
}
</style>
