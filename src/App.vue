<script setup lang="tsx">
import { ref, provide, computed, inject, Ref } from "vue";

import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NPopselect,
  NIcon,
  NDrawer,
  NDrawerContent,
  NButton,
  TreeOption,
useDialog,
NInput,
} from "naive-ui";

import {
  InformationCircleOutline as InfoIcon,
  Menu as MenuIcon,
} from "@vicons/ionicons5";
import MilkdownEditor from "./Editor.vue";
import OutlineView from "./Outline.vue";
import saveAs from "file-saver";

const config = inject("config") as Ref<Record<string, any>>;
const readonly = ref(config.value.mode === "read");
/** 大纲功能 **/
// 大纲树类型
export interface OutlineTreeOption extends TreeOption {
  scroll: () => void;
}
// 用来检索大纲的数据
const pattern = ref("");
// 大纲树数据
const outline = ref<OutlineTreeOption[]>([]);
// 扁平的大纲数据
const flatOutline = ref<OutlineTreeOption[]>([]);
// 选中的大纲
const selectedKeys = ref<(string | number)[]>([]);
// 展开的大纲层级
const expandedKeys = ref<(string | number)[]>([]);

// 滚动相关
const scrollLock = ref(false);
const lastScrollTime = ref(0);
const onScroll = () => {
  lastScrollTime.value = Date.now();
  if (scrollLock.value) return;
  const rs = [];
  for (const item of flatOutline.value) {
    // @ts-ignore
    const { top } = item.getRect()[0];
    if (top > 0) rs.push([top, item]);
  }
  if (rs.length === 0) return;
  rs.sort((a, b) => a[0] - b[0]);

  selectedKeys.value = [rs[0][1].key];
  const suffix = document.getElementById(rs[0][1].key);
  suffix?.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
};

const editorLeftPadding = ref(60);
const editorStyle = computed(
  () => `
    padding: 20px;
    padding-left: ${editorLeftPadding.value}px;
    padding-bottom: 0;
  `
);

// resize
const getSidebarWidth = () => {
  const limit = 250;
  const w = window.innerWidth;
  const rw = w * 0.2;
  if (w < 800) {
    editorLeftPadding.value = 0;
    return 0;
  }
  editorLeftPadding.value = 60;
  return rw < limit ? limit : rw;
};
const sideWidth = ref(getSidebarWidth());

window.onresize = () => {
  sideWidth.value = getSidebarWidth();
};

const infos = computed(() => [
  {
    label: config.value.uri,
    value: "uri",
  },
  {
    label: `eol: ${config.value.eol}`,
    value: "eol",
  },
]);

const drawerActive = ref(false);
const openDrawer = () => (drawerActive.value = true);

const save = inject("save") as () => void;
const content = inject("content") as Ref<string>;
const title = inject("title") as Ref<string>;
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key == "s" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save();
    }
  },
  false
);

const dialog = inject("dialog") as Ref<any>
dialog.value = useDialog();

// 注入
provide("flatOutline", flatOutline);
provide("outline", outline);
provide("pattern", pattern);
provide("selectedKeys", selectedKeys);
provide("expandedKeys", expandedKeys);
provide("sideWidth", sideWidth);
provide("scrollLock", scrollLock);
provide("lastScrollTime", lastScrollTime);
provide("readonly", readonly);
</script>
<template>
  <n-layout class="top-container" :has-sider="sideWidth !== 0">
    <n-layout-sider
      v-if="sideWidth !== 0"
      :native-scrollbar="false"
      collapse-mode="transform"
      :collapsed-width="0"
      :width="sideWidth"
      show-trigger="bar"
      content-style="
          padding: 15px;
          padding-top: 56px;
        "
      style="height: 100vh"
      bordered
    >
      <outline-view />
    </n-layout-sider>
    <n-layout style="background-color: var(--surface); height: 100vh">
      <n-layout-header
        style="
          height: 54px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 18px;
        "
        bordered
      >
        <Saver/>
        <n-button
          v-if="sideWidth === 0"
          #icon
          strong
          quaternary
          size="small"
          style="margin-right: 8px"
          @click="openDrawer"
        >
          <n-icon>
            <menu-icon></menu-icon>
          </n-icon>
        </n-button>
        <div v-else></div>
        <n-popselect :options="infos" size="medium">
          <n-button
            #icon
            strong
            quaternary
            circle
            size="small"
            style="margin-right: 8px"
          >
            <n-icon>
              <info-icon />
            </n-icon>
          </n-button>
        </n-popselect>
      </n-layout-header>
      <n-layout
        position="absolute"
        :content-style="editorStyle"
        style="top: 54px; background-color: var(--surface)"
        :native-scrollbar="true"
        @scroll="onScroll"
      >
        <milkdown-editor
          class="--markswift-editor"
          @ready="onScroll"
          :config="config"
        />
      </n-layout>
    </n-layout>
  </n-layout>

  <n-drawer v-model:show="drawerActive" :width="300" placement="left">
    <n-drawer-content title="大纲" closable>
      <outline-view />
    </n-drawer-content>
  </n-drawer>
</template>
