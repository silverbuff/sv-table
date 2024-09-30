import moment from "moment";
import { IFetchFieldsConfig, ISearchConfig } from "./interface";

/** 分页查询参数默认值 */
export const INIT_PAGE_PARAM = {
  total: 0,
  current: 1,
  size: 10,
  sortMap: {},
  filterMap: {},
};

/** 分页配置默认值 */
export const PAGINATION_DEFAULT = {
  paginationShow: true,
  disabled: false,
  size: 10,
  simple: false,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "30", "40", "50"],
  showTotal: (total: number) => `共${total}条记录`,
};

export const RANGES = {
  今天: [moment().startOf("day"), moment().endOf("day")],
  最近3天: [moment().startOf("day").subtract(2, "day"), moment().endOf("day")],
  最近7天: [moment().subtract(1, "week").startOf("day"), moment().endOf("day")],
  最近1个月: [
    moment().subtract(1, "months").startOf("day"),
    moment().endOf("day"),
  ],
};

/** fetch默认配置 */
export const FETCH_FIELDS_CONFIG_DEFAULT: IFetchFieldsConfig = {
  sortMapKey: "sortMap",
  currentKey: "pageNum",
  sizeKey: "pageSize",
  filtersKey: "param",
  dataKey: "records",
  totalKey: "total",
  ascKey: "ascend",
  descKey: "descend",
  successCode: 200,
  isFlat: false,
  transform: (val) => val,
};

/** 搜索默认配置 */
export const SEARCH_CONFIG_DEFAULT: ISearchConfig = {
  searchShow: true,
  searchText: "查询",
  resetText: "重置",
  defaultCollapsed: true,
  span: 8,
  wrapperCol: { span: 18 },
  labelCol: { span: 6 },
  rules: {},
  searchMinSpan: 8,
  transform: (val) => val,
  validator: () => true,
};
