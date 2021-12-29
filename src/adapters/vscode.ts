import { ref,  } from "vue";
import { Adapter } from "./Adapter";

export class VscodeAdapter extends Adapter {
  private vscode?: {
    postMessage: (...args: any[]) => void;
    setState:(...args: any[]) => void;
  };
  private serverLock = ref(false);
  constructor() {
    super();
    // @ts-ignore
    if (window.acquireVsCodeApi) {
      // @ts-ignore
      this.vscode = acquireVsCodeApi();
      // @ts-ignore
      const state = this.vscode.getState();
      if (state?.text) {
        this.content.value = state.text;
      }
      // 监听 vscode 
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.type) {
          case "change": {
            const text = message.text;
            this.title.value = message.title;
            this.serverLock.value = true;
            this.updateContent(text);
            return;
          }
          case "restart": {
            this.restart();
            return;
          }
          case "config": {
            this.config.value = message.content;
            return;
          }
        }
      });
    }
  }
  protected save() {
    const vsc = this.vscode;
    vsc &&
      vsc.postMessage({
        type: "save",
      });
  }
  protected onEdit(n:string): void {
    if(!this.vscode)return;
    if (this.serverLock.value) {
      this.serverLock.value = false;
      return;
    }
    
    this.vscode.setState({ n });
    this.vscode.postMessage({
      type: "change",
      content: n,
    });
  }
  protected onReady(){
    const vsc = this.vscode
    vsc&&vsc.postMessage({
      type: "ready",
    });
  }
}
