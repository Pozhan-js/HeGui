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
            v-for="(item, index) in form.activityContent"
            :key="index"
          >
            <img
              style="width: 378px; height: 180px; border: 1px solid"
              v-if="item.picUrl"
              :src="prefix + item.picUrl"
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
          <el-form-item label="活动标题" prop="activityTitle">
            <el-input
              v-model="form.activityTitle"
              maxlength="10"
              placeholder="请输入活动标题"
            />
          </el-form-item>
          <el-row
            v-for="(item, index) in form.activityContent"
            :key="index"
            style="
              border: 1px solid #e2e2e2;
              padding: 10px;
              margin-bottom: 20px;
            "
          >
            <el-col :span="8">
              <ResourcePicker
                v-model="form.activityContent[index].picUrl"
                vertical
                size-hint="建议680*250"
              />
            </el-col>
            <el-col :span="16">
              <el-form-item label="图片链接地址" prop="linkUrl">
                <el-input
                  v-model="form.activityContent[index].linkUrl"
                  type="textarea"
                  placeholder="请输入内容"
                />
              </el-form-item>
              <div
                v-if="form.activityContent.length > 1"
                style="text-align: right; font-size: 18px; color: red"
              >
                <i
                  class="el-icon-delete"
                  style="cursor: pointer"
                  @click="delShopPic(index)"
                ></i>
              </div>
            </el-col>
          </el-row>
          <el-button
            style="width: 100%; margin-top: 20px"
            type="primary"
            icon="el-icon-plus"
            @click="addShopPic"
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
import { getActivity, addActivity, updateActivity } from "@/api/merchant/activity";
import { getOrgTree } from "@/api/utils";
import ResourcePicker from "@/components/ResourcePicker";

export default {
  name: "Pic",
  components: {
    ResourcePicker,
  },
  data() {
    return {
      // 图片前缀
      prefix: sessionStorage.getItem("prefix"),
      loading: false,
      // 活动ID
      activityId: this.$route.query.activityId,
      shopId: this.$route.query.shopId,
      // 组织机构
      orgOptions: [],
      // 表单参数
      form: {
        activityContent: [
          {
            picUrl: null,
            linkUrl: null,
          },
        ],
      },
      // 表单校验
      rules: {
        activityTitle: [
          { required: true, message: "活动标题不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    if (this.$route.query.activityId) {
      this.getInfo();
    }
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
      getActivity(this.activityId).then((res) => {
        this.loading = false;
        this.form = {
          activityId: res.data.activityId,
          activityTitle: res.data.activityTitle,
          activityContent: res.data.activityContent,
        };
      });
    },
    // 添加多个List
    addShopPic() {
      this.form.activityContent.push({
        picUrl: null,
        linkUrl: null,
      });
    },
    // 删除图片List
    delShopPic(index) {
      this.form.activityContent = this.form.activityContent.filter(
        (item, itemIndex) => index !== itemIndex
      );
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const params = {
            ...this.form,
            shopId: this.shopId
          };
          this.$confirm(`是否确认${this.$route.query.activityId ? '修改' : '新增'}店铺活动数据?`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              return this.$route.query.activityId ? updateActivity(params) : addActivity(params);
            })
            .then(() => {
              this.msgSuccess(`${this.$route.query.activityId ? '修改' : '新增'}活动成功`);
              this.cancel()
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
