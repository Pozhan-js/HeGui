<template>
  <div>
    <pro-table ref="proTableRef" :api-config="{ url: '/scoreGoods/list' }" :params="{
      orderByColumn: 'goods_number', isAsc: 'asc'
    }" :columns="columns" row-key="scoreGoodsId">
      <el-row slot="title" class="mb10">
        <el-col :span="20">
          <el-button type="primary" size="mini" @click="handleAdd" v-hasPermi="['marketing:scoreGoods:add']">新增活动</el-button>
          <el-button type="primary" size="mini" @click="handlePromote" v-hasPermi="['system:commonSetting:scoreGoods']">推广积分商城</el-button>
        </el-col>
        <el-col v-if="scoreGoodsFlag !== undefined" :span="4" v-hasPermi="['system:commonSetting:scoreGoods']">
          开关
          <el-switch v-model="scoreGoodsFlag" class="ml10" :active-value="1" :inactive-value="0"
            @change="handleSwitch" />
        </el-col>
      </el-row>

      <template #goodsId_column_content="{row}">
        <jump v-if="row.scoreGoodsType === 'coupon'" path="/marketing/coupons/marketing" :query="{couponId: row.goodsId}">
          <cover :name="row.goodsName" :type="row.scoreGoodsType" :cover="row.thumbnail" />
        </jump> 
        <jump v-else :path="'/goodsmanage/goods'" :query="{goodsName: row.goodsName}">
          <cover :name="row.goodsName" :type="row.scoreGoodsType" :cover="row.thumbnail" />
        </jump>
      </template>
      <template #expiryBeginTime_column_content="{row}">
        <div>
            <div>{{row.expiryBeginTime}}</div>
            <div>至</div>
            <div>{{row.expiryEndTime}}</div>
          </div>
      </template>

      <template #goodsNumber_column_content="scope">
        <el-popover title="修改展示序号" placement="right" v-if="hasPermi(['marketing:scoreGoods:edit'])">
          <el-input-number v-model="sortNum" :step="1" step-strictly @blur="handleSort(scope.row)" />
          <el-button slot="reference" type="text" @click="sortNum = scope.row.goodsNumber">{{ scope.row.goodsNumber }}
            <i class="el-icon-edit" />
          </el-button>
        </el-popover>
        <span v-else>{{ scope.row.goodsNumber }}</span>
      </template>

      <template #action_column_content="scope">
        <!-- 如果不为失效状态，或停用状态 -->
        <el-button v-if="scope.row.status < 2" v-hasPermi="['marketing:scoreGoods:enabled']" type="text" size="mini" @click="handleStatus(scope.row, 2)">停用
        </el-button>
        <el-button v-if="scope.row.status === 2" v-hasPermi="['marketing:scoreGoods:enabled']" type="text" size="mini" @click="handleStatus(scope.row, 1)">启用
        </el-button>
        <el-button v-if="scope.row.status !== 3" v-hasPermi="['marketing:scoreGoods:update']" type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
        <el-button v-if="scope.row.status !== 3" v-hasPermi="['marketing:scoreGoods:expired']" type="text" size="mini" @click="handleStatus(scope.row, 3)">失效
        </el-button>
        <el-button v-if="scope.row.status === 3" v-hasPermi="['marketing:scoreGoods:remove']" type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </pro-table>
    <promote ref="promoteRef" />
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import Promote from '@/views/components/promote'
import Cover from './cover'
import {
  promoteQR,
  delScoreGoods,
  enabledScoreGoods,
  disabledScoreGoods,
  expiredScoreGoods,
  updateScoreGoods,
  getScoreMall,
  setScoreMall
} from '@/api/marketing/scoreMall'
import Jump from '@/components/Jump.vue'
import { checkPermi } from '@/utils/permission'

const renderText = ({text}) => text != null && text != '' ? text : '-'

