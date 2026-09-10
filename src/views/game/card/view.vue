<template>
  <el-drawer title="卡池管理详情" v-model="visible" direction="rtl" size="60%" append-to-body :before-close="handleClose" class="detail-drawer">
    <div v-loading="loading" class="drawer-content">
      <h4 class="section-header">基本信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡号：</label>
            <span class="info-value plaintext">
              {{ info.cardNo }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡牌名称：</label>
            <span class="info-value plaintext">
              {{ info.name }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡包名称：</label>
            <span class="info-value plaintext">
              {{ info.packageName }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">稀有度：</label>
            <span class="info-value plaintext">
              {{ info.rarity }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡牌费用：</label>
            <span class="info-value plaintext">
              {{ info.cost }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡牌属性：</label>
            <span class="info-value plaintext">
              {{ info.cardAttribute }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">PP数值：</label>
            <span class="info-value plaintext">
              {{ info.ppValue }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">DP数值：</label>
            <span class="info-value plaintext">
              {{ info.dpValue }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">信号球颜色：</label>
            <span class="info-value plaintext">
              {{ info.signalColor }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡牌类型：</label>
            <span class="info-value plaintext">
              {{ info.cardTypes }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡牌特征：</label>
            <span class="info-value plaintext">
              {{ info.features }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">效果文本：</label>
            <span class="info-value plaintext">
              {{ info.effect }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">卡图地址：</label>
            <span class="info-value plaintext">
              {{ info.imageUrl }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">状态：</label>
            <span class="info-value plaintext">
              {{ info.status }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">备注：</label>
            <span class="info-value plaintext">
              {{ info.remark }}
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup name="CardViewDrawer">
import { getCard } from '@/api/game/card'


const visible = ref(false)
const loading = ref(false)
const info = reactive({})

const open = async (id) => {
  visible.value = true
  loading.value = true
  try {
    const res = await getCard(id)
    Object.assign(info, res.data || {})
  } catch (error) {
    console.error('获取卡池管理信息失败:', error)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  visible.value = false
  Object.keys(info).forEach(key => delete info[key])
}

defineExpose({ open })
</script>
