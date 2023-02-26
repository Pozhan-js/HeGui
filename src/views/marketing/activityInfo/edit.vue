<template>
  <!-- 添加或修改活动信息对话框 -->
  <el-dialog :title="title" :visible.sync="open"  :before-close="handleClose">
    <el-form ref="form" :model="form" :disabled="type == 'review'" :rules="rules" label-width="120px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input v-model="form.activityName" placeholder="请输入活动名称" />
      </el-form-item>
      <el-form-item label="活动渠道" prop="activityChannel">
        <el-select
          v-model="form.activityChannel"
          placeholder="请选择活动渠道"
          clearable
        >
          <el-option
            v-for="dict in activityChannelOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用范围" prop="activityScope" required>
        <el-radio-group v-model="form.activityScope" @change="handleChangeForScope">
          <el-radio-button label="all"> 全国通用</el-radio-button>
          <el-radio-button label="other"> 个性化 </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="form.activityScope == 'other'" label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          :disabled="type == 'review'"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :popupStyle="{zIndex: 9999}"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="handleChangeForOrg"
        />
      </el-form-item>
      <el-form-item label="活动时间" prop="activityStartTime">
        <range-picker 
          clearable
          size="small"
          :s-time.sync="form.activityStartTime"
          :e-time.sync="form.activityEndTime"/>
      </el-form-item>
      <el-form-item label="活动内容" prop="activityGoodsList">
        <el-table
          ref="multipleTable"
          v-loading="activeGoodsListloading"
          size="small"
          :data="activityGoodsList"
          :row-key="(row) => row.goodsId"
          @selection-change="handleSelectionChange"
      >
          <el-table-column type="selection" reserve-selection width="76" align="center" />
          <el-table-column label="产品名称" align="center" prop="goodsName" />
          <el-table-column label="零售价（元）" align="center" >
            <template slot-scope="{row}"> {{ row.price && toDecimal2((row.price>>0) / 100) }}</template>
          </el-table-column>
          <el-table-column label="优惠" align="center">
            <el-table-column
              label="赠送积分数量"
              align="center"
            >
              <template slot-scope="{row}">
                <span v-if="row.isEdit">
                  <el-input-number size="mini" :min="0" v-model="row.score" />
                </span>
                <span v-else :class="[row.sendScore || 'text-gray']">{{row.sendScore ? row.sendScore : '不设置赠送0'}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="赠送打包优惠券"
              align="center"
              prop="sendCouponPackageId"
            >
              <template slot-scope="{row, $index}">
                <template v-if="row.sendCouponPackageName || row.packageName" >
                  <el-button v-if="row.isEdit" size="mini" type="text"  @click="openDialogCoupon($index)">{{row.packageName}}</el-button>
                  <span v-else>{{row.sendCouponPackageName}}</span>
                </template>
                <el-row v-else>
                  <el-col :span="12">空</el-col>
                  <el-col :span="12"><el-button size="mini" type="text" :disabled="!row.isEdit" @click="openDialogCoupon($index)">选择</el-button></el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="{row, $index}">
                
                <template v-if="row.isEdit">
                  <el-button
                    size="mini"
                    type="text"
                    @click="handleSave(row, $index)"
                    >保存
                  </el-button>
                  <el-button
                    size="mini"
                    type="text"
                    @click="handleCancel(row, $index)"
                    >取消
                  </el-button>
                </template>
                <el-button
                  v-else
                  size="mini"
                  type="text"
                  @click="handleEdit(row)"
                  >编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="积分限额" >
        <el-form-item prop="userDayScore">
          <span>每人每日限制积分</span>
          <el-input-number
            v-model="form.userDayScore"
            :min="0"
            size="small"
            placeholder=""
            style="margin: 0 5px"
          />
          <span>个</span>
        </el-form-item>
        <el-form-item class="mt20" prop="userActivityScore">
          <span>每人活动最大获得</span>
          <el-input-number
            v-model="form.userActivityScore"
            :min="0"
            size="small"
            placeholder=""
            style="margin: 0 5px"
          />
          <span>个</span>
        </el-form-item>
        <el-form-item class="mt20" prop="activityTotalScore">
          <span>活动总积分</span>
          <el-input-number
            v-model="form.activityTotalScore"
            :min="0"
            size="small"
            placeholder=""
            style="margin: 0 5px"
          />
          <span>个</span>
        </el-form-item>
      </el-form-item>
      <el-form-item label="异常提醒" prop="abnormal" disabled>
        <div>
          活动结束前
          <el-input-number
            v-model="form.outBeforeDay"
            :min="0"
            disabled
            size="small"
            placeholder=""
            style="margin: 0 5px"
          />
          天，或打包优惠券剩余
          <el-input-number
            v-model="form.residueCouponNum"
            :min="0"
            disabled
            size="small"
            placeholder=""
            style="margin: 0 5px"
          />
          张
        </div>
        <el-form-item class="mt20" prop="sendPhone">
          短信提醒给/企业微信消息通知给
          <el-input
            v-model="form.sendPhone"
            disabled
            placeholder=""
            maxlength="11"
            size="small"
            style="width: 200px; margin: 0 5px"
          />
        </el-form-item>
      </el-form-item>
      <el-form-item label="是否启用" prop="status">
        <span v-if="type == 'review'">
          {{{disable: '停用', enable: '启用', overdue: '失效'}[form.status]}}
        </span>
        <el-radio-group v-else v-model="form.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="type == 'review'" @click="cancel">返回</el-button>
      <template v-else>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="this.$store.state.isLoading"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </template>
    </div>

    <el-dialog
      title="选择打包优惠券"
      :visible.sync="dialogCouponVisible"
      append-to-body
    >
      <pcg-coupons ref="pcgCoupons"  :is-open="dialogCouponVisible" @cancel="dialogCouponVisible = false" @selected-coupon="getSelectedCoupon" :org-id="form.orgId" :selected-id="selectedCouponPckId"/>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  addActivityInfo,
  getActivityInfo,
  updateActivityInfo,
} from "@/api/marketing/activityInfo";
import { goodsStockList } from "@/api/marketing/shareInfo"
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import RangePicker from '@/components/RangePicker'
import PcgCoupons from './components/PcgCoupons' 
import { flatten, searchSuperior } from '@/utils/array'

