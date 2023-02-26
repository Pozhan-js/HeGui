<template>
  <div style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 30%"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="优惠券包名称" prop="packageName">
        <el-input v-model="form.packageName" style="width: 30%" placeholder="请输入优惠券包名称" />
      </el-form-item>
      <el-form-item label="选择优惠券" prop="pckCouponList">
        <div>
          <el-button
            icon="el-icon-plus"
            type="text"
            @click="handleModel"
          >选择优惠券</el-button>
          <router-link to="/marketing/coupons/marketing" style="margin: 0 10px">
            <el-button type="text">新增优惠券</el-button>
          </router-link>
          <el-button type="text" :disabled="form.pckCouponList.length <= 0" @click="modelRef">刷新</el-button>
        </div>
        <div
          v-if="form.pckCouponList && form.pckCouponList.length > 0"
          class="table_div"
        >
          <div class="title_div">
            <div class="block">优惠券名称</div>
            <div class="block">总张数</div>
            <div class="block">已使用张数</div>
            <div class="block">剩余张数</div>
            <div class="block" style="border-style: none">操作</div>
          </div>
          <div
            v-for="(pck, index) in modelList.filter((item) =>
              form.pckCouponList.includes(item.couponId)
            )"
            :key="pck.couponId"
            :style="
              index > 0
                ? 'display: flex;border-top: 1px solid #e2e2e2;'
                : 'display: flex'
            "
          >
            <div class="block">{{ pck.couponName }}</div>
            <div class="block">{{ pck.totalNumberSheet }}</div>
            <div class="block">{{ pck.usedNum }}</div>
            <div class="block">{{ pck.remainingNum }}</div>
            <div class="block" style="border-style: none">
              <el-button
                type="text"
                @click="modelRemove(pck.couponId)"
              >在打包中删除</el-button>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="活动专享" prop="packageActivityList">
        <el-checkbox-group v-model="form.packageActivityList">
          <!-- <el-checkbox label="home_page">首页弹窗</el-checkbox>
          <el-checkbox label="coupon_center">优惠券中心</el-checkbox>
          <el-checkbox label="promote">中奖码</el-checkbox>
          <el-checkbox label="operation_give">运营发券</el-checkbox> -->
          <el-checkbox v-for="item in couponActivityType" :key="item.dictValue" :label="item.dictValue">{{ item.dictLabel }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="包个数" prop="packageNum">
        <el-row>
          <el-col :span="3">
            <el-input-number
              v-model="form.packageNum"
              disabled
              :min="0"
              placeholder="请输入包个数"
            />
          </el-col>
          <el-col :span="1" style="padding-left: 20px"> 个 </el-col>
          <el-col :span="20" style="color: red">
            <el-button
              type="text"
              style="padding-right: 20px"
              :disabled="form.pckCouponList.length <= 0"
              @click="modelRef"
            >刷新</el-button>所选择的优惠券中剩余量最少的量</el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="失效条件" prop="failureCondition">
        <el-radio-group v-model="form.failureCondition">
          <el-radio
            v-for="dict in failureConditionOptions"
            :key="dict.dictValue"
            :label="parseInt(dict.dictValue)"
          >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
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
    <el-dialog
      v-if="open"
      title="选择优惠券"
      :visible.sync="open"
      width="800px"
      append-to-body
      @close="onClose"
    >
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="优惠券名称">
          <el-input
            v-model="queryParams.couponName"
            placeholder="优惠券名称"
          />
        </el-form-item>
        <el-form-item label="优惠券状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择优惠券状态"
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
        :data="modelList"
        tooltip-effect="dark"
        style="width: 100%"
        height="500"
        :row-key="(row) => row.couponPckId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          label="优惠券名称"
          align="center"
          property="couponName"
        />
        <el-table-column
          label="总张数"
          align="center"
          property="totalNumberSheet"
        />
        <el-table-column
          label="剩余张数"
          align="center"
          property="remainingNum"
        />
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          :formatter="statusFormat"
        />
      </el-table>
      <div style="text-align: right; margin-top: 20px">
        <el-button type="primary" @click="modelSub">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addPackage,
  getPackage,
  updatePackage,
  couponInfoPck
} from '@/api/marketing/package'
import { Cascader } from 'ant-design-vue'

