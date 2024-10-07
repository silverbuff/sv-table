<template>
  <div v-if="isSearch">
    <!-- 搜索表单 -->
    <a-form
      ref="formRef"
      :model="filters"
      layout="inline"
      :rules="searchConfig.rules"
    >
      <a-row style="width: 100%">
        <template v-for="(item, index) in filterProps" :key="index">
          <a-col
            v-if="itemVisible(!!item.foldAble, collapsed)"
            :span="item.span ?? searchConfig.span"
          >
            <a-form-item
              v-if="!item.renderSlot"
              v-bind="item.itemProps"
              :name="item.dataIndex"
              :label="item.title"
              :label-col="item?.itemProps?.labelCol ?? searchConfig.labelCol"
              :wrapper-col="
                item?.itemProps?.wrapperCol ?? searchConfig.wrapperCol
              "
            >
              <!-- 支持标题插槽 -->
              <!-- <template v-if="item.slots?.title" #label>
                <slot :name="item.slots?.title"></slot>
              </template> -->

              <a-input-number
                v-if="item.type === 'input-number'"
                v-bind="buildFieldProps(item)"
                style="width: 100%"
                v-model:value="filters[item.dataIndex]"
                @change="
                  (val:any) => {
                    handleChange(val, item);
                  }
                "
              />
              <a-select
                v-else-if="item.type === 'select'"
                v-bind="buildFieldProps(item)"
                v-model:value="filters[item.dataIndex]"
                :filter-option="
                  item.fieldProps?.filterOption ?? selectFilterName
                "
                show-search
                @change="
                  (val:any) => {
                    handleChange(val, item);
                  }
                "
              />
              <a-range-picker
                v-else-if="item.type === 'range-picker'"
                v-bind="buildFieldProps(item)"
                v-model:value="filters[item.dataIndex]"
                style="width: 100%"
                :range="item.filterProps?.range ?? RANGES"
                show-time
                @change="
                  (val:any) => {
                    handleChange(val, item);
                  }
                "
              />
              <a-date-picker
                v-else-if="item.type === 'date-picker'"
                v-bind="buildFieldProps(item)"
                v-model:value="filters[item.dataIndex]"
                style="width: 100%"
                @change="
                  (val:any) => {
                    handleChange(val, item);
                  }
                "
              />
              <a-input
                v-else
                v-bind="buildFieldProps(item)"
                v-model:value="filters[item.dataIndex]"
                @change="
                  (val:any) => {
                    handleChange(val, item);
                  }
                "
              />
            </a-form-item>
            <!-- 自定义内容 -->
            <slot
              v-else
              :name="`sv_search_${item.renderSlot}`"
              :config="{
                ref: formRef,
                filters,
                filterProps,
                realReq,
                apiParam,
              }"
            >
            </slot>
          </a-col>
        </template>
      </a-row>
      <a-row :span="toolSpan">
        <a-space class="search-bar">
          <slot
            name="sv_search"
            :config="{ ref: formRef, filters, filterProps, realReq, apiParam }"
          ></slot>
          <a-button type="dashed" @click="onReset">
            <RedoOutlined /> {{ props.searchConfig.resetText }}
          </a-button>
          <a-button type="primary" @click="onSearch">
            <SearchOutlined /> {{ props.searchConfig.searchText }}
          </a-button>
          <a-button
            v-if="isShowCollapsedButton"
            class="collapsed"
            type="link"
            @click="collapsed = !collapsed"
          >
            {{ collapsed ? "展开" : "收起" }}
            <DownOutlined v-if="collapsed" />
            <UpOutlined v-if="!collapsed" />
          </a-button>
        </a-space>
      </a-row>
    </a-form>
    <!-- 分割线 -->
    <a-divider style="margin: 16px 0px" />
  </div>
</template>

<script lang="ts" setup generic="T extends Record<string,any>">
import {  reactive, ref, watchEffect, toRefs, PropType } from "vue";
import {
  UpOutlined,
  DownOutlined,
  SearchOutlined,
  RedoOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { RANGES } from "../config";
import {
  useFilterProps,
  useInitFilter,
  useToolSpan,
  useIsShowCollapsedButton,
  useIsSearch,
} from "./hooks";
import { cloneDeep } from "lodash-es";
import type { ISearchConfig, IColumnWithFilterConfig ,ResetFieldType} from "../interface";
import { itemVisible, selectFilterName, buildFieldProps } from "./utils";

const emit = defineEmits(["query"]);
const props = defineProps({
  columns: { type: Array as PropType<IColumnWithFilterConfig<T>[]> },
  searchConfig: { type: Object as PropType<ISearchConfig>, required: true },
});

/** 是否展示查询表单 */
const isSearch = useIsSearch(props.searchConfig);
/** 折叠标记 */
const collapsed = ref<boolean>(!!props.searchConfig.defaultCollapsed);
/** 表单实例 */
const formRef = ref();
/** 查询参数对象（实时状态） */
const filters= reactive<Partial<ResetFieldType<T>>>({} as T) as any
/** 查询参数对象（上一次查询时的状态） */
const realReq = reactive<Partial<ResetFieldType<T>>>({} as T)
/** 经过层层转换，最终传入接口的查询参数 */
const apiParam=reactive<any>({})
/** 1.获取需要展示的筛选项 */
const filterProps = useFilterProps(toRefs(props).columns);
/** 2.配置初始对象，重置使用 */
const initFilters = useInitFilter(filterProps);
/** 3.计算工具面板右对齐所需span */
const toolSpan = useToolSpan(
  filterProps,
  collapsed,
  toRefs(props).searchConfig
);
/** 4.判断是否需要展开&折叠按钮 */
const isShowCollapsedButton = useIsShowCollapsedButton(filterProps);

/** 初始化查询参数 */
watchEffect(() => {
  Object.assign(filters, cloneDeep(initFilters.value));
  Object.assign(realReq, cloneDeep(initFilters.value));
});

/** 覆写change,传入filters和filterProps */
const handleChange = (val: any, item: any) => {
  item.fieldProps?.onChange &&
    item.fieldProps.onChange(val, filters, filterProps.value);
};

/** 重置 */
const onReset = () => {
  Object.assign(filters, cloneDeep(initFilters.value));
  onSearch();
};

/** 搜索 */
const onSearch = async () => {
  try {
    await formRef.value.validate();
    /** 记录查询条件 */
    Object.assign(realReq, filters);
    emit("query");
  } catch (e) {
    message.error("请检查输入！");
  }
};

defineExpose({
  formRef,
  filters,
  realReq,
  apiParam,
  onReset,
  onSearch,
});
</script>

<style scoped>
.ant-form >>> .ant-form-item {
  margin-bottom: 16px;
  margin-right: 0px;
}
.collapsed {
  padding-left: 0px;
  padding-right: 0px;
}
.search-bar {
  float: right;
}
</style>
