<template>
  <el-dialog title="选择商品（必须是该组织开启的及时送商品）" :visible.sync="dialogVisible" >
    <el-form
      ref="goodsForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="商品名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入商品名称"
          clearable
          size="small"
          @change="handleQuery"
        />
      </el-form-item>
    </el-form>
    <el-table
      ref="gooodsTable"
      v-loading="loading"
      :row-key="(row) => row.goodsId"
      :data="goodsList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" reserve-selection width="76" align="center" />
      <el-table-column
        label="商品名称"
        align="center"
        prop="goodsName"
      />
      <el-table-column
        label="商品分组"
        align="center"
        prop="groupNameList"
      >
        <template slot-scope="{row}">
          <div v-for="(name, index) in row.groupNameList" :key="index">{{name}}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="库存"
        align="center"
        prop="totalStock"
      />
      <el-table-column
        label="价格(元)"
        align="center"
        prop="price"
        :formatter="(row) => toDecimal2(row.price / 100)"
      />
      <el-table-column
        label="已参加的优惠"
        align="center"
      >
        <template>
          <router-link to='/marketing/coupons/marketing'>
            <el-button type='text'>优惠券</el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <el-col :span="4" style="padding: 20px 0" >已选商品<span class="text-red">({{this.selectedItems.length}})</span> </el-col>
      <el-col :span="20">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  goodsStockList
} from "@/api/marketing/shareInfo";
import { Cascader } from 'ant-design-vue'

export default {
  components: {
    Cascader,
  },
  props: {
    orgId: Array | Object | String | Number,
    movedGoodsId: String | Number,
    selected: Array | null
  },
  data() {
    return {
      // 选择优惠券弹框
      dialogVisible: false,
      // 被选择的优惠券
      selectedItems: [],
      // 加载中
      loading: false,
      // 优惠券总数
      total: 0,
      //优惠券
      goodsList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
    }
  },
  watch: {
    movedGoodsId: {
      handler(val, oldVal) {
        this.handleToggleRowSelection(val)
      },
      deep: true
    },
    dialogVisible(val, oldVal) {
      if(val) {
        this.handleQuery()
      }
    },
    selected(val , oldVal) {
      if(this.$refs.gooodsTable) {
        val.length ? this.handleToggleRowSelections() : this.$refs.gooodsTable.clearSelection()
      }
    }
  },
  methods: {
    // 查询优惠券
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 商品列表
    getList() {
      this.loading = true
      goodsStockList({...this.queryParams, orgId: this.orgId}).then((response) => {
        this.goodsList = response.rows
        this.movedGoodsId && this.handleToggleRowSelection(this.movedGoodsId)
        this.handleToggleRowSelections()
        this.total = response.total
        this.loading = false
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },
    // 移出所选商品，表表格商品同步UI
    handleToggleRowSelection(goodsId) {
      for(let i = 0; i< this.goodsList.length; i++) {
        if(this.goodsList[i].goodsId != goodsId) continue
        this.$nextTick(()=>{
          this.$refs.gooodsTable.toggleRowSelection(this.goodsList[i], false)
        })
      }
    },
    // 回显所选商品，表表格商品同步UI
    handleToggleRowSelections() {
      this.$nextTick(()=>{
        for(let i = 0; i< this.goodsList.length; i++) {
          this.$refs.gooodsTable.toggleRowSelection(this.goodsList[i], this.selected.includes(this.goodsList[i].goodsId))
        }
      })
    },
    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
    },
    // 确认选中商品
    handleConfirm() {
      if(this.selectedItems.length > 10) {
        this.$message({
          message: '最多只能选择10件商品， 请重新选择！',
          type: 'error'
        });
      } else {
        this.handleClose()
        this.$emit('selected-goods', this.selectedItems)
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>