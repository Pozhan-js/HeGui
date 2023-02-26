<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:group:add']"
            type="primary"
            size="mini"
            @click="handleAdd"
          >新增分组
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
        <el-form-item label="组名" prop="groupName">
          <el-input
            v-model="queryParams.groupName"
            placeholder="请输入组名"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="组长" prop="leaderName">
          <el-input
            v-model="queryParams.leaderName"
            placeholder="请输入组长"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="组长手机号" prop="leaderPhone">
          <el-input
            v-model="queryParams.leaderPhone"
            placeholder="请输入组长手机号"
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
            v-hasPermi="['distribution:group:export']"
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
        :data="groupList"
        :row-key="(row) => row.groupId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80" align="center" />
        <el-table-column label="组织" min-width="140" align="center" prop="orgName" />
        <el-table-column label="组名" min-width="120" align="center" prop="groupName" />
        <el-table-column label="店铺名称" min-width="120" align="center" prop="shopName" />
        <el-table-column label="组长" min-width="100" align="center" prop="leaderName" />
        <el-table-column label="组长手机号" min-width="120" align="center" prop="leaderPhone" />
        <el-table-column
          label="操作"
          min-width="120"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['distribution:group:remove']"
              size="mini"
              type="text"
              @click="handleCheck(scope.row)"
            >查看
            </el-button>
            <el-button
              v-hasPermi="['distribution:group:edit']"
              size="mini"
              type="text"
              class="outer-link--text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-hasPermi="['distribution:group:remove']"
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
            v-hasPermi="['distribution:group:remove']"
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

      <el-dialog v-if="open" title="查看配送员分组" :visible.sync="open" width="1000px">
        <el-form ref="form" label-width="80px">
          <el-form-item label="组织">
            <Cascader
              v-model="modalData.orgId"
              :allow-clear="false"
              :options="orgOptions"
              change-on-select
              expand-trigger="hover"
              style="width: 50%;"
              placeholder="请选择组织"
              :field-names="{ value: 'id', label: 'label', children: 'children' }"
            />
          </el-form-item>
          <el-form-item label="组名">
            <el-input v-model="modalData.groupName" style="width: 50%;background-color: #fff;color: #333;" disabled placeholder="请输入组名" />
          </el-form-item>
          <el-form-item label="成员">
            <el-table
              v-loading="modalLoading"
              :data="distributionList"
            >
              <el-table-column label="配送员编号" align="center" prop="distributionId" />
              <el-table-column label="等级" align="center" prop="levelName" />
              <el-table-column label="姓名" align="center" prop="makiName" />
              <el-table-column label="手机号" align="center" prop="telephone" />
              <el-table-column label="入组时间" align="center" prop="joinTime" />
              <el-table-column width="100" label="成员" align="center" prop="isLeader">
                <template slot-scope="scope">
                  {{ scope.row.isLeader === 0 ? '组员' : '组长' }}
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <pagination
            v-show="checkParams.total > 0"
            :total="checkParams.total"
            :page.sync="checkParams.pageNum"
            :limit.sync="checkParams.pageSize"
            @pagination="getPageGroup"
          />
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { delGroup, listGroup, getGroup, getDistribution } from '@/api/distribution/group'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import { flatten, searchSuperior } from '@/utils/array'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Group',
  components: {
    Cascader
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView: window.location.hash.split('?')[0].split('/').length > 4,
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
      // 配送员分组表格数据
      groupList: [],
      // 全选
      checked: false,
      // 组织数据
      orgOptions: [],
      // 查看分组Modal
      open: false,
      // 分组信息
      modalData: {},
      // model遮罩层
      modalLoading: false,
      // 配送员信息
      distributionList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        shopName: null,
        groupName: null,
        leaderName: null,
        leaderPhone: null
      },
      // 配送员分组查看参数
      checkParams: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      // 搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Group')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Group'))
      }
    }
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getList()
  },
  methods: {
    /** 查询配送员分组列表 */
    getList() {
      this.loading = true
      listGroup(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.groupList = response.rows
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        shopName: null,
        groupName: null,
        leaderName: null,
        leaderPhone: null
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.groupId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.groupList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/org/distribution/group/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Group', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path
      })
    },
    // 查看
    handleCheck(row) {
      getGroup(row.groupId).then(res => {
        const orgArr = flatten(this.orgOptions, 'children')
        this.modalData = {
          ...res.data,
          orgId: searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        }
        this.checkParams.groupId = res.data.groupId
        this.open = true
        this.getPageGroup()
      })
    },
    // 查看配送员
    getPageGroup() {
      this.modalLoading = true
      const params = {
        ...this.checkParams
      }
      delete params.total
      getDistribution(params).then(res => {
        this.distributionList = res.rows
        this.checkParams.total = res.total
        this.modalLoading = false
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/org/distribution/group/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Group', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          groupId: row.groupId || this.ids,
          type: 'update'
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const groupIds = row.groupId || this.ids
      this.$confirm(
        `是否确认${typeof groupIds === 'object' ? '批量删除' : '删除"' + row.groupName + '"'}配送员分组?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delGroup(groupIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/group/export',
        {
          ...this.queryParams
        },
        `distribution_group.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.groupList.forEach((row) => {
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
.title_bleck {
  padding: 5px 0;
  border-right: 1px solid #333;
}
.info_bleck{
  padding: 10px 0;
  border-right: 1px solid #333;
}
.is-disabled{
  /deep/ .el-input__inner{
    background-color: #fff;
    color: #333;
  }
}

</style>
