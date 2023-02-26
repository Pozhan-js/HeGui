<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-form
        v-show="showSearch"
        ref="queryForm"
        class="search-form"
        :model="queryParams"
        :inline="true"
        label-width="160px"
      >
        <el-form-item label="配送员编号" prop="distributionId">
          <el-input
            v-model="queryParams.distributionId"
            placeholder="请输入配送员编号"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="配送员姓名" prop="idTag">
          <el-input
            v-model="queryParams.idTag"
            placeholder="请输入配送员姓名或手机号码"
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
            :show-search="{$cascaderFilter}"
            placeholder="请选择组织"
            expand-trigger="hover"
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
        <el-form-item label="配送员等级" prop="levelId">
          <el-select
            v-model="queryParams.levelId"
            placeholder="请选择配送员等级"
            clearable
            size="small"
          >
            <el-option
              v-for="leve in LeveOptions"
              :key="leve.id"
              :label="leve.name"
              :value="leve.id"
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
        <!-- <el-row>
          <el-form-item label="身份证过期时间" prop="idCardTime">
            <el-date-picker
              clearable
              size="small"
              v-model="queryParams.idCardTime"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="健康证过期时间" prop="healthTime">
            <el-date-picker
              clearable
              size="small"
              v-model="queryParams.healthTime"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
        </el-row> -->
        <el-row
          :gutter="10"
          class="mb8"
          style="margin-left: 155px; margin-top: 5px"
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
            <el-button
              class="gray-btn"
              size="mini"
              @click="resetQuery"
            >重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['distribution:distributioninfo:manageexport']"
              size="mini"
              @click="handleExport"
            >导出
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <el-tabs
        v-model="queryParams.runStatus"
        class="tabContainer"
        style="margin-top: 20px"
        type="card"
        @tab-click="tabCheck"
      >
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane
          v-for="dict in runStatusOptions"
          :key="dict.dictValue"
          :label="dict.dictLabel"
          :name="dict.dictValue"
        />
      </el-tabs>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        stripe
        :max-height="maxHeight"
        :data="distributioninfoList"
        :row-key="(row) => row.distributionId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="76" align="center" />
        <el-table-column
          label="编号"
          align="center"
          prop="distributionId"
          min-width="86"
        />
        <el-table-column
          label="配送员信息"
          align="center"
          min-width="110"
        >
          <template slot-scope="{row}">
            <div>{{ row.makiName }}</div>
            <div>{{ row.telephone }}</div>
            <el-tag size="mini">{{ row.levelName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="运营状态"
          align="center"
          min-width="80"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.runStatus === 1 ? "启运" : "停运" }}</div>
            <el-button
              v-if="scope.row.state === 2"
              v-hasPermi="['distribution:distributioninfo:operation']"
              size="mini"
              type="text"
              @click="
                operationState(scope.row, scope.row.runStatus === 0 ? 1 : 0)
              "
            >
              {{ scope.row.runStatus === 1 ? "停运" : "启运" }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="首缴质保金时间"
          align="center"
          min-width="120"
        >
          <template slot-scope="{row}">
            <break-time :date-time="row.firstAmountDate" />
          </template>
        </el-table-column>
        <el-table-column
          label="总质保金"
          align="center"
          prop="amount"
          min-width="110"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.amount ? toDecimal2(scope.row.amount / 100) : 0 }}</div>
            <el-button
              v-hasPermi="['distribution:amount:list']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleWarranty(scope.row.distributionId)"
            >
              质保金记录
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="缴纳保险"
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.payInsurance ? "是" : "否" }}</div>
            <el-button
              v-hasPermi="['distribution:insurance:list']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleInsurance(scope.row.distributionId)"
            >
              保险记录
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="保险到期账期"
          align="center"
          prop="insurance"
          min-width="110"
        />

        <el-table-column
          label="送货员"
          align="center"
          prop="deliveryId"
          min-width="110"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.deliveryName }}</div>
            <div>{{ scope.row.deliveryTelephone }}</div>
            <div>
              <el-button
                v-hasPermi="['distribution:distributioninfo:bindDelivery']"
                size="mini"
                type="text"
                @click="handleBindDelivery(scope.row)"
              >
                绑定
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="配送员类型"
          align="center"
          min-width="90"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.distributionType == 1 ? '专职' : '兼职' }}</div>
            <el-button
              size="mini"
              type="text"
              @click="
                openblack(
                  scope.row.distributionId,
                  1,
                  scope.row.distributionType == 1 ? 'part' : 'full'
                )
              "
            >
              {{
                scope.row.distributionType == 1
                  ? "兼职"
                  : "专职"
              }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="组织"
          align="center"
          prop="orgName"
          min-width="100"
        />
        <el-table-column
          label="所属分组"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.groupName }}</div>
            <el-button
              v-hasPermi="['distribution:distributioninfo:updategroup']"
              size="mini"
              type="text"
              @click="groupModel(scope.row)"
            >
              所属分组
            </el-button>
            <el-button
              v-hasPermi="['distribution:joinLog:list']"
              size="mini"
              type="text"
              @click="groupJoinModel(scope.row)"
            >
              查看历史
            </el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column label="组长" align="center" prop="borderFence">
          <template slot-scope="scope">
            <div>{{ scope.row.leaderName }}</div>
            <div>{{ scope.row.leaderPhone }}</div>
          </template>
        </el-table-column> -->
        <el-table-column
          label="接单"
          align="center"
          prop="naturalOrder"
          :formatter="naturalOrderFormat"
          min-width="60"
        />
        <el-table-column
          label="围栏边界"
          align="center"
          min-width="80"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.geofenceId"
              v-hasPermi="['distribution:distributioninfo:fence']"
              size="mini"
              type="text"
              @click="handleFence(scope.row.shopId, scope.row.geofenceId, scope.row.orgId)"
            >
              {{ scope.row.geofenceName }}
            </el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="状态"
          align="center"
          prop="status"
          :formatter="statusFormat"
        /> -->
        <el-table-column
          label="操作"
          align="center"
          min-width="90"
          fixed="right"
          class-name="small-padding fixed-width operation-row"
        >
          <template slot-scope="scope">

            <el-button
              v-hasPermi="['distribution:location:locationalert']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="openTrajectoryModal(scope.row)"
            >
              轨迹
            </el-button>

            <el-button
              v-if="scope.row.status === 2 && scope.row.runStatus === 1"
              v-hasPermi="['distribution:distributioninfo:naturalorder']"
              size="mini"
              type="text"
              @click="
                handleSingle(scope.row, scope.row.naturalOrder === 0 ? 1 : 0)
              "
            >
              {{ scope.row.naturalOrder === 1 ? "不接自然单" : "接自然单" }}
            </el-button>
            <el-button
              v-if="scope.row.isBlacklist === 1"
              v-hasPermi="['distribution:distributioninfo:blacklist']"
              size="mini"
              type="text"
              @click="removeBlacklist(scope.row.distributionId)"
            >
              移除黑名单
            </el-button>
            <el-button
              v-if="scope.row.isBlacklist === 0"
              v-hasPermi="['distribution:distributioninfo:blacklist']"
              size="mini"
              type="text"
              @click="openblack(scope.row.distributionId, 1, 'blacklist')"
            >
              加入黑名单
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
            v-hasPermi="['distribution:distributioninfo:operation']"
            size="mini"
            :disabled="multiple"
            @click="operationState({}, 0)"
          >停运
          </el-button>
          <el-button
            v-hasPermi="['distribution:distributioninfo:operation']"
            size="mini"
            :disabled="multiple"
            @click="operationState({}, 1)"
          >启运
          </el-button>
          <el-button
            v-hasPermi="['distribution:distributioninfo:naturalOrder']"
            size="mini"
            :disabled="multiple"
            @click="handleSingle({}, 0)"
          >不接自然单
          </el-button>
          <el-button
            v-hasPermi="['distribution:distributioninfo:naturalOrder']"
            size="mini"
            :disabled="multiple"
            @click="handleSingle({}, 1)"
          >接自然单
          </el-button>
          <el-button
            v-hasPermi="['distribution:distributioninfo:blacklist']"
            size="mini"
            :disabled="multiple"
            @click="openblack(ids.toString(), 1, 'blacklist')"
          >加入黑名单
          </el-button>
          <el-button
            v-hasPermi="['distribution:distributioninfo:blacklist']"
            size="mini"
            :disabled="multiple"
            @click="removeBlacklist(ids.toString())"
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
      <!-- 绑定送货员对话框 -->
      <el-dialog
        title="绑定送货员"
        :visible.sync="open"
        width="1000px"
        append-to-body
      >
        <el-form
          ref="queryBindForm"
          :model="bindParams"
          :inline="true"
          label-width="100px"
        >
          <el-form-item label="送货员姓名" prop="deliveryName">
            <el-input
              v-model="bindParams.deliveryName"
              placeholder="请输入送货员姓名"
              clearable
              size="small"
              @keyup.enter.native="handleBind"
            />
          </el-form-item>
          <el-form-item label="送货员手机号" prop="telephone">
            <el-input
              v-model="bindParams.telephone"
              placeholder="请输入送货员手机号"
              clearable
              size="small"
              @keyup.enter.native="handleBind"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleBind"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              size="mini"
              @click="resetBind"
            >重置</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="loading" :data="deliveryList">
          <el-table-column label="姓名" align="center" prop="deliveryName" />
          <el-table-column label="手机号码" align="center" prop="telephone" />
          <el-table-column label="操作" align="center" prop="deliveryId">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                @click="handleBindingDelivery(scope.row.deliveryId)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <el-dialog
        title="所属分组"
        :visible.sync="openGroup"
        width="1000px"
        append-to-body
      >
        <el-form
          ref="groupForm"
          :model="groupParams"
          :inline="true"
          label-width="100px"
        >
          <el-form-item label="分组名称" prop="groupName">
            <el-input
              v-model="groupParams.groupName"
              placeholder="请输入分组名称"
              clearable
              size="small"
              @keyup.enter.native="getListGroup"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="getListGroup"
            >搜索</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="groupLoding" :data="groupList">
          <el-table-column label="分组名" align="center" prop="groupName" />
          <el-table-column label="组长" align="center" prop="leaderName" />
          <el-table-column label="组长电话" align="center" prop="leaderPhone" />
          <el-table-column label="操作" align="center" prop="deliveryId">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.groupId !== groupParams.groupId"
                size="mini"
                type="text"
                @click="handleGroup(scope.row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="groupParams.total > 0"
          :total="groupParams.total"
          :page.sync="groupParams.pageNum"
          :limit.sync="groupParams.pageSize"
          @pagination="getListGroup"
        />
      </el-dialog>
      <el-dialog
        title="配送员出/入组记录"
        :visible.sync="openGroupJoin"
        width="1000px"
        append-to-body
      >
        <el-table v-loading="groupJoinLoading" :data="groupJoinList">
          <el-table-column label="分组名" align="center" prop="groupName" />
          <el-table-column label="入组时间" align="center" prop="joinTime" />
          <el-table-column label="出组时间" align="center" prop="outTime" />
        </el-table>
        <pagination
          v-show="groupJoinParams.total > 0"
          :total="groupJoinParams.total"
          :page.sync="groupJoinParams.pageNum"
          :limit.sync="groupJoinParams.pageSize"
          @pagination="getGroupJoinLog"
        />
      </el-dialog>
      <el-dialog
        :title="
          {
            blacklist: '加入黑名单',
            part: '转为兼职配送员',
            full: '转为专职配送员',
          }[openType]
        "
        :visible.sync="blacklistOpen"
        width="800px"
      >
        <el-form
          ref="blacklistForm"
          :model="blacklistForm"
          :rules="blacklistRules"
          :inline="true"
          label-width="100px"
        >
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="blacklistForm.remark"
              style="width: 600px"
              type="textarea"
              placeholder="请输入备注"
              :autosize="{ minRows: 3, maxRows: 5 }"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            :loading="this.$store.state.isLoading"
            @click="
              handleBlacklist(
                blacklistForm.distributionIds,
                blacklistForm.status,
                blacklistForm.remark
              )
            "
          >确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
    <el-dialog
      title="配送员轨迹"
      :visible.sync="trajectoryOpen"
      width="1300px"
      append-to-body
    >
      <el-row>
        <el-col :span="14">
          <el-form
            ref="trajectoryForm"
            :model="trajectoryQuery"
            :inline="true"
            label-width="100px"
          >
            <el-form-item label="日期" prop="yyyyMMdd">
              <el-date-picker
                v-model="trajectoryQuery.yyyyMMdd"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="选择日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                size="mini"
                @click="getTrajectoryList"
              >搜索</el-button>
            </el-form-item>
          </el-form>
          <el-table ref="trackTable" v-loading="trajectoryLoading" height="610px" :data="trajectoryList" @selection-change="handleTrackChange">
            <el-table-column v-if="clearIs" type="selection" align="center" width="80" />
            <el-table-column
              label="采集时间"
              align="center"
              prop="locationTime"
            />
            <el-table-column
              label="上报时间"
              align="center"
              prop="createTime"
            />
            <el-table-column label="经度" align="center" prop="locationPoint">
              <template slot-scope="scope">
                {{ scope.row.locationPoint.lng }}
              </template>
            </el-table-column>
            <el-table-column label="纬度" align="center" prop="locationPoint">
              <template slot-scope="scope">
                {{ scope.row.locationPoint.lat }}
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="trajectoryTotal > 0"
            :total="trajectoryTotal"
            :pager-count="5"
            :page.sync="trajectoryQuery.pageNum"
            :limit.sync="trajectoryQuery.pageSize"
            @pagination="getTrajectoryList"
          />
        </el-col>
        <el-col :span="10" style="padding: 20px;">
          <TrajectoryMap v-if="trajectoryOpen" :data="trajectoryList" :trackchecked="trackchecked" @getClearIs="onClearIs" />
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDistributioninfo,
  outService,
  departure,
  listDeliveryinfo,
  joinBlacklist,
  removeBlacklist,
  joinSingle,
  notSingle,
  bindingDelivery,
  listGroup,
  updateGroup,
  partDistribution,
  fullDistribution,
  listTrajectory,
  listGroupJoinLog
} from '@/api/distribution/distributioninfo'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'
import Data from '../../system/dict/data.vue'
import { Cascader } from 'ant-design-vue'
import TrajectoryMap from '@/views/components/trajectoryMap'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'
import moment from 'moment'

