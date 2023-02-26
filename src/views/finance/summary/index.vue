<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="配送员" prop="distributionName">
        <el-input
          v-model="queryParams.distributionName"
          placeholder="请输入配送员"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属分组" prop="groupId">
        <el-select
          v-model="queryParams.groupId"
          placeholder="请选择所属分组"
          clearable
          size="small"
        >
          <el-option
            v-for="group in groupOptions"
            :key="group.id"
            :label="group.name"
            :value="group.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配送员类型" prop="distributionType">
        <el-select
          v-model="queryParams.distributionType"
          placeholder="请选择配送员类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in distributionTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否组长" prop="isGroupLeader">
        <el-select
          v-model="queryParams.isGroupLeader"
          placeholder="请选择是否组长"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in isGroupLeaderOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="账期" prop="cycleTime">
          <el-date-picker
            v-model="queryParams.cycleTime"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择账期"
          />
        </el-form-item>
      </el-row>

      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:dataAnalysis:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="650"
      style="margin-top: 20px"
      :data="summaryList"
    >
      <el-table-column width="100" fixed label="账期" align="center" prop="cycleTime" />
      <el-table-column width="100" fixed label="配送员编号" align="center" prop="distributionId" />
      <el-table-column width="100" fixed label="配送员信息" align="center" prop="distributionId">
        <template slot-scope="scope">
          <div>{{ scope.row.distributionName }}</div>
          <div>{{ scope.row.distributionPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column width="80" fixed label="是否组长/专兼职" align="center" prop="distributionId">
        <template slot-scope="scope">
          <div>{{ scope.row.isGroupLeader ? '是' : '否' }}</div>
          <div>{{ distributionTypeFormat(scope.row.distributionType) }}</div>
        </template>
      </el-table-column>

      <el-table-column width="120" fixed label="组织" align="center" prop="orgName" />
      <el-table-column width="80" fixed label="分组" align="center" prop="groupName" />
      <el-table-column width="120" label="商品名称" align="center" prop="distributionId">
        <template slot-scope="scope">
          <div v-for="goods in scope.row.goodsAnalysisResponseList" :key="goods.goodsId + 'name'">{{ goods.goodsName }}</div>
        </template>
      </el-table-column>
      <el-table-column width="120" label="自然单包数" align="center" prop="distributionId">
        <template slot-scope="{ row }">
          <div
            v-for="goods in row.goodsAnalysisResponseList"
            :key="goods.goodsId + 'single'"
          >
            <jump
              class="outer-link--text"
              path="/deliver/detail"
              :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
            >
              {{ goods.naturalSingleNum }}
            </jump>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="120" label="自然多包数" align="center" prop="distributionId">
        <template slot-scope="{ row }">
          <div
            v-for="goods in row.goodsAnalysisResponseList"
            :key="goods.goodsId + 'multiple'"
          >
            <jump
              class="outer-link--text"
              path="/deliver/detail"
              :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
            >
              {{ goods.naturalMultipleNum }}
            </jump>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="120" label="推广订单包数" align="center" prop="distributionId">
        <template slot-scope="{ row }">
          <div
            v-for="goods in row.goodsAnalysisResponseList"
            :key="goods.goodsId + 'promote'"
          >
            <jump
              class="outer-link--text"
              path="/deliver/detail"
              :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 0, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
            >
              {{ goods.promoteNum }}
            </jump>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="120" label="礼品订单包数" align="center" prop="giftTotal">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, incomeTypeList: 5, timeKey: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ row.giftTotal }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="自然单包数汇总" align="center" prop="naturalSingleTotal">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ row.naturalSingleTotal }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="自然多包数汇总" align="center" prop="naturalMultipleTotal">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ row.naturalMultipleTotal }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="推广订单包数汇总" align="center" prop="promoteTotal">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 0, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ row.promoteTotal }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="礼品订单包数汇总" align="center" prop="giftTotal">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 5, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ row.giftTotal }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="自然单包配送费" align="center" prop="naturalSingleDistributionAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.naturalSingleDistributionAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="自然多包配送费" align="center" prop="naturalMultipleDistributionAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.naturalMultipleDistributionAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="推广订单配送费" align="center" prop="promoteDistributionAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 0, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.promoteDistributionAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="礼品订单配送费" align="center" prop="giftDistributionAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 5, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.promoteDistributionAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="配送费合计" align="center" prop="distributionTotalAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.distributionTotalAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="支付管理津贴" align="center" prop="payContributionAmount">
        <template slot-scope="{ row }">
          {{ row.payContributionAmount ? toDecimal2(row.payContributionAmount / 100) : '-' }}
        </template>
      </el-table-column>
      <el-table-column width="120" label="获得管理津贴" align="center" prop="obtainContributionAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, incomeTypeList: 2, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ row.obtainContributionAmount ? toDecimal2(row.obtainContributionAmount / 100) : '-' }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="历史账期累计未提现金额" align="center" prop="historyCashAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.historyCashAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="本次应提现金额" align="center" prop="availableCashAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.availableCashAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="本次已提现金额" align="center" prop="alreadyCashAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.alreadyCashAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column width="120" label="本次应实际支付金额" align="center" prop="payCashAmount">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/deliver/detail"
            :query="{ distributionId: row.distributionId, timeKey: 1, beginTime: momentStart(row.cycleTime), endTime: momentEnd(row.cycleTime)}"
          >
            {{ toDecimal2(row.payCashAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>
  </div>
</template>

<script>
import { listSummary } from '@/api/finance/summary'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'
import moment from 'moment'

export default {
  name: 'Summary',
  components: { Cascader },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 组织数据
      orgOptions: [],
      // 配送员分组
      groupOptions: [],
      // 配送员类型
      distributionTypeOptions: [],
      // 是否是组长
      isGroupLeaderOptions: [
        { dictLabel: '是', dictValue: true },
        { dictLabel: '否', dictValue: false }
      ],
      // 总条数
      total: 0,
      // 供应商结算中间表表格数据
      summaryList: [],
      finance_settlement_detail_status: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        groupId: null,
        cycleTime: null,
        distributionType: null,
        distributionName: null,
        isGroupLeader: null
      }
    }
  },
  created() {
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('distributionGroup').then((res) => {
      this.groupOptions = res.data
    })
    this.getDicts('distribution_type').then((response) => {
      this.distributionTypeOptions = response.data
    })
  },
  methods: {
    momentStart(deta) {
      return moment(deta).startOf('days').format('YYYY-MM-DD HH:mm:ss')
    },
    momentEnd(deta) {
      return parseInt(moment(deta).format('DD')) >= 15 ? moment(deta).endOf('months').format('YYYY-MM-DD HH:mm:ss') : moment(deta).endOf('days').format('YYYY-MM-15 HH:mm:ss')
    },
    distributionTypeFormat(type, column) {
      return this.selectDictLabel(this.distributionTypeOptions, type)
    },
    /** 查询供应商结算中间表列表 */
    getList() {
      this.loading = true
      listSummary(this.queryParams).then((response) => {
        this.summaryList = response.rows
        this.total = response.total
        this.loading = false
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        groupId: null,
        cycleTime: null,
        distributionType: null,
        distributionName: null,
        isGroupLeader: null
      }
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/distribution/data/analysis/export', this.queryParams)
    }
  }
}
</script>
