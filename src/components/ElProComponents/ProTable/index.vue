<template>
  <div class="el-pro-table-container" :class="containerClassName">
    <slot name="title" />
    <el-form v-if="searchConfig" @submit.native.prevent ref="formRef" :model="queryParams" class="search-form-container" :class="searchConfig.className" v-bind="formProps">

      <el-row v-for="(row, rowIndex) in searchLayoutColumns" :key="rowIndex">
        <el-col v-for="item in row" :key="item.prop" :span="item.span || searchConfig.span">
          <template v-if="$scopedSlots[item.prop + '_search_item']">
            <div v-show="isDisplayFormItem(rowIndex)"><slot :name="item.prop + '_search_item'" :column="item" :queryParams="queryParams" /></div>
          </template>
          <template v-else-if="item.renderFormItem">
            <RenderJSX v-show="isDisplayFormItem(rowIndex)" :render-fn="item.renderFormItem" :fn-params="{ type: item.valueType, formItemProps: item.formItemProps, fieldProps: item.fieldProps }" />
          </template>
          <search-item
            v-else
            v-show="isDisplayFormItem(rowIndex)"
            v-model="queryParams[item.prop]"
            :form-item-props="item.formItemProps"
            :field-props="item.fieldProps"
            :value-type="item.valueType"
            :prop-name="item.prop"
            :label="item.label"
            :options="item.valueType === 'treeSelect' ? treeOptions : item.options"
            :combine-options="item.combineOptions"
            @keyup.enter.native="handleSearch"
            @get-dict-done="receiveDicts($event, item.prop)"
          />
        </el-col>
      </el-row>

      <el-row class="search-btns-container mt10 mb8" :gutter="16" :style="{'margin-left': parseFloat(formProps.labelWidth) - 8 + 'px'}">
        <el-col :span="1.5">
          <el-button class="blue-btn" size="mini" @click="handleSearch">{{ searchConfig.searchText }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetSearch">{{ searchConfig.resetText }}</el-button>
        </el-col>
        <slot name="search-btns" :get-params="getFormatQueryParams" />
        <el-col v-if="showFormCollapse" :span="1.5">
          <el-button class="collapse" type="text" size="mini" @click="handleClickCollapse">
            {{ formCollapse ? '展开' : '收起' }}
            <i class="ml5" :class="formCollapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" />
          </el-button>
        </el-col>
      </el-row>

    </el-form>

    <slot name="table-title" :get-params="getFormatQueryParams">
      <el-tabs
        v-if="searchTabsConfig"
        v-model="tabValue"
        class="tabContainer"
        type="card"
        @tab-click="handleSearch"
      >
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane
          v-for="dict in searchTabsList"
          :key="dict.dictValue"
          :label="dict.dictLabel"
          :name="dict.dictValue"
        />
      </el-tabs>
    </slot>

    <template v-if="$scopedSlots['table-main']">
      <slot name="table-main" v-bind="{ data: listData, loading: listLoading }" />
    </template>
    <template v-else-if="tableRender">
      <RenderJSX :render-fn="tableRender" :fn-params="{ data: listData, loading: listLoading }" />
    </template>
    <el-table
      v-else
      ref="tableRef"
      v-loading="listLoading"
      :data="listData"
      :row-key="rowKey"
      :height="autoSetMaxHeight ? void 0 : height"
      :max-height="autoSetMaxHeight ? tableMaxHeight : maxHeight"
      v-bind="tableProps"
      :class="tableClassName"
      :style="tableStyle"
      v-on="$listeners"
      @selection-change="handleSelectionChange"
    >
      <slot name="table-before-column" />
      <slot v-for="item in listColumns" :name="item.prop + '_column'" v-bind="item">
        <el-table-column
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align"
          v-bind="item.tableColumnProps"
        >
          <slot slot="header" slot-scope="scope" :name="item.prop + '_column_header'" v-bind="scope">
            {{ scope.column.label }}
          </slot>
          <!-- Scoped Slot 会导致 Table-column.formatter 函数失效，请使用 render / renderText 代替 -->
          <slot :slot="item | formatSlotName" slot-scope="scope" :name="item.prop + '_column_content'" v-bind="scope" :text="renderCellStr(scope, item)">
            <template v-if="item.render">
              <RenderJSX :render-fn="item.render" :fn-params="getRenderParams(scope, item)" />
            </template>
            <template v-else-if="item.renderText">
              {{ item.renderText(getRenderParams(scope, item)) }}
            </template>
            <template v-else>
              {{ renderCellStr(scope, item) }}
            </template>
          </slot>
        </el-table-column>
      </slot>
      <slot name="table-after-column" />
    </el-table>

    <slot name="table-footer">
      <el-row ref="footerRef" class="table-footer">
        <el-col v-if="isInternalRenderingTable && hasSelectionType" :span="2" style="margin-top: 25px; padding-left: 10px;">
          <el-checkbox
            v-model="checkedAll"
            @change="toggleSelection"
          >当页全选</el-checkbox>
        </el-col>
        <el-col :span="10" style="margin-top: 23px;">
          <slot name="table-footer-btns" :checked-list="checkedList" />
        </el-col>
        <el-col :span="hasSelectionType ? 12 : 14">
          <pagination
            v-show="listTotal > 0"
            :total="listTotal"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            v-bind="paginationProps"
            @pagination="handlePagination"
          />
        </el-col>
      </el-row>
    </slot>

  </div>
</template>

<script>
import RenderJSX from './RenderJSX'
import SearchItem from './SearchItem'
import PropClasses from './PropClasses.js'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import { getOrgTree } from '@/api/utils'
import { getDicts } from '@/api/system/dict/data'
import moment from 'moment'
import Decimal from 'decimal.js'
import { appMainPadding } from '@/assets/styles/variables.scss'

export { PropClasses }

function debounceFn(fn, time) {
  let timer = null
  return function() {
    clearTimeout(timer)
    timer = setTimeout(fn, time)
  }
}

export default {
  name: 'ElProTable',
  components: {
    Pagination,
    SearchItem,
    RenderJSX
  },
  filters: {
    formatSlotName(item) {
      const typeArr = ['selection', 'index', 'expand']
      if (typeArr.includes(item.tableColumnProps?.type)) {
        return 'NOSLOT'
      }

      return 'default'
    }
  },
  inheritAttrs: false,
  props: {
    apiConfig: {
      type: Object,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    manualRequest: {
      type: Boolean,
      default: false
    },
    params: Object,
    formProps: {
      type: PropClasses.FormClass,
      default: () => new PropClasses.FormClass()
    },
    searchConfig: {
      type: [Boolean, PropClasses.SearchConfigClass],
      default: () => new PropClasses.SearchConfigClass()
    },
    tableProps: Object,
    paginationProps: Object,
    tableClassName: String,
    tableStyle: String,
    height: [String, Number],
    maxHeight: [String, Number],
    autoSetMaxHeight: {
      type: Boolean,
      default: true
    },
    rowKey: {
      type: [String, Function],
      // v-hasPermi 会导致 v-if报错，传入 rowKey 解决
      required: true
    },
    /*
    interface searchTabsConfig {
      paramKey: string   // 请求参数名
      dictName: string   // 字典接口名
    }
    */
    searchTabsConfig: Object,
    postData: Function,
    onLoad: Function,
    onLoadingChange: Function,
    onRequestError: Function,
    beforeSearchSubmit: Function,
    onSubmit: Function,
    onReset: Function,
    onPaginationChange: Function,
    tableRender: Function,
    containerClassName: {
      type: String,
      default: 'app-container'
    },
    columnEmptyText: {
      type: [Boolean, String],
      default: false
    }
  },
  data: (vm) => ({
    listLoading: false,
    listData: [],
    listTotal: 0,
    queryParams: {},
    treeOptions: [],
    dictsMap: new Map(),
    checkedAll: false,
    checkedList: [],
    searchTabsList: [],
    tabValue: 'all',
    formCollapse: vm.searchConfig.defaultCollapsed,
    tableMaxHeight: undefined
  }),
  computed: {
    initializedColumns() {
      return this.columns.map(item => {
        const { valueType, align } = item
        return {
          ...item,
          valueType: valueType ?? 'text',
          align: align ?? 'center'
        }
      })
    },
    listColumns() {
      return this.initializedColumns.filter(i => !i.hideInTable)
    },
    searchColumns() {
      // 当 search 表单顺序与 table 不同时，用 order 做表单排序
      return this.initializedColumns.filter(i => !i.hideInSearch).sort((a, b) => a.order - b.order)
    },
    // 转换为二维数组，根据 searchConfig.span 划定每行列数，newLine 为 true 时强制换行
    searchLayoutColumns() {
      const arr = []
      const colNum = Math.floor(24 / this.searchConfig.span)

      this.searchColumns.reduce((index, item) => {
        if (item.newLine) {
          arr.push([item])
          return 1
        }
        if (index % colNum === 0) {
          arr.push([item])
        } else {
          arr[arr.length - 1].push(item)
        }
        return index + 1
      }, 0)

      return arr
    },
    isInternalRenderingTable() {
      return typeof this.$scopedSlots['table-main'] === 'undefined' && typeof this.tableRender === 'undefined'
    },
    showFormCollapse() {
      return this.searchConfig.useCollapse && this.searchLayoutColumns.length > 1
    },
    hasSelectionType() {
      return this.listColumns.findIndex(i => i.tableColumnProps?.type === 'selection') !== -1
    },
    hasOrgIdColumn() {
      return this.initializedColumns.findIndex(i => i.prop === 'orgId') !== -1
    }
  },
  watch: {
    params(newVal) {
      this.queryParams = {
        ...this.queryParams,
        ...newVal
      }
      this.getListData()
    },
    listLoading(newVal) {
      this.onLoadingChange?.(newVal)
    },
    columns: {
      immediate: true,
      handler(newVal) {
        this.getOnlyTableDictData(newVal)
      }
    }
  },
  created() {
    this.initQueryParams()
    if (!this.manualRequest) {
      this.getListData()
    }
    if (this.hasOrgIdColumn) {
      getOrgTree().then((res) => {
        if (res.code === 200) {
          this.treeOptions = res.data
        }
      })
    }
    if (this.searchTabsConfig?.dictName) {
      getDicts(this.searchTabsConfig.dictName).then(res => {
        this.searchTabsList = res.data
      })
    }
  },
  mounted() {
    if (this.autoSetMaxHeight) {
      this.setMaxHeight()
      this.handleResizeFn = debounceFn(this.setMaxHeight, 120)
      window.addEventListener('resize', this.handleResizeFn)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResizeFn)
  },
  methods: {
    initQueryParams() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        ...this.params
      }
    },
    getFormatQueryParams() {
      const obj = { ...this.queryParams }
      const dateTypeArr = ['dateRange', 'timeRange', 'dateTimeRange']
      const numTypeArr = ['moneyRange', 'digitRange']
      const mul100 = (v) => typeof v === 'undefined' ? undefined : new Decimal(v).mul(100).toNumber()

      this.searchColumns.forEach(item => {
        const val = obj[item.prop]
        // 设置联合查询参数
        if (item.combineOptions && val) {
          delete obj[item.prop]
          Object.entries(val).forEach(([key, value]) => {
            if (key && value) {
              obj[key] = value
            }
          })
          return
        }

        // 转换时间范围类型的参数
        if (dateTypeArr.includes(item.valueType) && Array.isArray(val)) {
          const arr = item.paramsRange ?? ['beginTime', 'endTime']
          delete obj[item.prop]
          obj[arr[0]] = item.valueType !== 'dateRange' ? val[0] : moment(val[0]).startOf('day').format('yyyy-MM-DD HH:mm:ss')
          obj[arr[1]] = item.valueType !== 'dateRange' ? val[1] : moment(val[1]).endOf('day').format('yyyy-MM-DD HH:mm:ss')
        }
        // 转换数字范围类型的参数
        if (numTypeArr.includes(item.valueType) && Array.isArray(val)) {
          const arr = item.paramsRange ?? ['beginAmount', 'endAmount']
          delete obj[item.prop]
          obj[arr[0]] = item.valueType === 'digitRange' ? val[0] : mul100(val[0])
          obj[arr[1]] = item.valueType === 'digitRange' ? val[1] : mul100(val[1])
        }
      })

      if (this.searchTabsConfig?.paramKey) {
        obj[this.searchTabsConfig.paramKey] = this.tabValue === 'all' ? undefined : this.tabValue
      }

      return obj
    },
    getListData() {
      this.listLoading = true

      const params = this.getFormatQueryParams()
      request({
        url: this.apiConfig.url,
        method: 'get',
        params: this.beforeSearchSubmit ? this.beforeSearchSubmit(params) : params
      })
        .then(res => {
          if (typeof res.code !== 'undefined' && typeof res.total !== 'undefined') {
            const rows = res.rows ?? []
            this.listData = this.postData ? this.postData(rows) : rows
            this.listTotal = res.total
            this.onLoad?.(this.listData)
          }
        })
        .catch(error => {
          this.onRequestError?.(error)
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    getInitData() {
      this.initQueryParams()
      this.getListData()
    },
    handleSearch() {
      const stopExec = this.onSubmit?.(this.getFormatQueryParams())
      if (!stopExec) {
        this.getListData()
      }
    },
    resetSearch() {
      const stopExec = this.onReset?.()
      if (!stopExec) {
        this.tabValue = 'all'
        this.clearSelected()
        this.getInitData()
      }
    },
    receiveDicts(list, prop) {
      this.dictsMap.set(prop, list)
      // 获取字典后刷新table
      if (this.listColumns.find(i => i.prop === prop)) {
        this.listData = this.listData.slice()
      }
    },
    renderCellStr(scope, item) {
      const val = scope.row[item.prop]
      const emptyText = this.columnEmptyText || ''

      switch (item.valueType) {
        case 'dictSelect':
          return this.convertDictLabel(scope.row[item.prop], item.prop) ?? emptyText
        case 'money':
          return val !== undefined && val !== null ? new Decimal(val).div(100).toFixed(2) : '-'
        default:
          return val ?? emptyText
      }
    },
    getRenderParams(scope, item) {
      return {
        text: this.renderCellStr(scope, item),
        record: scope.row,
        column: scope.column,
        index: scope.$index
      }
    },
    isDisplayFormItem(i) {
      if (this.showFormCollapse && this.formCollapse) {
        return i < 1
      } else {
        return true
      }
    },
    handleSelectionChange(selection) {
      if (!this.hasSelectionType) {
        return
      }
      this.checkedList = selection
      this.checkedAll = this.listData.length === selection.length
    },
    toggleSelection(value) {
      this.$refs.tableRef.toggleAllSelection()
    },
    handleClickCollapse() {
      const val = !this.formCollapse
      this.searchConfig?.onCollapse?.(val)
      this.formCollapse = val
      if (this.autoSetMaxHeight) {
        this.$nextTick(this.setMaxHeight)
      }
    },
    handlePagination({ page, limit }) {
      this.onPaginationChange?.({ page, limit })
      this.getListData()
    },
    setMaxHeight() {
      const tableTop = this.$refs.tableRef?.$el.getBoundingClientRect().top
      const footerHeight = this.$refs.footerRef?.$el.offsetHeight ?? 55
      this.tableMaxHeight = Math.floor(window.innerHeight - tableTop - footerHeight - parseFloat(appMainPadding))
      this.$refs.tableRef?.doLayout()
    },
    // 加载只在列表中的字典数据
    getOnlyTableDictData(arr) {
      arr.forEach(item => {
        if (item.valueType === 'dictSelect' && !this.dictsMap.has(item.prop) && !item.hideInTable && item.hideInSearch) {
          getDicts(item.fieldProps.dict).then(res => {
            this.receiveDicts(res.data, item.prop)
          })
        }
      })
    },
    // Tips: 以下是提供给 $refs 调用的方法
    reload() {
      this.handleSearch()
    },
    reloadAndRest() {
      this.queryParams.pageNum = 1
      this.clearSelected()
      this.handleSearch()
    },
    reset() {
      this.resetSearch()
    },
    clearSelected() {
      this.$refs.tableRef.clearSelection()
    },
    getComponentRef(elName) {
      switch (elName) {
        case 'form':
          return this.$refs.formRef
        case 'table':
          return this.$refs.tableRef
      }
    },
    convertDictLabel(value, prop) {
      const list = this.dictsMap.get(prop)
      const val = value + ''
      return list?.find(i => i.dictValue === val)?.dictLabel
    }
    // Tips: 以上是提供给 $refs 调用的方法
  }
}
</script>

<style lang="scss" scoped>
  .el-pro-table-container {
    .search-form-container {
      margin-bottom: 20px;
      /deep/ .el-form-item {
        display: flex;
        .el-form-item__content {
          flex: 1;
        }
      }
      .search-btns-container .collapse {
        font-size: 14px;
      }
    }
  }
</style>
