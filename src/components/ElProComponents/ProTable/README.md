# @ElProComponents/ProTable

> ProTable 的诞生是为了解决项目中需要写很多 table 的样板代码的问题，所以在其中做了封装了很多常用的逻辑。这些封装可以简单的分类为预设行为与预设逻辑。
> ProTable 在 Element UI 的 Table 上进行了一层封装，支持了一些预设，并且封装了一些行为。

![组件演示](https://cnd.kwwdqd.com/cchs/goods/20220526/1653552762694.png)

## 代码示例

```html
<template>
  <pro-table
    :api-config="{ url: '/customer/info/list' }"
    :columns="columns"
    :params="params"
    :search-config="searchConfig"
    row-key="customerId"
  >
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>

    <template #action_column_content="">
      <el-button type="text" size="mini">运营发券</el-button>
      <el-button type="text" size="mini">加标签</el-button>
    </template>

    <template #table-footer-btns="{checkedList}">
      <el-button size="mini" :disabled="!checkedList.length">加入黑名单</el-button>
      <el-button size="mini" :disabled="!checkedList.length">加标签</el-button>
    </template>
  </pro-table>
</template>

<script>
import ProTable, { PropClasses } from '@/components/ElProComponents/ProTable'

export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {},
    searchConfig: new PropClasses.SearchConfigClass({ resetText: 'reset' })
  }),
  computed: {
    columns() {
      return [
        { prop: 'selection', width: 80, hideInSearch: true, tableColumnProps: { type: 'selection' }},
        { label: '昵称', prop: 'nickname', order: 1, hideInTable: true },
        { label: '手机号', prop: 'phone', order: 2, hideInTable: true },
        { label: '客户编号', prop: 'customerId', order: 3 },
        { label: '最后操作人', prop: 'updateBy', order: 4, hideInTable: true },
        { label: '头像昵称', prop: 'loginName', hideInSearch: true, render: (h, { record }) => (<CustomerLink row={record} />) },
        { label: '等级', prop: 'levelName', hideInSearch: true },
        { label: '来源方式', prop: 'entryMethod', valueType: 'dictSelect', order: 5, fieldProps: { dict: 'customer_entry_method' }},
        { label: '购买订单数', prop: 'consumeTimesTotal', hideInSearch: true, render: (h, { text }) => (<ElButton type='text' class='outer-link--text'>{text}</ElButton>) },
        { label: '消费金额', prop: 'consumeAmountTotal', valueType: 'money', hideInSearch: true, render: (h, { text }) => (<ElButton type='text' class='outer-link--text'>{text}</ElButton>) },
        { label: '余额', prop: 'accountAmount', valueType: 'money', hideInSearch: true, render: (h, { text }) => (<ElButton type='text' class='outer-link--text'>{text}</ElButton>) },
        { label: '积分', prop: 'scoreTotal', hideInSearch: true, render: (h, { text }) => (<ElButton type='text' class='outer-link--text'>{text}</ElButton>) },
        { label: '成长值', prop: 'growth', hideInSearch: true, render: (h, { text }) => (<ElButton type='text'>{text}</ElButton>) },
        { label: '入驻时间', prop: 'createTime', valueType: 'dateTimeRange', hideInSearch: true, render: (h, { record }) => (<BreakTime dateTime={record.createTime} />) },
        { label: '修改人', prop: 'updateBy', hideInSearch: true },
        { label: '操作', prop: 'action', hideInSearch: true }
      ]
    }
  },
  methods: {
    handleExport({ getParams }) {
      this.download('customer/list/export', getParams())
    }
  }
}
</script>
```

### Attributes

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apiConfig | 接口请求配置 | `{ url: string }` | - |
| params | 用于查询的额外参数，一旦变化会触发重新加载 | `object` | - |
| columns | 配置 table/form 的数据项 | [Columns](#columns) | - |
| postData | 对获取的数据进行处理 | `(data: T[]) => T[]` | - |
| formProps | el-form 的配置 | [<u>FormProps](https://element.eleme.cn/2.15/#/zh-CN/component/form#form-attributes) | - |
| tableProps | el-table 的配置 | [<u>TableProps</u>](https://element.eleme.cn/2.15/#/zh-CN/component/table#table-attributes) | - |
| paginationProps | el-pagination 的配置 | [<u>PaginationProps</u>](https://element.eleme.cn/2.15/#/zh-CN/component/pagination#attributes) | - |
| onLoad | 数据加载完成后触发,会多次触发 | `(data: T[]) => void` | - |
| onLoadingChange | loading 被修改时触发，一般是网络请求导致的 | `(loading:boolean)=>void` | - |
| onRequestError | 数据加载失败时触发 | `(error)=>void` | - |
| containerClassName | 顶层容器 的 className | `string \| object` | - |
| tableClassName | 封装的 table 的 className | `string \| object` | - |
| tableStyle | 封装的 table 的 style | `string \| object` | - |
| searchConfig | 是否显示搜索表单，传入对象时为搜索表单的配置 | `false \|` [SearchConfig](#search-config) | - |
| beforeSearchSubmit | 搜索之前进行一些修改 | `(params:T)=>T` | - |
| onSubmit | 提交表单时触发, `return true` 时停止执行后续逻辑 | `(params: U) => boolean` | - |
| onReset | 重置表单时触发, `return true` 时停止执行后续逻辑 | `() => boolean` | - |
| onPaginationChange | 分页变化时触发 | `({ page, limit }) => void` | - |
| columnEmptyText | 空值时的显示， false 可以关闭此功能 | `string \| false` | false |
| tableRender | 自定义渲染表格函数 | `({ data, loading }) => jsx` | - |
| manualRequest | 是否需要手动触发首次请求 | `boolean` | false |
| height | table 的高度 | `string \| number` | - |
| maxHeight | table 的最大高度 | `string \| number` | - |
| autoSetMaxHeight | 自动设置 table 的 maxHeight（防止页面出现两个滚动条）, 为 true 时 height/maxHeight 都将失效 | `boolean` | true |
| row-key | 行数据的 Key，用来优化 Table 的渲染；类型为 String 时，支持多层访问：`user.info.id`，但不支持 `user.info[0].id`，此种情况请使用 Function。| `(row) => string \| string`  | - |
| searchTabsConfig | 以 tabs 形式的查询条件 | `{ paramKey: string, dictName: string }` | - |

#### SearchConfig  

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| searchText | 查询按钮的文本 | `string` | 筛选 |
| resetText | 重置按钮的文本 | `string` | 重置 |
| span | 配置查询表单的列数 | `number` | 6 |
| className | 封装的搜索 Form 的 className | `string` | search-form |
| useCollapse | 使用 折叠/展开 功能 | `boolean` | true |
| defaultCollapsed | 默认是否收起 | `boolean` | true |
| onCollapse | 收起按钮的事件 | `(collapsed: boolean) => void;` | - |

### Events

支持 el-table 的 [<u>所有事件</u>](https://element.eleme.cn/2.15/#/zh-CN/component/table#table-events)  
使用： `<pro-table @xx="fn" />`

#### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| reload | 刷新数据 | - |
| reloadAndRest | 刷新并清空,页码也会重置，不包括表单 | - |
| reset | 重置到默认值，包括表单 | - |
| clearSelected | 清空选中项 | - |
| getComponentRef | 获取组件内部 ref | `(name: 'form' \| 'table') => ref`
| convertDictLabel | 转换为字典label | `(value: string, prop: string) => dictLabel`

#### Slots

| name | 说明 | 参数 |
| --- | --- | -- |
| title | 顶部内容 | - |
| ${prop}_search_item | form 项 | { column: {} } |
| search-btns | form 底部按钮组 | { getParams: () => params } |
| table-title | table 顶部内容 | { getParams: () => params } |
| table-main | table 主体内容 | { data: [], loading: boolean   } |
| table-footer | table 底部内容 | - |
| table-footer-btns | table 底部按钮组 | { checkedList: [] } |
| table-before-column | 插入 table column 前面的内容 | - |
| table-after-column | 插入 table column 后面的内容 | - |
| ${prop}_column | table column 项 | - |
| ${prop}_column_header | table column 的 header | scope: {} |
| ${prop}_column_content | table column 的 content | { ...scope, text: string } |

### Columns

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| prop | 对应列内容的字段名 | `string` | - |
| label | 显示的标题 | `string` | - |
| valueType | 值的类型 | [ValueType](#valuetype) | `text` |
| hideInSearch | 在查询表单中不展示此项 | `boolean` | - |
| hideInTable | 在 Table 中不展示此列 | `boolean` | - |
| width | 对应列的固定宽度 | `string` | - |
| minWidth | 对应列的最小宽度，会把剩余宽度按比例分配给设置了 min-width 的列 | `string` | - |
| align | 对齐方式 | `'left'` \| `'center'` \| `'right'` | `'center'`
| order | 查询表单中的顺序，从小到大的顺序 | `number` | - |
| span | 查询表单中的列数，传值会覆盖`SearchConfig.span` | `number` | - |
| newLine | 为 true 时，查询表单项强制换行 | `boolean` | - |
| renderFormItem | 渲染查查询表单项的函数 | `({ type: valueType, formItemProps, fieldProps }) => jsx` | - |
| formItemProps | 传递给 [<u>el-form-item</u>](https://element.eleme.cn/2.15/#/zh-CN/component/form#form-attributes) 的配置 | `object` | - |
| fieldProps | 表单项的 props，如果渲染出来是 el-input,就支持 el-input 的所有 props；有预设字段(如showShortcuts)，具体情况请看代码 | `object` | - |
| tableColumnProps | 传递给 [<u>el-table-column</u>](https://element.eleme.cn/2.15/#/zh-CN/component/table#table-attributes) 的配置 | `object` | - |
| render | el-table-column 的 render 函数 | `(h, { record: {}, index: number, column: {} }) => jsx` | - |
| renderText | 类似 render，无需 `h` 参数且不支持返回 jsx | `({ record: {}, index: number, column: {} }) => string` | - |
| paramsRange | 区间类型表单项的请求参数名 | `string[]` | `['beginTime','endTime']` \| `['beginAmount','endAmount']`
| options | `select`下拉框中的选项值 | `[{ label: string, value: string }]` | - |
| combineOptions | 联合查询的选项值，传入将在表单项前生成一个下拉框 | `[{ label: string, value: string \| array }]` | - |

### ValueType

| type | 说明 |
| --- | --- |
| text | 文本框 |
| select | 下拉框 |
| money | 金额输入框 |
| moneyRange | 金额区间 |
| digitRange | 数字区间 |
| timeRange | 时间区间 |
| dateRange | 日期区间 |
| dateTimeRange | 日期时间区间 |
| dateMonth | 月 |
| dateTime | 日期时间 |
| dictSelect | 字典下拉框 |
| treeSelect | 树形下拉框 |
