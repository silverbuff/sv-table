import { Ref } from "vue";
import { FormItemProps } from "ant-design-vue";
import type { ColumnProps } from "ant-design-vue/lib/table/interface";
import type { UnwrapRefSimple } from "@vue/composition-api";
import type { IFilterExtra } from "./search-field/interface";

/** 分页查询参数 */
export type IPageParamType = {
  total: number;
  current: number;
  size: number;
  sortMap: Record<string, string>;
  filterMap: Record<string, any>;
};

/** 分页配置 */
export type IPaginationConfig = {
  paginationShow: boolean;
  disabled: boolean;
  size: number;
  simple: boolean;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
  showTotal: (total: number) => string;
  [props: string]: any;
};

/** 搜索配置 */
export type ISearchConfig = {
  /** 是否展示搜索 */
  searchShow: boolean;
  /** 搜索按钮文本 */
  searchText: string;
  /** 重置按钮文本 */
  resetText: string;
  /** 默认折叠 */
  defaultCollapsed: boolean;
  /** 网格设置 */
  span: number;
  /** 表单项设置 */
  wrapperCol: object;
  /** 表单标题设置 */
  labelCol: Object;
  /** 表单校验 */
  rules: object;
  /** 搜索项内嵌最小span */
  searchMinSpan: number;
  /** 查询前的全局转换 */
  transform: (val: any) => any;
  /** 提交时的校验逻辑 */
  validator: (filters: any) => boolean;
};

/** 数据请求配置 */
export type IFetchFieldsConfig = {
  /** 排序字段映射 */
  sortMapKey: string;
  /** 当前页字段映射 */
  currentKey: string;
  /** 条数字段映射 */
  sizeKey: string;
  /** 排序字段映射 */
  filtersKey: string;
  /** 数据字段映射 */
  dataKey: string;
  /** 总数字段映射 */
  totalKey: string;
  /** 参数是否扁平化 */
  isFlat: boolean;
  /** 成功状态吗 */
  successCode: number | string;
  /** 升序字段映射 */
  ascKey: string;
  /** 降序字段映射 */
  descKey: string;
  /** 查询返回数据转换 */
  transform: (val: any[]) => any[];
};

export interface IUseFetchDataReturn<T> {
  fetchData: (
    pageParam: IPageParamType,
    filters?: Record<string, any>
  ) => Promise<{ data: UnwrapRefSimple<T>[]; total: number }>;
  loading: Ref<boolean>;
  total: Ref<number>;
  dataSource: Ref<any[]>;
  sortMap: Ref<object>;
}

/** 核心配置项 */
interface IFilterCustom {
  /** 筛选项表单类型 */
  type: "input" | "input-number" | "select" | "range-picker" | "date-picker";
  /** 初始值 */
  initValue: any;
  /** 定制顺序索引 */
  order: number;
  /** 是否支持折叠 */
  foldAble: boolean;
  /** 自定义插槽名 */
  renderSlot: string;
  /** 是否在列表中隐藏 */
  hideInTable: boolean;
  /** 参数转换 */
  transform: Function;
  /** 单个表单项的span */
  span: number;
}

/** 不同类型表单项通用 */
interface IFormItemField {
  /** 筛选项下拉枚举 */
  options: any;
  /** placeholder */
  placeHolder: string;
  /** 时间选择快捷选择 */
  ranges: any;
  /** 时间选择，格式设置 */
  format: string;
  /** onChange事件 */
  onChange: (
    val: any,
    filters: undefined | any,
    filterProps: undefined | (IFilterConfig & IFilterExtra)[]
  ) => void;
  /** 兜底 */
  [props: string]: any;
}

/** 表单配置类型 */
export type IFilterConfig = {
  /** form-item配置 */
  itemProps?: FormItemProps;
  /** 具体表单项配置 */
  fieldProps?: Partial<IFormItemField>;
} & Partial<IFilterCustom>;

/** 枚举下拉 */
export type IOptionItem<T extends string | number = string> = {
  label: string;
  value: T;
};

/** postData */
export type IPostDataType = (val: any[]) => any[];

/** 添加了表单配置到column类型 */
export type IColumnWithFilterConfig<T extends Record<string, any> = {}> = {
  filterConfig?: IFilterConfig;
} & Override<ColumnProps, "dataIndex", keyof T | string>;

/** 类型覆写 */
export type Override<T, K extends keyof T, V> = Omit<T, K> & { [P in K]: V };

/** filter对象字段类型重置 */
export type ResetFieldType<T extends Record<string, any>> = {
  [P in keyof T]: any;
};
