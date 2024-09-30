import { Ref, ref, onMounted } from "vue";
import { cloneDeep, pick,debounce } from "lodash-es";
import { INIT_PAGE_PARAM } from "../config";
import type {
  ISearchConfig,
  IPaginationConfig,
  IPageParamType,
} from "../interface";
import { searchTransform, postDataPipline } from "../utils";

/** 数据查询 */
export const useSvTableQuery = (
  props: any,
  searchFieldRef: any,
  searchConfig: Ref<ISearchConfig>,
  paginationConfig: Ref<IPaginationConfig>
) => {
  /** 解构参数 */
  const {
    dataSource,
    request,
    params,
    columns,
    postData,
    onLoad,
    onRequestError,
    debounceTime,
  } = props;
  /** 列表数据 */
  const dataList = ref<any[]>([]);
  /** 查询接口loading */
  const loading = ref<boolean>(false);
  /** 分页参数 */
  const pageParam = ref<IPageParamType>({
    ...INIT_PAGE_PARAM,
    ...{ size: paginationConfig.value.size },
  });
  /** 是否前端分页 */
  const isFront = ref<boolean>(!!dataSource.value);
  /** 列表查询 */
  const query = debounce(async (
    page: IPageParamType = Object.assign(
      cloneDeep(INIT_PAGE_PARAM),
      pick(pageParam.value, ["size", "sortMap", "filterMap"])
    )
  ) => {
    /** 传入dataSource,并且为有效值时，以dataSource为主，退化为一般table,不支持搜索，支持前端分页 */
    if (Array.isArray(dataSource.value)) {
      /** 静态列表数据，前段分页 */
      dataList.value = cloneDeep(dataSource.value);
    } else if (request.value) {
      /** 传入request,主要区分是否设置search:false情况 */
      /** 初始化查询接口参数 */
      let searchParam = cloneDeep(params.value);
      /** search非false场景 */
      if (searchConfig.value.searchShow) {
        /** 校验 */
        if (
          !searchConfig.value.validator(
            cloneDeep(searchFieldRef.value?.filters)
          )
        ) {
          return;
        }
        /** 合入查询参数 */
        searchParam = Object.assign(
          cloneDeep(searchFieldRef.value?.filters),
          searchParam
        );
        /** 参数转换 */
        searchParam = searchTransform(
          searchParam,
          columns.value,
          searchConfig.value
        );
      }
      /** 开始loading */
      loading.value = true;
      /** 查询数据 */
      pageParam.value = cloneDeep(page);

      try {
        /** 记录转换后最终的参数 */
        Object.assign(searchFieldRef.value?.apiParam,cloneDeep(searchParam))
        /** 请求数据 */
        const { data, total } = await request.value(page, searchParam);
        /** 数据转换通道，支持多个转换 */
        dataList.value = postDataPipline(data, postData.value);
        /** 更新总数值 */
        pageParam.value.total = total;
        /** 触发加载完成函数 */
        onLoad.value(cloneDeep(dataList.value));
      } catch (error) {
        /** 如果没有传递这个方法的话，需要把错误抛出去，以免吞掉错误 */
        if (onRequestError.value == undefined) throw new Error(error as string);
        dataList.value = [];
        /** 执行错误回调 */
        onRequestError.value(error);
      } finally {
        loading.value = false;
      }
    } else {
      dataList.value = [];
    }
  },debounceTime.value)
  /** 初始化查询列表数据 */
  onMounted(() => {
    query();
  });
  return { query, dataList, loading, pageParam, isFront };
};
