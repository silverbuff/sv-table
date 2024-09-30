<template>
  <a-pagination
    class="pagination"
    v-if="paginationConfig?.paginationShow && !isFront"
    :total="pageParam.total"
    :page-size="pageParam.size"
    v-model:current="pageParam.current"
    v-bind="paginationConfig"
    @change="pageChange"
    @showSizeChange="showSizeChange"
  >
  </a-pagination>
</template>
<script lang="ts" setup>
import { PropType, toRefs } from "vue";
import type { IPageParamType, IPaginationConfig } from "../interface";
const emit = defineEmits(["query"]);
const props = defineProps({
  pageParam: { type: Object as PropType<IPageParamType>, required: true },
  paginationConfig: { type: Object as PropType<IPaginationConfig> },
  isFront: { type: Boolean as PropType<Boolean> },
});
const { pageParam } = toRefs(props);

/** 页面内展示记录条数 */
const showSizeChange = (current: number, pageSize: number) => {
  emit("query", {
    ...pageParam.value,
    current: current,
    size: pageSize,
  });
};
/** 分页切换 */
const pageChange = (pageNumber: number) => {
  emit("query", {
    ...pageParam.value,
    current: pageNumber,
  });
};
</script>

<style scoped>
.pagination {
  text-align: right;
  margin: 16px 0px;
}
</style>
