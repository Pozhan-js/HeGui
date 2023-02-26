<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:org:add']"
          >新增组织</el-button
        >
      </el-col>
      <!-- <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar> -->
    </el-row>
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="组织名称" prop="orgName">
        <el-input
          v-model="queryParams.orgName"
          placeholder="请选择组织名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="组织状态"
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
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
            >筛选</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button size="mini" @click="resetQuery"
            >重置</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      class="tree-table"
      :max-height="maxHeight"
      style="margin-top: 20px"
      :data="orgList"
      :row-class-name="tableRowClassName"
      row-key="orgId"
      default-expand-all
      @expand-change="handleExpandChange"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        prop="orgId"
        label="组织ID"
        min-width="200"
      ></el-table-column>
      <el-table-column
        prop="orgName"
        label="组织名称"
        min-width="130"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="orgType"
        label="组织类型"
        :formatter="typeFormat"
        min-width="120"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="orderNum"
        label="排序"
        min-width="100"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        :formatter="statusFormat"
        min-width="100"
        align="center"
      ></el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        min-width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="120"
        align="center"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:org:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:org:add']"
            >新增</el-button
          >
          <el-button
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:org:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改组织对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级组织" prop="parentId">
              <treeselect
                :disabled="openType === 'update'"
                v-model="form.parentId"
                :options="orgOptions"
                :normalizer="normalizer"
                placeholder="选择上级组织"
                @select="getOrgId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="组织编号" prop="orgId">
              <div style="display: flex;">
              <div style="text-align: end;" v-if="orgIdConfig.before">{{ orgIdConfig.before }}</div>
              <div style="width: 50%;">
                <el-input
                  :disabled="openType === 'update'"
                  oninput="value=value.replace(/[^\d]/g, '')"
                  v-model="form.orgId"
                  placeholder="请输入组织编号"
                />
              </div>
              <div v-if="orgIdConfig.after">{{ orgIdConfig.after }}</div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="1" style="line-height: 35px; padding: 0 5px">
            <el-tooltip
              class="item"
              effect="dark"
              content="第1位=平台，第2-3位=战区，第4-5位=省，第6-7位=市，第8-9位=区县，第10位=供应商"
              placement="bottom"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组织类型" prop="orgType">
              <el-select
                v-model="form.orgType"
                placeholder="请选择组织类型"
                clearable
                size="small"
              >
                <el-option
                  v-for="dict in orgTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组织名称" prop="orgName">
              <el-input v-model="form.orgName" placeholder="请选择组织名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input
                v-model="form.leader"
                placeholder="请输入负责人"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入联系电话"
                maxlength="11"
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
          <el-col :span="12">
            <el-form-item label="组织状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="submitForm"
          :loading="this.$store.state.isLoading"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listOrg,
  getOrg,
  delOrg,
  addOrg,
  updateOrg,
  listOrgExcludeChild,
  getParentOrgId
} from "@/api/system/org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: "Org",
  components: { Treeselect },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      orgList: [],
      // 组织树选项
      orgOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // type模式
      openType: "",
      // 状态数据字典
      statusOptions: [],
      // 组织类型
      orgTypeOptions: [],
      // 查询参数
      queryParams: {
        orgName: null,
        status: null,
      },
      orgIdConfig: {},
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: "上级组织不能为空", trigger: "blur" },
        ],
        orgId: [
          { required: true, message: "组织ID不能为空", trigger: "blur" },
          { max: 10, message: "组织ID最多输入10个字符", trigger: "blur" },
        ],
        orgType: [
          { required: true, message: "组织类型不能为空", trigger: "blur" },
        ],
        orgName: [
          { required: true, message: "组织名称不能为空", trigger: "blur" },
        ],
        orderNum: [
          { required: true, message: "菜单顺序不能为空", trigger: "blur" },
        ],
        email: [
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      // 展开列数组
      expandedMap: new Map(),
      // 列表默认全部展开
      defaultExpandAll : true,
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_org_type").then((response) => {
      this.orgTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询组织列表 */
    getList() {
      this.loading = true;
      listOrg(this.queryParams).then((response) => {
        this.orgList = this.handleTree(response.data, "orgId");
        this.loading = false;
      });
    },
    /** 根据父级ID查询当前ID */
    getOrgId(value) {
      if (this.openType === 'update') return
      getParentOrgId(value.orgId).then(res => {
        this.orgIdConfig = res.data
        this.rules.orgId = [
          { required: true, message: "组织ID不能为空", trigger: "blur" },
          { max: res.data.childNodeLength, min: res.data.childNodeLength ,message: `组织ID输入${res.data.childNodeLength}个字符`, trigger: "blur" },
        ]
      })
    },
    /** 转换组织数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.orgId,
        label: node.orgName,
        children: node.children,
      };
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 字典状态字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.orgTypeOptions, row.orgType);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null,
        parentId: null,
        orgType: null,
        orgName: null,
        orderNum: null,
        leader: null,
        phone: null,
        email: null,
        status: "0",
      };
      this.orgIdConfig = {}
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.orgId = null;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row != undefined) {
        this.form.parentId = row.orgId;
      }
      this.open = true;
      this.openType = "add";
      this.title = "添加组织";
      listOrg().then((response) => {
        this.orgOptions = this.handleTree(response.data, "orgId");
      });
      if (row.orgId) {
        this.getOrgId(row)
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getOrg(row.orgId).then((response) => {
        this.openType = "update";
        this.form = {
          ...response.data,
          orgType: response.data.orgType.toString()
        };
        this.open = true;
        this.title = "修改组织";
      });
      listOrgExcludeChild(row.orgId).then((response) => {
        this.orgOptions = this.handleTree(response.data, "orgId");
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定${this.openType === "update" ? "修改" : "新增"}组织?`,
            "警告",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              const params = {
                ...this.form,
                orgId: (this.orgIdConfig.before || '')  + this.form.orgId + (this.orgIdConfig.after || '')
              }
              return this.openType === "update"
                ? updateOrg(params)
                : addOrg(params);
            })
            .then((res) => {
              this.msgSuccess(
                `${this.openType === "update" ? "修改" : "新增"}成功~`
              );
              this.rules.orgId = []
              this.open = false;
              this.getList();
            });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除名称为"' + row.orgName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delOrg(row.orgId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    // 表行层级展开样式
    tableRowClassName({row}) {
      const isExpendRow = this.defaultExpandAll 
                  ? (this.defaultExpandAll && row.children && this.expandedMap.set(row.orgId, true))
                  : !!this.expandedMap.get(row.orgId)

      return isExpendRow ? 'row-expanded' : ''
    },
    // 表展开或关闭行时触发该事件
    handleExpandChange(row, expanded) {
      this.defaultExpandAll = false
      this.expandedMap.set(row.orgId, expanded)
    }
  },
};
</script>