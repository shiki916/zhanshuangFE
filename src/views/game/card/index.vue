<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="卡号" prop="cardNo">
        <el-input
          v-model="queryParams.cardNo"
          placeholder="请输入卡号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡牌名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入卡牌名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡包名称" prop="packageName">
        <el-input
          v-model="queryParams.packageName"
          placeholder="请输入卡包名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="稀有度" prop="rarity">
        <el-input
          v-model="queryParams.rarity"
          placeholder="请输入稀有度"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡牌费用" prop="cost">
        <el-input
          v-model="queryParams.cost"
          placeholder="请输入卡牌费用"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡牌属性" prop="cardAttribute">
        <el-input
          v-model="queryParams.cardAttribute"
          placeholder="请输入卡牌属性"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="PP数值" prop="ppValue">
        <el-input
          v-model="queryParams.ppValue"
          placeholder="请输入PP数值"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="DP数值" prop="dpValue">
        <el-input
          v-model="queryParams.dpValue"
          placeholder="请输入DP数值"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="信号球颜色" prop="signalColor">
        <el-input
          v-model="queryParams.signalColor"
          placeholder="请输入信号球颜色"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡牌类型" prop="cardTypes">
        <el-input
          v-model="queryParams.cardTypes"
          placeholder="请输入卡牌类型"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡牌特征" prop="features">
        <el-input
          v-model="queryParams.features"
          placeholder="请输入卡牌特征"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡图地址" prop="imageUrl">
        <el-input
          v-model="queryParams.imageUrl"
          placeholder="请输入卡图地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['game:card:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['game:card:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['game:card:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['game:card:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="cardList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="卡号" align="center" prop="cardNo" />
      <el-table-column label="卡牌名称" align="center" prop="name" />
      <el-table-column label="卡包名称" align="center" prop="packageName" />
      <el-table-column label="稀有度" align="center" prop="rarity" />
      <el-table-column label="卡牌费用" align="center" prop="cost" />
      <el-table-column label="卡牌属性" align="center" prop="cardAttribute" />
      <el-table-column label="PP数值" align="center" prop="ppValue" />
      <el-table-column label="DP数值" align="center" prop="dpValue" />
      <el-table-column label="信号球颜色" align="center" prop="signalColor" />
      <el-table-column label="卡牌类型" align="center" prop="cardTypes" />
      <el-table-column label="卡牌特征" align="center" prop="features" />
      <el-table-column label="效果文本" align="center" prop="effect" />
      <el-table-column label="卡图地址" align="center" prop="imageUrl" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewData(scope.row)" v-hasPermi="['game:card:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['game:card:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['game:card:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 卡池管理详情抽屉 -->
    <card-view-drawer ref="cardViewRef" />
    <!-- 添加或修改卡池管理对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="cardRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="卡号" prop="cardNo">
              <el-input v-model="form.cardNo" placeholder="请输入卡号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡牌名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入卡牌名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡包名称" prop="packageName">
              <el-input v-model="form.packageName" placeholder="请输入卡包名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="稀有度" prop="rarity">
              <el-input v-model="form.rarity" placeholder="请输入稀有度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡牌费用" prop="cost">
              <el-input v-model="form.cost" placeholder="请输入卡牌费用" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡牌属性" prop="cardAttribute">
              <el-input v-model="form.cardAttribute" placeholder="请输入卡牌属性" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PP数值" prop="ppValue">
              <el-input v-model="form.ppValue" placeholder="请输入PP数值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="DP数值" prop="dpValue">
              <el-input v-model="form.dpValue" placeholder="请输入DP数值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信号球颜色" prop="signalColor">
              <el-input v-model="form.signalColor" placeholder="请输入信号球颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡牌类型" prop="cardTypes">
              <el-input v-model="form.cardTypes" placeholder="请输入卡牌类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡牌特征" prop="features">
              <el-input v-model="form.features" placeholder="请输入卡牌特征" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="效果文本" prop="effect">
              <el-input v-model="form.effect" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡图地址" prop="imageUrl">
              <el-input v-model="form.imageUrl" placeholder="请输入卡图地址" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="删除标志" prop="delFlag">
              <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Card">
import { listCard, getCard, delCard, addCard, updateCard } from "@/api/game/card"
import CardViewDrawer from "./view"

const { proxy } = getCurrentInstance()

const cardList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    cardNo: undefined,
    name: undefined,
    packageName: undefined,
    rarity: undefined,
    cost: undefined,
    cardAttribute: undefined,
    ppValue: undefined,
    dpValue: undefined,
    signalColor: undefined,
    cardTypes: undefined,
    features: undefined,
    effect: undefined,
    imageUrl: undefined,
    status: undefined,
  },
  rules: {
    cardNo: [
      { required: true, message: "卡号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "卡牌名称不能为空", trigger: "blur" }
    ],
    packageName: [
      { required: true, message: "卡包名称不能为空", trigger: "blur" }
    ],
    rarity: [
      { required: true, message: "稀有度不能为空", trigger: "blur" }
    ],
    cost: [
      { required: true, message: "卡牌费用不能为空", trigger: "blur" }
    ],
    cardAttribute: [
      { required: true, message: "卡牌属性不能为空", trigger: "blur" }
    ],
    cardTypes: [
      { required: true, message: "卡牌类型不能为空", trigger: "blur" }
    ],
    imageUrl: [
      { required: true, message: "卡图地址不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    // delFlag: [
    //   { required: true, message: "删除标志不能为空", trigger: "blur" }
    // ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询卡池管理列表 */
function getList() {
  loading.value = true
  listCard(queryParams.value).then(response => {
    cardList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    cardNo: null,
    name: null,
    packageName: null,
    rarity: null,
    cost: null,
    cardAttribute: null,
    ppValue: null,
    dpValue: null,
    signalColor: null,
    cardTypes: null,
    features: null,
    effect: null,
    imageUrl: null,
    status: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("cardRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加卡池管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getCard(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改卡池管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["cardRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCard(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCard(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除卡池管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCard(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 详情按钮操作 */
function handleViewData(row) {
  proxy.$refs["cardViewRef"].open(row.id)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('game/card/export', {
    ...queryParams.value
  }, `card_${new Date().getTime()}.xlsx`)
}

getList()
</script>
