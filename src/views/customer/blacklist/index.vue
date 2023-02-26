<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <!-- <el-form-item label="组织" prop="orgId">
        <Cascader
          :options="orgOptions"
          v-model="queryParams.orgId"
          change-on-select
          style="width: 300px"
          placeholder="请选择组织"
          expand-trigger="hover"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="客户昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入客户昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户编号" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入客户编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
          @change="inputChange"
        />
      </el-form-item>

      <el-form-item label="来源方式" prop="entryMethod">
        <el-select
          v-model="queryParams.entryMethod"
          placeholder="请选择来源方式"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in entryMethodOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户等级" prop="levelId">
        <el-select
          v-model="queryParams.levelId"
          placeholder="请选择客户等级"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in levelOptions"
            :key="dict.levelId"
            :label="dict.levelName"
            :value="dict.levelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户标签" prop="labelId">
        <el-select
          v-model="queryParams.labelId"
          placeholder="请选择客户标签"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in labelOptions"
            :key="dict.labelId"
            :label="dict.labelName"
            :value="dict.labelId"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="黑名单时间" prop="expireTime">
          <el-date-picker
            v-model="queryParams.expireTime"
            clearable
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="入驻时间" prop="time">
          <el-date-picker
            v-model="queryParams.time"
            clearable
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['customer:blacklist:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :max-height="maxHeight"
      :data="blacklistList"
      :row-key="(row) => row.blacklistId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="客户Id" align="center" prop="customerId" /> -->
      <el-table-column min-width="90" label="客户昵称" align="center" prop="nickname">
        <template slot-scope="scope">
          <img
            :src="scope.row.avatar ? scope.row.avatar : '/avatar.png'"
            style="width: 40px; height: 40px; border-radius: 100px"
          >
          <div>{{ scope.row.nickname }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="90" label="客户等级" align="center" prop="levelName" />
      <el-table-column
        min-width="90"
        label="性别"
        align="center"
        prop="sex"
        :formatter="sexFormat"
      />
      <el-table-column
        min-width="90"
        label="来源方式"
        align="center"
        prop="entryMethod"
        :formatter="entryMethodFormat"
      />
      <el-table-column
        min-width="120"
        label="购买订单数"
        align="center"
        prop="consumeTimesTotal"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="jumpOrder(scope.row.customerId)">{{
            scope.row.consumeTimesTotal
          }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        min-width="120"
        label="消费金额"
        align="center"
        prop="consumeAmountTotal"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="jumpOrder(scope.row.customerId)">{{
            scope.row.consumeAmountTotal &&
              toDecimal2(scope.row.consumeAmountTotal / 100)
          }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        min-width="120"
        label="余额"
        align="center"
        prop="accountAmount"
      >
        <template slot-scope="scope">
          {{
            scope.row.accountAmount &&
              toDecimal2(scope.row.accountAmount / 100)
          }}
        </template>
      </el-table-column>
      <el-table-column min-width="120" label="积分" align="center" prop="scoreTotal" />
      <el-table-column
        min-width="90"
        label="客群标签"
        align="center"
        prop="customerLabelRelationList"
      >
        <template v-if="scope.row.customerLabelRelationList" slot-scope="scope">
          <el-dropdown v-if="scope.row.customerLabelRelationList.length > 1">
            <span class="el-dropdown-link">
              客群标签<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="item in scope.row.customerLabelRelationList"
                :key="item.labelId"
              >
                {{ item.labelName }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-tag v-else>
            {{ scope.row.customerLabelRelationList[0].labelName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="入驻时间"
        align="center"
        prop="customerCreateTime"
      />
      <el-table-column
        min-width="100"
        label="黑名单时间"
        align="center"
        prop="createTime"
        width="180"
      />
      <el-table-column
        min-width="90"
        label="操作"
        align="center"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['customer:blacklist:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >移除黑名单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
        <el-checkbox
          v-model="checked"
          @change="toggleSelection"
        >当页全选</el-checkbox>
      </el-col>
      <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
        <el-button
          v-hasPermi="['customer:blacklist:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >移除黑名单
        </el-button>
      </el-col>
      <el-col :span="11">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { delBlacklist, listBlacklist } from '@/api/customer/blacklist'
import { getDropDown } from '@/api/selectUtils'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'


export default {
  name: 'Blacklist',
  components: {
    Cascader
  },
  mixins: [ SetTableMaxHeight ],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 客户黑名单表格数据
      blacklistList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 组织数据
      orgOptions: [],
      // 性别
      userSexOptions: [],
      // 来源方式
      entryMethodOptions: [],
      // 客户等级
      levelOptions: [],
      // 客户标签
      labelOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        nickname: null,
        entryMethod: null,
        customerId: null,
        levelId: null,
        labelId: null,
        expireTime: null,
        time: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('sys_user_sex').then((response) => {
      this.userSexOptions = response.data
    })
    this.getDicts('customer_entry_method').then((response) => {
      this.entryMethodOptions = response.data
    })
    // 客户等级
    getDropDown('customerLevel').then((res) => {
      this.levelOptions = res.data
    })
    // 客户标签
    getDropDown('customerLabel').then((res) => {
      this.labelOptions = res.data
    })
    this.getList()
  },
  methods: {
    // 输入框值改变
    inputChange() {
      this.queryParams.customerId = this.queryParams.customerId.replace(/[^\d]/g, '')
    },
    /** 查询客户黑名单列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.expireTime && this.queryParams.expireTime.length === 2) {
        params.blackBeginTime = moment(this.queryParams.expireTime[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        params.blackEndTime = moment(this.queryParams.expireTime[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        delete params.expireTime
      }
      if (this.queryParams.time && this.queryParams.time.length === 2) {
        params.beginTime = moment(this.queryParams.time[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        params.endTime = moment(this.queryParams.time[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        delete params.time
      }

      listBlacklist(params).then((response) => {
        this.blacklistList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    sexFormat(row, column) {
      return this.selectDictLabel(this.userSexOptions, row.sex)
    },
    // 来源方式
    entryMethodFormat(row, column) {
      return this.selectDictLabel(this.entryMethodOptions, row.entryMethod)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.blacklistId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.blacklistList.length === selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const blacklistIds = row.blacklistId || this.ids
      this.$confirm(
        `是否确认${
          typeof blacklistIds === 'object' ? '批量' : '将客户"' + row.nickname
        }"移除黑名单?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delBlacklist(blacklistIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('移除黑名单成功')
        })
    },
    // 跳转订单界面
    jumpOrder(customerId) {
      this.$router.push({
        path: '/order/delivery/allorder',
        query: {
          customerId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/blacklist/export',
        {
          ...this.queryParams
        },
        `customer_blacklist.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.blacklistList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
<style scoped lang="scss">
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
