<template>
  <section @click="toggleMark" class="cursor-pointer hover:scale-110 transition-transform duration-200">
    <component :is="isMarked ? 'Bookmark' : 'NonBookmark'" class="w-5 h-5" />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import type { PropType } from 'vue'
import type { Map } from '@/types/Map'
import Bookmark from '@/assets/Review/Bookmark.svg'
import NonBookmark from '@/assets/Review/NonBookmark.svg'
import { useToast } from 'vue-toast-notification'

export default defineComponent({
  components: { Bookmark, NonBookmark },
  props: {
    place: {
      type: Object as PropType<Map>,
      required: true,
    },
  },
  emits: ['refreshMarkers'],
  setup(props, { emit }) {
    const isMarked = ref(false)
    const token = sessionStorage.getItem('accessToken')
    const toast = useToast()
    //마커 상태
    const fetchMarkStatus = async () => {
      if (!token) {
        console.log('토큰이 없습니다. 마커 상태를 조회할 수 없습니다.')
        return
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/marker/${props.place.attractionId}/check`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        isMarked.value = response.data
      } catch (error) {
        console.error('마커 상태를 가져오는데 실패했습니다:', error)
      }
    }

    const toggleMark = () => {
      const markData = {
        attractionId: props.place.attractionId,
        name: props.place.title,
        latitude: props.place.latitude,
        longitude: props.place.longitude,
        sidoId: props.place.areaCode,
        gugunId: props.place.siGunGuCode,
      }
      if (!token) {
        toast.error('로그인이 필요합니다.')
        return
      }
      try {
        if (isMarked.value) {
          axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/marker/${props.place.attractionId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          isMarked.value = false
          toast.success('마커가 삭제되었습니다.')
          //   console.log('마커 삭제 성공')
        } else {
          axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/marker/${props.place.attractionId}`, markData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          isMarked.value = true
          toast.success('마커가 추가되었습니다.')
          //   console.log('마커 추가 성공')
        }
        emit('refreshMarkers')
      } catch (error) {
        console.error('마커 상태를 변경하는데 실패했습니다:', error)
      }
    }

    onMounted(() => {
      fetchMarkStatus()
    })

    return {
      isMarked,
      toggleMark,
      token,
      fetchMarkStatus,
    }
  },
})
</script>

<style scoped></style>
