<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Papa from 'papaparse'
import { ElMessage } from 'element-plus'
import { useCardStore } from '../stores/cards'
import type { CardRecord } from '../types'
const store=useCardStore(), keyword=ref(''), editing=ref<CardRecord|null>(null)
const form=reactive({cost:null as number|null,pp_value:null as number|null,dp_value:null as number|null})
const visible=computed(()=>store.cards.filter(card=>`${card.card_no}${card.name}`.toLowerCase().includes(keyword.value.toLowerCase())))
function edit(card:CardRecord){editing.value=card;Object.assign(form,{cost:card.cost,pp_value:card.pp_value,dp_value:card.dp_value})}
function apply(){if(!editing.value)return;store.updateNumbers(editing.value.card_no,form);editing.value=null;ElMessage.success('修正已应用，请导出卡表以永久保存')}
function csvBlob(){const csv='\ufeff'+Papa.unparse(store.cards.map(({image_variants:_,selected_variant_id:__,...card})=>({...card,image_url:`/card-images/${card.card_no}.png`})));return new Blob([csv],{type:'text/csv;charset=utf-8'})}
async function saveCsv(){
  const picker=(window as typeof window & {showSaveFilePicker?: (options:unknown)=>Promise<{createWritable:()=>Promise<{write:(data:Blob)=>Promise<void>;close:()=>Promise<void>}>}>}).showSaveFilePicker
  if(picker){try{const handle=await picker({suggestedName:'cards.csv',types:[{description:'CSV 卡表',accept:{'text/csv':['.csv']}}]});const writable=await handle.createWritable();await writable.write(csvBlob());await writable.close();ElMessage.success('卡表已写入本地文件');return}catch(reason){if(reason instanceof DOMException&&reason.name==='AbortError')return}}
  const link=document.createElement('a');link.href=URL.createObjectURL(csvBlob());link.download='cards.csv';link.click();URL.revokeObjectURL(link.href);ElMessage.info('当前浏览器不支持直接保存，已改为下载文件')
}
</script>
<template><section class="panel data-page"><div class="toolbar"><el-input v-model="keyword" clearable placeholder="搜索卡号或卡名" /><el-button type="primary" @click="saveCsv">保存已修正卡表</el-button><el-alert title="请选择工程中的 public/data/cards.csv 覆盖保存；重新进入项目后修正仍会生效。" type="info" :closable="false" /></div>
  <el-table :data="visible" height="calc(100vh - 210px)" stripe><el-table-column prop="card_no" label="卡号" width="120"/><el-table-column prop="name" label="卡名" min-width="170"/><el-table-column prop="card_types" label="类型" min-width="180"/><el-table-column prop="cost" label="费用" width="80"/><el-table-column prop="pp_value" label="PP" width="90"/><el-table-column prop="dp_value" label="DP" width="80"/><el-table-column label="操作" width="100"><template #default="scope"><el-button link type="primary" @click="edit(scope.row)">纠错</el-button></template></el-table-column></el-table></section>
  <el-dialog v-model="editing" :title="`修正 ${editing?.card_no} ${editing?.name}`" width="440px"><el-form label-width="70px"><el-form-item label="费用"><el-input-number v-model="form.cost" :min="0"/></el-form-item><el-form-item label="PP"><el-input-number v-model="form.pp_value" :step="500"/></el-form-item><el-form-item label="DP"><el-input-number v-model="form.dp_value" :min="0"/></el-form-item></el-form><template #footer><el-button @click="editing=null">取消</el-button><el-button type="primary" @click="apply">应用</el-button></template></el-dialog>
</template>
