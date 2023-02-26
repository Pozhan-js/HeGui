<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['wms:warehouse:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增仓库
        </el-button>
      </el-col>
    </el-row>
    <el-form
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
      <el-form-item label="仓库名" prop="warehouseName">
        <el-input
          v-model="queryParams.warehouseName"
          placeholder="请输入仓库名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="仓库管理员" prop="managerBy">
        <el-select v-model="queryParams.managerBy" filterable clearable placeholder="请选择仓管员">
          <el-option
            v-for="item in managerOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            v-hasPermi="['system:warehouse:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      max-height="650"
      style="margin-top: 20px"
      :data="warehouseList"
      :row-key="(row) => row.warehouseId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column label="仓库编号" align="center" prop="warehouseCode" />
      <el-table-column label="仓库名" align="center" prop="warehouseName" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="辐射范围" align="center" prop="shopInfos">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.shopInfos" :key="item.shopId">
            {{ index > 0 ? '，' : '' }}{{ item.shopName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="建立日期" align="center" prop="createDate" />
      <el-table-column label="仓库管理员" align="center" prop="managerName" />
      <!-- <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <div>{{ scope.row.status === 'enable' ? '启用' : '禁用' }}</div>
          <el-button
            v-hasPermi="['wms:warehouse:edit']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.warehouseId, scope.row.status === 'enable' ? 'disable' : 'enable')"
          >
            {{ scope.row.status === 'enable' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column> -->
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['wms:warehouse:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['wms:warehouse:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >删除
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
          v-hasPermi="['system:warehouse:remove']"
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
  </div>
</template>

<script>
import {
  delWarehouse,
  listWarehouse,
  updateStatus
} from '@/api/wms/warehouse'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'
import { Cascader } from 'ant-design-vue'

export default {
  name: 'Warehouse',
  components: {
    Cascader
  },
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
      // 组织机构数据
      orgOptions: [],
      // 仓库管理员
      managerOptions: [],
      // 总条数
      total: 0,
      // 仓库表格数据
      warehouseList: [],
      // 全选状态
      checked: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        warehouseName: null,
        managerBy: null,
        orderByColumn: 'warehouse_id',
        isAsc: 'desc'
      },
      searchParams: {}
    }
  },
  created() {
    if (this.routerView) return

    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Warehouse')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Warehouse'))
      }
    }

    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('managers').then(res => {
      this.managerOptions = res.data.map(item => {
        return {
          userId: item.userId,
          nickName: item.nickName
        }
      })
    })
    this.getList()
  },
  methods: {
    /** 查询仓库列表 */
    getList() {
      this.loading = true
      listWarehouse(this.queryParams).then((response) => {
        this.warehouseList = response.rows
        this.total = response.total
        this.loading = false
        this.searchParams = { ...this.queryParams }
      })
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
        warehouseName: null,
        managerBy: null,
        orderByColumn: 'warehouse_id',
        isAsc: 'desc'
      }
      this.resetForm('queryForm')
      localStorage.removeItem('Warehouse')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.warehouseId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.warehouseList.length === selection.length
    },
    // 修改仓库状态
    handleUpdateStatus(warehouseId, status) {
      this.$confirm(`是否确认${status === 'disable' ? '禁用' : '启用'}仓库?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return updateStatus({ warehouseId, status })
      }).then(() => {
        this.getList()
        this.msgSuccess(`${status === 'disable' ? '禁用' : '启用'}仓库成功`)
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/wms/warehouse/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Warehouse', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'add'
        }
      })
    },
    /** 修改操作 */
    handleUpdate(row) {
      const path = '/wms/warehouse/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Warehouse', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          warehouseId: row.warehouseId,
          type: 'update'
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const warehouseIds = row.warehouseId || this.ids
      const type = typeof warehouseIds === 'object'
        ? '批量删除'
        : '删除"' + row.warehouseName + '"'
      this.$confirm(`是否确认${type}仓库?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delWarehouse(warehouseIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/wms/warehouse/export', this.queryParams)
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.warehouseList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
