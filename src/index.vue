<template>
  <div class="page-container">
    <!-- 头部插槽 -->
    <slot name="sv_header" :searchInfo="searchInfo"></slot>
    <!-- 查询表单 -->
    <SearchField
      ref="searchFieldRef"
      :columns="columns"
      :searchConfig="searchConfig"
      @query="query"
    >
      <!-- 配置表单插槽透传，配置_search_和列表record做区分 -->
      <template
        v-for="(item, index) in searchSlots"
        :key="index"
        #[`sv_search_${item}`]="{ config }"
      >
        <slot :name="`sv_search_${item}`" :config="config"></slot>
      </template>

      <!-- 透传查询插槽 -->
      <template #sv_search="{ config }">
        <slot name="sv_search" :config="config"></slot>
      </template>
    </SearchField>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div>
        <slot name="sv_title" :searchInfo="searchInfo">
          <!-- title -->
          <div class="table-title">{{ headerTitle }}</div>
        </slot>
      </div>
      <!-- 工具条插槽 -->
      <div>
        <slot name="sv_toolbar" :searchInfo="searchInfo"></slot>
      </div>
    </div>

    <!-- 列表区域 -->
    <SearchTable
      v-bind="$attrs"
      :columns="columns"
      :loading="loading"
      :dataSource="dataList || []"
      :pageParam="pageParam"
      :isFront="isFront"
      :paginationConfig="paginationConfig"
      @query="query"
    >
      <template
        v-for="(item, index) in tableSlots"
        :key="index"
        #[item]="{ record }"
      >
        <slot :name="item" :record="record"></slot>
      </template>
    </SearchTable>

    <a-row>
      <a-col :span="12" :style="{ lineHeight: '32px' }">
        <slot name="sv_footer" :searchInfo="searchInfo"></slot>
      </a-col>
      <a-col :span="12">
        <Pagination
          :pageParam="pageParam"
          :isFront="isFront"
          :paginationConfig="paginationConfig"
          @query="query"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup generic="T extends Record<string,any>">
import { ref, PropType, Ref, toRefs } from "vue";
import SearchField from "./search-field/index.vue";
import {
  useSearchConfig,
  useSlots,
  usePolling,
  useBuildRef,
  useBuildSearchInfo,
  usePaginationConfig,
} from "./hooks/table";
import { useSvTableQuery } from "./hooks/useSvTableQuery";
import type {
  IPageParamType,
  IPostDataType,
  ISearchConfig,
  IPaginationConfig,
  IColumnWithFilterConfig,
} from "./interface";
import SearchTable from "./search-table/index.vue";
import Pagination from "./pagination/index.vue";
import { PAGINATION_DEFAULT } from "./config";

const props = defineProps({
  headerTitle: { type: String as PropType<string> },
  columns: {
    type: Array as PropType<IColumnWithFilterConfig<T>[]>,
    required: true,
  },
  request: {
    type: Function as PropType<
      (
        pageParam: IPageParamType,
        filter: Object
      ) => Promise<{ data: any[]; total: number }>
    >,
  },
  /** 搜素配置 */
  search: {
    type: [Boolean, Object] as PropType<false | Partial<ISearchConfig>>,
    default: undefined,
  },
  /** 静态数据 */
  dataSource: {
    type: Object as PropType<any[]>,
  },
  /** 额外参数 */
  params: {
    type: Object as PropType<Object>,
    default: () => {},
  },
  /** 轮询 */
  polling: { type: Number as PropType<Object> },
  /** 对通过 request 获取的数据进行处理 */
  postData: {
    type: [Function, Array] as PropType<Array<IPostDataType> | IPostDataType>,
  },
  /** 列表实例 */
  actionRef: { type: Object as PropType<any>, default: () => {} },
  /** 表单实例子 */
  formInfo: {
    type: Object as PropType<
      { ref: any; filters: any; realReq: any } | Record<string, any>
    >,
    default: () => {},
  },
  /** 数据加载完成执行 */
  onLoad: {
    type: Function as PropType<(arr) => void>,
    default: () => {},
  },
  /** 数据加载失败时出触发 */
  onRequestError: {
    type: Function as PropType<(arr) => void>,
  },
  /** 页面配置 */
  pagination: {
    type: [Boolean, Object] as PropType<false | Partial<IPaginationConfig>>,
    default: () => PAGINATION_DEFAULT,
  },
  /** 防抖时间 */
  debounceTime: {
    type: Number as PropType<number>,
    default: () => 10,
  },
});

/** 查询表单实例 */
const searchFieldRef = ref();
/** 搜索配置正规化 */
const searchConfig: Ref<ISearchConfig> = useSearchConfig(props);
/** 分页配置正规化 */
const paginationConfig: Ref<IPaginationConfig> = usePaginationConfig(props);
/** 获取插槽 */
const { tableSlots, searchSlots } = useSlots(props);
/** 数据获取 */
const { query, dataList, loading, pageParam, isFront } = useSvTableQuery(
  toRefs(props),
  searchFieldRef,
  searchConfig,
  paginationConfig
);
/** 搜索信息 */
const searchInfo = useBuildSearchInfo(searchFieldRef);
/** 支持轮询 */
usePolling(props, query);
/** 配置actionRef和formRef */
useBuildRef(props, query, searchFieldRef);
/** 导出 */
defineExpose({ reload: query, searchFieldRef });
</script>

<style scoped>
.page-container {
  background-color: #fff;
  margin: 10px;
  padding: 10px;
  min-height: calc(100% - 20px);
  border-radius: 5px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  overflow: auto;
}
.toolbar .table-title {
  font-size: 18px;
  font-weight: 500;
}
</style>