export default {
  name: "DialogEdit",
  components: {
    Cascader,
    RangePicker,
    PcgCoupons
  },
  props: {
    type: String
  },
  
  data() {
    //手机号验证
    const checkPhone = (rule, value, callback) => {
      if (value && value.trim()) {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error("请输入正确的手机号"));
        }
      } else {
        callback()
      }
    }

    const checkOrgId = (rule, value, callback) => {
      if(this.form.activityScope == 'other' && !value) {
        return callback(new Error("请选择组织"));
      } else {
        callback()
      }
    }
    const checkContent = (rule, value, callback) => {
      if(this.type == 'review' || this.form.activityGoodsList.length) {
        callback()
      } else {
        return callback(new Error("请至少选择一条活动商品内容"));
      }
    }
    const checkUserDayScore =  (rule, value, callback) => {
      if(value) {
        if(this.form.userActivityScore) return value > this.form.userActivityScore ?  callback(new Error("每日每人限制积分不能大于每人活动最大获得积分")) :  callback()
        else if(this.form.activityTotalScore) return value > this.form.userActivityScore ?  callback(new Error("每日每人限制积分不能大于活动总积分")) :  callback()
      } else {
        return callback();
      }
    }
    
    const checkUserActivityScore =  (rule, value, callback) => {
      if(value) {
        return this.form.activityTotalScore &&  value > this.form.activityTotalScore ? callback(new Error("每人活动最大获得积分不能大于活动总积分")) :  callback()
      } else {
        return callback();
      }
    }

    return {
      activeGoodsListloading: false,
      activityGoodsList: [],
      open: false,
      dialogCouponVisible: false,
      activityIndex: null,
      total: 0,
      // 组织
      orgOptions: [],
      // 表单参数
      form: {
        activityScope:undefined,
        status: undefined,
        activityGoodsList: []
      },
      // 表单校验
      rules: {
        activityName:[{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        activityChannel:[{ required: true, message: '请选择活动渠道', trigger: 'change' }],
        activityStartTime:[{ required: true, message: '请选择有效期', trigger: 'blur' }],
        orgId: [{ validator: checkOrgId,  message: '请选择组织', trigger: 'change' }],
        sendPhone: [ {validator: checkPhone, trigger: "blur" }],
        activityGoodsList: [{validator: checkContent, trigger: "change"}],
        userDayScore: [{validator: checkUserDayScore, trigger: "change"}],
        userActivityScore: [{validator: checkUserActivityScore, trigger: "change"}],
      },
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      activityChannelOptions: null,
      orgOptions: [],
      statusOptions: [
        { label: "停用", value: "disable" },
        { label: "启用", value: "enable" },
      ],
      goodsQuery: {
        pageNum: 1,
        pageSize: 9999
      }
    };
  },
  watch: {},
  created() {
    this.getDicts("activity_channel").then((response) => {
      this.activityChannelOptions = response.data;
    });
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
        this.topOrgId = this.orgOptions[0].id
      }
    })
  },
  computed: {
    query() {
      const activityGoodsList = this.form.activityGoodsList.map(item=>{
        const {sendScore,sendCouponPackageId, sendCouponPackageName, goodsId, goodsInfo} = item
        return {sendScore,sendCouponPackageId, sendCouponPackageName, goodsId, goodsInfo}
      })
      const orgId = this.form.activityScope == 'all' ? this.topOrgId : this.form.orgId
      const { activityName,
              activityChannel,
              activityScope,
              activityStartTime,
              activityEndTime,
              userDayScore,
              userActivityScore,
              activityTotalScore,
              outBeforeDay,
              residueCouponNum,
              sendPhone,
              status,
              activityId,
            } = this.form
      const obj = {}
      Object.entries({userDayScore, userActivityScore, activityTotalScore, outBeforeDay, residueCouponNum, sendPhone, activityId}).forEach(([key, value]) => {
        if(typeof value != 'undefined') obj[key] = value
      })
      return {
        activityName,
        activityChannel,
        activityScope,
        activityStartTime,
        activityEndTime,
        ...obj,
        status,
        activityGoodsList,
        orgId: this.getOrgIdStr(orgId),
      }
    },
    selectedCouponPckId() {
      return this.activityIndex != null ? this.activityGoodsList[this.activityIndex].couponPckId : null
    },
    maxTotalScore() {
      return this.form.activityGoodsList.reduce((prev, cur) => prev + (cur.sendScore>>0),  0)
    }
  },
  methods: {
    handleClose(done) {
      this.$refs['form']?.clearValidate()
      done()
    },
    /** 查询活动商品列表 */
    getList() {
      this.activeGoodsListloading = true;
      goodsStockList(this.goodsQuery).then((response) => {
        this.activityGoodsList = response.rows.map(item => {
          let promtObj = {sendScore: 0, sendCouponPackageId: undefined, sendCouponPackageName: undefined}
          this.form.activityGoodsList.forEach( goods => {
            if(goods.goodsId == item.goodsId) {
              const {sendScore, sendCouponPackageId, sendCouponPackageName} = goods
              promtObj = {sendScore, sendCouponPackageId, sendCouponPackageName}
            }
          });
          return {
            goodsId: item.goodsId,
            goodsInfo: {...item},
            goodsName: item.goodsName,
            price: item.price,
            isEdit: false,
            score: promtObj.sendScore,
            packageName: promtObj.sendCouponPackageName,
            couponPckId: promtObj.sendCouponPackageId,
            ...promtObj,
          }
        });
        this.handleToggleRowSelections()
        this.total = response.total;
      }).finally(()=>this.activeGoodsListloading = false)
    },
    // 获取活动信息
    getInfo(activityId) {
      getActivityInfo(activityId).then((response) => {
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(response.data.orgId, 'id', orgArr, 'parentId')
        this.goodsQuery.orgId = orgId
        this.form = {...response.data, orgId};
        this.open = true
        this.getList()
      });
    },
    // 回显所选商品，表表格商品同步UI
    handleToggleRowSelections() {
      const goodsIds = this.form.activityGoodsList.map(item => item.goodsId)
      this.$nextTick(()=>{
        for(let i = 0; i< this.activityGoodsList.length; i++) {
          this.$refs?.multipleTable?.toggleRowSelection(this.activityGoodsList[i], goodsIds.includes(this.activityGoodsList[i].goodsId+''))
        }
      })
    },
    // 商品复选 
    handleSelectionChange(selection) {
      this.form.activityGoodsList = selection
    },
    // 切换适应范围
    handleChangeForScope(val) {
      if(val == 'all') {
        this.goodsQuery.orgId = this.topOrgId
        this.getList()
      } else {
        this.goodsQuery.orgId = undefined
        this.activityGoodsList = []
      }
      this.form.orgId = undefined
      this.activityIndex = null
      this.form.activityGoodsList = []
    },
    // 切换组织
    handleChangeForOrg(val) {
      if(this.form.activityScope == 'other' && this.getOrgIdStr(val) == this.getOrgIdStr(this.goodsQuery.orgId)) return
      this.goodsQuery.orgId = val
      this.form.activityGoodsList = []
      val.length ? this.getList() : this.activityGoodsList = []
    },
    // 获取最后一级的orgId
    getOrgIdStr(orgId) {
      return orgId ? typeof orgId === 'object' ? orgId.slice(-1)[0] : orgId : undefined
    },
    // 输入框值改变
    inputChange() {
      this.form.telephone = this.form.telephone.replace(/[^\d]/g, "");
    },
    
    // 取消按钮
    cancel() {
      // this.reset();
      this.open = false;
    },
    // 编辑
    handleEdit(row) {
      row.isEdit = !row.isEdit
    },
    /**
     * 打开选择优惠券弹框
     */
    openDialogCoupon(index) {
      this.activityIndex = index
      this.dialogCouponVisible = true
    },

    /**
     * 选中的优惠券
     */
    getSelectedCoupon(selectedCoupon) {
      if(selectedCoupon) {
        this.activityGoodsList[this.activityIndex].packageName = selectedCoupon.packageName
        this.activityGoodsList[this.activityIndex].couponPckId = selectedCoupon.couponPckId
      }
      this.dialogCouponVisible = false
    },
    // 保存编辑项
    handleSave(row) {
      row.isEdit = false
      row.sendCouponPackageName = row.packageName
      row.sendCouponPackageId = row.couponPckId
      row.sendScore = row.score
    },
 
    // 取消编辑项
    handleCancel(row) {
      row.isEdit = false
      row.packageName = row.sendCouponPackageName
      row.couponPckId= row.sendCouponPackageId 
      row.score = row.sendScore
    },
    // 表单重置
    reset() {
      this.form = {
        activityName: undefined,
        activityChannel: undefined,
        activityScope: 'all',
        orgId: undefined,
        activityStartTime: undefined,
        activityEndTime: undefined,
        status: 'disable',
        activityGoodsList: [],
      };
      this.$refs?.multipleTable?.clearSelection()
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const type = this.form.activityId != null ? "修改" : "新增";
          this.$confirm(`是否确认${type}活动信息?`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(() => {
            return this.form.activityId != null
              ? updateActivityInfo(this.query)
              : addActivityInfo(this.query);
          })
          .then(() => {
            this.msgSuccess(`${type}活动信息成功`);
            this.open = false;
            this.$emit('updateList')
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.text-gray{
  color: #ddd;
}
/deep/ .el-input-number--small {
  width: 200px;
}
</style>