<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--组织数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="orgName"
            placeholder="请选择组织名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="tree"
            :data="orgOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:add']"
              type="primary"
              size="mini"
              @click="handleAdd"
            >新增用户</el-button>
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
          <el-form-item label="用户账号" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户账号"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-row>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                size="small"
                style="width: 240px"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
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
            <!-- <el-col :span="1.5">
              <el-button
                size="mini"
                @click="handleExport"
                v-hasPermi="['system:user:export']"
                >导出</el-button
              >
            </el-col> -->
            <!-- <el-col :span="1.5">
              <el-button
                type="info"
                plain
                size="mini"
                @click="handleImport"
                v-hasPermi="['system:user:import']"
                >导入</el-button
              >
            </el-col> -->
          </el-row>
        </el-form>

        <el-table
          ref="multipleTable"
          v-loading="loading"
          style="margin-top: 20px"
          :data="userList"
          :row-key="(row) => row.userId"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column
            v-if="columns[0].visible"
            key="userId"
            label="用户编号"
            align="center"
            prop="userId"
          />
          <el-table-column
            key="userCode"
            label="员工工号"
            align="center"
            prop="userCode"
          />
          <el-table-column
            v-if="columns[1].visible"
            key="userName"
            label="用户账号"
            align="center"
            prop="userName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns[2].visible"
            key="nickName"
            label="用户昵称"
            align="center"
            prop="nickName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns[3].visible"
            key="orgName"
            label="组织"
            align="center"
            prop="org.orgName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns[4].visible"
            key="phonenumber"
            label="手机号码"
            align="center"
            prop="phonenumber"
            width="120"
          />
          <el-table-column
            v-if="columns[5].visible"
            key="status"
            label="状态"
            align="center"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns[6].visible"
            label="创建时间"
            align="center"
            prop="createTime"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="160"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['system:user:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-if="scope.row.userId !== 1"
                v-hasPermi="['system:user:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <el-button
                v-hasPermi="['system:user:resetPwd']"
                size="mini"
                type="text"
                icon="el-icon-key"
                @click="handleResetPwd(scope.row)"
              >重置</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row>
          <el-col :span="1.5" style="margin-top: 33px; margin-left: 30px">
            <el-checkbox
              v-model="checked"
              @change="toggleSelection"
            >当页全选</el-checkbox>
          </el-col>
          <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
            <el-button
              v-hasPermi="['system:user:remove']"
              style="font-size: 16px"
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
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属组织" prop="orgId">
              <treeselect
                v-model="form.orgId"
                :options="orgOptions"
                :show-count="true"
                placeholder="请选择归属组织"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="form.phonenumber"
                placeholder="请输入手机号码"
                maxlength="11"
                @change="handlePas"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="用户账号"
              prop="userName"
            >
              <el-input v-model="form.userName" placeholder="请输入用户账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="用户密码"
              prop="password"
            >
              <el-input
                v-model="form.password"
                placeholder="请输入用户密码"
                type="password"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="员工工号">
              <el-input
                v-model="form.userCode"
                disabled
                placeholder="请输入员工工号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in sexOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择" @change="() => form = {...form}">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择" @change="() => form = {...form}">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                maxlength="200"
                show-word-limit
                type="textarea"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          <el-checkbox
            v-model="upload.updateSupport"
          />是否更新已经存在的用户数据
          <el-link
            type="info"
            style="font-size: 12px"
            @click="importTemplate"
          >下载模板</el-link>
        </div>
        <div slot="tip" class="el-upload__tip" style="color: red">
          提示：仅允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitFileForm"
        >确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  getPassword
} from '@/api/system/user'
import { getToken } from '@/utils/auth'
import { treeselect } from '@/api/system/org'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'User',
  components: { Treeselect },
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
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 组织树选项
      orgOptions: null,
      // 是否显示弹出层
      open: false,
      // 组织名称
      orgName: null,
      // 默认密码
      initPassword: null,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      // 全选
      checked: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: null,
        phonenumber: null,
        status: null,
        orgId: null
      },
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户账号`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `组织`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true }
      ],
      // 表单校验
      rules: {
        userName: [
          { required: true, message: '用户账号不能为空', trigger: 'blur' }
        ],
        orgId: [
          { required: true, message: '归属组织不能为空', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' }
        ],
        email: [
          {
            required: true,
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phonenumber: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    // 根据名称筛选组织树
    orgName(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
    this.getDicts('sys_normal_disable').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then((response) => {
      this.sexOptions = response.data
    })
    getPassword().then(res => {
      this.initPassword = res.msg
    })
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    /** 查询组织下拉树结构 */
    getTreeselect() {
      treeselect().then((response) => {
        this.orgOptions = response.data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 手机号码填充密码
    handlePas(value) {
      this.form.password = value
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.orgId = data.id
      this.getList()
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.status === '0' ? '启用' : '停用'
      this.$confirm(
        '确认要"' + text + '""' + row.userName + '"用户吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return changeUserStatus(row.userId, row.status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
        })
        .catch(function() {
          row.status = row.status === '0' ? '1' : '0'
        })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        userId: null,
        orgId: null,
        userName: null,
        nickName: null,
        password: null,
        phonenumber: null,
        userCode: null,
        userCode: null,
        email: null,
        sex: null,
        status: '0',
        remark: null,
        postIds: [],
        roleIds: []
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userId)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.checked = selection.length === this.userList.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeselect()
      getUser().then((response) => {
        this.postOptions = response.posts
        this.roleOptions = response.roles
        this.open = true
        this.title = '添加用户'
        // this.form.password = this.initPassword;
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        this.form = {
          ...response.data
        }
        this.postOptions = response.posts
        this.roleOptions = response.roles
        console.log(response.postIds)
        this.form.postIds = response.postIds.map(item => item.toString())
        this.form.roleIds = response.roleIds.map(item => item.toString())
        this.open = true
        this.title = '修改用户'
        // this.form.password = "";
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!value || value.length < 6) return this.msgError('请输入正确用户密码~')
          resetUserPwd(row.userId, this.encrypt(value)).then((response) => {
            this.msgSuccess('修改成功，新密码是：' + value)
          })
        })
        .catch(() => {})
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定${this.form.userId != undefined ? '修改' : '新增'}用户?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return this.form.userId != undefined
                ? updateUser(this.form)
                : addUser({ ...this.form, password: this.encrypt(this.form.password) })
            })
            .then((res) => {
              this.msgSuccess(
                `${this.form.userId != undefined ? '修改' : '新增'}成功`
              )
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids
      this.$confirm(
        `是否确认${
          typeof userIds === 'object' ? '批量删除' : '删除"' + row.nickName + '"'
        }用户?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delUser(userIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/user/export',
        {
          ...this.queryParams
        },
        `user_${new Date().getTime()}.xlsx`
      )
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download(
        'system/user/importTemplate',
        {
          ...this.queryParams
        },
        `user_${new Date().getTime()}.xlsx`
      )
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    // 全部选中
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.userList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
