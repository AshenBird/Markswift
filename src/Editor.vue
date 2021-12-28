<script lang="tsx">
import { defineComponent, ref, Ref, inject, watchEffect, watch, nextTick } from "vue";
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewOptionsCtx,
} from "@milkdown/core";
import { vscode as vscodeTheme } from "./theme-vscode/index";
// Github Markdown 语法插件
import { gfm } from "@milkdown/preset-gfm";
// 选词工具栏插件
import { tooltip } from "@milkdown/plugin-tooltip";
// 斜线工具栏插件
import { slash } from "@milkdown/plugin-slash";
// 历史插件
import { history } from "@milkdown/plugin-history";
// 监听器插件
import { listener, listenerCtx } from "@milkdown/plugin-listener";
// 剪贴板插件
import { clipboard } from "@milkdown/plugin-clipboard";
// 协同编辑插件
// import { collaborative, y } from '@milkdown/plugin-collaborative';
// emoji 表情插件
import { emoji } from "@milkdown/plugin-emoji";
// prism 支持的代码高亮插件
import { prism } from "@milkdown/plugin-prism";
// LaTeX 数学公式插件
import { math } from "@milkdown/plugin-math";
// milkdown 的 vue 组件封装
import { VueEditor, useEditor, EditorRef } from "@milkdown/vue";
// 工具函数
import { debounce, getTitles } from "./utils";
// 样式
import "katex/dist/katex.min";

export default defineComponent({
  emits: {
    change: null,
    ready: null,
  },
  props: {
    config: {
      type: Object,
      default: {},
    },
  },
  setup: (props, context) => {
    const create = inject(
      "create",
      ref(() => {})
    );
    const editorRef = inject("editorRef") as Ref<EditorRef>;
    const content = inject("content", ref(""));
    const ready = inject("ready", ref(false));
    const config = inject("config");

    // 大纲
    const outline = inject("outline") as Ref<unknown[]>;
    const flatOutline = inject("flatOutline") as Ref<unknown[]>;
    const pattern = inject("pattern") as Ref<string>;
    const readonly = inject("readonly") as Ref<boolean>;

    const updateOutline = async () => {
      const { tree, list } = getTitles(pattern.value);
      outline.value = tree;
      flatOutline.value = list;
      return outline.value;
    };

    const isOption = ref(false);

    // 编辑器
    const getEditor = ref();
    create.value = () => {
      getEditor.value = useEditor((root) =>
        Editor.make()
          .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, content.value);
            ctx.set(editorViewOptionsCtx, { editable: () => !readonly.value });
            ctx.set(listenerCtx, {
              markdown: [
                debounce(
                  (getMarkdown: () => string) => onChange(getMarkdown),
                  200
                ),
              ],
            });
          })
          .use(vscodeTheme())
          .use(gfm)
          .use(math)
          .use(slash)
          .use(tooltip)
          .use(history)
          .use(listener)
          .use(emoji)
          .use(clipboard)
          .use(prism)
      );
      isOption.value = true;
    };

    // 编辑器内容变更事件响应
    const onChange = (getContent: () => string) => {
      const text = getContent();
      if (content.value === text) return;
      content.value = text;
    };
    watch(content, (n, o) => {
      // if (n === o) return;
      updateOutline();
    });

    create.value();

    const stop = watchEffect(() => {
      if (editorRef.value) {
        const timer = setInterval(async () => {
          const editor = editorRef.value.get() as Editor;
          if (editor) {
            clearInterval(timer);

            context.emit("ready");
            ready.value = true;
            stop();
          }
        }, 100);
      }
    });

    return () =>
      isOption.value ? (
        <VueEditor editor={getEditor.value} editorRef={editorRef} />
      ) : (
        <></>
      );
  },
});
</script>