import { getOrgTree } from '@/api/utils'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  components: {
    Cascader
  },
  data() {
    return {
      // 组织
      orgOptions: [],
      // 失效条件字典
      failureConditionOptions: [],
      // 优惠券状态
      statusOptions: [],
      // 活动专享
      couponActivityType: [],
      // 表单参数
      form: {
        pckCouponList: [],
        packageActivityList: []
      },
      // 表单校验
      rules: {
        orgId: [{ required: true, message: '组织不能为空', trigger: 'blur' }],
        packageName: [
          { required: true, message: '优惠券包名称不能为空', trigger: 'blur' }
        ],
        pckCouponList: [
          { required: true, message: '优惠券不能为空', trigger: 'blur' }
        ],
        failureCondition: [
          { required: true, message: '失效条件不能为空', trigger: 'blur' }
        ]
      },
      // 是否显示弹出层
      open: false,
      // 选中数据
      modelSelect: [],
      loading: false,
      modelList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 100,
        couponName: null,
        status: null
      }
    }
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
        if (this.$route.query.type === 'update') {
          this.handleUpdate(this.$route.query.couponPckId)
        }
      }
    })
    this.getDicts('coupon_pck_failure_condition').then((response) => {
      this.failureConditionOptions = response.data
    })
    this.getDicts('coupon_pck_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('coupon_pck_activity_type').then((response) => {
      this.couponActivityType = response.data
    })
  },
  methods: {
    // 优惠券打包状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
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
      couponInfoPck({
        ...this.queryParams,
        orgId:
          typeof this.form.orgId === 'object'
            ? this.form.orgId.slice(-1)[0]
            : this.form.orgId
      }).then((res) => {
        let modelList = res.rows
        if (this.$route.query.type !== 'update') {
          modelList = res.rows.filter(item => item.canPckFlag)
        }
        this.modelList = modelList
        this.loading = false
        if (this.form.pckCouponList.length > 0) {
          this.toggleSelection(
            modelList.filter((item) =>
              this.form.pckCouponList.includes(item.couponId)
            )
          )
        }
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.modelSelect = selection
    },
    // 打开model
    handleModel() {
      if (!this.form.orgId) return this.msgError('请先选择组织机构')
      this.open = true
      this.getList()
    },
    // 刷新优惠券
    modelRef() {
      couponInfoPck({
        ...this.queryParams,
        orgId:
          typeof this.form.orgId === 'object'
            ? this.form.orgId.slice(-1)[0]
            : this.form.orgId
      }).then((res) => {
        let modelList = res.rows
        if (this.$route.query.type !== 'update') {
          modelList = res.rows.filter(item => item.canPckFlag)
        }
        this.modelList = modelList
        this.form.packageNum = Math.min(
          ...modelList
            .filter((item) => this.form.pckCouponList.includes(item.couponId))
            .map((item) => parseInt(item.remainingNum))
        )
      })
    },
    // 在打包中删除
    modelRemove(couponId) {
      const nweList = this.form.pckCouponList.filter(
        (item) => item !== couponId
      )
      this.form.pckCouponList = nweList
      this.form.packageNum =
        nweList.length > 0
          ? Math.min(
            ...this.modelList
              .filter((item) => nweList.includes(item.couponId))
              .map((item) => parseInt(item.remainingNum))
          )
          : null
    },
    // 确定Model
    modelSub() {
      this.form.pckCouponList = this.modelSelect.map((item) => item.couponId)
      this.form.packageNum = Math.min(
        ...this.modelSelect.map((item) => parseInt(item.remainingNum))
      )
      this.open = false
    },
    // model关闭
    onClose() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 100,
        couponName: null,
        status: null
      }
    },
    /** 修改按钮操作 */
    handleUpdate(couponPckId) {
      const _this = this
      getPackage(couponPckId).then((response) => {
        this.modelList = response.data.couponPackageRelationList
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(response.data.orgId, 'id', orgArr, 'parentId')
        _this.form = {
          couponPckId: response.data.couponPckId,
          orgId: orgId,
          packageName: response.data.packageName,
          pckCouponList: response.data.couponPackageRelationList.map(
            (cpItem) => cpItem.couponId
          ),
          packageActivityList: response.data.couponPackageActivityList.map(item => item.activityType),
          packageNum: response.data.packageNum,
          failureCondition: response.data.failureCondition
        }
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const params = {
            couponPckId: this.form.couponPckId,
            orgId: this.form.orgId
              ? typeof this.form.orgId === 'object'
                ? this.form.orgId.slice(-1)[0]
                : this.form.orgId
              : null,
            packageName: this.form.packageName,
            pckCouponList: this.form.pckCouponList.map((item) => {
              return { couponId: item }
            }),
            packageActivityList: this.form.packageActivityList,
            packageNum: this.form.packageNum,
            failureCondition: this.form.failureCondition
          }
          this.$confirm(
            `是否确定${this.form.couponId ? '修改' : '新增'}打包优惠券?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            return this.form.couponPckId ? updatePackage(params) : addPackage(params)
          }).then(() => {
            this.msgSuccess(`${this.form.couponId ? '修改' : '新增'}成功`)
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
