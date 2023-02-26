<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['merchant:activity:add']"
          type="primary"
          size="mini"
          @click="handleAdd()"
        >新增店铺活动
        </el-button>
      </el-col>
    </el-row>
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="活动标题" prop="activityTitle">
        <el-input
          v-model="queryParams.activityTitle"
          placeholder="请输入活动标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['merchant:activity:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="activityList"
      :row-key="(row) => row.activityId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="120" align="center" />
      <!-- <el-table-column label="id" align="center" prop="activityId" /> -->
      <el-table-column label="活动标题" align="center" prop="activityTitle" />
      <el-table-column label="活动内容" align="center" prop="activityContent">
        <template slot-scope="scope">
          <el-image
            v-for="(item, index) in scope.row.activityContent"
            :key="index"
            style="width: 80px; height: 80px; margin-right: 10px"
            :src="prefix + item.picUrl"
            :preview-src-list="
              scope.row.activityContent.map((item) => prefix + item.picUrl)
            "
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="200"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['merchant:activity:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['merchant:activity:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
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
          v-hasPermi="['merchant:activity:remove']"
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
  </div>
</template>

<script>
import { listActivity, delActivity } from '@/api/merchant/activity'

export default {
  name: 'Activity',
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length > 4,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
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
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 店铺活动表格数据
      activityList: [],
      // 全选
      checked: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: this.$route.query.shopId,
        activityTitle: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询店铺活动列表 */
    getList() {
      this.loading = true
      listActivity(this.queryParams).then((response) => {
        this.activityList = response.rows
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
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.activityId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.activityList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/merchant/shop/activity/add',
        query: {
          shopId: this.$route.query.shopId
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$router.push({
        path: '/merchant/shop/activity/update',
        query: {
          shopId: this.$route.query.shopId,
          activityId: row.activityId
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const activityIds = row.activityId || this.ids
      this.$confirm(
        `是否确认${
          typeof activityIds === 'object'
            ? '批量删除'
            : '删除"' + row.activityTitle
        }"店铺活动?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delActivity(activityIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(
            `${
              typeof activityIds === 'object' ? '批量删除' : '删除'
            }店铺活动成功`
          )
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'merchant/activity/export',
        {
          ...this.queryParams
        },
        `merchant_activity.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.activityList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
