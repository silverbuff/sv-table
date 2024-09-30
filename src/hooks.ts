import { ref, Ref, computed, watchEffect } from "vue";
import type { UnwrapRefSimple } from "@vue/composition-api";
import { message } from "ant-design-vue";
import { cloneDeep } from "lodash-es";
import { FETCH_FIELDS_CONFIG_DEFAULT } from "./config";
import {
  IFetchFieldsConfig,
  IUseFetchDataReturn,
  IOptionItem,
  IPageParamType,
} from "./interface";

/** 列表查询 */
export function useFetchData<T = any>(
  fetchIns: (
    param: any
  ) => Promise<{ code: string | number; data: any; msg: string }>,
  configPartial?: Partial<IFetchFieldsConfig>
): IUseFetchDataReturn<T> {
  const loading = ref<boolean>(false);
  const totalNum = ref<number>(0);
  const dataCurrent = ref<any[]>([]);
  /** 导出排序参数 */
  const sortInfo = ref<any>({});
  const result = ref<{ data: any[]; total: number }>({ data: [], total: 0 });
  /** 支持缺省配置 */
  const config: IFetchFieldsConfig = Object.assign(
    cloneDeep(FETCH_FIELDS_CONFIG_DEFAULT),
    configPartial
  );
  /** 获取列表数据 */
  const fetchData = async (
    pageParam: IPageParamType,
    filters: Record<string, any> = {}
  ): Promise<{ data: UnwrapRefSimple<T>[]; total: number }> => {
    /** filterMap暂不支持 */
    const { current, size, sortMap } = pageParam;
    /** 升降序字段映射 */
    Object.keys(sortMap).forEach((ele: string) => {
      sortMap[ele] = sortMap[ele] === "ascend" ? config.ascKey : config.descKey;
    });

    try {
      loading.value = true;
      /** 根据字段映射配置查询体 param */
      let param = {
        [config.currentKey]: current,
        [config.sizeKey]: size,
        [config.sortMapKey]: sortMap,
      };
      /** 记录sortMap */
      sortInfo.value = cloneDeep(sortMap);
      const filterParam = cloneDeep(filters);
      if (config.isFlat) {
        param = { ...param, ...filterParam };
      } else {
        Object.assign(param, { [config.filtersKey]: filterParam });
      }
      /** 获取数据 */
      const { code, data, msg } = await fetchIns(param);
      if (code === config.successCode) {
        /** 响应体中数据结构中有records和total */
        const { [config.dataKey]: records = [], [config.totalKey]: total = 0 } =
          data;
        totalNum.value = total;
        result.value = { data: config.transform(records), total };
        dataCurrent.value = cloneDeep(config.transform(records));
        return result.value;
      } else {
        message.error(msg || "获取数据失败，请重试！");
      }
    } catch (error) {
      message.error("获取数据失败，请重试！");
    } finally {
      loading.value = false;
      return result.value;
    }
  };
  return {
    fetchData,
    loading,
    total: totalNum,
    dataSource: dataCurrent,
    sortMap: sortInfo,
  };
}

/** 表单枚举名称映射 */
export const useGetEnumName = (): Ref<
  (list: IOptionItem[], value: string | number) => string | number
> => {
  return computed(() => {
    return (list: IOptionItem[], value: string | number): string | number =>
      list?.find((ele) => ele.value === value)?.label || value;
  });
};

/** 配置查询表单下拉枚举 */
export const useDecoratedColumn = (
  decColumns: any[],
  listMap?: Ref<Record<string, any>>
): {
  columns: Ref<any[]>;
  getEnumName: Ref<
    (
      list: (IOptionItem & { [props: string]: any })[],
      value: string | number
    ) => string | number
  >;
} => {
  /** 配置下拉枚举 */
  const columns = ref(cloneDeep(decColumns));
  /** 表单枚举名称映射 */
  const getEnumName = useGetEnumName();

  watchEffect(() => {
    if (listMap) {
      columns.value.forEach((ele) => {
        for (const key in listMap.value) {
          /** 配置了查询项并且 */
          if (ele.dataIndex === key && ele?.filterConfig) {
            /** 没有配置fieldProps字段 */
            if (!ele?.filterConfig?.fieldProps) {
              ele.filterConfig.fieldProps = {
                options: [],
              };
            }
            /** 配置了fieldProps字段，但是没有options字段 */
            if (!ele?.filterConfig?.fieldProps?.options) {
              ele.filterConfig.fieldProps.options = [];
            }
            ele.filterConfig.fieldProps.options = listMap.value[key];
          }
        }
      });
    }
  });
  return { columns, getEnumName };
};

/**
 * 字段转换hooks
 * @param {string[]} fields - 要转换到字段
 * @param {Function} transform - 转换方法
 * @return {Function} - 转换函数
 */
export function useFieldsTransform(
  fields: string[],
  transform: Function
): Function {
  return (list: any[]) => {
    const result = cloneDeep(list);
    result.forEach((ele) => {
      for (const key in ele) {
        if (fields.includes(key)) {
          ele[key] = transform(ele[key]);
        }
      }
    });
    return result;
  };
}
