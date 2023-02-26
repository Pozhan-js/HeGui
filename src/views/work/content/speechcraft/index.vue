<template>
  <div class="app-container">
    <a-card
      style="width: 100%"
      :tab-list="dictionTypes"
      :active-tab-key="form.dictionType"
      @tabChange="(key) => onTabChange(key, 'dictionType')"
    >
      <div class="flex justify-content-between align-center mb20">
        <el-button
          type="primary"
          v-hasPermi="['workwechat:dictionManage:add']"
          size="mini"
          @click="handleAdd"
          >新建话术</el-button
        >
        <!-- <el-switch class="mr10" size="mini" v-model="form.value2" active-text="侧边栏"/> -->
        <el-form inline>
          <el-form-item label="发送次数排序" class="mb0">
            <el-select v-model="sendNum" size="small" clearable>
              <el-option
                v-for="i in orderOptions"
                :key="i.valueKey"
                :value="i.valueKey"
                :label="i.labelKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="可用部门" label-width="120px" class="mb0">
            <tree-select
              v-model="form.deptId"
              style="width: 240px"
              filterTreeNode
              allowClear
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="departmentData"
              placeholder="请选择可用部门"
              tree-default-expand-all
              :replace-fields="{
                children: 'children',
                title: 'name',
                value: 'deptId',
              }"
            >
            </tree-select>
          </el-form-item>
        </el-form>
      </div>
      <el-row type="flex" class="mb10 flex align-center">
        <el-col class="text-center" style="flex: 0 0 120px">
          <el-button
            type="text"
            icon="el-icon-plus"
            v-hasPermi="['workwechat:dictionManage:moveUp']"
            @click="handleAddGroup"
            >添加分组</el-button
          >
        </el-col>
        <el-col>
          <div style="padding-left: 22px">
            <span v-if="form.dictionGroupId">【{{ dictionGroupName }}】</span>
            <!-- <el-popover
                  placement="top-bottom"
                  width="200"
                  trigger="hover"
                  :content="`范围内的员工可在【企业微信-${form.value2}】使用话术`">
                  <span >可见范围</span>
                  <i slot="reference" class="el-icon-question" />
                </el-popover> -->
            <span><span>可见范围， </span>{{ visibleDepts }}员工可见</span>
          </div>
        </el-col>
      </el-row>
      <a-tabs v-model="form.dictionGroupId" tab-position="left">
        <a-tab-pane
          v-for="item in dictionGroup"
          :key="item.dictionGroupId"
          :tab="item.dictionGroupName"
          style="padding-bottom: 20px"
        >
          <el-table
            ref="multipleTable"
            v-loading="loading"
            :data="dictionManageList"
          >
            <el-table-column label="话术内容" prop="dictionContent">
              <template slot-scope="{ row }">
                <img
                  v-if="row.messageType == '图片'"
                  :src="`${prefix}/${row.dictionContent}`"
                  width="80"
                  height="80"
                  @click="handlePreviewImage(row.dictionContent)"
                />
                <div
                  v-else-if="row.messageType == '文字'"
                  class="text-overflow line-clamp4"
                >
                  {{ row.dictionContent }}
                </div>
                 <div  v-else-if="row.messageType == '图文'">
                  <a :href="row.dictionContent" class="size" target="_blank">{{ row.dictionContent }}</a>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="话术标题"
              align="center"
              prop="dictionTitle"
            />
            <el-table-column label="发送次数" align="center" prop="sendNum">
              <template slot-scope="{ row }">
                {{ row.sendNum || 0 }}
              </template>
            </el-table-column>
            <el-table-column
              label="所属分组"
              align="center"
              prop="dictionGroupName"
            />
            <el-table-column label="创建人" align="center" prop="createBy" />
            <el-table-column label="创建时间" align="center" prop="createTime">
              <template slot-scope="{ row }">
                <break-time :date-time="row.createTime" />
              </template>
            </el-table-column>
            <el-table-column label="类型" align="center" prop="messageType" />
            <el-table-column align="center" width="100" label="操作">
              <template slot-scope="{ row, $index }">
                <el-button
                  :disabled="$index == 0 && form.pageNum == 1"
                  type="text"
                  v-hasPermi="['workwechat:dictionManage:moveUp']"
                  @click="handleMoveUp(row, $index)"
                  >上移</el-button
                >
                <el-button
                  :disabled="total < 2"
                  type="text"
                  v-hasPermi="['workwechat:dictionManage:moveDown']"
                  @click="handleMoveDown(row, $index)"
                  >下移</el-button
                >
                <el-button
                  type="text"
                  @click="handleUpdate(row)"
                  v-hasPermi="['workwechat:dictionManage:edit']"
                  >编辑</el-button
                >
                <el-button
                  type="text"
                  @click="handleDelete(row)"
                  v-hasPermi="['workwechat:dictionManage:remove']"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <pagination

            v-show="total > 0"
            :total="total"
            :page.sync="form.pageNum"
            :limit.sync="form.pageSize"
            @pagination="getList"
          />
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <EditSpeechCraft
      :type="SpeechCraftDialog.type"
      :diction-type="form.dictionType"
      :diction-group="dictionGroup"
      :diction-manage-id="dictionManageId"
      :visible.sync="SpeechCraftDialog.visible"
      @complete="getList"
      @close="SpeechCraftDialog = {}"
    />
    <EditGroup
      :visible.sync="groupDialog.visible"
      :departmentData="departmentData"
      @complete="getDictionGroup"
      @close="groupDialog = {}"
    />
    <el-dialog
      :visible.sync="previewVisible"
      title="预览"
      width="800"
      append-to-body
    >
    <div class="text-center">
      <el-image :src="previewImage" />
    </div>
    </el-dialog>
</div>
</template>

