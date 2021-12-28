<script setup lang="ts">
import { inject, nextTick, ref, watch, Ref, toRaw } from "vue";
import { NTree, NInput, TreeOption } from "naive-ui";
import { OutlineTreeOption } from "./App.vue";
import { Key } from "naive-ui/lib/tree/src/interface";
const pattern = inject("pattern", ref(""));
const selectedKeys = inject<Ref<Key[]>>("selectedKeys", ref([]));
const expandedKeys = inject<Ref<Key[]>>("expandedKeys", ref([]));
const flatOutline = inject<Ref<OutlineTreeOption[]>>("flatOutline", ref([]));
const outline = inject("outline") as Ref<OutlineTreeOption[]>;
const scrollLock = inject("scrollLock", ref(false));
const lastScrollTime = inject("lastScrollTime", ref(0));
const tree = ref();
const defaultExpandedKeys = ref<Key[]>([]);
// 通过监听控制展开的大纲等级
watch(
  flatOutline,
  async (n, o) => {
    await nextTick();
    const r = new Set(expandedKeys.value)
    const oKeys = new Set(o?.map((item) => item.key as Key) || []);
    flatOutline.value.forEach((item) => {
      if (oKeys.has(item.key as Key)) return;
      if (!item.fid) return;
      r.add(item.fid as Key)
    });
    expandedKeys.value = [...r]
    // expandedKeys.value.push(item.fid as Key);
    // expandedKeys.value.push(...r)
  },
  {
    immediate: true,
    deep: true,
  }
);

// 展开事件响应
const outlineExpendChange = ((
  keys: Key[],
  list: (OutlineTreeOption | null)[]
) => {
  console.log(keys.length,expandedKeys.value.length)
  expandedKeys.value = keys;
}) as (value: Key[], option: Array<TreeOption | null>) => void;

// 大纲元素被点击时的响应
const outlineSelected = ((
  keys: (string | number)[],
  list: (OutlineTreeOption | null)[]
) => {
  selectedKeys.value = keys;
  if (list.length > 0) {
    scrollLock.value = true;
    list[0]?.scroll();
    const timer = setInterval(() => {
      if (Date.now() - lastScrollTime.value <= 200) return;
      scrollLock.value = false;
      clearInterval(timer);
    }, 200);
  }
}) as (value: Key[], option: Array<TreeOption | null>) => void;

// 匹配搜索条件
const onPatternChange = (text: string) => {
  pattern.value = text;
  const flatNodes = [];
  flatNodes.push(...document.querySelectorAll(`.n-tree-node-wrapper`));
  flatNodes.forEach((node) => {
    if (
      (
        node.querySelector(".n-tree-node-content__text") as HTMLElement
      ).innerHTML.includes(text)
    ) {
      (node as HTMLElement).style.display = "";
      return;
    }
    if (text) {
      (node as HTMLElement).style.display = "none";
    }
  });
};
</script>
<template>
  <div class="outline-container">
    <n-tree
      :ref="tree"
      default-expand-all
      :default-expanded-keys="defaultExpandedKeys"
      :expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      :watch-props="['defaultExpandedKeys']"
      selectable
      :data="outline"
      block-node
      @update:selectedKeys="outlineSelected"
      @update:expandedKeys="outlineExpendChange"
    />
    <div class="outline-search">
      <n-input :value="pattern" @input="onPatternChange" placeholder="搜索" />
    </div>
  </div>
</template>
<style>
.outline-search {
  background-color: var(--color);
  position: absolute;
  left: 0;
  right: 15px;
  top: 0;
  padding: 15px;
  padding-right: 0;
  padding-top: 10px;
  z-index: 1;
}
</style>
