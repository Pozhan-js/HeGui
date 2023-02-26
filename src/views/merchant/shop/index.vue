<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['merchant:shop:add']"
            type="primary"
            size="mini"
            @click="handleAdd"
          >新增店铺
          </el-button>
        </el-col>
      </el-row>
      <el-form
        v-show="showSearch"
        ref="queryForm"
        class="search-form"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item v-if="showOrg" label="组织" prop="orgId">
          <Cascader
            v-model="queryParams.orgId"
            :options="orgOptions"
            change-on-select
            expand-trigger="hover"
            style="width: 300px"
            placeholder="请选择组织"
            :field-names="{ value: 'id', label: 'label', children: 'children' }"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input
            v-model="queryParams.shopName"
            placeholder="请输入店铺名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="店铺类型" prop="shopType">
          <el-select
            v-model="queryParams.shopType"
            placeholder="请选择店铺类型"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in shopTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺状态" prop="shopStatus">
          <el-select
            v-model="queryParams.shopStatus"
            placeholder="请选择店铺状态"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in shopStatusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <!-- <el-row>
          <el-form-item label="营业时间" prop="openTime">
            <el-row style="width: 300px">
              <el-col :span="10">
                <el-time-picker
                  style="width: 100%"
                  v-model="queryParams.openTime"
                  format="HH:mm"
                  placeholder="开始时间"
                />
              </el-col>
              <el-col :span="4" style="text-align: center">至</el-col>
              <el-col :span="10">
                <el-time-picker
                  style="width: 100%"
                  v-model="queryParams.closeTime"
                  format="HH:mm"
                  placeholder="结束时间"
                />
              </el-col>
            </el-row>
          </el-form-item>
        </el-row> -->
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
              v-hasPermi="['merchant:shop:export']"
              >导出
            </el-button>
          </el-col> -->
        </el-row>
      </el-form>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        style="margin-top: 20px;"
        :max-height="maxHeight"
        fit
        :data="shopList"
        :row-key="(row) => row.shopId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80" align="center" />
        <!-- <el-table-column label="店铺id" align="center" prop="shopId" /> -->
        <el-table-column min-width="100" label="店铺名称" align="center" prop="shopName" />
        <el-table-column min-width="110" label="组织" align="center" prop="orgName" />
        <el-table-column
          min-width="80"
          label="店铺类型"
          align="center"
          prop="shopType"
          :formatter="shopTypeFormat"
        />
        <el-table-column label="客服电话" min-width="120" align="center" prop="customTel" />
        <el-table-column
          min-width="100"
          label="营业时间"
          align="center"
          prop="openTime"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.openTimeHour + ":" + scope.row.openTimeMinute
            }}</span>
            —
            <span>{{
              scope.row.closeTimeHour + ":" + scope.row.closeTimeMinute
            }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="链接地址" align="center" prop="linkUrl" />
        <!-- <el-table-column label="无响应时长" align="center" prop="noResponseTime"/> -->
        <!-- <el-table-column label="超时时间" align="center" prop="longTime" /> -->
        <!-- <el-table-column label="提前几分钟提醒" align="center" prop="tipTime" /> -->
        <!-- <el-table-column label="骑行需要时间" align="center" prop="needTime" /> -->
        <!-- <el-table-column label="骑行规划距离" align="center" prop="distance" /> -->
        <!-- <el-table-column label="扫二维码距离范围" align="center" prop="distanceScope"/> -->
        <el-table-column min-width="100" label="抢单距离（m）" align="center" prop="distance" />
        <el-table-column
          label="推广距离（m）"
          min-width="100"
          align="center"
          prop="distanceScope"
        />
        <!-- <el-table-column label="围栏边界" align="center" prop="hasShelves" /> -->
        <!-- <el-table-column label="店铺总销量" align="center" prop="totalSales" /> -->
        <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
        <el-table-column
          label="店铺状态"
          min-width="80"
          align="center"
          prop="shopStatus"
        >
          <template slot-scope="scope">
            <div>
              {{ shopStatusFormat(scope.row) }}
            </div>
            <el-button
              v-hasPermi="['merchant:shop:shopStatus']"
              size="mini"
              type="text"
              @click="
                handleStatus(scope.row, scope.row.shopStatus === 1 ? 0 : 1)
              "
            >
              {{ scope.row.shopStatus === 1 ? "停业" : "营业" }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="110" align="center" prop="createTime">
          <template slot-scope="scope">
            <!-- {{ formatDate(scope.row.createTime)[0] }}<br>
            {{ formatDate(scope.row.createTime)[1] }} -->
            <break-time :date-time="scope.row.createTime" />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="76"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['merchant:activity:list']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="shopActivity(scope.row.shopId)"
            >店铺活动
            </el-button>
            <el-button
              v-hasPermi="['merchant:shop:goods']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="shopBanner(scope.row.shopId, scope.row.orgId)"
            >店铺Banner
            </el-button>
            <el-button
              v-hasPermi="['merchant:shop:goods']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="goodsmanage(scope.row)"
            >商品管理
            </el-button>
            <el-button
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleCheck(scope.row)"
            >详情
            </el-button>
            <el-button
              v-hasPermi="['merchant:shop:edit']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-if="scope.row.shopStatus === 2"
              v-hasPermi="['merchant:shop:remove']"
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
            <el-button
              size="mini"
              type="text"
              @click="handlePromote(scope.row)"
            >推 广
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
            v-hasPermi="['merchant:shop:remove']"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
          >删除</el-button>
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
      <Promote ref="promote" />
    </div>
  </div>
</template>

<script>
import { delShop, listShop, disabled, enabled, promoteQR } from '@/api/merchant/shop'
import { getAreaTree, getOrgTree } from '@/api/utils'
import moment from 'moment'
import Promote from '@/views/components/promote'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Shop',
  components: {
    Promote,
    Cascader
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length >= 4,
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
      // 店铺信息表格数据
      shopList: [],
      // 是否显示组织
      showOrg: !this.$route.query.orgId,
      // 全选
      checked: false,
      // 店铺类型(自营，加盟)字典
      shopTypeOptions: [],
      // 店铺状态(营业，停业，草稿)字典
      shopStatusOptions: [],
      // 区域数据
      areaOptions: [],
      // 组织数据
      orgOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopName: null,
        orgId: null,
        shopType: null,
        openTime: null,
        closeTime: null,
        shopStatus: null
      },
      // 搜索过得搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Shop')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Shop'))
      }
    }
    if (this.$route.query.orgId) {
      this.queryParams.orgId = this.$route.query.orgId
    }
    this.getList()
    this.getDicts('merchant_shop_type').then((response) => {
      this.shopTypeOptions = response.data
    })
    this.getDicts('merchant_shop_status').then((response) => {
      this.shopStatusOptions = response.data
    })
    // 查询地区
    getAreaTree().then((res) => {
      this.areaOptions = res.data
    })
    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data
      // if (this.$route.query.orgId) {
      //   const orgArr = flatten(res.data, "children");
      //   const orgId = searchSuperior(this.$route.query.orgId, "id", orgArr, "parentId");
      //   this.queryParams.orgId = orgId.concat()
      // }
    })
  },
  destroyed() {
    const head = window.location.href.indexOf('#') + 1
    const tail = window.location.href.indexOf('?') === -1 ? window.location.href.length : window.location.href.indexOf('?')
    const routeUrl = window.location.href.slice(head, tail)
    const subsetRouting = [
      '/merchant/shop/add',
      '/merchant/shop/banner',
      '/merchant/shop/activity',
      '/merchant/shop/cascade',
      '/merchant/shop/update',
      '/merchant/shop/check',
      '/merchant/shop'
    ]
    // if (!subsetRouting.includes(routeUrl)) {
    //   localStorage.removeItem('Shop')
    // }
  },
  methods: {
    /** 查询店铺信息列表 */
    getList() {
      this.loading = true
      const queryParams = {
        ...this.queryParams
      }
      if (this.queryParams.openTime) {
        const openTime = moment(this.queryParams.openTime)
          .format('HH:mm')
          .split(':')
        queryParams.openTimeHour = openTime ? openTime[0] : null
        queryParams.openTimeMinute = openTime ? openTime[1] : null
        delete queryParams.openTime
      }
      if (this.queryParams.closeTime) {
        const closeTime = moment(this.queryParams.closeTime)
          .format('HH:mm')
          .split(':')
        queryParams.closeTimeHour = closeTime ? closeTime[0] : null
        queryParams.closeTimeMinute = closeTime ? closeTime[1] : null
        delete queryParams.closeTime
      }

      listShop(queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.shopList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 店铺类型(自营，加盟)字典翻译
    shopTypeFormat(row, column) {
      return this.selectDictLabel(this.shopTypeOptions, row.shopType)
    },
    // 店铺状态(营业，停业，草稿)字典翻译
    shopStatusFormat(row, column) {
      return this.selectDictLabel(this.shopStatusOptions, row.shopStatus)
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
        shopName: null,
        orgId: null,
        shopType: null,
        openTime: null,
        closeTime: null,
        shopStatus: null
      }
      localStorage.removeItem('Shop')
      if (this.$route.query.orgId) {
        this.queryParams.orgId = this.$route.query.orgId
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.shopId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.shopList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/merchant/shop/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Shop', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'add'
        }
      })
    },
    // 店铺Banner管理
    shopBanner(shopId, orgId) {
      const path = '/merchant/shop/banner'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Shop', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          shopId,
          orgId
        }
      })
    },
    /** 店铺活动 */
    shopActivity(shopId) {
      const path = '/merchant/shop/activity'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Shop', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          shopId
        }
      })
    },
    // 商品管理
    goodsmanage(row) {
      const path = '/merchant/shop/cascade'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Shop', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          shopId: row.shopId,
          shopName: row.shopName
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/merchant/shop/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Shop', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          shopId: row.shopId,
          type: 'update'
        }
      })
    },
    /** 详情 */
    handleCheck(row) {
      const path = '/merchant/shop/check'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Shop', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          shopId: row.shopId,
          type: 'check'
        }
      })
    },
    // 推广链接
    handlePromote(row) {
      promoteQR(row.shopId).then(res => {
        this.$refs['promote'].link = res.data
        this.$refs['promote'].open = true
        this.$refs['promote'].type = 'base64'
        this.$refs['promote'].generate()
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const shopIds = row.shopId || this.ids
      this.$confirm(
        `是否确认${
          typeof shopIds === 'object' ? '批量删除' : '删除"' + row.shopName +
        '"'}店铺信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delShop(shopIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    // 禁用店铺
    handleStatus(rows, status) {
      this.$confirm(
        `是否确认${{ 0: '停运', 1: '营业' }[status]}"${
          rows.shopName
        }"店铺信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return status === 0 ? disabled(rows.shopId) : enabled(rows.shopId)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 0: '停运', 1: '营业' }[status]}成功`)
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'merchant/shop/export',
        {
          ...this.queryParams
        },
        `merchant_shop.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.shopList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
