import type { IFilterExtra } from "./interface";
import type { IFilterConfig } from "../interface";

/** 查询表单项显影控制 */
export const itemVisible = (foldAble: boolean, collapsed: boolean): boolean =>
  !foldAble || !collapsed;

/** select检索设置 */
export const selectFilterName = (input: string, option: any) => {
  return `${option.label}`.includes(`${input || ""}`);
};

/** 获取fieldProps默认值 */
const getFieldPropsDefault = (item: IFilterConfig & IFilterExtra) => {
  let placeholder = "请选择";
  const allowClear = true;
  switch (item.type) {
    case "select":
      break;
    case "input-number": {
      placeholder = "请输入";
      break;
    }
    case "date-picker": {
      break;
    }
    case "range-picker": {
      break;
    }
    default: {
      placeholder = "请输入";
      break;
    }
  }

  placeholder += item.title ?? "";
  return { placeholder, allowClear };
};

/** 获取fieldProps参数，默认+传入值 */
export const buildFieldProps = (item: IFilterConfig & IFilterExtra) => {
  /** 默认placeholder */
  const defaultFieldProps = getFieldPropsDefault(item);
  return {
    ...defaultFieldProps,
    ...item.fieldProps,
  };
};
