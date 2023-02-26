<template>
  <div class="app-container">
    <a-card
      style="width:100%"
      :tab-list="tabList"
      :active-tab-key="queryParams.fileType"
      @tabChange="key => onTabChange(key, 'fileType')"
    >
      <el-row :gutter="10" class="mb10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['workwechat:dictionMaterialLibrary:add']"
            >新增{{queryParams.fileType}}
          </el-button>
        </el-col>
      </el-row>
      <el-row style="fontSize: 14px;color: rgba(0, 0, 0, 0.85); marginBottom: 16px;fontWeight: 500">
        <el-col>{{queryParams.fileType}}素材（共{{total}}篇）</el-col>
      </el-row>
      <div v-if="queryParams.fileType === '链接'">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6" :lg="4" v-for="item in dictionMaterialLibraryList" :key="item.dictionMaterialLibraryId">
            <a-card class="material-item-view" hoverable>
              <div class="item link-item">
                <div class="title">{{item.linkTitle}}</div> 
                <el-row type="flex" justify="space-between" :gutter="10">
                  <el-col ><a :href="item.linkUrl" class="size" target="_blank"> {{item.linkDescribe}}</a> </el-col>
                  <el-col style="flex: 0 0 48px"><img :src="item.coverImage" class="right-contain"></el-col>
                </el-row>
                <div class="mt5"><small class="text-gray">同步时间：{{item.updateTime}}</small></div>
              </div>
              <el-row type="flex" justify="end" align="center" class="action-item">
                <el-button :disabled="item.isSyncRadar == 1" type="default" size="mini" v-hasPermi="['workwechat:dictionMaterialLibrary:edit']" @click="handleSyncRadar(item)">{{item.isSyncRadar ? '已同步雷达' : '同步至雷达' }}</el-button>
              </el-row>
            </a-card>
          </el-col>
        </el-row >
      </div>
      <div v-else-if="queryParams.fileType === '海报'">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6" :lg="4" v-for="item in dictionMaterialLibraryList" :key="item.dictionMaterialLibraryId">
            <a-card class="material-item-view poster-item-view" hoverable>
              <div class="item poster-item">
                <div class="box-img">
                  <img slot="cover" :alt="item.linkTitle" :src="item.coverImage" class=""/>
                </div>
              </div>
            </a-card>
          </el-col>
        </el-row >
      </div>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        :page-sizes="pageSizes"
        @pagination="getList"
          />
    </a-card>

    <!-- 添加或修改素材库对话框 -->
    <el-dialog :title="queryParams.fileType" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <template v-if="queryParams.fileType == '链接'">
          <el-form-item label="链接地址" prop="linkUrl">
            <el-input v-model="form.linkUrl" placeholder="请输入链接地址" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="链接标题" prop="linkTitle">
            <el-input v-model="form.linkTitle" placeholder="请输入链接标题" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="链接描述" prop="linkDescribe">
            <el-input type="textarea" v-model="form.linkDescribe" placeholder="请输入链接描述" maxlength="255" show-word-limit />
          </el-form-item>
          <el-form-item label="封面图" prop="coverImage">
            <ResourcePicker v-model="form.coverImage" size-hint="建议：360*360" />
          </el-form-item>
          <el-form-item label="" prop="isSyncRadar" label-width="0">
            <el-checkbox v-model="form.isSyncRadar">是否同步至企业雷达</el-checkbox>
          </el-form-item>
        </template>
         <el-form-item v-else label="海报封面" prop="coverImage">
            <ResourcePicker v-model="form.coverImage" size-hint="建议：1242*2280"/>
          </el-form-item>
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
  addDictionMaterialLibrary,
  delDictionMaterialLibrary,
  getDictionMaterialLibrary,
  listDictionMaterialLibrary,
  updateDictionMaterialLibrary,
} from "@/api/work/dictionMaterialLibrary";
import ResourcePicker from '@/components/ResourcePicker'
import { Card as ACard} from 'ant-design-vue'

