<template>
  <div class="app-container">
    <el-form :loading="loading" ref="form" :model="form" :rules="rules" :disabled="routerType == 'review'" label-width="120px">
      <div class="form-title">基本信息</div>
      <el-form-item label="活动名称" prop="activityName">
        <el-input
          v-model="form.activityName"
          style="width: 400px"
          maxlength="8"
          show-word-limit
          placeholder="请输入活动名称"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 400px"
          :disabled="routerType == 'review'"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="生效日期" prop="effectiveDateTime">
        <el-date-picker
          v-model="form.effectiveDateTime"
          size="small"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item label="奖品设置" prop="activityTotalNum">
        <div><el-button type="text" size="small" @click="openDialogCoupon">选择优惠券</el-button></div>
        <el-table
          :data="selectedCoupons"
          border
          style="width: 800px"
        >
          <el-table-column
            prop="couponName"
            label="优惠券名称"
            align="center"
            />
          <!-- <el-table-column
            prop="orgName"
            label="组织"
            align="center"
             /> -->
          <el-table-column
            prop="useThreshold"
            label="门槛"
            align="center"
          />
          <el-table-column
            prop="couponDiscountFlag"
            label="优惠"
            align="center"
             />
          <el-table-column
            prop="totalNumberSheet"
            label="总张数"
            align="center"
             />
          <el-table-column
            prop="limitedNumberSheet"
            label="限领"
            align="center"
             />
          <el-table-column
            prop="dailyLimit"
            label="每日限领"
            align="center"
             />
          <el-table-column
            label="活动总张数"
            align="center"
            width="200"
          >
            <template  slot-scope="{row}">
              <el-input-number size="small" :min="1" :max="row.totalNumberSheet>>0" v-model="form.activityTotalNum" style="width: 160px" />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <div class="form-title mt20">规则设置 <small class="text-red ml10">双方都需要发券，不管售后退款，延后时间可配置</small></div>
      <el-form-item label="分享人数" prop="effectUserNum">
        <el-radio-group v-model="form.effectType">
          <el-radio label="share">点击</el-radio>
          <el-radio label="pay">支付</el-radio>
        </el-radio-group>
        <div class="mt10">
          生效参与人数
          <el-input-number size="medium" class="ml5 mr5" :min="1" v-model="form.effectUserNum" /> 人
        </div>
      </el-form-item>

      <el-form-item label="奖励限制" prop="userLimitFlag">
        <el-checkbox v-model="form.userLimitFlag">限定每人获取奖励次数</el-checkbox> 
        <span class="text-red ml10">可以分享次数大于限制数输入数值小于优惠券总张数</span>
      </el-form-item>
     
      <el-form-item v-show="form.userLimitFlag" label="奖品限制">
        <el-form-item prop="userActivityNum">
          <el-checkbox v-model="form.userActivityLimitFlag">限制每人活动期间内最多获取次数</el-checkbox> 
          <el-input-number size="medium" class="ml5 mr5" :min="1" :disabled="!form.userActivityLimitFlag" v-model="form.userActivityNum"/>次
        </el-form-item>
        <el-form-item class="mt20" prop="userDateNum">
          <el-checkbox v-model="form.userDateLimitFlag">限制每人每</el-checkbox> 
          <el-select
            v-model="form.userDateType"
            :disabled="!form.userDateLimitFlag"
            placeholder=""
            clearable
            size="small"
            class="ml5"
            style="width: 80px"
          >
            <el-option
              v-for="dict in dateTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
          最多获取奖品 
          <el-input-number size="medium" class="ml5 mr5" :min="1" v-model="form.userDateNum" :disabled="!form.userDateLimitFlag" style="width:180px" />个
         </el-form-item>
      </el-form-item>

      <el-form-item label="活动商品" prop="goodsIdList">
        <el-radio-group v-model="form.joinGoodsType">
          <el-radio label="all">全部商品</el-radio>
          <el-radio label="part">部分商品</el-radio>
        </el-radio-group>
        <template v-if="form.joinGoodsType==='part'">
          <div>
            <el-button type="text" size="small" @click="openDialogGoods">选择商品</el-button>
            <jump class="ml10" path="/goodsmanage/goods/add" :query="{activeName: 'info'}"> <span>新增商品</span></jump>
          </div>
          <div>最多只能选择10个商品</div>
           <el-table
            ref="gooodsTable"
            :data="selectedGoods"
            border
            style="width: 800px"
          >
            <el-table-column
              label="商品名称"
              min-width="220"
            >
              <template slot-scope="{row}">
                <el-row :gutter="20" style="display: flex">
                  <img
                    :src="prefix+row.thumbnail ? prefix+row.thumbnail : '/avatar.png'"
                    style="width: 60px; height: 60px; margin-left: 10px"
                  >
                  <el-col>
                    <el-row :gutter="20">
                      <el-col class="mb10">{{row.goodsName}}</el-col>
                      <el-col :span="12">销量：{{row.salesStock}}</el-col>
                      <el-col :span="12">库存：{{row.totalStock}}</el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column
              label="商品分组"
              align="center"
              prop="groupNameList"
              min-width="180"
            >
              <template slot-scope="{row}">
                <div v-for="(name, index) in row.groupNameList" :key="index">{{name}}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="120">
              <template slot-scope="{row, $index}">
                <el-popconfirm
                  title="是否确认删除该商品？"
                  @confirm="handleRemove(row, $index)"
                >
                  <el-button slot="reference" type="text" size="small">移除</el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
         
          <div class="mt10">已选商品<span class="text-red">({{this.selectedGoods.length}})</span></div>
        </template>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <span v-if="routerType == 'review'">
          {{{disable: '暂停', enable: '开启', overdue: '失效'}[form.status]}}
        </span>

        <el-radio-group v-else v-model="form.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictValue"
          >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="routerType !== 'review'">
        <el-button :loading="submitLoading" type="primary" @click="submitForm('form')">{{routerType === 'add' ? '保存' : '修改'}}</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
    <el-button v-if="routerType == 'review'" @click="cancel" style="margin: 20px 120px">返回</el-button>
    <dialog-coupon ref="dialogCoupon" @selected-coupon="getSelectedCoupon" :org-id="form.orgId" :selected="selectedCoupon"/>
    <dialog-goods ref="dialogGoods" @selected-goods="getSelectedGoods" :org-id="form.orgId" :moved-goods-id="movedGoodsId" :selected="form.goodsIdList" />
  </div>
