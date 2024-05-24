<script setup lang="ts">
import type { UploadChangeParam } from 'ant-design-vue';
import type { UploadFile } from 'ant-design-vue/es';
import type { RuleObject } from 'ant-design-vue/es/form'
 
interface Form {
    title: string;
    icon: UploadFile[];
    logo: UploadFile[];
    horizontal_logo: UploadFile[];
}

definePageMeta({
  requiresAuth: false,
  title: 'title.headSetup',
})

const route = useRoute()

const { signIn: _signIn, appInfo } = useGlobal()

const { api, isLoading, error } = useApi({ useGlobalInstance: true })

const { t } = useI18n()

useSidebar('nc-left-sidebar', { hasSidebar: false })

const formValidator = ref()

const form = reactive<Form>({ 
  title: '', 
  icon: [],
  logo: [],
  horizontal_logo: [],
})

const formRules: Record<string, RuleObject[]> = {
  title: [
    { required: true, message: t('msg.error.titleRequired') }, 
  ], 
  icon: [
    { required: true, message: t('msg.error.iconRequired') }, 
  ], 
  logo: [
    { required: true, message: t('msg.error.logoRequired') }, 
  ], 
  horizontal_logo: [
    { required: true, message: t('msg.error.sidebarIconRequired') }, 
  ],
} 

async function submit() {
  if (!formValidator.value.validate()) return

  resetError() 

  api.utils.setup({
    title: form.title,
    icon: form.icon[0].originFileObj,
    logo: form.logo[0].originFileObj,
    horizontal_logo: form.horizontal_logo[0].originFileObj,
  }).then(async () => {
    window.location.href = '/'; 
  }).catch(error => {
    // Handle error
  });
  
}

function resetError() {
  if (error.value) error.value = null
} 

function handleIconImageInputChange(info: UploadChangeParam<UploadFile<any>>) { 
    const { fileList } = info;
    form.icon = fileList.slice(-1); // Keep only the latest file 
}
 

function handleLogoImageInputChange(info: UploadChangeParam<UploadFile<any>>) { 
    const { fileList } = info;
    form.logo = fileList.slice(-1); // Keep only the latest file 
} 

function handleSidebarIconImageInputChange(info: UploadChangeParam<UploadFile<any>>) { 
    const { fileList } = info;
    form.horizontal_logo = fileList.slice(-1); // Keep only the latest file 
}


</script>

<template>
  <div>
    <NuxtLayout>
      <div
        data-testid="nc-form-setup"
        class="md:bg-primary bg-opacity-5 setup h-full min-h-[600px] flex flex-col justify-center items-center nc-form-setup"
      >
        <div
          class="bg-white mt-[60px] relative flex flex-col justify-center gap-2 w-full max-w-[500px] mx-auto p-8 md:(rounded-lg border-1 border-gray-200 shadow-xl)"
        >
          <LazyGeneralNocoIcon class="color-transition hover:(ring ring-accent ring-opacity-100)" :animate="isLoading" />

          <h1 class="prose-2xl font-bold self-center my-4">{{ $t('general.setup') }}</h1>

          <a-form ref="formValidator" :model="form" layout="vertical" no-style @finish="submit">
            <template v-if="!appInfo.disableEmailAuth">
              <Transition name="layout">
                <div v-if="error" class="self-center mb-4 bg-red-500 text-white rounded-lg w-3/4 mx-auto p-1">
                  <div class="flex items-center gap-2 justify-center">
                    <MaterialSymbolsWarning />
                    <div class="break-words">{{ error }}</div>
                  </div>
                </div>
              </Transition>

              <a-form-item :label="$t('labels.title')" name="title" :rules="formRules.title">
                <a-input
                  v-model:value="form.title"
                  data-testid="nc-form-setup__title"
                  size="large" 
                  @focus="resetError"
                />
              </a-form-item> 
 
              <a-form-item :label="$t('labels.uploadIcon')" name="icon" :rules="formRules.icon">
                <a-upload 
                    list-type="picture-card"
                    :file-list="form.icon" 
                    @change="handleIconImageInputChange"
                    accept=".ico,image/x-icon"
                    :multiple="false"
                    :max-count="1"     
                >
                    <div>
                        <a-icon type="plus" />
                        <div style="margin-top: 8px">Upload</div>
                    </div>
                </a-upload>
              </a-form-item> 

              <a-form-item :label="$t('labels.uploadLogo')" name="logo" :rules="formRules.logo">
                <a-upload 
                    list-type="picture-card"
                    :file-list="form.logo" 
                    @change="handleLogoImageInputChange"
                    accept="image/svg+xml"  
                    :multiple="false"
                    :max-count="1"     
                >
                    <div>
                        <a-icon type="plus" />
                        <div style="margin-top: 8px">Upload</div>
                    </div>
                </a-upload>
              </a-form-item> 
 
              <a-form-item :label="$t('labels.uploadHorizontalLogo')" name="horizontal_logo" :rules="formRules.horizontal_logo">
                <a-upload 
                    list-type="picture-card"
                    :file-list="form.horizontal_logo" 
                    @change="handleSidebarIconImageInputChange"
                    accept="image/svg+xml"  
                    :multiple="false"
                    :max-count="1"     
                >
                    <div>
                        <a-icon type="plus" />
                        <div style="margin-top: 8px">Upload</div>
                    </div>
                </a-upload>
              </a-form-item> 
            </template>

            <div class="self-center flex flex-col flex-wrap gap-4 items-center mt-4 justify-center">
              <template v-if="!appInfo.disableEmailAuth">
                <button data-testid="nc-form-setup__submit" class="scaling-btn bg-opacity-100" type="submit">
                  <span class="flex items-center gap-2"> 
                    {{ $t('general.submit') }}
                  </span>
                </button>
              </template>  
            </div>
          </a-form>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
.setup {
  .ant-input-affix-wrapper,
  .ant-input {
    @apply !appearance-none my-1 border-1 border-solid border-primary border-opacity-50 rounded;
  }

  .password {
    input {
      @apply !border-none !m-0;
    }
  }
}
</style>
