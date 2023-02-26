<template>
  <div class="component-upload-image">
    <Upload
      class="uploader"
      list-type="picture-card"
      :remove="handleRemove"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :accept="accept"
      :showUploadList="{ showPreviewIcon: false, showRemoveIcon: true }"
    >
      <div v-if="fileList.length < 1">
        <i class="el-icon-plus" />
      </div>
    </Upload>
    <span class="size-hint" v-if="sizeHint != null">{{ sizeHint }}</span>
    <el-dialog
      :visible.sync="dialogVisible"
      title="预览"
      width="800"
      append-to-body
    >
      <img
        :src="previewUrl"
        style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
// @Fuck `element-ui` `upload` 组件受控模式下，一堆bug.
import { Upload } from "ant-design-vue";
import { upload } from "@/api/resource/picture";

export default {
  components: { Upload },
  data() {
    return {
      dialogVisible: false,
      fileList: [],
      previewUrl: "",
      prefix: sessionStorage.getItem("prefix"), // 图片前缀
    };
  },
  props: {
    sizeHint: String,
    // 手动上传模式，默认为自动
    // 手动模式需要调用 ref.submit 方法
    // 额外携带的上传参数
    params: Object,
    accept: {
      type: String,
      default: "image/*",
    },
    // 多个图片用逗号分隔
    value: {
      type: String,
    },
  },
  methods: {
    reset() {
      this.fileList = []
    },
    async submit() {
      const params = new FormData();
      params.append("file", this.fileList[0]);
      params.append("fileName", this.params.fileName);
      params.append("fileGroupId", this.params.fileGroupId);

      const loading = this.$loading({
        lock: true,
        text: "上传中",
        background: "rgba(0, 0, 0, 0.7)",
      });

      try {
        const result = await upload(params);
        if (result.code == 200) {
          this.$emit('success', result.data)
        }
      } finally {
        loading.close()
      }
    },
    handleRemove() {
      this.fileList = [];
      this.$emit("change", {});
    },
    handleBeforeUpload(file) {
      this.fileList = [file];
      this.$emit("change", file);
      return false;
    },
  },
};
</script>

<style scoped lang="scss">
.component-upload-image {
  display: flex;
  align-items: center;
  &.vertical {
    width: 100%;
    flex-direction: column;
    .size-hint {
      margin-left: 0;
      margin-top: 10px;
    }
  }
  .size-hint {
    margin-left: 20px;
    font-size: 14px;
    color: #b1b1b1;
  }
}
.image {
  position: relative;
  .mask {
    opacity: 0;
    position: absolute;
    top: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: all 0.3s;
  }
  &:hover .mask {
    opacity: 1;
  }
}
</style>
