<template>
  <div class="app-container">
    <a-card
      style="width:100%"
      :tab-list="tabList"
      :active-tab-key="queryParams.materialType"
      @tabChange="key => onTabChange(key, 'materialType')"
    >
      <el-row style="fontSize: 14px;color: rgba(0, 0, 0, 0.85); marginBottom: 16px;fontWeight: 500">
        <el-col>{{queryParams.materialType == '封面' ? '封面素材库可上传企业品牌图等内容，成员可以选择并配置到自己的朋友圈中' : '签名素材库可上传企业品牌标语等内容，成员可以选择并配置到自己的朋友圈中' }}</el-col>
      </el-row>
      <el-row type="flex" :gutter="10" class="mb10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['workwechat:coverSignatureMaterial:add']"
            >新增{{queryParams.materialType}}
          </el-button>
        </el-col>
        <el-col v-if="queryParams.materialType === '签名'" :span="1.5">
          <el-popover
            placement="right"
            width="400"
            trigger="click">
              <img src="~@/assets/images/sign.jpg" alt="示例：单行文字" />
            <el-button type="text" slot="reference">示例：单行文字</el-button>
          </el-popover>
        </el-col>
      </el-row>
      <div v-loading="loading" v-if="queryParams.materialType === '封面'">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6" :lg="4" v-for="(item, index) in coverSignatureMaterialList" :key="index">
            <a-card class="material-item-view" hoverable>
              <div class="poster-item">
                <el-image class="box-img" :src="item.materialContent" alt="" fit="contain" >
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </div>
            </a-card>
          </el-col>
        </el-row >
      </div>
      <div v-loading="loading" v-else-if="queryParams.materialType === '签名'">
        <!-- <el-divider></el-divider> -->
        <!-- <el-row :gutter="16" v-for="(item, index) in coverSignatureMaterialList" :key="index">
          <el-col :span="8">
            <span>签名：</span>
            <span>{{item.materialContent}}</span>
          </el-col>
          <el-col :span="8">
            <span>创建时间：</span>
            <span>{{item.createTime}}</span>
          </el-col>
          <el-col :span="8">
            <span>状态：</span>
            <span>{{item.isUse == '1' ? "已使用" : "未使用" }}</span>
          </el-col>
        </el-row > -->
         <el-table :data="coverSignatureMaterialList">
          <el-table-column property="materialContent" label="签名" ></el-table-column>
          <el-table-column property="createTime" label="创建时间"></el-table-column>
          <el-table-column property="isUse" label="状态" :formatter="row => row.isUse == 1 ? '已使用' : '未使用'"></el-table-column>
        </el-table>
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
    <el-dialog :title="queryParams.materialType" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <template v-if="queryParams.materialType == '封面'">
          <el-form-item label="封面" prop="materialContent" :rules="[{required: true, message: '请上传封面图', trigger: 'change'}]">
            <ResourcePicker v-model="form.materialContent" size-hint="建议：360*360" />
          </el-form-item>
        </template>
        <el-form-item v-else label="签名" prop="materialContent" :rules="[{required: true, message: '请填写签名', trigger: 'change'}]">
          <el-input v-model="form.materialContent" placeholder="请输入签名" maxlength="100" show-word-limit/>
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
  addCoverSignatureMaterial,
  listCoverSignatureMaterial,
} from "@/api/work/coverSignatureMaterial"

import ResourcePicker from '@/components/ResourcePicker'
import ProTable from '@/components/ProTable'
import { Card as ACard} from 'ant-design-vue'

export default {
  name: "DictionMaterialLibrary",
  components: {
    ResourcePicker,
    ACard,
    ProTable
  },
  data() {
    return {
      prefix: sessionStorage.getItem('prefix'),
      // 话术类型
      tabList: [
        { tab: "封面素材库", key: "封面" },
        { tab: "签名素材库", key: "签名" }
      ],

      key: 'tab1',
      
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 素材库表格数据
      coverSignatureMaterialList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        materialType: '封面',
        pageNum: 1,
        pageSize: 50
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.getList()
  },
  watch:{
    'queryParams.materialType'(val) {
      this.queryParams.pageSize = val == '封面' ? 50 : 10
    }
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
      listCoverSignatureMaterial(this.queryParams).then((response) => {
        this.coverSignatureMaterialList = response.rows?.map(item=>{
          const materialContent = this.queryParams.materialType == '封面' ? {materialContent : this.prefix+'/'+ item.materialContent} : {}
          return {...item, ...materialContent}
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
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
         
          this.$confirm(`是否确认新增素材库?`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              return addCoverSignatureMaterial({...this.form, materialType: this.queryParams.materialType})
            })
            .then(() => {
              this.msgSuccess(`新增素材库成功`);
              this.open = false;
              this.getList();
            });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";
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
  /deep/.ant-card-body {
    padding: 0;
  }
  .poster-item{
    background: #fff;
    box-shadow: 0 0 0 1px rgba(0,0,0,.05);
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
    text-align: right;
  }
  
  .size {
    line-height: 18px;
    margin-top: 9px;
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