<template>
  <a-table
    v-bind="$attrs"
    class="mt-10"
    :loading="loading"
    :columns="displayColumns"
    :data-source="dataSource"
    :pagination="paginationConfig?.paginationShow && isFront"
    @change="tableChange"
  >
    <!-- 配置列表插槽透传 -->
    <template
      v-for="(item, index) in tableSlots"
      :key="index"
      #[item]="{ record }"
    >
      <slot :name="item" :record="record"></slot>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { useTableSlots, useDisplayColumns } from "../hooks/table";
import type { IPageParamType, IPaginationConfig } from "../interface";

const emit = defineEmits(["query"]);
const props = defineProps({
  columns: { type: Array as PropType<any[]>, required: true },
  dataSource: { type: Object as PropType<any[]> },
  loading: { type: Boolean as PropType<boolean> },
  pageParam: { type: Object as PropType<IPageParamType>, required: true },
  isFront: { type: Boolean as PropType<boolean> },
  paginationConfig: { type: Object as PropType<IPaginationConfig> },
});

/** 列表展示字段，过滤hideInTable的字段 */
const displayColumns = useDisplayColumns(props);
/** 列表插槽 */
const tableSlots = useTableSlots(props);
/** 列表该表，比如排序，过滤 */
const tableChange = (page:any, filters:any, { field, order }:any) => {
  emit("query", {
    ...props.pageParam,
    sortMap: {
      [field]: order,
    },
    filterMap: filters,
  });
};
</script>

<style scoped>
.mt-10 {
  margin-top: 10px;
}
</style>