</template>

<script>
import DialogCoupon from './components/DialogCoupon' 
import DialogGoods from './components/DialogGoods'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'
import { flatten, searchSuperior } from '@/utils/array'


import {
  addShareInfo,
  updateShareInfo,
  getShareInfo,
} from "@/api/marketing/shareInfo";

export default {
  components: {
    DialogCoupon,
    Cascader,
    DialogGoods,
  },
  data() {
    return {
      // 已选的优惠券
      selectedCoupon: null,
      // 已选的商品
      selectedGoods: [],
      // 组织
      orgOptions: [],
      // 奖品限制领取时间规则
      dateTypeOptions: [],
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 移除的商品ID
      movedGoodsId: '',
      // 表单参数
      form: {
        effectType: 'share',
        joinGoodsType: 'all',
        userLimitFlag: 0,
        userDateType: 'day',
        status: 'disable',
        orgId: null,
        shareRewardList: [
          {rewardType: 'coupon'}
        ]
      },
      
      // 界面类型
      routerType: this.$route.query.type,
      // 是否启用
      statusOptions: [
        {dictLabel: '暂停', dictValue: 'disable'},
        {dictLabel: '开启', dictValue: 'enable'},
      ],
      loading: false,
      // 提交按钮loading
      submitLoading: false,
      // 表单校验
      rules: {
        activityName: [ { required: true, message: '活动名称不能为空', trigger: 'blur' }],
        orgId: [ { required: true, message: '组织不能为空', trigger: 'change' }],
        activityTotalNum: [
          { validator: (rule, value, callback) => {
            if (!this.selectedCoupon) {
              callback(new Error('请先选择一张优惠券'))
            } else if (!value){
              callback(new Error('请设置活动总张数'))
            } else {
              callback()
            }
          }, required: true, trigger: 'blur' },
        ],
        userActivityNum: [{validator: (rule, value, callback) => {
          this.form.userActivityLimitFlag && !value ? callback(new Error('请设置每人活动期间内最多获取次数')) : callback()
        }, trigger: 'blur'}],
        goodsIdList: [{validator: (rule, value, callback) => {
          this.form.joinGoodsType == 'part' && (!this.form.goodsIdList || this.form.goodsIdList.length == 0) ? callback(new Error('请至少选择一个商品')) : callback()
        }, trigger: 'change'}],
        userDateNum: [{validator: (rule, value, callback) => {
          this.form.userDateLimitFlag && !value ? callback(new Error(`请设置每人每${{day: '日', week: '周', month: '月' }[this.form.userDateType]}最多获取奖品数`)) : callback()
        }, trigger: 'blur'}],
        effectiveDateTime : [{ required: true, message: '有效时间不能为空', trigger: 'change' }],
        effectUserNum: [{ required: true, message: '请输入有效参与人数', trigger: 'blue' }]
      }
    }
  },
  watch: {
    selectedGoods(val, oldVal) {
      this.form.goodsIdList = val.map(item => item.goodsId.toString())
    },
    selectedCoupon(val, oldVal) {
      if(!val) delete this.form.activityTotalNum
    },
    'form.orgId'(val, oldVal) {
      if(val !== oldVal && !this.loading) {
        this.selectedCoupon = null
        this.selectedGoods = []
      }
    }
  },
  computed: {
    selectedCoupons() {
      return this.selectedCoupon ?  [this.selectedCoupon] : []
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('common_date_type').then((response) => {
      this.dateTypeOptions = response.data
    })
    
  }, 
  mounted() {
    if (['update', 'review'].includes(this.routerType)) {
      this.getInfo(this.$route.query.activityShareId)
    }
  },
  methods: {
    resetForm() {
      this.$refs['form'].resetFields();
    },
    // 打开弹窗
    openDialog(modalType) {
      this.$refs['form'].validateField('orgId', (errorMsg)=>{
        if(errorMsg) {
          this.$message({
            message: `${errorMsg},请先选择组织！` ,
            type: 'error'
          });
        } else  {
          this.$refs[modalType].dialogVisible = true
        }
      }) 
    },
    /**
     * 打开选择优惠券弹框
     */
    openDialogCoupon() {
      this.openDialog('dialogCoupon') 
    },
    /**
     * 打开选择商品弹框
     */
    openDialogGoods() {
      this.openDialog('dialogGoods') 
    },

    /**
     * 选中的优惠券
     */
    getSelectedCoupon(selectedCoupon) {
      this.selectedCoupon = selectedCoupon
      this.form.shareRewardList[0].rewardValue = selectedCoupon.couponId
    },
    /**
     * 选中的商品
     */
    getSelectedGoods(selectedItems) {
      this.selectedGoods = selectedItems
    },
    /**
     * 移出的商品
     */
    handleRemove(row, index) {
      this.selectedGoods.splice(index, 1)
      this.movedGoodsId = row.goodsId
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1)
    },
    // 查询详情
    getInfo(activityShareId) {
      this.loading = true
      getShareInfo(activityShareId)
        .then(res => {
          const {activityStartTime, activityShareId, activityEndTime, shareRewardList, joinGoodsType, userLimitFlag, effectType, activityName, effectUserNum, activityTotalNum, userActivityNum, userDateNum, userDateType, status,userActivityLimitFlag, userDateLimitFlag} = res.data
          const orgArr = flatten(this.orgOptions, 'children')
          const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
          const effectiveDateTime = activityStartTime ? [ activityStartTime, activityEndTime ] : null
          this.selectedCoupon = shareRewardList[0].rewardDetail
          
          if(joinGoodsType == 'part') this.selectedGoods = res.data.goodsInfoList

          this.form = {
            activityShareId,
            effectType,
            activityName,
            effectUserNum,
            joinGoodsType,
            activityTotalNum,
            activityStartTime,
            activityEndTime,
            effectiveDateTime,
            shareRewardList: shareRewardList.map( item=> {
              return {
                rewardType:item.rewardType,
                rewardValue:item.rewardValue
              }
            }),
            userLimitFlag: !!(userLimitFlag>>0),
            userActivityNum, 
            userDateNum, 
            userDateType, 
            status,
            orgId,
            userActivityLimitFlag: !!(userActivityLimitFlag>>0),
            userDateLimitFlag: !!(userDateLimitFlag>>0),
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * foramtParams
     */

    formatParams() {
      const { shareRewardList, joinGoodsType, userLimitFlag, effectType, activityName, effectUserNum, activityTotalNum, userActivityNum, userDateNum, userDateType, status, userActivityLimitFlag, userDateLimitFlag, effectiveDateTime, orgId, goodsIdList} = this.form
      const params = {
        activityName,
        orgId: typeof orgId === 'object' ? orgId.slice(-1)[0] : orgId,
        activityStartTime: moment( effectiveDateTime[0] ).format('YYYY-MM-DD HH:mm:ss'),
        activityEndTime: moment( effectiveDateTime[1] ).format('YYYY-MM-DD HH:mm:ss'),
        shareRewardList,
        effectType,
        effectUserNum,
        joinGoodsType,
        activityTotalNum,
        userLimitFlag: userLimitFlag>>0,
        userActivityLimitFlag: userActivityLimitFlag>>0,
        userDateLimitFlag: userDateLimitFlag>>0,
        status,
      }
      let userLimtFlagParams =  {}
      if(userLimitFlag) {
        if(userDateLimitFlag) userLimtFlagParams = {...userLimtFlagParams, userDateNum, userDateType}
        if(userActivityLimitFlag) userLimtFlagParams = {...userLimtFlagParams, userActivityNum}
      } else {
        userLimtFlagParams = {...userLimtFlagParams, userActivityLimitFlag: 0, userDateLimitFlag : 0 }
      }

      const joinGoodsParams = joinGoodsType === 'all' ? {} : {goodsIdList}
      return {
        ...params,
        ...userLimtFlagParams,
        ...joinGoodsParams
      }
    },

    /**
     * 表单提交
     */
    submitForm() {
      const type = this.routerType == 'add' ? '新增' : '更新'
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.$confirm(`是否确认${type}分享有礼信息?`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              let params = this.formatParams()
              this.submitLoading = true
              return this.form.activityShareId != null
                ? updateShareInfo({...params, activityShareId: this.form.activityShareId})
                : addShareInfo(params)
            })
            .then(() => {
              this.msgSuccess(`${type}分享有礼信息成功`);
              this.cancel()
            })
            .finally(() => {
              this.submitLoading = false
            })
        }
      })
    },
  }
}
</script>
<style scoped lang="scss">
.form-title {
  padding: 18px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
  small {
    font-size: 14px;
    font-weight: 400;
  }
}
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
</style>
 