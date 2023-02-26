<template>
  <div class="pro-table">
    <div class="title">{{ title }}</div>
    <el-table v-loading="loading" :data="data">
      <el-table-column
        v-if="showOrder"
        label="序号"
        type="index"
        width="50"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ (pagination.pageNum - 1) * pagination.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, i) in columnsData"
        :key="i"
        :label="item.label"
        align="center"
        :prop="item.prop"
      >
        <template slot-scope="scope">
          <span v-if="item.render">{{ item.render(scope.row) }}</span>
          <span v-else-if="item.formatter">{{
            item.formatter(scope.row[item.prop])
          }}</span>
          <component :is="item.component" v-else-if="item.component" :row="scope.row" />
          <span v-else>{{ scope.row[item.prop] }}</span>
        </template>
      </el-table-column>
      <slot />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pagination.pageNum"
      :limit.sync="pagination.pageSize"
      @pagination="getData"
    />
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ProTable',
  props: {
    showOrder: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    },
    initWhenMounted: {
      type: Boolean,
      default: true
    },
    api: {
      type: String,
      required: true
    },
    method: {
      type: String,
      default: 'get'
    },
    pageSize: {
      type: Number,
      default: 10
    },
    params: {
      type: Object
    },
    columns: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      data: [],
      loading: false,
      total: 0,
      pagination: this.getInitPagination()
    }
  },
  computed: {
    columnsData() {
      return Object.entries(this.columns).map(([key, value]) => {
        return {
          label: value.label || value,
          prop: key,
          align: value.align || 'center',
          render: value.render,
          formatter: value.formatter,
          component: value.component
        }
      })
    }
  },
  watch: {
    total() {
      this.$emit('update:total', this.total)
    }
  },
  created() {
    if (this.initWhenMounted) {
      this.refresh()
    }
  },
  methods: {
    // 获取初始分页
    getInitPagination() {
      return {
        pageSize: this.pageSize,
        pageNum: 1
      }
    },
    // 刷新
    refresh() {
      this.total = 0
      this.pagination = this.getInitPagination()
      this.getData()
    },
    // 获取数据
    async getData() {
      console.log(this.params)
      this.loading = true
      try {
        // 目前只处理了GET请求
        const result = await request({
          url: this.api,
          method: this.method,
          params: this.method.toLowerCase() === 'get' ? { ...this.params, ...this.pagination } : this.pagination,
          data: this.method.toLowerCase() === 'post' ? { ...this.params, ...this.pagination } : undefined
        })
        this.data = result.rows
        this.total = result.total
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pro-table {
  border: 1px solid #ddd;
  padding-bottom: 30px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  line-height: 40px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
  text-align: left;
}
</style>
