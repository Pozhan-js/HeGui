<template>
  <div class="app-container" v-loading="loading">
    <div style="display: flex; justify-content: space-evenly;">
      <div
        style="
          border: 1px solid;
          padding: 10px;
          min-height: 800px;
          width: 400px;
        "
      >
        <el-carousel height="180px">
          <el-carousel-item
            v-for="(item, index) in form.shopBannerList"
            :key="index"
          >
            <img
              style="width: 378px; height: 180px; border: 1px solid"
              v-if="item.bannerUrl"
              :src="prefix + item.bannerUrl"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
      <div
        style="
          border: 1px dashed;
          padding: 20px;
          height: 800px;
          overflow: overlay;
        "
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="组织" prop="orgId">
            <el-cascader
              disabled
              style="width: 100%"
              v-model="form.orgId"
              :options="orgOptions"
              :props="{ value: 'id', label: 'label', expandTrigger: 'hover' }"
              placeholder="请选择组织"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="微页面名称" prop="pageName">
            <el-input
              v-model="form.pageName"
              maxlength="10"
              placeholder="请输入微页面名称"
            />
          </el-form-item>
          <el-row
            v-for="(item, index) in form.shopBannerList"
            :key="index"
            style="
              border: 1px solid #e2e2e2;
              padding: 10px;
              margin-bottom: 20px;
            "
          >
            <el-col :span="8">
              <ResourcePicker
                v-model="form.shopBannerList[index].bannerUrl"
                vertical
                size-hint="建议680*320"
              />
            </el-col>
            <el-col :span="16">
              <el-form-item label="banner标题" prop="bannerTitle">
                <el-input
                  v-model="form.shopBannerList[index].bannerTitle"
                  placeholder="请输入banner标题"
                />
              </el-form-item>
              <el-form-item label="图片链接地址" prop="linkUrl">
                <el-input
                  v-model="form.shopBannerList[index].linkUrl"
                  type="textarea"
                  placeholder="请输入内容"
                />
              </el-form-item>
              <div
                style="text-align: right; font-size: 18px; color: red"
              >
                <i
                  class="el-icon-delete"
                  style="cursor: pointer"
                  @click="delShopBanner(index)"
                ></i>
              </div>
            </el-col>
          </el-row>
          <el-button
            style="width: 100%; margin-top: 20px"
            type="primary"
            icon="el-icon-plus"
            @click="addShopBanner"
            >添加</el-button
          >
        </el-form>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        @click="submitForm"
        :loading="this.$store.state.isLoading"
        >确 定</el-button
      >
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import { addBanner, getBanner } from "@/api/merchant/banner";
import { getOrgTree } from "@/api/utils";
import ResourcePicker from "@/components/ResourcePicker";

export default {
  name: "Banner",
  components: {
    ResourcePicker,
  },
  data() {
    return {
      // 图片前缀
      prefix: sessionStorage.getItem("prefix"),
      loading: false,
      // 商铺ID
      shopId: this.$route.query.shopId,
      // 组织机构
      orgOptions: [],
      // banner类型(视频/图片)字典
      bannerTypeOptions: [],
      // 表单参数
      form: {
        orgId: parseInt(this.$route.query.orgId),
        shopBannerList: [
          {
            bannerUrl: null,
            bannerTitle: null,
            linkUrl: null,
          },
        ],
      },
      // 表单校验
      rules: {
        orgId: [
          {
            required: true,
            message: "组织id,所属战区不能为空",
            trigger: "blur",
          },
        ],

        pageName: [
          { required: true, message: "微页面名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getInfo();
    // this.getDicts("merchant_banner_type").then((response) => {
    //   this.bannerTypeOptions = response.data;
    // });
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
  },
  methods: {
    // 查询店铺已有信息
    getInfo() {
      this.loading = true;
      getBanner(this.shopId).then((res) => {
        this.loading = false;
        this.form = {
          orgId: parseInt(this.$route.query.orgId),
          pageName: res.data.pageName,
          shopBannerList: res.data.shopBannerList,
        };
      });
    },
    // banner类型(视频/图片)字典翻译
    bannerTypeFormat(row, column) {
      return this.selectDictLabel(this.bannerTypeOptions, row.bannerType);
    },
    // 添加多个List
    addShopBanner() {
      this.form.shopBannerList.push({
        bannerUrl: null,
        bannerTitle: null,
        linkUrl: null,
      });
    },
    // 删除图片List
    delShopBanner(index) {
      this.form.shopBannerList = this.form.shopBannerList.filter(
        (item, itemIndex) => index !== itemIndex
      );
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const bannerId = row.bannerId || this.ids;
      getBanner(bannerId).then((response) => {
        this.form = response.data;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const params = {
            ...this.form,
            shopId: this.shopId,
            shopBannerList: this.form.shopBannerList.filter(item => item.bannerUrl),
            orgId:
              typeof this.form.orgId === "object"
                ? this.form.orgId.slice(-1)[0]
                : this.form.orgId,
          };
          this.$confirm("是否确认编辑店铺Banner数据?", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              return addBanner(params);
            })
            .then(() => {
              this.msgSuccess("编辑Banner成功");
            });
        }
      });
    },
    // 取消按钮
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style>
.dialog-footer {
  margin-top: 20px;
  padding-bottom: 20px;
  text-align: center;
}
</style>