<script>
import {
  delDictionManage,
  listDictionGroup,
  moveUpDictionManage,
  moveDownDictionManage,
  listDictionManage,
} from "@/api/work/content";
import { getDepartments } from "@/api/work/work";
import { TreeSelect, Card as ACard, Tabs as ATabs } from "ant-design-vue";

import EditGroup from "./EditGroup.vue";
import EditSpeechCraft from "./EditSpeechCraft.vue";
export default {
  name: "Speechcraft",
  components: {
    EditGroup,
    EditSpeechCraft,
    TreeSelect,
    ACard,
    ATabs,
    ATabPane: ATabs.TabPane,
  },
  data() {
    return {
      prefix: sessionStorage.getItem("prefix"),
      // 预览弹框
      previewVisible: false,
      // 图片预览地址
      previewImage: '',
      loading: false,
      total: 0,
      form: {
        dictionType: "企业话术",
        dictionGroupId: "",
        deptId: null,
        pageNum: 1,
        pageSize: 10,
        orderByColumn: "sort",
        isAsc: "asc",
      },
      sendNum: null,
      dictionManageId: null,
      // 话术类型
      dictionTypes: [{ tab: "企业话术", key: "企业话术" }],
      // 发送次数
      orderOptions: [
        { valueKey: "0", labelKey: "升序" },
        { valueKey: "1", labelKey: "降序" },
      ],
      dictionManageList: [],
      // 可用部门
      departmentData: [],
      // 分组
      dictionGroup: [],
      // 分组
      groupDialog: {},
      // 话术
      SpeechCraftDialog: {},
    };
  },
  created() {
    this.getList();
    this.getDepartments();
    this.getDictionGroup();
  },
  watch: {
    form: {
      handler(val, oldVal) {
        this.getList();
      },
      deep: true,
    },
    "form.deptId"(val, oldVal) {
      if (val != oldVal) {
        this.form.dictionGroupId = ''
        this.getDictionGroup()
      }
    },
    sendNum(val, oldVal) {
      this.form.orderByColumn = val ? "send_num" : "sort";
      this.form.isAsc = val == "1" ? "desc" : "asc";
    },
  },
  computed: {
    // 可见部门
    visibleDepts() {
      const getDepatsNames = () => {
        const group = this.dictionGroup?.find(
          (item) => item.dictionGroupId == this.form.dictionGroupId
        );
        return group?.deptList?.map((item) => item.name).join("、");
      };
      return this.form.dictionGroupId ? getDepatsNames() : "全部";
    },
    // 分组名
    dictionGroupName() {
      return this.form.dictionGroupId
        ? this.dictionGroup?.find(
            (item) => item.dictionGroupId == this.form.dictionGroupId
          )?.dictionGroupName
        : "";
    },
  },
  methods: {
    // 类型筛选
    onTabChange(key, type) {
      this.form[type] = key;
      this.getList();
    },
    /** 查询话术管理列表 */
    getList() {
      this.loading = true;
      listDictionManage(this.form).then((response) => {
        this.dictionManageList = response.rows ?? []
        this.total = response.total;
        this.loading = false;
      })
    },
    // 分组
    handleGroup(item) {
      this.form.dictionGroupId = item.dictionGroupId;
    },
    // 查询部门列表
    getDepartments() {
      getDepartments().then((res) => {
        this.departmentData = [res.data];
      })
    },
    // 查询话术分组列表
    getDictionGroup() {
      listDictionGroup({ deptId: this.form.deptId }).then((res) => {
        const arr = res.rows ?? []
        this.dictionGroup = [
          { dictionGroupId: "", dictionGroupName: "全部" },
          ...arr,
        ]
      })
    },
    // 上移
    handleMoveUp(row, index) {
      moveUpDictionManage(row.dictionManageId).then((res) => {
        this.getList();
      })
    },
    // 下移
    handleMoveDown({ dictionManageId }, index) {
      moveDownDictionManage(dictionManageId).then((res) => {
        if (res.data) {
          this.getList();
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.dictionManageId = row.dictionManageId;
      this.SpeechCraftDialog = {
        type: "update",
        visible: true,
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const dictionManageIds = row.dictionManageId || this.ids;
      this.$confirm(`是否确认话术管理?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return delDictionManage(dictionManageIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    // 新增组
    handleAddGroup() {
      this.groupDialog = {
        visible: true,
      }
    },
    // 新增话术
    handleAdd() {
      this.dictionManageId = null;
      this.SpeechCraftDialog = {
        type: "create",
        visible: true,
      }
    },
    handlePreviewImage(src) {
      this.previewImage = this.prefix + '/' + src
      this.previewVisible = true
    }
  },
};
</script>

<style lang="scss">
.flex {
  display: flex;
  &.align-center {
    align-items: center;
  }
  &.align-stretch {
    align-items: stretch;
  }
  &.justify-content-between {
    justify-content: space-between;
  }
}
</style>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";
/deep/ .ant-tabs-nav .ant-tabs-tab-active {
  color: $primary;
}
/deep/ .ant-tabs-ink-bar {
  background: $primary;
}
/deep/ .ant-tabs-nav .ant-tabs-tab:active {
  color: $primary;
}
/deep/ .ant-tabs-nav .ant-tabs-tab:hover {
  color: $primaryHover;
}
/deep/ .ant-tabs .ant-tabs-left-bar {
  width: 120px;
}
.mb0{
  margin-bottom: 0;
}
/deep/ .el-radio-button__inner {
  border: none !important;
}

/deep/ .pagination-container{
  box-sizing: content-box
}
.text-overflow {
  line-height: 18px;
  color: rgba(0,0,0,.65);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.line-clamp4{
  max-height: 72px;
  -webkit-line-clamp: 4;
}
</style>