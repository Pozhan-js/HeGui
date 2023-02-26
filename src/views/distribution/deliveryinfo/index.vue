<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['distribution:deliveryinfo:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增送货员
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
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="送货员姓名" prop="deliveryName">
        <el-input
          v-model="queryParams.deliveryName"
          placeholder="请输入送货员姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="送货员手机号" prop="telephone">
        <el-input
          v-model="queryParams.telephone"
          placeholder="请输入送货员手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
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
            v-hasPermi="['distribution:deliveryinfo:export']"
            >导出
          </el-button>
        </el-col> -->
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
        v-for="dict in runOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      :data="deliveryinfoList"
      :row-key="(row) => row.deliveryId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column label="送货员编码" min-width="100" align="center" prop="deliveryCode" />
      <el-table-column label="送货员姓名" min-width="100" align="center" prop="deliveryName" />
      <el-table-column label="送货员手机号" min-width="100" align="center" prop="telephone" />
      <el-table-column label="组织" min-width="100" align="center" prop="orgName">
        <template slot-scope="scope">
          <!-- <div
            style="color: #46a6ff; cursor: pointer"
            @click="handleShop(scope.row)"
          >
            {{ scope.row.orgName }}
          </div> -->
          <el-button
            class="outer-link--text"
            size="mini"
            type="text"
            @click="handleShop(scope.row)"
          >{{ scope.row.orgName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        min-width="80"
        align="center"
        prop="runStatus"
        :formatter="runStatusFormat"
      />
      <!-- <el-table-column label="创建时间" min-width="120" align="center" prop="createTime" /> -->
      <el-table-column label="创建时间" min-width="120" align="center">
        <template slot-scope="{row}">
          <break-time :date-time="row.createTime"/>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="100"
        align="center"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status == 1"
            v-hasPermi="['distribution:deliveryinfo:operation']"
            size="mini"
            type="text"
            @click="handleStatus(scope.row, scope.row.runStatus === 0 ? 1 : 0)"
          >
            {{ scope.row.runStatus === 0 ? "启运" : "停运" }}
          </el-button>
          <el-button
            v-if="scope.row.status == 1"
            v-hasPermi="['distribution:deliveryinfo:resign']"
            size="mini"
            type="text"
            @click="handleStatus(scope.row, 2)"
          >离职
          </el-button>
          <el-button
            v-hasPermi="['distribution:deliveryinfo:edit']"
            class="outer-link--text"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
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
          v-hasPermi="['distribution:deliveryinfo:operation']"
          size="mini"
          :disabled="multiple"
          @click="handleStatus({}, 0)"
        >停运
        </el-button>
        <el-button
          v-hasPermi="['distribution:deliveryinfo:operation']"
          size="mini"
          :disabled="multiple"
          @click="handleStatus({}, 1)"
        >启运
        </el-button>
        <el-button
          v-hasPermi="['distribution:deliveryinfo:resign']"
          size="mini"
          :disabled="multiple"
          @click="handleStatus({}, 2)"
        >离职
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
import {
  delDeliveryinfo,
  listDeliveryinfo,
  shipment,
  shutdown,
  separation
} from '@/api/distribution/deliveryinfo'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import Item from '@/layout/components/Sidebar/Item.vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Deliveryinfo',
  components: {
    Cascader,
    Item
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length > 3,
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
      // 总条数
      total: 0,
      // 送货员信息表格数据
      deliveryinfoList: [],
      // 运营状态
      runOptions: [],
      // 离职入职状态
      statusOptions: [],
      // 全选
      checked: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        runStatus: 'all',
        orgId: null,
        deliveryName: null,
        telephone: null,
        status: null
      },
      // 筛选条件
      searchParams: {}
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
    // 运用状态
    this.getDicts('delivery_run').then((response) => {
      this.runOptions = response.data
    })
    this.getDicts('delivery_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询送货员信息列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.runStatus === 'all') {
        params.runStatus = null
      }
      listDeliveryinfo(params).then((response) => {
        this.deliveryinfoList = response.rows
        this.total = response.total
        this.loading = false
        this.searchParams = this.queryParams
      })
    },
    // 运营状态(0停运1.启运)字典翻译
    runStatusFormat(row, column) {
      return this.selectDictLabel(this.runOptions, row.runStatus)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        runStatus: 'all',
        orgId: null,
        deliveryName: null,
        telephone: null,
        status: null
      }
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.deliveryId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.deliveryinfoList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/org/deliveryinfo/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Deliveryinfo', JSON.stringify(this.searchParams))
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
      const path = '/org/deliveryinfo/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Deliveryinfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'update',
          deliveryId: row.deliveryId
        }
      })
    },
    /** 跳转店铺 */
    handleShop(row) {
      const path = '/merchant/shop'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Deliveryinfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'update',
          orgId: row.orgId
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const deliveryIds = row.deliveryId || this.ids
      this.$confirm(
        `是否确认${
          typeof deliveryIds === 'object'
            ? '批量删除'
            : '删除"' + row.deliveryName + '"'
        }送货员信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return delDeliveryinfo(deliveryIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    handleStatus(row, status) {
      const deliveryIds = row.deliveryId || this.ids
      this.$confirm(
        `是否确认${
          typeof deliveryIds === 'object'
            ? '批量' + `${{ 0: '停运', 1: '启运', 2: '离职' }[status]}`
            : `${{ 0: '停运', 1: '启运', 2: '离职' }[status]}"` +
              row.deliveryName +
              '"'
        }送货员?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          switch (status) {
            case 0:
              return shutdown(deliveryIds)
            case 1:
              return shipment(deliveryIds)
            case 2:
              return separation(deliveryIds)
          }
        })
        .then(() => {
          this.getList()
          this.msgSuccess(
            `${{ 0: '停运', 1: '启运', 2: '离职' }[status]}成功~`
          )
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/deliveryinfo/export',
        {
          ...this.queryParams
        }
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.deliveryinfoList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
