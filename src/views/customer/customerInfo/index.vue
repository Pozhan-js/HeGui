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
        label-width="100px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="queryParams.nickname"
            placeholder="请输入用户的昵称"
            clearable
            size="small"
            :disabled="disabledSearch"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号码"
            clearable
            size="small"
            :disabled="disabledSearch"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="客户编号" prop="customerId">
          <el-input
            v-model="queryParams.customerId"
            placeholder="请输入客户编号"
            clearable
            size="small"
            :disabled="disabledSearch"
            @keyup.enter.native="handleQuery"
            @change="(e) => inputChange(e, 'customerId')"
          />
        </el-form-item>
        <el-form-item label="最后操作人" prop="updateBy">
          <el-input
            v-model="queryParams.updateBy"
            placeholder="请输入最后操作人"
            clearable
            size="small"
            :disabled="disabledSearch"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select
            v-model="queryParams.sex"
            placeholder="请选择性别"
            clearable
            size="small"
            :disabled="disabledSearch"
          >
            <el-option
              v-for="dict in sexOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="来源方式" prop="entryMethod">
          <el-select
            v-model="queryParams.entryMethod"
            placeholder="请选择来源方式"
            clearable
            size="small"
            :disabled="disabledSearch"
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
            :disabled="disabledSearch"
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
            :disabled="disabledSearch"
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
          <el-form-item label="累计消费金额">
            <el-col :span="10">
              <el-input
                v-model="queryParams.beginConsumeAmountTotal"
                placeholder="请输入累计消费金额"
                clearable
                size="small"
                :disabled="disabledSearch"
                @change="
                  (value) => inputChange(value, 'beginConsumeAmountTotal')
                "
              />
            </el-col>
            <el-col :span="2" style="text-align: center">—</el-col>
            <el-col :span="10">
              <el-input
                v-model="queryParams.endConsumeAmountTotal"
                placeholder="请输入累计消费金额"
                clearable
                size="small"
                :disabled="disabledSearch"
                @change="(value) => inputChange(value, 'endConsumeAmountTotal')"
              />
            </el-col>
          </el-form-item>
          <el-form-item label="余额">
            <el-col :span="10">
              <el-input
                v-model="queryParams.beginAccountAmount"
                placeholder="请输入余额"
                clearable
                size="small"
                :disabled="disabledSearch"
                @change="(value) => inputChange(value, 'beginAccountAmount')"
              />
            </el-col>
            <el-col :span="2" style="text-align: center">—</el-col>
            <el-col :span="10">
              <el-input
                v-model="queryParams.endAccountAmount"
                placeholder="请输入余额"
                clearable
                size="small"
                :disabled="disabledSearch"
                @change="(value) => inputChange(value, 'endAccountAmount')"
              />
            </el-col>
          </el-form-item>
          <el-form-item label="积分">
            <el-col :span="10">
              <el-input
                v-model="queryParams.beginAccountScore"
                placeholder="请输入积分"
                clearable
                size="small"
                :disabled="disabledSearch"
                @change="(value) => inputChange(value, 'beginAccountScore')"
              />
            </el-col>
            <el-col :span="2" style="text-align: center">—</el-col>
            <el-col :span="10">
              <el-input
                v-model="queryParams.endAccountScore"
                placeholder="请输入积分"
                clearable
                size="small"
                :disabled="disabledSearch"
                @change="(value) => inputChange(value, 'endAccountScore')"
              />
            </el-col>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="入驻时间" prop="time">
            <el-date-picker
              v-model="queryParams.time"
              clearable
              size="small"
              :picker-options="pickerOptions"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled="disabledSearch"
            />
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="queryParams.birthday"
              clearable
              size="small"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled="disabledSearch"
            />
          </el-form-item>
          <el-form-item label="下单时间" prop="orderTime">
            <el-date-picker
              v-model="queryParams.orderTime"
              clearable
              size="small"
              :picker-options="pickerOptions"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled="disabledSearch"
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
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['customer:customerInfo:export']"
              size="mini"
              @click="download('customer/info/export', queryParams)"
            >导出
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        style="margin-top: 20px"
        :max-height="maxHeight"
        :data="customerInfoList"
        :row-key="(row) => row.customerId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80" align="center" />
        <el-table-column
          min-width="100"
          label="客户编号"
          align="center"
          prop="customerId"
        />
        <el-table-column
          min-width="110"
          label="图像名称"
          align="center"
          prop="loginName"
        >
          <template slot-scope="scope">
            <div
              style="cursor: pointer"
              @click="handleDetails(scope.row.customerId)"
            >
              <img
                :src="scope.row.avatar ? scope.row.avatar : '/avatar.png'"
                style="width: 40px; height: 40px; border-radius: 100px"
              >
              <div class="outer-link--text">{{ scope.row.nickname }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          label="等级"
          align="center"
          prop="levelName"
        />
        <el-table-column
          min-width="100"
          label="来源方式"
          align="center"
          prop="entryMethod"
          :formatter="entryMethodFormat"
        />
        <el-table-column
          min-width="110"
          label="购买订单数"
          align="center"
          prop="consumeTimesTotal"
        >
          <template slot-scope="scope">
            <el-button
              class="outer-link--text"
              type="text"
              @click="jumpOrder(scope.row.customerId)"
            >{{ scope.row.consumeTimesTotal }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          min-width="110"
          label="消费金额"
          align="center"
          prop="consumeAmountTotal"
        >
          <template slot-scope="scope">
            <el-button
              class="outer-link--text"
              type="text"
              @click="jumpOrder(scope.row.customerId)"
            >{{
              scope.row.consumeAmountTotal &&
                toDecimal2(scope.row.consumeAmountTotal / 100)
            }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          min-width="110"
          label="余额"
          align="center"
          prop="accountAmount"
        >
          <template slot-scope="scope">
            <jump
              v-if="scope.row.accountAmount != null"
              path="/recharge/record"
              :query="{ customerId: scope.row.customerId }"
            >
              <span class="outer-link--text">{{
                toDecimal2(scope.row.accountAmount / 100)
              }}</span>
            </jump>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          label="积分"
          align="center"
          prop="scoreTotal"
        >
          <template slot-scope="scope">
            <jump
              v-if="scope.row.scoreTotal != null"
              path="/finance-affairs/score/change-record"
              :query="{ customerId: scope.row.customerId }"
            >
              <span class="outer-link--text">{{ scope.row.scoreTotal }}</span>
            </jump>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          label="成长值"
          align="center"
          prop="growth"
        >
          <template slot-scope="scope">
            <el-button type="text" @click="handleGrowthRecord(scope.row)">
              {{ scope.row.growth }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column min-width="110" label="入驻时间" align="center">
          <template slot-scope="{ row }">
            <break-time :date-time="row.createTime" />
          </template>
        </el-table-column>
        <el-table-column
          min-width="90"
          label="修改人"
          align="center"
          prop="updateBy"
        />
        <el-table-column
          min-width="180"
          label="操作"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['marketing:couponInfo:operationIssue']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleSendCoupon(scope.row.customerId, 'operation')"
            >运营发券</el-button>
            <el-button
              v-hasPermi="['customer:customerInfo:addLabel']"
              size="mini"
              type="text"
              @click="openDetailsModel(scope.row)"
            >加标签</el-button>
            <el-popover placement="bottom" trigger="hover" popper-class="kld-popover">
              <div style="display: flex; flex-direction: column; align-items:end">
                <el-button
                  v-hasPermi="['customer:address:list']"
                  class="outer-link--text"
                  size="mini"
                  type="text"
                  @click="handleAddres(scope.row)"
                >收货地址
                </el-button>
                <el-button
                  v-hasPermi="['marketing:couponInfo:customerIssue']"
                  class="outer-link--text"
                  size="mini"
                  type="text"
                  @click="handleSendCoupon(scope.row.customerId, 'customer')"
                >客服发券
                </el-button>
                <el-button
                  v-hasPermi="['customer:signLog:list']"
                  class="outer-link--text"
                  size="mini"
                  type="text"
                  @click="handleSignIn(scope.row)"
                >签到记录
                </el-button>
                <el-button
                  v-hasPermi="['customer:customerInfo:addAmount']"
                  size="mini"
                  type="text"
                  @click="openModel(scope.row, 'balance')"
                >加余额
                </el-button>
                <el-button
                  v-hasPermi="['customer:customerInfo:addScore']"
                  size="mini"
                  type="text"
                  @click="openModel(scope.row, 'integral')"
                >加积分
                </el-button>
                <el-button
                  v-hasPermi="['customer:growthRecord:add']"
                  size="mini"
                  type="text"
                  @click="openGrowth(scope.row)"
                >成长值调整
                </el-button>
                <el-button
                  v-hasPermi="['customer:customerAccount:updateDistributionFlag']"
                  size="mini"
                  type="text"
                  @click="openDistribution(scope.row)"
                >分销权限设置
                </el-button>
              </div>
              <el-button slot="reference" size="mini" type="text">更多</el-button>
            </el-popover>
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
            v-hasPermi="['customer:customerInfo:batchAddBlacklist']"
            size="mini"
            :disabled="multiple"
            @click="handleBlacklist({ customerIds: ids })"
          >加入黑名单
          </el-button>
          <el-button
            v-hasPermi="['customer:customerInfo:batchAddLabel']"
            size="mini"
            :disabled="multiple"
            @click="openModel({ customerId: ids }, 'label')"
          >加标签
          </el-button>
          <el-button
            v-hasPermi="['customer:customerInfo:removeLabel']"
            size="mini"
            :disabled="multiple"
            @click="openCloseLable"
          >去标签
          </el-button>
          <el-button
            v-hasPermi="['marketing:couponInfo:operationIssue']"
            size="mini"
            :disabled="multiple"
            @click="handleSendCoupon(ids.toString(), 'operation')"
          >运营发券</el-button>
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

      <!-- 添加或修改客户基本信息对话框 -->
      <el-dialog
        v-if="open"
        :title="
          {
            label: '添加客户标签',
            coupon: '发优惠券',
            balance: '加余额',
            integral: '加积分',
          }[modelType]
        "
        :visible.sync="open"
        width="1000px"
        :z-index="1000"
        append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item
            v-if="modelType === 'label'"
            label="客户标签"
            prop="labelId"
          >
            <el-select
              v-model="form.labelId"
              multiple
              style="width: 500px"
              placeholder="请选择客户标签"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in labelOptions"
                :key="dict.labelId"
                :label="dict.labelName"
                :value="dict.labelId"
                :disabled="isExist(dict.labelId)"
              />
            </el-select>
          </el-form-item>
          <el-row v-if="modelType === 'coupon'">
            <el-col :span="24">
              <el-form-item label="组织">
                <Cascader
                  v-model="form.queryParams.orgId"
                  :options="orgOptions"
                  change-on-select
                  style="width: 300px"
                  expand-trigger="hover"
                  placeholder="请选择组织"
                  :field-names="{
                    value: 'id',
                    label: 'label',
                    children: 'children',
                  }"
                  @change="handleCouponOrg"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-table v-loading="couponLoading" :data="couponList">
                <el-table-column
                  label="优惠券名称"
                  align="center"
                  prop="couponName"
                />
                <el-table-column
                  label="总张数"
                  align="center"
                  prop="totalNumberSheet"
                />
                <el-table-column
                  label="剩余张数"
                  align="center"
                  prop="remainingNum"
                />
                <el-table-column
                  label="开始时间"
                  align="center"
                  prop="effectiveBeginTime"
                />
                <el-table-column
                  label="结束时间"
                  align="center"
                  prop="effectiveEndTime"
                />
                <el-table-column
                  label="状态"
                  align="center"
                  prop="status"
                  :formatter="couponStatusFormat"
                />
                <el-table-column label="操作" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="hairCoupon(scope.row.couponId)"
                    >发券</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <pagination
                v-show="form.queryParams.total > 0"
                :total="form.queryParams.total"
                :page.sync="form.queryParams.pageNum"
                :limit.sync="form.queryParams.pageSize"
                @pagination="handleCouponOrg"
              />
            </el-col>
          </el-row>
          <el-form-item
            v-if="['balance', 'integral'].includes(modelType)"
            :label="modelType === 'balance' ? '余额' : '积分'"
            prop="amount"
          >
            <el-input-number
              v-model="form.amount"
              :placeholder="`请输入${
                modelType === 'balance' ? '余额' : '积分'
              }`"
            />
          </el-form-item>
          <el-form-item
            v-if="['balance', 'integral'].includes(modelType)"
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="form.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 4 }"
              placeholder="请输入内容"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <div v-if="modelType !== 'coupon'" slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            :loading="this.$store.state.isLoading"
            @click="submitForm"
          >确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :visible.sync="openDetails"
        title="客户标签信息"
        width="500px"
        append-to-body
        @close="() => getList()"
      >
        <div v-if="labelList.length > 0" class="lab_title">
          <div class="title">当前标签</div>
          <div>
            <el-tag
              v-for="(tag, index) in labelList"
              :key="index"
              closable
              style="margin: 5px"
              :class="{'system-preset': tag.createBy === 'job'}"
              @close="handleCloseLable(tag)"
            >
              {{ tag.labelName }}
            </el-tag>
          </div>
        </div>
        <div
          v-if="
            labelOptions.filter(
              (item) =>
                !labelList
                  .map((labItem) => labItem.labelId)
                  .includes(item.labelId)
            ).length > 0
          "
          v-loading="this.$store.state.isLoading"
          class="lab_title"
          style="margin-top: 20px"
        >
          <div class="title">可添加标签</div>
          <div>
            <el-tag
              v-for="(tag, index) in labelOptions.filter(
                (item) =>
                  !labelList
                    .map((labItem) => labItem.labelId)
                    .includes(item.labelId)
              )"
              :key="index"
              style="cursor: pointer; margin: 5px"
              @click="postLabel(tag)"
            >
              {{ tag.labelName }}
            </el-tag>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        title="批量删除客户标签"
        :visible.sync="batchOpen"
        width="800px"
        append-to-body
      >
        <div class="lab_title">
          <div class="title">当前标签</div>
          <div>
            <el-tag
              v-for="(tag, index) in canDelLable"
              :key="index"
              closable
              style="margin: 5px"
              @close="batchDelLable(tag)"
            >
              {{ tag.labelName }}
            </el-tag>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        v-if="distributionOpen"
        title="分销授权"
        :visible.sync="distributionOpen"
        width="600px"
        :z-index="1000"
        append-to-body
      >
        <el-form
          ref="distributionform"
          :model="distributionForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="分销权限" prop="distributionRebatesFlag">
            <el-select
              v-model="distributionForm.distributionRebatesFlag"
              placeholder="请选择分销权限"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in distributionFlagOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="当前会员等级">
            {{ distributionForm.levelName }}
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            :loading="this.$store.state.isLoading"
            @click="onDistribution"
          >确 定</el-button>
          <el-button @click="distributionCancel">取 消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        v-if="growthOpen"
        title="成长值调整"
        :visible.sync="growthOpen"
        width="600px"
        :z-index="1000"
        append-to-body
      >
        <el-form
          ref="growthform"
          :model="growthForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="当前成长值">
            {{ growthForm.growth }}
          </el-form-item>
          <el-form-item label="成长值新增" prop="growthNum">
            <el-input-number
              v-model="growthForm.growthNum"
              placeholder="请输入成长值新增"
              :precision="0"
              :min="0"
              :max="99999"
            />
          </el-form-item>
          <el-form-item label="修改后成长值">
            {{
              growthForm.growthNum
                ? toDecimal2(growthForm.growth + growthForm.growthNum)
                : growthForm.growth
            }}
          </el-form-item>
          <el-form-item label="最后操作人">
            {{ growthForm.name }}
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="growthForm.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 4 }"
              placeholder="请输入内容"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            :loading="this.$store.state.isLoading"
            @click="onGrowth"
          >确 定</el-button>
          <el-button @click="growthCancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  listCustomerInfo,
  getCustomerInfo,
  addLabel,
  batchAddLabel,
  removeLabel,
  addAmount,
  addScore,
  couponIssue,
  hairCoupon,
  batchHairCoupon,
  batchAddBlacklist,
  detail,
  updateDistributionFlag,
  growthRecordAdd
} from '@/api/customer/customerInfo'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'
import { filterArr } from '@/utils/array'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'CustomerInfo',
  components: {
    Cascader
  },
  mixins: [ SetTableMaxHeight ],
  data() {
    return {
      routerView: window.location.hash.split('?')[0].split('/').length === 4,
      // 禁用搜索框
      disabledSearch: false,
      // 遮罩层
      loading: true,
      // 发券loding
      couponLoading: false,
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
      // 客户基本信息表格数据
      customerInfoList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // model框类型
      modelType: null,
      // 详细信息标签
      openDetails: false,
      // 客户标签详情
      labelList: [],
      // 性别，值为1时是男性，值为2时是女性，值为0时是未知字典
      sexOptions: [],
      // 帐号状态字典
      statusOptions: [],
      // 来源方式
      entryMethodOptions: [],
      // 组织
      orgOptions: [],
      // 客户标签
      labelOptions: [],
      // 客户等级
      levelOptions: [],
      // 分销权限字典
      distributionFlagOptions: [],
      // 优惠券列表信息
      couponList: [],
      // 优惠券状态
      couponStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        nickname: null,
        phone: null,
        entryMethod: null,
        customerId: null,
        updateBy: null,
        time: null,
        birthday: null,
        status: null,
        labelId: null,
        levelId: null,
        sex: null,
        beginConsumeAmountTotal: null,
        endConsumeAmountTotal: null,
        beginAccountAmount: null,
        endAccountAmount: null,
        beginAccountScore: null,
        endAccountScore: null
      },
      searchParams: null,
      // 表单参数
      form: {
        couponId: null,
        queryParams: {
          total: 0,
          pageNum: 1,
          pageSize: 10,
          orgId: null
        }
      },
      // 分销权限modal
      distributionOpen: false,
      // 分销Form
      distributionForm: {},
      // 成长值
      growthOpen: false,
      growthForm: {},
      // 批量删除客户标签
      batchOpen: false,
      // 可删除标签
      canDelLable: [],
      // 客户拥有标签
      haveLable: [],
      // 表单校验
      rules: {
        labelId: [
          { required: true, message: '客户标签不能为空', trigger: 'blur' }
        ],
        distributionRebatesFlag: [
          { required: true, message: '分销权限不能为空', trigger: 'blur' }
        ],
        amount: [
          {
            required: true,
            message: `${
              this.modelType === 'balance' ? '余额' : '积分'
            }不能为空`,
            trigger: 'blur'
          }
        ],
        growthNum: [
          { required: true, message: '新增成长值不能为空', trigger: 'blur' }
        ],
        remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'))
              const end = new Date(moment(new Date()).endOf('day'))
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(start).endOf('day'))
              ])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          }
        ]
      }
    }
  },
  created() {
    if (this.routerView) {
      return
    }

    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      if (this.$route.query.couponId) {
        this.disabledSearch = true
      }
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('CustomerInfo')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('CustomerInfo'))
      }
    }
    this.getList()
    // 客户标签
    getDropDown('customerLabel', { labelStatus: 1 }).then((res) => {
      this.labelOptions = res.data
    })
    // 客户等级
    getDropDown('customerLevel').then((res) => {
      this.levelOptions = res.data
    })
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('sys_user_sex').then((response) => {
      this.sexOptions = response.data
    })
    this.getDicts('customer_user_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('customer_entry_method').then((response) => {
      this.entryMethodOptions = response.data
    })
    this.getDicts('coupon_status').then((response) => {
      this.couponStatusOptions = response.data
    })
    this.getDicts('customer_distribution_rebates_flag').then((response) => {
      this.distributionFlagOptions = response.data
    })
  },
  methods: {
    // 输入框值改变
    inputChange(value, key) {
      if (
        key === 'endConsumeAmountTotal' &&
        parseInt(this.queryParams.beginConsumeAmountTotal) >
          parseInt(value.replace(/[^\d]/g, ''))
      ) {
        this.queryParams[key] = this.queryParams.beginConsumeAmountTotal
      } else if (
        key === 'endAccountAmount' &&
        parseInt(this.queryParams.beginAccountAmount) >
          parseInt(value.replace(/[^\d]/g, ''))
      ) {
        this.queryParams[key] = this.queryParams.beginAccountAmount
      } else {
        this.queryParams[key] = value.replace(/[^\d]/g, '')
      }
    },
    /** 查询客户基本信息列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.time && this.queryParams.time.length === 2) {
        params.beginTime = moment(this.queryParams.time[0])
          .startOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
        params.endTime = moment(this.queryParams.time[1])
          .endOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      if (this.queryParams.birthday && this.queryParams.birthday.length === 2) {
        params.beginBirthday = moment(this.queryParams.birthday[0])
          .startOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
        params.endBirthday = moment(this.queryParams.birthday[1])
          .endOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      if (
        this.queryParams.orderTime &&
        this.queryParams.orderTime.length === 2
      ) {
        params.beginLastOrderTime = moment(this.queryParams.orderTime[0])
          .startOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
        params.endLastOrderTime = moment(this.queryParams.orderTime[1])
          .endOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      if (this.queryParams.beginConsumeAmountTotal) {
        params.beginConsumeAmountTotal =
          this.queryParams.beginConsumeAmountTotal * 100
      }
      if (this.queryParams.endConsumeAmountTotal) {
        params.endConsumeAmountTotal =
          this.queryParams.endConsumeAmountTotal * 100
      }
      if (this.queryParams.beginAccountAmount) {
        params.beginAccountAmount = this.queryParams.beginAccountAmount * 100
      }
      if (this.queryParams.endAccountAmount) {
        params.endAccountAmount = this.queryParams.endAccountAmount * 100
      }

      delete params.birthday
      delete params.time
      delete params.orderTime
      listCustomerInfo(params).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.customerInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 性别，值为1时是男性，值为2时是女性，值为0时是未知字典翻译
    sexFormat(row, column) {
      return this.selectDictLabel(this.sexOptions, row.sex)
    },
    // 帐号状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 来源方式
    entryMethodFormat(row, column) {
      return this.selectDictLabel(this.entryMethodOptions, row.entryMethod)
    },
    // 优惠券状态
    couponStatusFormat(row, column) {
      return this.selectDictLabel(this.couponStatusOptions, row.status)
    },
    // 打开model框
    openModel(row, type) {
      this.reset()
      this.form.customerId = row.customerId
      this.modelType = type
      this.open = true
      if (type === 'coupon') {
        this.handleCouponOrg()
      }
    },
    // 取消按钮
    cancel() {
      this.modelType = null
      this.open = false
      this.form.labelId = null
      this.reset()
    },
    // 打开详情信息标签model框
    openDetailsModel(row) {
      this.openDetails = true
      this.form.customerId = row.customerId
      this.labelList = row.customerLabelRelationList || []
    },
    // 是否存在标签
    isExist(labelId) {
      return (
        this.labelList?.filter((item) => item.labelId === labelId).length > 0
      )
    },
    // 表单重置
    reset() {
      this.form = {
        customerId: null,
        labelId: null,
        couponId: null,
        amount: null,
        remark: null,
        queryParams: {
          total: 0,
          pageNum: 1,
          pageSize: 10,
          orgId: null
        }
      }
      this.resetForm('form')
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
        nickname: null,
        entryMethod: null,
        customerId: null,
        time: null,
        status: null,
        labelId: null,
        levelId: null
      }
      this.disabledSearch = false
      localStorage.removeItem('CustomerInfo')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.customerId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.customerInfoList.length === selection.length
    },
    // 成长值变动记录
    handleGrowthRecord(row) {
      const path = '/customer/growthRecordDetails'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CustomerInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          customerId: row.customerId
        }
      })
    },
    // 发券
    handleSendCoupon(customerId, type) {
      const path =
        type === 'customer'
          ? '/customer/customerInfo/customerSendCoupon'
          : '/customer/customerInfo/operationSendCoupon'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CustomerInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type,
          customerId
        }
      })
    },
    // 收货地址管理
    handleAddres(row) {
      const path = '/customer/customerInfo/address'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CustomerInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          customerId: row.customerId
        }
      })
    },
    // 签到记录
    handleSignIn(row) {
      const path = '/customer/customerInfo/signIn'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CustomerInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          customerId: row.customerId
        }
      })
    },
    /** 加入黑名单 */
    handleBlacklist(params) {
      this.$confirm('加入黑名单的客户不能浏览商城，不能再购买产品', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchAddBlacklist(params).then((res) => {
          this.getList()
          this.msgSuccess('加入黑名单成功~')
        })
      })
    },
    /** 发券组织选择 */
    handleCouponOrg(value = null) {
      this.couponLoading = true
      if (value === null) {
        this.form.queryParams.pageNum = 1
      }
      const params = {
        ...this.form.queryParams
      }
      delete params.total
      couponIssue(params).then((res) => {
        this.couponLoading = false
        this.form.queryParams.total = res.total
        this.couponList = res.rows
      })
    },
    /** 加标签 */
    postLabel(label) {
      if (this.$store.state.isLoading) return
      const params = {
        customerId: this.form.customerId,
        labelId: label.labelId
      }
      addLabel(params).then((res) => {
        this.getCustomerLable(params.customerId)
      })
    },
    /** 发券 */
    hairCoupon(couponId) {
      this.form.couponId = couponId
      this.submitForm()
    },
    /** 打开分销授权 */
    openDistribution(row) {
      detail(row.customerId).then((res) => {
        this.distributionForm = {
          accountId: res.data.accountId,
          customerId: row.customerId,
          distributionRebatesFlag: res.data.distributionRebatesFlag,
          levelName: res.data.levelName
        }
        this.distributionOpen = true
      })
    },
    /** 关闭分销授权 */
    distributionCancel() {
      this.distributionOpen = false
      this.distributionForm = {
        distributionRebatesFlag: null
      }
    },
    /** 分销权限保存 */
    onDistribution() {
      this.$refs['distributionform'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定调整该会员（${this.distributionForm.levelName}）分销权限？`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const params = {
                ...this.distributionForm
              }
              delete params.levelName
              return updateDistributionFlag(params)
            })
            .then(() => {
              this.getList()
              this.distributionCancel()
              this.msgSuccess(`分销权限设置成功~`)
            })
        }
      })
    },
    /** 打开成长值调整 */
    openGrowth(row) {
      this.growthForm = {
        growth: Math.floor(row.growth * 100) / 100,
        customerId: row.customerId,
        name: this.$store.state.user.name,
        customerName: row.nickname
      }
      this.growthOpen = true
    },
    /** 关闭成长值调整 */
    growthCancel() {
      this.growthOpen = false
      this.growthForm = {}
    },
    /** 成长值调整保存 */
    onGrowth() {
      this.$refs['growthform'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定调整"${this.growthForm.customerName}"用户成长值？`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const params = {
                customerId: this.growthForm.customerId,
                growthNum: this.growthForm.growthNum,
                reason: this.growthForm.remark
              }
              return growthRecordAdd(params)
            })
            .then(() => {
              this.getList()
              this.growthCancel()
              this.msgSuccess(`用户成长值调整成功~`)
            })
        }
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (['balance', 'integral'].includes(this.modelType)) {
            this.$prompt('请输入密码', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'password'
            })
              .then(({ value }) => {
                let params = {}
                switch (this.modelType) {
                  case 'balance':
                    params = {
                      customerId: this.form.customerId,
                      amount: this.form.amount * 100,
                      remark: this.form.remark,
                      password: this.encrypt(value)
                    }
                    return addAmount(params)
                  case 'integral':
                    params = {
                      customerId: this.form.customerId,
                      score: this.form.amount,
                      remark: this.form.remark,
                      password: this.encrypt(value)
                    }
                    return addScore(params)
                }
              })
              .then(() => {
                this.open = false
                this.reset()
                this.getList()
                this.msgSuccess(
                  `客户加${
                    { balance: '余额', integral: '积分' }[this.modelType]
                  }成功~`
                )
              })
          } else {
            this.$confirm(
              {
                label: `是否确认${
                  typeof this.form.customerId === 'object' ? '批量' : ''
                }添加客户标签信息？`,
                coupon: `是否确认${
                  typeof this.form.customerId === 'object' ? '批量' : ''
                }给客户发优惠券？`
              }[this.modelType],
              '警告',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }
            )
              .then(() => {
                let params = null
                switch (this.modelType) {
                  case 'label':
                    if (typeof this.form.customerId === 'object') {
                      params = {
                        customerIds: this.form.customerId,
                        labelIds: this.form.labelId
                      }
                      return batchAddLabel(params).then((res) => {
                        this.msgSuccess('批量添加客户标签成功~')
                      })
                    } else {
                      params = {
                        customerId: this.form.customerId,
                        labelIds: this.form.labelId
                      }
                      return addLabel(params).then((res) => {
                        this.getCustomerLable(params.customerId)
                        this.msgSuccess('添加客户标签成功~')
                      })
                    }
                  case 'coupon':
                    if (typeof this.form.customerId === 'object') {
                      return batchHairCoupon({
                        customerIds: this.form.customerId,
                        couponId: this.form.couponId
                      }).then((res) => {
                        if (res.data.failCustomerList.length) {
                          this.msgInfo(
                            `${res.data.failCustomerList.length}个用户已超过限领张数~`
                          )
                        } else {
                          this.msgSuccess(`批量发送优惠券成功~`)
                        }
                      })
                    } else {
                      return hairCoupon({
                        customerId: this.form.customerId,
                        couponId: this.form.couponId
                      }).then((res) => {
                        this.msgSuccess('发送优惠券成功~')
                      })
                    }
                }
              })
              .then(() => {
                if (this.modelType === 'coupon') return this.handleCouponOrg()
                this.open = false
                this.reset()
                this.getList()
              })
          }
        }
      })
    },
    // 查询用户标签
    getCustomerLable(customerId) {
      getCustomerInfo(customerId).then((res) => {
        this.labelList = res.data.customerLabelRelationList
      })
    },
    // 删除客户标签
    handleCloseLable(tag) {
      this.$confirm('是否确认删除客户标签信息?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return removeLabel(tag.labelRelationId)
        })
        .then(() => {
          this.labelList = this.labelList.filter(
            (item) => item.labelRelationId !== tag.labelRelationId
          )
        })
    },
    // 打开批量删除界面
    openCloseLable() {
      let lableList = []
      this.customerInfoList
        .filter((item) => this.ids.includes(item.customerId))
        .map((item) => {
          lableList = lableList
            .concat(item.customerLabelRelationList)
            .filter((fitem) => fitem)
        })
      this.haveLable = lableList
      this.canDelLable = filterArr(lableList, 'labelId')
      this.batchOpen = true
    },
    // 批量删除客户标签
    batchDelLable(tag) {
      const ids = this.haveLable
        .filter((item) => item.labelId === tag.labelId)
        .map((item) => item.labelRelationId)
      this.$confirm('是否确定批量删除客户标签?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return removeLabel(ids.toString())
        })
        .then(() => {
          this.canDelLable = this.canDelLable.filter(
            (item) => item.labelId !== tag.labelId
          )
          this.getList()
          this.msgSuccess('删除客户标签成功~')
        })
    },
    /** 跳转客户画像 */
    handleDetails(customerId) {
      const path = '/customer/customerInfo/portrait'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CustomerInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          customerId
        }
      })
    },
    // 跳转订单界面
    jumpOrder(customerId) {
      const path = '/order/delivery/allorder'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem('CustomerInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          customerId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/customerInfo/export',
        {
          ...this.queryParams
        },
        `customer_customerInfo.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.customerInfoList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
<style lang="scss">
.system-preset {
  background: transparent;
}
.lab_title {
  position: relative;
  padding: 20px 10px;
  border-radius: 5px;
  border: 1px solid #e2e2e2;
  .title {
    width: 120px;
    text-align: center;
    top: -12px;
    padding: 0 10px;
    font-size: 16px;
    background: #fff;
    position: absolute;
  }
}
.kld-popover {
  min-width: 70px;
  margin-right: 30px;
}
</style>
