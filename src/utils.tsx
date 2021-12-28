import { h } from "vue";
import { NText } from "naive-ui";
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timer: number;
  return (...args: T) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      // func(...args);
      func.apply(undefined, args);
    }, delay);
  };
};

// 文章导航实现
export const getTitles = (pattern: string) => {
  const flatNodes = [];
  const groupMap = new Map();
  const list = new Map();
  const currentGroup: Record<string, string> = {};
  // 讲所有标题拿出来
  for (let i = 1; i <= 6; i++) {
    flatNodes.push(...document.querySelectorAll(`h${i}.heading`));
  }

  // 给他们排个序
  flatNodes.sort((a, b) => {
    const r = a.compareDocumentPosition(b);
    switch (r) {
      case 2:
        return 1;
      case 4:
        return -1;
    }
    return 0;
  });

  const getGroup = (level: number) => {
    return currentGroup[level.toString()];
  };
  const clearSons = (level: number) => {
    for (const i of Array(6 - level).keys()) {
      Reflect.deleteProperty(currentGroup, (level + i + 1).toString());
    }
  };
  // 逐个遍历生成树
  flatNodes.forEach((node, index) => {
    const level = node.nodeName[1];
    clearSons(Number(level));
    const id = `L${level}-I${index + 1}`;
    currentGroup[level] = id;
    const item = {
      level,
      label: node.textContent || "",
      key: id,
      indent: 0,
      // suffix: () => h("i", { id, class: "outline-item-anchor" }),
      // @ts-ignore
      suffix: () => (
        // @ts-ignore
        <NText depth="3" id={id} class="outline-prefix">
          H{level}
        </NText>
      ),
      getRect: () => node.getClientRects(),
      scroll: () =>
        node.scrollIntoView({
          behavior: "smooth",
        }),
      children: undefined,
      fid: "",
    };
    list.set(id, item);
    groupMap.set(id, item);

    let fl = Number(level) - 1;
    let f: { indent: number; children: any[] } | null = null;
    // let indent = 0;
    for (;;) {
      if (fl === 0) {
        return;
      }
      // 获得分组
      const group = getGroup(fl);
      f = list.get(group);
      // item.indent = indent;
      // 有直接父元素的
      if (f) {
        // @ts-ignore
        item.fid = f.key;
        break;
      }
      fl = fl - 1;
      // indent = indent + 1;
    }
    if (!f.children) {
      f.children = [];
    }

    f.children.push(list.get(id));
    groupMap.delete(id);
  });
  return {
    list: [...list.values()],
    tree: [...groupMap.values()],
  };
};
