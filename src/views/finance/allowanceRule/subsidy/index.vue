<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" :disabled="isCheck" label-width="100px">
      <el-form-item label="名称" prop="ruleName">
        <el-input v-model="form.ruleName" style="width: 30%" :disabled="nextStep" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="机构" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :disabled="nextStep"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="form.time"
          :disabled="nextStep"
          style="width: 30%"
          clearable
          size="small"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item v-if="!nextStep && form.orgId">
        <el-button type="primary" style="width: 30%;" @click="handleNextStep">保存，并下一步</el-button>
      </el-form-item>
      <el-form-item v-if="nextStep" label="提成设置">
        <el-tabs v-model="selectGroupId" type="card" :addable="!isCheck" style="width: 30%;" @edit="handleTabsEdit" @tab-click="getGoods">
          <el-tab-pane
            v-for="item in selectGroupList"
            :key="item.groupId"
            :label="item.groupName"
            :name="item.groupId"
            :closable="item.groupId !== '0' && !item.userAdd && !isCheck"
          />
        </el-tabs>
        <el-table
          v-loading="goodsLoading || this.$store.state.isLoading"
          :data="goodsOptions"
          :span-method="objectSpanMethod"
          style="width: 700px;"
          border
        >
          <el-table-column v-if="selectGroupId !== '0'" label="分组名称" align="center" prop="groupName">
            {{ selectGroupInfo.groupName }}
          </el-table-column>
          <el-table-column v-if="selectGroupId !== '0'" label="组长信息" align="center" prop="groupInfo">
            {{ selectGroupInfo.leaderName }} <br> {{ selectGroupInfo.leaderPhone }}
          </el-table-column>
          <el-table-column label="产品名称" align="center">
            <template slot-scope="scope">
              <img style="width: 40px; height: 30px; margin: 0 10px" :src="scope.row.thumbnail">
              <div>{{ scope.row.goodsName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="价格（元）" align="center" prop="price">
            <template slot-scope="scope">
              {{ scope.row.price && toDecimal2(scope.row.price / 100) }}
            </template>
          </el-table-column>
          <el-table-column label="管理津贴（元）" align="center">
            <template slot-scope="{row}">
              <el-input-number v-if="updateGoods[row.goodsId + 'leader']" v-model="row.leaderAllowance" style="width: 180px;" :min="0" :max="row.price / 100" @change="(e) => row.leaderAllowance = Math.round(e * 100) / 100" @blur="onSbumit(row)" />
              <div v-else>
                <span>{{ row.leaderAllowance }}</span>
                <i v-if="!isCheck" class="el-icon-edit" style="color: #409eff;font-size: 18px;margin: 0 5px;cursor: pointer;" @click="openPrice(row.goodsId + 'leader')" />
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div style="width: 700px;">
          <pagination
            v-show="goodsTotle > 0"
            :total="goodsTotle"
            :page.sync="goodsQuery.pageNum"
            :limit.sync="goodsQuery.pageSize"
            @pagination="getGoods"
          />
        </div>
      </el-form-item>
    </el-form>
    <el-dialog title="新增配送员分组提成" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="groupForm" :model="groupForm" :rules="groupRules" label-width="110px">
        <el-form-item label="配送员分组" prop="groupId">
          <el-select v-model="groupForm.groupId">
            <el-option
              v-for="item in distributionGroupList"
              :key="item.groupId"
              :label="item.groupName"
              :value="item.groupId"
              :disabled="hasDisGroup(item.groupId)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="submitGroupForm"
        >确 定</el-button>
        <el-button @click="resetGroupForm">取 消</el-button>
      </div>
    </el-dialog>
    <div class="edit-footer">
      <el-button @click="cancel">返 回</el-button>
    </div>
  </div>
</template>

<script>
import {
  addAllowanceRule,
  getAllowanceRule,
  goodsList,
  listDistributionGroup,
  getSelectGroupList,
  delSelectGroup
} from '@/api/finance/allowanceRule'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'
import Decimal from 'decimal.js'

export default {
  components: {
    Cascader
  },
  data() {
    return {
      loading: false,
      // 商品列表loding
      goodsLoading: false,
      // 是否查看
      isCheck: this.$route.query.type === 'check',
      // 组织机构
      orgOptions: [],
      // 表单参数
      form: {
        allowanceRuleId: this.$route.query.allowanceRuleId
      },
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: '组织不能为空', trigger: 'blur' }
        ],
        ruleName: [
          { required: true, message: '管理津贴规则名称不能为空', trigger: 'blur' },
          { max: 15, message: '名称不能超过15个字符', trigger: 'blur' }
        ],
        time: [{ required: true, message: '时间不能为空', trigger: 'blur' }]
      },
      // 修改商品组长提成
      updateGoods: {},
      nextStep: false,
      // 商品信息
      goodsOptions: [],
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      goodsQuery: {
        pageNum: 1,
        pageSize: 10
      },
      goodsTotle: 0,
      selectGroupList: [],
      selectGroupId: '0',
      open: false,
      distributionGroupList: [],
      groupRules: {
        groupId: [{ required: true, message: '配送员分组不能为空', trigger: 'blur' }]
      },
      groupForm: {}
    }
  },
  computed: {
    orgIdParam() {
      return Array.isArray(this.form.orgId) ? this.form.orgId.slice(-1)[0] : this.form.orgId
    },
    selectGroupInfo() {
      return this.distributionGroupList.find(item => item.groupId === this.selectGroupId) || {}
    }
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
      if (this.$route.query.type !== 'add') {
        this.handleInfo(this.$route.query.allowanceRuleId)
      }
    })
  },
  methods: {
    // 查询详情
    handleInfo(allowanceRuleId) {
      getAllowanceRule(allowanceRuleId).then((res) => {
        this.loading = false
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.form = {
          allowanceRuleId,
          ruleName: res.data.ruleName,
          orgId: orgId,
          time: [res.data.beginTime, res.data.endTime]
        }
        if (this.isCheck) {
          this.getGoods()
          this.getGroupList()
          this.getDistributionGroup()
        }
      })
    },
    /** 下一步 */
    handleNextStep() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const params = {
            allowanceRuleId: this.form.allowanceRuleId,
            orgId: this.orgIdParam,
            ruleName: this.form.ruleName,
            beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
            endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss')
          }
          if (!this.isCheck) {
            return addAllowanceRule(params).then(res => {
              if (res.code !== 200) return
              this.form.allowanceRuleId = res.data
              this.getGoods()
              this.getGroupList()
              this.getDistributionGroup()
            })
          }
        }
      })
    },
    /** 查询商品 */
    getGoods() {
      this.nextStep = true
      this.goodsLoading = true
      this.updateGoods = {}
      const params = {
        ...this.goodsQuery,
        orgId: this.form.orgId,
        allowanceRuleId: this.form.allowanceRuleId,
        groupId: this.selectGroupId
      }
      goodsList(params).then((res) => {
        this.goodsOptions = res.rows.map((item) => {
          return {
            ...item,
            thumbnail: this.prefix + item.thumbnail,
            leaderAllowance: item.leaderAllowance ? item.leaderAllowance / 100 : 0
          }
        })
        this.goodsTotle = res.total
        this.goodsLoading = false
      })
    },
    handleTabsEdit(targetName, action) {
      switch (action) {
        case 'add':
          this.groupForm = {}
          this.resetForm('groupForm')
          this.open = true
          break
        case 'remove':
          this.delDistributionGroup(targetName)
          break
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'groupName' || column.property === 'groupInfo') {
        if (rowIndex === 0) {
          return {
            rowspan: this.goodsQuery.pageSize,
            colspan: 1
          }
        } else {
          return { rowspan: 0, colspan: 0 }
        }
      }
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null
      }
      this.resetForm('form')
    },
    // 修改组长提成
    openPrice(goodsId) {
      this.updateGoods = {
        [goodsId]: true
      }
    },
    /** 修改商品提成 */
    onSbumit(data) {
      const params = {
        allowanceRuleId: this.form.allowanceRuleId,
        orgId: this.orgIdParam,
        ruleName: this.form.ruleName,
        beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
        endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
        allowanceRuleGoodsList: [
          {
            goodsId: data.goodsId,
            allowanceRuleId: this.form.allowanceRuleId,
            groupId: this.selectGroupId,
            leaderAllowance: new Decimal(data.leaderAllowance).mul(100).toNumber()
          }
        ]
      }
      addAllowanceRule(params).then(res => {
        this.updateGoods = {}
        this.form.allowanceRuleId = res.data
        this.selectGroupList = this.selectGroupList.map(item => {
          if (item.groupId === this.selectGroupId) {
            return { ...item, userAdd: false }
          }
          return item
        })
      })
    },
    getGroupList() {
      getSelectGroupList(this.form.allowanceRuleId).then(res => {
        this.selectGroupList = res.data
      })
    },
    getDistributionGroup() {
      listDistributionGroup({ orgId: this.orgIdParam }).then(res => {
        this.distributionGroupList = res.data
      })
    },
    delDistributionGroup(id) {
      const group = this.distributionGroupList.find(item => item.groupId === id)
      this.$confirm(`是否确认删除"${group.groupName}"分组提成设置?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return delSelectGroup({
          allowanceRuleId: this.form.allowanceRuleId,
          groupId: group.groupId
        })
      }).then(() => {
        if (this.selectGroupId === id) {
          this.selectGroupId = '0'
          this.getGoods()
        }
        this.getGroupList()
        this.msgSuccess('删除成功')
      })
    },
    hasDisGroup(groupId) {
      return !!this.selectGroupList.find(item => item.groupId === groupId)
    },
    resetGroupForm() {
      this.open = false
      this.groupForm = {}
      this.resetForm('groupForm')
    },
    submitGroupForm() {
      this.$refs['groupForm'].validate((valid) => {
        if (valid) {
          const group = this.distributionGroupList.find(item => item.groupId === this.groupForm.groupId)
          this.selectGroupList.push({
            ...group,
            userAdd: true
          })
          this.selectGroupId = this.groupForm.groupId
          this.getGoods()
          this.open = false
        }
      })
    },
    cancel() {
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.edit-footer {
  padding-bottom: 40px;
  text-align: center;
}

/deep/ .el-input-number {
  width: 100px !important;
  .el-input__inner {
    padding: 0px;
    border-style: none;
    border-bottom: 1px solid;
    border-radius: 0px;
  }
}
/deep/ .el-input-number__decrease {
  display: none;
}
/deep/ .el-input-number__increase {
  display: none;
}
</style>
