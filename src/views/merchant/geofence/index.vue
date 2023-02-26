<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['merchant:geofence:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增电子围栏
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
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="围栏名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入围栏名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
            v-hasPermi="['merchant:geofence:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      style="margin-top: 20px"
      :data="geofenceList"
      :row-key="(row) => row.geofenceId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="id" align="center" prop="geofenceId" /> -->
      <el-table-column label="围栏名称" min-width="120" align="center" prop="name" />
      <el-table-column label="组织" min-width="100" align="center" prop="orgName" />
      <el-table-column label="店铺名称" min-width="100" align="center" prop="polygon">
        <template slot-scope="scope">
          <div>{{ scope.row.shopName }}</div>
          <el-button v-if="scope.row.polygon" class="outer-link--text" size="mini" type="text" @click="onScope(scope.row)">范围</el-button>
        </template>
      </el-table-column>
      <el-table-column label="配送员数量" min-width="100" align="center" prop="distributionNum">
        <template slot-scope="scope">
          <el-button v-if="scope.row.distributionNum && scope.row.distributionNum !== 0" size="mini" type="text" @click="disJump(scope.row)">{{ scope.row.distributionNum }}</el-button>
          <span v-else>{{ scope.row.distributionNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" min-width="100" align="center" prop="updateTime">
        <template slot-scope="{row}">
          <break-time :date-time="row.updateTime" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="80"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['merchant:geofence:edit']"
            class="outer-link--text"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['merchant:geofence:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
          <el-button
            v-hasPermi="['merchant:geofence:bind']"
            size="mini"
            type="text"
            @click="handleband(scope.row, 'bind')"
          >绑定
          </el-button>
          <el-button
            v-hasPermi="['merchant:geofence:unbind']"
            size="mini"
            type="text"
            @click="handleband(scope.row, 'unbind')"
          >解绑
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
          v-hasPermi="['merchant:geofence:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
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

    <el-dialog
      :title="type === 'bind' ? '绑定配送员' : '解绑配送员'"
      :visible.sync="open"
      width="1000px"
      append-to-body
      @closed="() => {
        distributionIds = []
        modalChecked = false
        modelQuery = {
          distributionName: null,
          distributionTelephone: null,
          groupId: null,
          pageNum: 1,
          pageSize: 10,
        }
        getList()
      }"
    >
      <el-form
        ref="modalQueryForm"
        class="search-form"
        :model="modelQuery"
        :inline="true"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="distributionName">
          <el-input
            v-model="modelQuery.distributionName"
            placeholder="请输入姓名"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="distributionTelephone">
          <el-input
            v-model="modelQuery.distributionTelephone"
            placeholder="请输入手机号码"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分组" prop="groupId">
          <el-select
            v-model="modelQuery.groupId"
            placeholder="请选择分组"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in distributionGroup"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-row
          :gutter="10"
          class="mb8"
          style="margin-left: 95px; margin-top: 5px"
        >
          <el-col :span="1.5">
            <el-button
              type="primary"
              size="mini"
              @click="handleModalQuery"
            >筛选</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button size="mini" @click="resetModalQuery">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-table
          ref="modalTable"
          v-loading="modalLoading"
          style="margin-top: 20px"
          :data="distributionList"
          @selection-change="modalSelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column label="ID" align="center" prop="distributionId" />
          <el-table-column label="姓名" align="center" prop="distributionName" />
          <el-table-column label="手机号" align="center" prop="distributionPhone" />
          <el-table-column label="分组" align="center" prop="groupName" />
          <el-table-column label="当前电子围栏" align="center" prop="geofenceName" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                @click="bandGf([scope.row.distributionId])"
              >{{ type === 'bind' ? '绑定' : '解绑' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-row>
          <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
            <el-checkbox
              v-model="modalChecked"
              @change="toggleSelection"
            >当页全选</el-checkbox>
          </el-col>
          <el-col :span="3" style="margin-top: 26px; margin-left: 10px;text-align: center;">
            <el-button
              size="mini"
              :disabled="distributionIds.length === 0"
              @click="bandGf(null)"
            >{{ type === 'bind' ? '绑定' : '解绑' }}
            </el-button>
          </el-col>
          <el-col :span="11">
            <pagination
              v-show="modalTotal > 0"
              :total="modalTotal"
              :page.sync="modelQuery.pageNum"
              :limit.sync="modelQuery.pageSize"
              @pagination="getModalQuery"
            />
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  delGeofence,
  listGeofence,
  getDistributionList,
  getBindList,
  geofenceBind,
  geofenceUnbind
} from '@/api/merchant/geofence'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getDropDown } from '@/api/selectUtils'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Geofence',
  components: {
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
      // 组织数据
      orgOptions: [],
      // 配送员分组数据
      distributionGroup: [],
      // 配送员数据
      distributionList: [],
      // 总条数
      total: 0,
      // 电子围栏表格数据
      geofenceList: [],
      // 全选状态
      checked: false,
      // 弹出层类型
      type: '',
      // 是否显示弹出层
      open: false,
      // 模态框lodin
      modalLoading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        orgId: null
      },
      form: {},
      modelQuery: {
        distributionName: null,
        distributionTelephone: null,
        groupId: null,
        pageNum: 1,
        pageSize: 10
      },
      modalTotal: 0,
      distributionIds: [],
      // 全选状态
      modalChecked: false
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
  },
  methods: {
    /** 查询电子围栏列表 */
    getList() {
      this.loading = true
      listGeofence(this.queryParams).then((response) => {
        this.geofenceList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.geofenceId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.geofenceList.length === selection.length
    },
    // 模态框全选
    modalSelectionChange(selection) {
      this.distributionIds = selection.map((item) => item.distributionId)
      this.modalChecked = this.distributionList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/merchant/geofence/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Geofence', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'add'
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/merchant/geofence/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Geofence', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'update',
          geofenceId: row.geofenceId
        }
      })
    },
    /** 跳转到配送员界面 */
    disJump(row) {
      const path = '/org/distribution/distributioninfo'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Geofence', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          geofenceId: row.geofenceId
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const geofenceIds = row.geofenceId || this.ids
      const type =
        typeof geofenceIds === 'object'
          ? '批量删除'
          : '删除"' + row.name + '"'
      this.$confirm(`是否确认${type}电子围栏?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delGeofence(geofenceIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /**
     * 范围跳转
     */
    onScope(row) {
      this.$router.push({
        path: '/battleMap',
        query: {
          type: 'check',
          orgId: row.orgId,
          geofenceId: row.geofenceId
        }
      })
    },
    /**
     * 查询绑定配送员
     */
    handBindDis(params) {
      this.modalLoading = true
      getBindList(params).then(res => {
        this.modalLoading = false
        this.distributionList = res.rows
        this.modalTotal = res.total
      })
    },
    /**
     * 查询没绑定配送员
     */
    handOnBind(params) {
      this.modalLoading = true
      getDistributionList(params).then(res => {
        this.modalLoading = false
        this.distributionList = res.rows
        this.modalTotal = res.total
      })
    },
    /**
     * 查询配送员列表
     */
    handleModalQuery() {
      this.modelQuery.pageNum = 1
      if (this.type === 'bind') {
        this.handOnBind(this.modelQuery)
      } else {
        this.handBindDis(this.modelQuery)
      }
    },
    getModalQuery() {
      if (this.type === 'bind') {
        this.handOnBind(this.modelQuery)
      } else {
        this.handBindDis(this.modelQuery)
      }
    },
    /** 重置配送员列表 */
    resetModalQuery() {
      this.resetForm('modalQueryForm')
      this.modelQuery.shopId = this.form.shopId
      this.handleModalQuery()
      this.distributionIds = []
      this.modalChecked = false
    },
    /**
     * 打开绑定解绑界面
     */
    handleband(row, type) {
      this.loading = true
      this.type = type
      this.form = {
        geofenceId: row.geofenceId,
        shopId: row.shopId
      }
      this.modelQuery.shopId = row.shopId
      if (type === 'bind') {
        Promise.all([getDropDown('distributionGroup', { shopId: row.shopId }), getDistributionList(this.modelQuery)]).then(res => {
          this.loading = false
          this.open = true
          this.distributionGroup = res[0].data
          this.distributionList = res[1].rows
          this.modalTotal = res[1].total
        })
      } else {
        this.modelQuery.geofenceId = row.geofenceId
        Promise.all([getDropDown('distributionGroup', { shopId: row.shopId }), getBindList(this.modelQuery)]).then(res => {
          this.loading = false
          this.open = true
          this.distributionGroup = res[0].data
          this.distributionList = res[1].rows
          this.modalTotal = res[1].total
        })
      }
    },
    /**
     * 绑定电子围栏
     */
    bandGf(ids) {
      this.$confirm(`是否确认${this.type === 'bind' ? '绑定' : '解绑'}配送员电子围栏?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {
            geofenceId: this.form.geofenceId,
            distributionIdList: ids || this.distributionIds
          }
          return this.type === 'bind' ? geofenceBind(params) : geofenceUnbind(params)
        }).then(() => {
          this.handleModalQuery()
          this.msgSuccess(`${this.type === 'bind' ? '绑定' : '解绑'}配送员电子围栏成功`)
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'merchant/geofence/export',
        {
          ...this.queryParams
        },
        `merchant_geofence.xlsx`
      )
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.geofenceList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    // 全选
    modalToggleSelection(value) {
      if (value) {
        this.$refs.modalTable.clearSelection()
        this.distributionList.forEach((row) => {
          this.$refs.modalTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.modalTable.clearSelection()
      }
    }
  }
}
</script>
