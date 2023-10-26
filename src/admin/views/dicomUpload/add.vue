<template>
  <div class="app-container">
    <UploadHandler />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import UploadHandler from '/src/components/UploadHandler.vue';
import { genFileId } from 'element-plus';
import {
  uploadUrl,
  add as uploadFile,
  remove as removeUploadFile,
} from 'api/upload';
import { object2FormData } from 'utils/url';

const uploadRef = ref(null);
const uploadList = ref([]);
const uploadedList = ref([]);
const progressPercent = ref(0);
const onAddLoading = ref(false);
const onAddDisabled = ref(true);
const optionFormRef = ref(null);
const optionForm = reactive({
  type: 'image',
  useTimeDir: false,
  useRandomName: false,
  overwrite: false,
  reizeConfig: {
    enable: false,
    width: 0,
    height: 0,
  },
  compressConfig: {
    enable: false,
    quality: 75,
    newFile: true,
  },
  watermarkConfig: {
    enable: false,
    path: 'http://127.0.0.1/php-seed/upload/?filename=logo.png&type=image',
    x: 0,
    y: 0,
    position: 'bottom-right',
  },
});
const watermarkPositionList = ref([
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
]);

const uploadMehod = async (params) => {
  progressPercent.value = 0;
  console.debug('uploadMehod params', params);

  const file = params.file;
  const form = new FormData();
  form.append('file', file);
  object2FormData(optionForm, form);

  progressPercent.value = 50;

  return uploadFile(form, (progressEvent) => {
    progressPercent.value = Math.floor(
      (progressEvent.loaded * 100) / progressEvent.total,
    );
  });
};

const handleUploadExceed = (files) => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    uploadRef.value.handleStart(file);
  }
};

const beforeUpload = (file) => {
  if (file.type.indexOf('image/') < 0) {
    ElMessage.error('File must be image format!');
    return false;
  }
  if (file.size / 1024 / 1024 > 100) {
    ElMessage.error('File size can not exceed 100MB!');
    return false;
  }
  if (file.size < 1) {
    ElMessage.error('File size can not lessen 1KB!');
    return false;
  }
  return true;
};

const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  console.debug('handleUploadSuccess', response);
  progressPercent.value = 100;
  onAddDisabled.value = true;
  uploadList.value = [];
  uploadRef.value.clearFiles();
  uploadedList.value = uploadedList.value.concat(response.data);
  ElMessage.success('Upload success');
};

const handleUploadError = (error, uploadFile, uploadFiles) => {
  progressPercent.value = 0;
  uploadRef.value.clearFiles();
  ElMessage.error('Upload error');
  console.error('Upload error', error);
};

const handleUploadProgress = (event, uploadFile, uploadFiles) => {};

const handleUploadChange = (uploadFile, uploadFiles) => {
  if (uploadList.value.length > 0) {
    onAddDisabled.value = false;
  }
};

const handleUploadRemove = (file) => {
  if (!file) {
    return ElMessage.error('no file');
  }
  removeUploadFile({ type: 'image', filename: file.name })
    .then(() => {
      ElMessage.success('Remove success');
    })
    .catch((error) => {
      ElMessage.error('Remove error');
      console.error('Remove error', error);
    });
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  align-items: center;

  .option-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 1;

    .config-collapse {
      width: 280px;
    }
  }

  .upload-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 2;

    .down-container {
      margin-top: 10px;
      display: flex;
      align-items: center;
      flex-direction: row;
    }
  }

  .block {
    padding: 0 10px;
    text-align: center;
    display: inline-block;
    box-sizing: border-box;
    vertical-align: top;

    .demonstration {
      display: block;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }

    .el-image {
      width: 200px;
    }
  }
}
</style>
