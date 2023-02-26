<template>
  <div>
    <el-input
      style="margin-bottom: 8px"
      placeholder="输入部门以查找"
      v-model="searchValue"
      clearable
      suffix-icon="el-icon-search"
    />
    <tree
      :tree-data="options"
      :expanded-keys="expandedKeys"
      :replaceFields="replaceFields"
      :selectedKeys="[value]"
      @select="handleSelect"
      show-line
    >
      <template slot="title" slot-scope="row">
        <search-text :text="row[replaceFields.title]" :search-value="searchValue"/>
      </template>
    </tree>
  </div>
</template>

<script>
import { Tree } from "ant-design-vue";
import SearchText from './search-text.vue'

export default {
  components: { Tree, SearchText },
  props: {
    options: Array,
    replaceFields: {
      type: Object,
      default: () => ({ children: "children", title: "name", key: "deptId" }),
    },
    value: [Number, String]
  },
  computed: {
    expandedKeys() {
      const ret = [];
      const deepFind = (options) => {
        options.forEach((item) => {
          const children = item[this.replaceFields.children];
          if (children) {
            ret.push(item[this.replaceFields.key])
            deepFind(children);
          }
        });
      };
      deepFind(this.options);
      return ret;
    },
  },
  data() {
    return {
      searchValue: "",
    };
  },
  methods: {
    handleSelect(value) {
      this.$emit('input', value[0])
    },
  },
};

</script>