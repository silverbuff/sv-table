import { Ref, computed, ref, onMounted, onUnmounted } from "vue";
import { cloneDeep } from "lodash-es";
import { SEARCH_CONFIG_DEFAULT, PAGINATION_DEFAULT } from "../config";
import type { ISearchConfig } from "../interface";
import { formatSize, getRecSlots } from "../utils";

/** 筛选项正规化 */
export const useSearchConfig = (props: any): Ref<ISearchConfig> => {
  return computed(() => {
    if (typeof props.search === "boolean") {
      return Object.assign(cloneDeep(SEARCH_CONFIG_DEFAULT), {
        searchShow: props.search,
      });
    } else if (typeof props.search === "object") {
      return Object.assign(cloneDeep(SEARCH_CONFIG_DEFAULT), props.search);
    }
    return cloneDeep(SEARCH_CONFIG_DEFAULT);
  });
};

/** 页面配置正规化 */
export const usePaginationConfig = (props: any) => {
  return computed(() => {
    if (typeof props.pagination === "boolean") {
      return Object.assign(cloneDeep(PAGINATION_DEFAULT), {
        paginationShow: props.pagination,
      });
    } else if (typeof props.pagination === "object") {
      /** 分页显示条数只能在[10,20,30,40,50]中 */
      Object.assign(props.pagination, {
        size: formatSize(props.pagination.size),
      });
      return Object.assign(cloneDeep(PAGINATION_DEFAULT), props.pagination);
    }
    return cloneDeep(PAGINATION_DEFAULT);
  });
};

/** 列表展示字段，支持hideInTable */
export const useDisplayColumns = (props: any): Ref<any[]> => {
  return computed(() =>
    (props.columns || []).filter((ele: any) => !ele.filterConfig?.hideInTable)
  );
};

/** 列表项自定义插槽 */
export const useTableSlots = (props: any): Ref<string[]> => {
  /** 返回所有slot下的所有插槽 */
  return computed(() => {
    const slotsItemList = getRecSlots(props.columns);
    /** 全部slots */
    const slots: string[] = [];
    slotsItemList.forEach((ele: any) => {
      const arr = Object.keys(ele);
      arr.forEach((item: string) => {
        slots.push(ele[item]);
      });
    });
    return slots;
  });
};

/** 表单项自定义插槽 */
export const useSearchSlots = (props: any): Ref<any[]> => {
  return computed(() => {
    /** 全量slots */
    let slots: string[] = [];
    /** 添加renderSlot插槽 */
    slots = (props.columns || [])
      .filter((ele: any) => ele.filterConfig?.renderSlot)
      .map((ele: any) => ele.filterConfig.renderSlot);
    return slots;
  });
};

/** 自定义插槽 */
export const useSlots = (props: any) => {
  const tableSlots = useTableSlots(props);
  const searchSlots = useSearchSlots(props);
  return { tableSlots, searchSlots };
};

/** 轮询 */
export const usePolling = (props: any, query: Function) => {
  const timer: any = ref(null);
  onMounted(() => {
    if (typeof props.polling === "number" && !timer.value) {
      timer.value = setInterval(() => {
        query();
      }, props.polling);
    }
  });
  onUnmounted(() => {
    clearInterval(timer.value);
    timer.value = null;
  });
};

/** actionRef挂载方法 */
export const useBuildRef = (
  props: any,
  query: Function,
  searchFieldRef: any
) => {
  onMounted(() => {
    /** 设置actionRef */
    if (typeof props.actionRef === "object" && props.actionRef !== null) {
      const obj = { reload: query, reset: searchFieldRef.value.onReset };
      Object.assign(props.actionRef, obj);
    }
    /** 设置formInfo */
    if (typeof props.formInfo === "object" && props.formInfo !== null) {
      const obj = {
        ref: searchFieldRef.value.formRef,
        filters: searchFieldRef.value.filters,
        realReq: searchFieldRef.value.realReq,
        apiParam: searchFieldRef.value.apiParam,
      };
      Object.assign(props.formInfo, obj);
    }
  });
};

/** 生成formInfo */
export const useBuildSearchInfo = (searchFieldRef: any) => {
  return computed(() => {
    return {
      ref: searchFieldRef.value?.formRef,
      filters: searchFieldRef.value?.filters,
      realReq: searchFieldRef.value?.realReq,
      apiParam: searchFieldRef.value?.apiParam,
    };
  });
};
