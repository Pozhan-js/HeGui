<template>
  <div style="padding: 20px">
    <el-form ref="queryForm" :model="queryParams" :rules="rules" label-width="150px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          :options="orgOptions"
          v-model="queryParams.orgId"
          style="width: 30%"
          placeholder="组织"
          :disabled="bottomDiv"
          change-on-select
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item :label="{consume: '支付时间', waitingTime: '支付时间', unpaid: '下单时间'}[this.$route.query.viveType]" prop="time">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.time"
          :picker-options="pickerOptions"
          :disabled="bottomDiv"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item :label="{consume: '购买金额', unpaid: '订单金额'}[viveType]" required v-if="viveType === 'consume' || viveType === 'unpaid'">
        <el-col :span="2">
          <el-form-item prop="beginAmount">
            <el-input-number :disabled="bottomDiv" style="width: 100%" :min="1" v-model="queryParams.beginAmount"/>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1"><div style="border-bottom: 1px solid;padding-top: 18px;margin: 0px 12px;"></div></el-col>
        <el-col :span="2">
          <el-form-item prop="endAmount">
            <el-input-number :disabled="bottomDiv" style="width: 100%" :min="queryParams.beginAmount" v-model="queryParams.endAmount"/>
          </el-form-item>
        </el-col>
        <el-col :span="4" style="padding-left: 10px;color: #000;font-weight: 600;font-size: 15px;">元</el-col>
      </el-form-item>
      <el-form-item label="购买订单量" required v-if="viveType === 'consume'">
        <el-col :span="2">
          <el-form-item prop="beginNum">
            <el-input-number style="width: 100%" :disabled="bottomDiv"  :min="1" v-model="queryParams.beginNum"/>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1"><div style="border-bottom: 1px solid;padding-top: 18px;margin: 0px 12px;"></div></el-col>
        <el-col :span="2">
          <el-form-item prop="endNum">
            <el-input-number style="width: 100%" :disabled="bottomDiv" :min="queryParams.beginNum" v-model="queryParams.endNum"/>
          </el-form-item>
        </el-col>
        <el-col :span="4" style="padding-left: 10px;color: #000;font-weight: 600;font-size: 15px;">数量</el-col>
      </el-form-item>
      <el-form-item label="支付到完成" required v-if="viveType === 'waitingTime'">
        <el-col :span="2">
          <el-form-item prop="beginNum">
            <el-input-number style="width: 100%" :min="1" :disabled="bottomDiv" v-model="queryParams.beginNum"/>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1"><div style="border-bottom: 1px solid;padding-top: 18px;margin: 0px 12px;"></div></el-col>
        <el-col :span="2">
          <el-form-item prop="endNum">
            <el-input-number style="width: 100%" :disabled="bottomDiv" :min="queryParams.beginNum" v-model="queryParams.endNum"/>
          </el-form-item>
        </el-col>
        <el-col :span="4" style="padding-left: 10px;color: #000;font-weight: 600;font-size: 15px;">分钟范围内</el-col>
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px;"
        v-if="routeType === 'add'"
      >
        <el-col :span="1.5" :offset="7">
          <el-button class="blue-btn" type="primary" @click="handleQuery">筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="form" :model="form" :rules="rules" label-width="150px" v-if="bottomDiv" style="margin-top: 5px;border-top: 1px solid;padding-top: 10px;">
      <el-form-item label="客群总数">
        <div>{{ userGroupNumber }}</div>
      </el-form-item>
      <el-form-item label="发放优惠券" v-if="routeType !== 'check'">
       <el-button type="text" @click="getCoupon()">选择</el-button>
       <el-button type="text" @click="onJump()">新建优惠券</el-button>
       <!-- <el-button type="text">刷新</el-button> -->
     </el-form-item>
     <el-form-item label="券名">
       <el-tag
        :key="tag.couponId"
        v-for="tag in selectCoupon"
        :closable="routeType !== 'check'"
        style="margin-right: 10px;"
        @close="onSelectCoupon(false, tag.couponId)">
        {{tag.couponName}}
      </el-tag>
     </el-form-item>
     <el-form-item label="发放时间" prop="couponTime">
      <el-date-picker
        :disabled="routeType === 'check'"
        v-model="form.couponTime"
        type="datetime"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="选择日期"/>
     </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="bottomDiv">
      <el-button v-if="routeType !== 'check'" type="primary" @click="submitForm" :loading="this.$store.state.isLoading">确 定</el-button>
      <el-button @click="cancel">返 回</el-button>
    </div>
    <el-dialog v-if="open" title="发优惠券 " :visible.sync="open" width="1000px" :z-index="1000" append-to-body>
      <el-table v-loading="modalLoading" :data="couponList">
        <el-table-column label="优惠券名称" align="center" prop="couponName" />
        <el-table-column label="总张数" align="center" prop="totalNumberSheet" />
        <el-table-column label="剩余张数" align="center" prop="remainingNum" />
        <el-table-column label="开始时间" align="center" prop="effectiveBeginTime" />
        <el-table-column label="结束时间" align="center" prop="effectiveEndTime" />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-checkbox :value="onIsCheck(scope.row.couponId)" @change="(e) => onSelectCoupon(e, scope.row.couponId)">选择</el-checkbox>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="modalqueryParams.total > 0"
        :total="modalqueryParams.total"
        :page.sync="modalqueryParams.pageNum"
        :limit.sync="modalqueryParams.pageSize"
        @pagination="getCoupon"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getTaskCount, getCouponTask, addCouponTask, updateCouponTask, couponIssue, couponIdQuery } from "@/api/customer/couponTask";