export default {
  name: 'Distributioninfo',
  components: { Data, Cascader, TrajectoryMap },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length > 4,
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
      // 配送员信息表格数据
      distributioninfoList: [],
      // 全选
      checked: false,
      // 配送员类型(1专职配送员，2.兼职配送员)字典
      distributionTypeOptions: [],
      // 运营状态(0停运1.启运)字典
      runStatusOptions: [],
      // 组织数据
      orgOptions: [],
      // 配送员分组
      groupOptions: [],
      // 配送员等级
      LeveOptions: [],
      // 是否加入黑名单
      isLeaderOptions: [],
      // 配送员状态
      statusOptions: [],
      // 绑定送货员界面
      open: false,
      // 送货员列表lodin
      bindLoading: false,
      // 送货员列表总条数
      bindTotal: 0,
      // 送货员列表数据
      deliveryList: [],
      // 绑定界面数据
      bindData: {},
      // 轨迹选中数据
      trackchecked: [],
      // 是否清除轨迹数据
      clearIs: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        groupId: null,
        levelId: null,
        runStatus: 'all',
        distributionType: null,
        distributionId: null,
        idTag: null,
        idCardTime: null,
        healthTime: null,
        orderByColumn: 'create_time',
        isAsc: 'desc'
      },
      bindParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        deliveryName: null,
        telephone: null,
        runStatus: 1,
        status: 1
      },
      // 配送员分组model Loding
      groupLoding: false,
      // 配送员分组
      openGroup: false,
      // 配送员分组列表
      groupList: [],
      // 配送员列表查询条件
      groupParams: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        orgId: null,
        groupName: null
      },
      openGroupJoin: false,
      groupJoinLoading: false,
      groupJoinList: [],
      // 配送员出入组记录
      groupJoinParams: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        distributionId: null
      },
      blacklistOpen: false,
      openType: '',
      blacklistForm: {},
      blacklistRules: {
        remark: [{ required: true, message: `备注不能为空`, trigger: 'blur' }]
      },
      // 搜索条件
      searchParams: null,
      // 轨迹
      trajectoryOpen: false,
      trajectoryQuery: {
        pageNum: 1,
        pageSize: 10,
        yyyyMMdd: null,
        orderByColumn: 'location_time',
        isAsc: 'desc'
      },
      trajectoryTotal: 0,
      trajectoryList: [],
      trajectoryLoading: false
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Distributioninfo')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Distributioninfo'))
      }
    }
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('distributionLevel').then((res) => {
      this.LeveOptions = res.data
    })
    getDropDown('distributionGroup').then((res) => {
      this.groupOptions = res.data
    })
    this.getDicts('distribution_type').then((response) => {
      this.distributionTypeOptions = response.data
    })
    this.getDicts('distribution_reg_way').then((response) => {
      this.registrationWayOptions = response.data
    })
    this.getDicts('distribution_run').then((response) => {
      this.runStatusOptions = response.data
    })
    this.getDicts('yes_no').then((response) => {
      this.isLeaderOptions = response.data
    })
    this.getDicts('distribution_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 初始化查询参数 */
    queryParamFomat() {
      const params = {
        ...this.queryParams
      }
      if (params.runStatus === 'all') {
        delete params.runStatus
      }
      if (this.queryParams.idCardTime && this.queryParams.idCardTime.length === 2) {
        params.idCardSTime = this.queryParams.idCardTime[0]
        params.idCardETime = this.queryParams.idCardTime[1]
      }
      if (this.queryParams.healthTime && this.queryParams.healthTime.length === 2) {
        params.healthSTime = this.queryParams.healthTime[0]
        params.healthETime = this.queryParams.healthTime[1]
      }
      delete params.idCardTime
      delete params.healthTime
      return params
    },
    /** 查询配送员信息列表 */
    getList() {
      this.loading = true
      listDistributioninfo(this.queryParamFomat()).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.distributioninfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 查询送货员列表
    getDeliveryList() {
      this.bindLoading = true
      listDeliveryinfo(this.bindParams).then((response) => {
        this.deliveryList = response.rows
        this.bindTotal = response.total
        this.bindLoading = false
      })
    },
    // 配送员类型(1专职配送员，2.兼职配送员)字典翻译
    distributionTypeFormat(row, column) {
      return this.selectDictLabel(
        this.distributionTypeOptions,
        row.distributionType
      )
    },
    // 运营状态(0停运1.启运)字典翻译
    runStatusFormat(row, column) {
      return this.selectDictLabel(this.runStatusOptions, row.runStatus)
    },
    // 是否加入黑名单
    naturalOrderFormat(row, column) {
      return this.selectDictLabel(this.isLeaderOptions, row.naturalOrder)
    },
    // 配送员状态
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        groupId: null,
        levelId: null,
        runStatus: 'all',
        distributionType: null,
        distributionId: null,
        idTag: null,
        idCardTime: null,
        healthTime: null,
        orderByColumn: 'create_time',
        isAsc: 'desc'
      }
      localStorage.removeItem('Distributioninfo')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.distributionId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.distributioninfoList.length === selection.length
    },
    // 运营状态
    operationState(rows, runStatus) {
      const distributionIds = rows.distributionId || this.ids
      this.$confirm(
        `是否确认${typeof distributionIds === 'object' ? '批量' : ''}
        ${{ 1: '启运', 0: '停运' }[runStatus]}
        ${
  typeof distributionIds === 'object' ? '' : '"' + rows.makiName + '"'
}配送员?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        if (runStatus === 0) {
          outService(distributionIds).then((res) => {
            this.msgSuccess(`${{ 1: '启运', 0: '停运' }[runStatus]}成功`)
            this.getList()
          })
        } else if (runStatus === 1) {
          departure(distributionIds).then((res) => {
            this.msgSuccess(`${{ 1: '启运', 0: '停运' }[runStatus]}成功`)
            this.getList()
          })
        }
      })
    },
    /** 打开加入黑名单模态框 */
    openblack(distributionIds, status, type) {
      if (status !== 1) return
      this.blacklistForm = {
        distributionIds: distributionIds,
        status: status,
        remark: null
      }
      this.openType = type
      this.blacklistOpen = true
    },
    cancel() {
      this.blacklistForm = {}
      this.openType = null
      this.resetForm('blacklistForm')
      this.blacklistOpen = false
    },
    /** 移除黑名单 */
    removeBlacklist(distributionIds) {
      this.$confirm(
        `是否确认配送员${typeof distributionIds.indexOf(',') > 0 ? '批量' : ''}移除黑名单?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        return removeBlacklist(distributionIds)
      }).then(() => {
        this.getList()
        this.cancel()
        this.msgSuccess(`移除黑名单成功`)
      })
    },
    // 黑名单操作
    handleBlacklist(distributionIds, status, remark = null) {
      this.$refs['blacklistForm'].validate((valid) => {
        if (valid) {
          switch (this.openType) {
            case 'blacklist':
              this.$confirm(
                `是否确认配送员${typeof distributionIds.indexOf(',') > 0 ? '批量' : ''}${{ 0: '移除', 1: '加入' }[status]}黑名单?`,
                '警告',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              ).then(() => {
                return status === 0 ? removeBlacklist(distributionIds) : joinBlacklist({ distributionIds: distributionIds.split(','), remark })
              }).then(() => {
                this.getList()
                this.cancel()
                this.msgSuccess(`${{ 0: '移除', 1: '加入' }[status]}黑名单成功`)
              })
              break
            case 'part':
              this.$confirm(`是否确认将配送员转为兼职配送员?`, '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                return partDistribution({
                  distributionIds: distributionIds.split(','),
                  remark: remark
                })
              }).then(() => {
                this.getList()
                this.cancel()
                this.msgSuccess(`配送员转为兼职配送员成功~`)
              })
              break
            case 'full':
              this.$confirm(`是否确认将配送员转为转为专职配送员?`, '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                return fullDistribution({
                  distributionIds: distributionIds.split(','),
                  remark: remark
                })
              }).then(() => {
                this.getList()
                this.cancel()
                this.msgSuccess(`配送员转为转为专职配送员成功~`)
              })
              break
          }
        }
      })
    },
    // 自然单操作
    handleSingle(rows, status) {
      const distributionIds = rows.distributionId || this.ids
      this.$confirm(
        `是否确认${
          typeof distributionIds === 'object' ? '批量' : ''
        }设置配送员${
          typeof distributionIds === 'object' ? '' : '"' + rows.makiName + '"'
        }${{ 0: '不接', 1: '接' }[status]}自然单?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return status === 0
            ? notSingle(distributionIds)
            : joinSingle(distributionIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`设置${{ 0: '不接', 1: '接' }[status]}自然单成功`)
        })
    },
    /** 打开所属分组 */
    groupModel(item) {
      this.groupParams.distributionId = item.distributionId
      this.groupParams.orgId = item.orgId
      this.groupParams.groupId = item.groupId
      this.openGroup = true
      this.getListGroup()
    },
    /** 查询分组 */
    getListGroup() {
      this.groupLoding = true
      const params = {
        ...this.groupParams
      }
      delete params.total
      listGroup(params).then((res) => {
        this.groupLoding = false
        this.groupList = res.rows
        this.groupParams.total = res.total
      })
    },
    groupJoinModel(item) {
      this.groupJoinList = []
      this.groupJoinParams.distributionId = item.distributionId
      this.openGroupJoin = true
      this.getGroupJoinLog()
    },
    getGroupJoinLog() {
      this.groupJoinLoading = true
      const params = {
        ...this.groupJoinParams
      }
      delete params.total
      listGroupJoinLog(params)
        .then(res => {
          this.groupJoinList = res.rows
          this.groupJoinParams.total = res.total
        })
        .finally(() => {
          this.groupJoinLoading = false
        })
    },
    /** 选择分组 */
    handleGroup(row) {
      this.$confirm(`是否确定绑定${row.groupName}分组`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          groupId: row.groupId,
          distributionId: this.groupParams.distributionId
        }
        updateGroup(params).then((res) => {
          this.openGroup = false
          this.groupParams = {
            pageNum: 1,
            pageSize: 10,
            total: 0,
            orgId: null,
            groupName: null
          }
          this.getList()
          this.msgSuccess(`配送员绑定分组成功~`)
        })
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/distribution/info/manageexport', this.queryParamFomat())
    },
    /** 绑定送货员 */
    handleBindDelivery(row) {
      this.open = true
      this.bindData = {
        distributionId: row.distributionId
      }
      this.bindParams.orgId = row.orgId
      this.getDeliveryList()
    },
    /** 搜索按钮操作 */
    handleBind() {
      this.bindParams.pageNum = 1
      this.getDeliveryList()
    },
    /** 重置按钮操作 */
    resetBind() {
      this.resetForm('queryBindForm')
      this.handleBind()
    },
    // 绑定送货员
    handleBindingDelivery(deliveryId) {
      bindingDelivery({ ...this.bindData, deliveryId }).then((res) => {
        this.open = false
        this.resetForm('queryBindForm')
        this.msgSuccess('绑定送货员成功~')
        this.getList()
      })
    },
    // 电子围栏
    handleFence(shopId, geofenceId, orgId) {
      if (!orgId) return this.msgError('组织为空，不能绘画电子围栏~')
      const path = '/battleMap'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'Distributioninfo',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          geofenceId,
          shopId,
          orgId,
          type: 'distribution'
        }
      })
    },
    // 质保金
    handleWarranty(distributionId) {
      const path = '/amount/order'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'Distributioninfo',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          distributionId
        }
      })
    },
    // 保险
    handleInsurance(distributionId) {
      const path = '/delivery-fee/list'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'Distributioninfo',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          distributionId
        }
      })
    },
    /** 打开轨迹模态框 */
    openTrajectoryModal(row) {
      this.resetForm('trajectoryForm')
      this.trajectoryQuery = {
        pageNum: 1,
        pageSize: 10,
        yyyyMMdd: moment().format('yyyy-MM-DD'),
        orderByColumn: 'location_time',
        isAsc: 'desc',
        distributionId: row.distributionId
      }
      this.trajectoryTotal = 0
      this.trajectoryList = []
      this.trajectoryOpen = true
      this.getTrajectoryList()
    },
    // 是否清除轨迹数据
    onClearIs(val) {
      this.clearIs = val
      if (!val) {
        this.trackchecked = []
        this.$refs.trackTable.clearSelection()
      }
    },
    // 轨迹选中点
    handleTrackChange(selection) {
      this.trackchecked = selection.concat()
    },
    /** 查询配送员轨迹 */
    getTrajectoryList() {
      this.trajectoryLoading = true
      listTrajectory(this.trajectoryQuery).then((response) => {
        this.trajectoryList = response.rows
        this.trajectoryTotal = response.total
        this.trajectoryLoading = false
      })
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.distributioninfoList.forEach((row) => {
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
.tabContainer {
  .el-tabs__item {
    width: 150px;
    text-align: center;
  }
}
</style>
