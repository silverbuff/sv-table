import { computed, ref, Ref } from "vue";
import { pick } from "lodash-es";
import type { IFilterExtra } from "./interface";
import type { IFilterConfig, ISearchConfig } from "@/interface";
import { itemVisible } from "./utils";

/** 获取需要展示的筛选项 */
export const useFilterProps: any = (columns: Ref<any[]>) => {
  const filterSeq: Ref<IFilterConfig & IFilterExtra[]> = ref([]);
  /** 1.获取需要展示的筛选项，由是否有filterConfig字段来决定 */
  filterSeq.value = (columns.value || [])
    ?.filter((ele: any) => ele.filterConfig)
    .map((ele: any) => ({
      ...ele.filterConfig,
      ...pick(ele, ["title", "dataIndex", "slots"]),
    }));
  /** 2.处理定制顺序，需要全部配置sequence */
  if (filterSeq.value.every((ele: any) => ele.order?.toString())) {
    filterSeq.value.sort((a:any, b:any) => a.order! - b.order!);
  }
  return filterSeq;
};

/** 获取重置对象 */
export const useInitFilter = (filterProps: Ref<any>) => {
  return computed(() => {
    const initFilters: any = {};
    filterProps.value.reduce((pre: any, cur: any) => {
      return Object.assign(pre, {
        [cur.dataIndex]: cur.initValue ?? undefined,
      });
    }, initFilters);
    return initFilters;
  });
};

/** 工具面板右对齐 */
export const useToolSpan = (
  filterProps: Ref<(IFilterConfig & IFilterExtra)[]>,
  collapsed: Ref<boolean>,
  searchdConfig: Ref<ISearchConfig>
): Ref<number> => {
  return computed(() => {
    /** 后续支持插槽，添加插槽情况返回24（预留） */
    /** 需要展示的表单 */
    const visibleItems = filterProps.value.filter((ele) => {
      itemVisible(!!ele.foldAble, collapsed.value);
    });
    let remain = 24;
    visibleItems.forEach((ele: any) => {
      /**实际span */
      const curSpan = ele.span ?? searchdConfig.value.span;
      if (curSpan <= remain) {
        remain -= curSpan;
        if (remain === 0) {
          remain = 24;
        }
      } else {
        remain = 24;
        remain -= curSpan;
      }
    });
    return remain >= searchdConfig.value.searchMinSpan ? remain : 24;
  });
};

/** 是否展示 展开&折叠 按钮 */
export const useIsShowCollapsedButton = (
  filterProps: Ref<(IFilterConfig & IFilterExtra)[]>
): boolean => {
  return filterProps.value.some((ele) => ele.foldAble) ? true : false;
};

/** 显影控制 */
export const useIsSearch = (searchConfig: any) => {
  return computed(() => {
    if (
      typeof searchConfig.searchShow === "boolean" &&
      !searchConfig.searchShow
    ) {
      return false;
    }
    return true;
  });
};
