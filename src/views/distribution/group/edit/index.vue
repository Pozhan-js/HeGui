<template>
  <div style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 300px"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="组名" prop="groupName">
        <el-input v-model="form.groupName" style="width: 300px" placeholder="请输入组名" />
      </el-form-item>
      <el-form-item label="组内成员">
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          label-width="100px"
        >
          <el-form-item label="配送员编号" prop="distributionId">
            <el-input
              v-model="queryParams.distributionId"
              placeholder="请输入配送员编号"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="配送员手机号" prop="telephone">
            <el-input
              v-model="queryParams.telephone"
              placeholder="请输入配送员手机号"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="配送员姓名" prop="makiName">
            <el-input
              v-model="queryParams.makiName"
              placeholder="请输入配送员姓名"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              size="mini"
              @click="resetQuery"
            >重置</el-button>
          </el-form-item>
          <el-table
            v-loading="loading"
            style="margin-top: 20px"
            :data="courierList"
          >
            <el-table-column
              label="编码"
              align="center"
              prop="distributionId"
            />
            <el-table-column label="等级" align="center" prop="levelName" />
            <el-table-column label="姓名" align="center" prop="makiName" />
            <el-table-column label="手机号" align="center" prop="telephone" />
            <el-table-column
              label="成员"
              align="center"
              prop="isLeader"
              :formatter="leaderFormat"
            />
            <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-radio-group
                  v-model="form[scope.row.distributionId]"
                  @change="isGroupLeader"
                >
                  <el-radio
                    :label="1"
                    :disabled="groupLeader"
                  >选为组长</el-radio>
                  <el-radio :label="0">设为组员</el-radio>
                </el-radio-group>
                <div>
                  <el-button
                    v-if="form[scope.row.distributionId] || form[scope.row.distributionId] === 0"
                    type="text"
                    @click="() => {
                      delete form[scope.row.distributionId]
                      form = {
                        ...form
                      }
                      isGroupLeader()
                    }"
                  >
                    取 消
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />
        </el-form>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import {
  addGroup,
  getGroup,
  updateGroup,
  listCourier
} from '@/api/distribution/group'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  components: {
    Cascader
  },
  data() {
    return {
      loading: false,
      // 配送员数据
      courierList: [],
      // 是否存在组长
      groupLeader: false,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        state: 2,
        orgId: null,
        distributionId: null,
        telephone: null,
        makiName: null
      },
      // 组织数据
      orgOptions: [],
      // 是否是组长字典数据
      yesIsNo: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orgId: [{ required: true, message: '组织不能为空', trigger: 'blur' }],
        groupName: [
          { required: true, message: '组名不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getDicts('distribution_is_leader').then((response) => {
      this.yesIsNo = response.data
    })
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
        if (this.$route.query.type === 'update') {
          this.handleUpdate(this.$route.query.groupId)
        }
      }
    })
  },
  methods: {
    /**
     * 判断是否存在组长
     */
    isGroupLeader() {
      const excludeKey = ['groupId', 'orgId', 'groupName']
      const valueArr = Object.keys(this.form)
        .filter((item) => !excludeKey.includes(item))
        .map((item) => {
          return this.form[item]
        })
      if (valueArr.includes(1)) {
        this.groupLeader = true
      } else {
        this.groupLeader = false
      }
    },
    // 状态字典翻译
    leaderFormat(row, column) {
      if (row.isLeader === null) return '未分组'
      return this.selectDictLabel(this.yesIsNo, row.isLeader)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询配送员列表 */
    getList() {
      if (!this.form.orgId) return this.msgError('请选择组织~')
      this.queryParams.orgId =
        this.form.orgId.length > 0
          ? this.form.orgId.slice(-1)[0]
          : this.form.orgId
      this.loading = true
      listCourier(this.queryParams).then((response) => {
        this.courierList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 表单重置
    reset() {
      this.form = {
        groupId: null,
        orgId: null,
        groupName: null
      }
      this.resetForm('form')
    },
    /** 修改按钮操作 */
    handleUpdate(groupId) {
      this.reset()
      getGroup(groupId).then((response) => {
        const orgArr = flatten(this.orgOptions, 'children')
        this.form = {
          groupId: response.data.groupId,
          orgId: searchSuperior(response.data.orgId, 'id', orgArr, 'parentId'),
          groupName: response.data.groupName
        }
        response.data.params.ids.map((item) => {
          if (item.isLeader === 1) {
            this.groupLeader = true
          }
          this.form[item.distributionId] = item.isLeader
        })
        this.getList()
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!this.groupLeader) return this.msgError('请选择一个组长~')
          const excludeKey = ['groupId', 'orgId', 'groupName']
          let leaderId = null
          const distributionIds = []
          Object.keys(this.form)
            .filter((item) => !excludeKey.includes(item))
            .map((item) => {
              if (this.form[item] === 1) {
                leaderId = item
              } else {
                distributionIds.push(item)
              }
            })
          const params = {
            leaderId,
            distributionIds: distributionIds.length > 0 ? distributionIds.toString() : null,
            orgId: typeof this.form.orgId === 'object' ? this.form.orgId.slice(-1)[0] : this.form.orgId,
            groupId: this.form.groupId,
            groupName: this.form.groupName
          }
          this.$confirm(
            `是否确认${this.form.groupId ? '修改' : '新增'}配送员分组?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return this.form.groupId ? updateGroup(params) : addGroup(params)
            })
            .then(() => {
              this.msgSuccess(`${this.form.groupId ? '修改' : '新增'}成功`)
              this.reset()
              this.cancel()
            })
        }
      })
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped lang="scss">
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}
</style>
