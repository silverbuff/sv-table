import { isEmpty, cloneDeep } from "lodash-es";
import type { IPostDataType, ISearchConfig } from "./interface";

/** 查询参数转换 */
export const searchTransform = (
  param: any,
  columns: any[],
  searchConfig: ISearchConfig
) => {
  /** 参数转换（全局） */
  const searchParam = searchConfig.transform(cloneDeep(param));
  /** 参数转换（单个） */
  columns?.forEach((ele: any) => {
    if (ele?.filterConfig?.transform) {
      const paramVal = searchParam[ele.dataIndex];
      let result = {};
      if (paramVal) {
        result = ele.filterConfig.transform(paramVal);
      }
      if (!isEmpty(result) && !Object.keys(result).includes(ele.dataIndex)) {
        Reflect.deleteProperty(searchParam, ele.dataIndex);
      }
      Object.assign(searchParam, result);
    }
  });
  return searchParam;
};

/** postData数据转换管道 */
export const postDataPipline = (
  val: any[],
  postData: IPostDataType[] | IPostDataType | undefined
) => {
  const data = cloneDeep(val);
  if (!postData) {
    return data;
  }
  if (!Array.isArray(postData) && typeof postData === "function") {
    return postData(data);
  }
  return postData.reduce((pre, postData) => {
    return postData(pre);
  }, data);
};

/** 正规化分页条数 */
export const formatSize = (num: number): number => {
  let size = 10;
  if (num >= 20 && num < 30) {
    size = 20;
  } else if (num >= 30 && num < 40) {
    size = 30;
  } else if (num >= 40 && num < 50) {
    size = 40;
  } else if (num >= 50) {
    size = 50;
  }
  return size;
};

/** 递归获取columns中的slots */
export const getRecSlots = (arr: any[]) => {
  let result: any[] = [];
  arr.forEach((item: any) => {
    //如果当前对象有slots 属性，添加到结果中
    if (item.slots) {
      result.push(item.slots);
    }
    // 如果当前对象有 children 属性且是数组，递归调用
    if (Array.isArray(item.children)) {
      result = result.concat(getRecSlots(item.children));
    }
  });
  return result;
};