import { getOrgTree } from "@/api/utils";
import { Cascader } from "ant-design-vue";
import { flatten, searchSuperior } from "@/utils/array";
import moment from 'moment';

export default {
  components: {
    Cascader
  },
  data() {
    return {
      // 组织数据
      orgOptions: [],
      queryParams: {
        orgId: null,
        time: null,
        beginAmount: undefined,
        endAmount: undefined,
        beginNum: undefined,
        endNum: undefined
      },
      // 表单参数
      form: {},
      viveType: this.$route.query.viveType,
      routeType: this.$route.query.type,
      // 客群总数
      userGroupNumber: 0,
      bottomDiv: false,
      open: false,
      modalLoading: false,
      modalqueryParams: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 优惠券列表
      couponList: [],
      // 选中优惠券
      selectCoupon: [],
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: "组织不能为空", trigger: "blur" },
        ],
        time: [
          { required: true, message: `${{consume: '支付', waitingTime: '支付', unpaid: '下单'}[this.$route.query.viveType]}时间不能为空`, trigger: "blur" },
        ],
        beginAmount: [
          { required: true, message: `${{consume: '购买金额', unpaid: '订单金额'}[this.$route.query.viveType]}不能为空`, trigger: "blur" },
        ],
        endAmount: [
          { required: true, message: `${{consume: '购买金额', unpaid: '订单金额'}[this.$route.query.viveType]}不能为空`, trigger: "blur" },
        ],
        beginNum: [
          { required: true, message: `${{consume: '购买订单量', waitingTime: '支付到完成时间'}[this.$route.query.viveType]}不能为空`, trigger: "blur" },
        ],
        endNum: [
          { required: true, message: `${{consume: '购买订单量', waitingTime: '支付到完成时间'}[this.$route.query.viveType]}不能为空`, trigger: "blur" },
        ],
        couponTime: [
          { required: true, message: "发放时间不能为空", trigger: "blur" },
        ]
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'));
              const end = new Date(moment(new Date()).endOf('day'));
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(start).endOf('day'))]);
            },
          },
          {
            text: "近七天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
        ],
      },
    };
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data;
      if (this.$route.query.type !== "add") {
        this.handleUpdate(this.$route.query.couponTaskId);
      }
    });
  },
  methods: {
    /** 查询客群总数 */
    getList(params) {
      getTaskCount(params).then(res => {
        this.userGroupNumber = res.data
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.$refs["queryForm"].validate((valid) => {
        if (valid) {
          const params = {
            ...this.queryParams,
            beginAmount: this.queryParams.beginAmount ? this.queryParams.beginAmount * 100 : null,
            endAmount: this.queryParams.endAmount ? this.queryParams.endAmount * 100 : null,
            beginTime: this.queryParams.time[0],
            endTime: this.queryParams.time[1],
            taskType: { consume: 1, waitingTime: 2, unpaid: 3 }[this.$route.query.viveType],
          }
          delete params.time
          this.getList(params);
          this.bottomDiv = true
        }
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.reset()
      this.queryParams.orgId = null
      this.queryParams.time = null
      this.resetForm("queryForm");
      // this.handleQuery();
      this.bottomDiv = false
    },
    // 表单重置
    reset() {
      this.form = {
        couponTime: null
      };
      this.userGroupNumber = 0
      this.selectCoupon = []
      this.resetForm("form");
    },
    /** 跳转优惠券列表 */
    onJump() {
      const path = "/marketing/coupons/marketing" 
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem("CouponTask", JSON.stringify(this.searchParams));
      }
      this.$router.push({
        path,
      });
    },
    /** 查询优惠券 */
    getCoupon() {
      const params = {
        issueCouponFlag: 'customer_group_give',
        pageNum: this.modalqueryParams.pageNum,
        pageSize: this.modalqueryParams.pageSize,
      }
      couponIssue(params).then((res) => {
        this.modalLoading = false;
        this.modalqueryParams.total = res.total;
        this.couponList = res.rows;
        this.open = true;
      });
    },
    /** 是否被选中 */
    onIsCheck(couponId) {
      const couponIdArr = this.selectCoupon.map(item => item.couponId)
      return couponIdArr.includes(couponId)
    },
    /** checkBox 改变事件 */ 
    onSelectCoupon(check, couponId) {
      if (check) {
        // this.selectCoupon = this.selectCoupon.concat(this.couponList.filter(item => item.couponId === couponId))
        this.selectCoupon = this.couponList.filter(item => item.couponId === couponId)
      } else {
        this.selectCoupon = this.selectCoupon.filter(item => !item.couponId)
      }
    },
    // 表单重置
    reset() {
      this.modalqueryParams = {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      }
    },
    /** 修改按钮操作 */
    handleUpdate(couponTaskId) {
      const orgArr = flatten(this.orgOptions, 'children')
      getCouponTask(couponTaskId).then(res => {
        couponIdQuery({ couponIdList: [res.data.couponId] }).then(cupRes => {
          this.queryParams = {
            orgId: searchSuperior(res.data.orgId, 'id', orgArr, 'parentId'),
            time: [res.data.beginTime, res.data.endTime],
            beginAmount: parseInt(res.data.beginAmount) / 100,
            endAmount: parseInt(res.data.endAmount) / 100,
            beginNum: res.data.beginNum,
            endNum: res.data.endNum,
          }

          this.userGroupNumber = res.data.couponTotal
          this.bottomDiv = true
          this.form = {
            couponTaskId,
            couponTime: res.data.couponTime,
          }
          this.selectCoupon = cupRes.data
        })
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const couponId = this.selectCoupon.map(item => item.couponId)
          if (couponId.length === 0) {
            return this.warning('请选择优惠券~')
          }
          const title = { consume: '消费情况发券', waitingTime: '等待时长发券', unpaid: '未支付订单发券'}[this.viveType]
          this.$confirm(
            `是否确认${this.$route.query.type === 'update' ? '修改' : '新增'}${title}?`,
            "警告",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const params = {
              ...this.queryParams,
              orgId: this.queryParams.orgId.length > 0
                    ? this.queryParams.orgId.slice(-1)[0]
                    : this.queryParams.orgId,
              beginAmount: this.queryParams.beginAmount ? this.queryParams.beginAmount * 100 : null,
              endAmount: this.queryParams.endAmount ? this.queryParams.endAmount * 100 : null,
              beginTime: this.queryParams.time[0],
              endTime: this.queryParams.time[1],
              taskType: { consume: 1, waitingTime: 2, unpaid: 3 }[this.$route.query.viveType],
              couponTotal: this.userGroupNumber,
              couponId: couponId.toString(),
              couponTime: this.form.couponTime,
              couponTaskId: this.form.couponTaskId
            }
            delete params.time
            return this.$route.query.type === 'update' ? updateCouponTask(params) : addCouponTask(params)
          }).then(() => {
            this.msgSuccess(`${this.$route.query.type === 'update' ? '修改' : '新增'}${title}~`);
            this.cancel();
          })
        }
      });
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