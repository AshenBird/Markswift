import { provide, Ref, ref, watch } from "vue";
import { EditorRef } from "@milkdown/vue";
import { Editor, editorViewCtx, parserCtx } from "@milkdown/core";
import { Slice } from "prosemirror-model";
export abstract class Adapter {
  protected create = ref(() => {}) as Ref<() => void>;
  protected editorRef = ref() as Ref<EditorRef>;
  protected content = ref("");
  protected ready = ref(false);
  protected dialog = ref();
  config = ref({
    theme: "dark",
    uri: "",
    eol: "LF",
    mode: "edit",
  });
  protected title = ref("untitled.md");

  protected abstract save():void

  protected abstract onEdit(newValue:string, oldValue:string):void

  protected abstract onReady():void

  constructor(){
    watch(this.content, (n, o) => {
      this.onEdit(n,o)
    });

    watch(this.ready, (n, o) => {
      if (!n) {
        return;
      }
      this.onReady()
    });
  }
  protected restart(){
    const editor = this.editorRef.value.get() as Editor;
    editor.action(async (ctx) => {
      const view = ctx.get(editorViewCtx);
      view.dom.parentElement?.remove();
      this.ready.value = false;
      await this.create.value();
    });
  }
  protected updateContent(markdown: string){
    if (typeof markdown !== "string") {
      return;
    }
    const editor = this.editorRef.value.get() as Editor;
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const parser = ctx.get(parserCtx);
      const doc = parser(markdown);
      if (!doc) {
        return;
      }
      this.content.value = markdown;
      const state = view.state;
      view.dispatch(
        state.tr.replace(
          0,
          state.doc.content.size,
          new Slice(doc.content, 0, 0)
        )
      );
    });
  };

  public provide(){
    provide("create", this.create);
    provide("editorRef", this.editorRef);
    provide("content", this.content);
    provide("ready", this.ready);
    provide("config", this.config);
    provide("title", this.title);
    provide("save", this.save.bind(this));
    provide("dialog",this.dialog)
  }
}