export default {
  components: { ProTable, Promote, Cover, Jump },
  data: (vm) => ({
    // 图片前缀
    prefix: sessionStorage.getItem('prefix'),
    sortNum: undefined,
    scoreGoodsFlag: undefined
  }),
  computed: {
    columns() {
      return [
        { label: '礼品名称', prop: 'goodsName', hideInTable: true },
        { label: '展示序号', prop: 'goodsNumber', width: 100, hideInSearch: true },
        { label: '礼品', prop: 'goodsId', hideInSearch: true },
        { label: '有效期', prop: 'expiryBeginTime', hideInSearch: true, width: 170 },
        { label: '成本价(元)', prop: 'cost', hideInSearch: true, valueType: 'money' },
        { label: '兑换价', prop: 'scoreNum', hideInSearch: true, renderText: ({ record }) => `${record.scoreNum ?? 0}积分 + ${record.amountNum ? this.toDecimal2(record.amountNum / 100) : 0}元` },
        { label: '已兑换/剩余', prop: 'stockUsedNum', hideInSearch: true, renderText: ({ record }) => `${record.stockUsedNum} / ${record.limitsGoodsTotal - record.stockUsedNum}` },
        { label: '总兑换量', prop: 'limitsGoodsTotal', hideInSearch: true, renderText },
        { label: '每人总限量', prop: 'limitsUserTotal', hideInSearch: true, renderText },
        { label: '每人每日限量', prop: 'limitsUserDayTotal', hideInSearch: true, renderText },
        { label: '状态', prop: 'status', valueType: 'dictSelect', fieldProps: { dict: 'finance_rule_status' } },
        { label: '操作', prop: 'action', hideInSearch: true }
      ]
    }
  },
  created() {
    getScoreMall()
      .then(res => {
        this.scoreGoodsFlag = Number(res.data.scoreGoodsFlag)
      })
  },
  methods: {
    hasPermi: checkPermi,
    handleAdd() {
      const path = '/marketing/score/mall/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')

      this.$router.push(path)
    },
    handleUpdate(row) {
      const path = '/marketing/score/mall/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')

      this.$router.push({
        path,
        query: {
          scoreGoodsId: row.scoreGoodsId
        }
      })
    },
    handleStatus(row, status) {
      this.$confirm(`是否确认${{ 0: '启用', 1: '启用', 2: '禁用', 3: '失效' }[status]}"${row.goodsName}"积分商品?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        switch (status) {
          case 0:
          case 1:
            return enabledScoreGoods(row.scoreGoodsId)
          case 2:
            return disabledScoreGoods(row.scoreGoodsId)
          case 3:
            return expiredScoreGoods(row.scoreGoodsId)
        }
      }).then(res => {
        this.$refs.proTableRef.reload()
        this.msgSuccess(`${{ 1: '启用', 2: '禁用', 3: '失效' }[status]}积分商品成功~`)
      })
    },
    handleDelete(row) {
      this.$confirm(`是否确认删除"${row.goodsName}"积分商品?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delScoreGoods(row.scoreGoodsId)
        })
        .then(() => {
          this.$refs.proTableRef.reload()
          this.msgSuccess('删除成功')
        })
    },
    handleSort(row) {
      if (this.sortNum === row.goodsNumber) {
        return
      }
      updateScoreGoods({
        scoreGoodsId: row.scoreGoodsId,
        goodsNumber: this.sortNum
      })
        .then(res => {
          this.$refs.proTableRef.reload()
          this.msgSuccess('修改展示序号成功')
        })
    },
    handlePromote() {
      promoteQR().then(res => {
        this.$refs.promoteRef.setData({
          link: res.data,
          open: true,
          type: 'base64'
        })
        this.$refs.promoteRef.generate()
      })
    },
    handleSwitch(val) {
      this.$confirm(`是否确认${val ? '开启' : '关闭'}积分商城?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return setScoreMall({ scoreGoodsFlag: val })
        })
        .then(() => {
          this.msgSuccess(`${val ? '开启' : '关闭'}积分商城成功`)
        })
        .catch(() => {
          this.scoreGoodsFlag = Number(!val)
        })
    }
  }
}
</script>
