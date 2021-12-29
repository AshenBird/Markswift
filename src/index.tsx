import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NLoadingBarProvider,
  NNotificationProvider,
} from "naive-ui";
import { darkTheme } from "naive-ui";
import { computed, defineComponent } from "vue";
import { Adapter } from "./adapters/Adapter";
import App from "./App.vue";
import adapters from "./adapters";

export const createEditor = (adapter: Adapter) =>
  defineComponent(() => {
    adapter.provide();

    // 主题配置
    const theme = computed(() =>
      adapter.config.value.theme === "dark" ? darkTheme : null
    );

    return () => (
      <NConfigProvider theme={theme.value}>
        <NNotificationProvider>
          <NMessageProvider>
            <NLoadingBarProvider>
              <NDialogProvider>
                <App />
              </NDialogProvider>
            </NLoadingBarProvider>
          </NMessageProvider>
        </NNotificationProvider>
      </NConfigProvider>
    );
  });

export {default as adapters} from "./adapters";

export default {
  createEditor,
  adapters
};
