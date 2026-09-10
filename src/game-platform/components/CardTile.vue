<script setup lang="ts">
import type { CatalogCard } from '../catalog-types'
defineProps<{ card: CatalogCard; count?: number }>()
defineEmits<{ add: []; remove: []; inspect: [] }>()
function fallbackImage(event: Event, cardNo: string) { const image = event.currentTarget as HTMLImageElement; const fallback = `/card-images/${cardNo}.png`; if (!image.src.endsWith(fallback)) image.src = fallback }
</script>
<template>
  <article class="card-tile" @click="$emit('inspect')">
    <img :src="card.image_url" :alt="card.name" loading="lazy" @error="fallbackImage($event, card.card_no)" />
    <div v-if="count !== undefined" class="card-quick-add" @click.stop>
      <el-button circle size="small" :disabled="count <= 0" aria-label="减少一张" @click="$emit('remove')">−</el-button>
      <b>{{ count }}</b>
      <el-button circle size="small" type="primary" :disabled="count >= 4" aria-label="加入一张" @click="$emit('add')">+</el-button>
    </div>
    <div class="card-meta"><strong>{{ card.name }}</strong><span>{{ card.card_no }}</span><span>费 {{ card.cost ?? '-' }} · PP {{ card.pp_value ?? '-' }} · DP {{ card.dp_value ?? '-' }}</span></div>
  </article>
</template>
