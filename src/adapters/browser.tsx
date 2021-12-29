import { Adapter } from "./Adapter";
import { saveAs } from "file-saver";
import { useDialog, NButton, NInput, NText } from "naive-ui";
export class BrowserAdapter extends Adapter {
  constructor() {
    super();
  }
  onEdit() {}
  onReady() {}
  save() {
    
    const _save = () => {
      const blob = new Blob([this.content.value], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, `${this.title.value}`);
      fileNameDialog.destroy();
    };
    const fileNameDialog = this.dialog.value.create({
      title: ()=>(<NText type="success" style={{fontSize:"16px"}}>保存文件</NText>),
      showIcon:false,
      maskClosable:false,
      content: () => (
        <NInput
          value={this.title.value}
          size="small"
          onInput={(v: string) => (this.title.value = v)}
          placeholder="文件名"
          round
        >
        </NInput>
      ),
      action: () => <NButton onClick={_save}>保存</NButton>,
    });
  }
}