export default {
  name: "DictionMaterialLibrary",
  components: {
    ResourcePicker,
    ACard
  },
  data() {
    return {
      prefix: sessionStorage.getItem('prefix'),
      tabList: [],

      key: 'tab1',
      
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 素材库表格数据
      dictionMaterialLibraryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        fileType: '链接',
        pageNum: 1,
        pageSize: 50
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        linkUrl: [
          {required: true, message:'请输入链接地址', trigger: 'blur'},
          {pattern: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/, message: '请输入正确的链接地址'}
        ],
        linkTitle: [{required: true, message:'请输入链接标题', trigger: 'blur'}],
        linkDescribe: [{required: true, message:'请输入链接描述', trigger: 'blur'}],
        coverImage: [{required: true, message:'请上传封面图', trigger: 'change'}],
      },
    };
  },
  created() {
    this.getDicts('material_library_type').then(res => {
      this.tabList = res.data.map((item, index)=> {
        return {
          tab: item.dictLabel,
          key: item.dictValue
        }
      })
      this.getList()
    })
  },
  computed: {
    pageSizes() {
      const ret = []
      for(let i = 1; i<=4; i++) {
        ret.push(this.queryParams.pageSize * i)
      }
      return  ret
    }
  },
  methods: {
    // 类型筛选
    onTabChange(key, type) {
      this.queryParams[type] = key;
      this.getList()
    },
    /** 查询素材库列表 */
    getList() {
      this.loading = true;
      listDictionMaterialLibrary(this.queryParams).then((response) => {
        this.dictionMaterialLibraryList = response.rows?.map(item=>{
          return {...item, coverImage: this.prefix+'/'+ (item.coverImage || item.linkUrl)}
        })

        this.total = response.total
        this.loading = false
      });
    },
      // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.reset();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      getDictionMaterialLibrary(row.dictionMaterialLibraryId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改素材库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const type =
            this.form.dictionMaterialLibraryId != null ? "修改" : "新增";
          this.$confirm(`是否确认${type}素材库?`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              return this.form.dictionMaterialLibraryId != null
                ? updateDictionMaterialLibrary({dictionMaterialLibraryId: this.form.dictionMaterialLibraryId, linkUrl: this.form.linkUrl, fileType: this.queryParams.fileType})
                : addDictionMaterialLibrary({...this.form, fileType: this.queryParams.fileType});
            })
            .then(() => {
              this.msgSuccess(`${type}素材库成功`);
              this.open = false;
              this.getList();
            });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(`是否确认删除素材库?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return delDictionMaterialLibrary(row.dictionMaterialLibraryId);
        })
        .then(() => {
          this.getList()
          this.msgSuccess("删除成功")
        })
    },
    // 同步到雷达
    handleSyncRadar(item) {
      this.$confirm(`是否同步至雷达?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return updateDictionMaterialLibrary({dictionMaterialLibraryId: item.dictionMaterialLibraryId, isSyncRadar: 1})
        })
        .then(() => {
          this.getList()
          this.msgSuccess("同步成功")
        })
    }
  },
}
</script>
<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";

.text-gray {
  color: $gray;
}
/deep/ .is-align-center {
  align-items: center;
}
/deep/ .ant-tabs-nav .ant-tabs-tab-active {
  color: $primary;
}
/deep/ .ant-tabs-ink-bar{
  background: $primary;
}
/deep/ .ant-tabs-nav .ant-tabs-tab:active {
  color: $primary;
}
/deep/ .ant-tabs-nav .ant-tabs-tab:hover {
  color: $primaryHover;
}
.material-item-view{
  margin-bottom: 16px;
  background: #f2f2f2;
  /deep/.ant-card-body {
    padding: 6px;
  }
  &.poster-item-view {
    /deep/.ant-card-body {
      padding: 0;
    }
  }
  .item{
    background: #fff;
    box-shadow: 0 0 0 1px rgba(0,0,0,.05);
  }
  .link-item {
    padding: 16px 12px 14px;
    .right-contain {
      width: 48px;
      height: 48px;
      background: #ededed;
      border-radius: 2px;
      -o-object-fit: contain;
      object-fit: contain;
    }
    .title {
      margin-bottom: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .poster-item{
    width: 100%;
    height: 0;
    padding-bottom: 125%;
    overflow: hidden;
    position: relative;
    text-align: center;
    .box-img{
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      img{
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      
    }
  }
  .action-item{
    padding-top:10px;
  }
  
  .size {
    line-height: 18px;
    max-height: 36px;
    color: rgba(0,0,0,.65);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}


</style>