<template>
  <!--ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ카카오맵ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ-->
  <div class="flex-1" id="map" style="width: 100%; height: calc(100vh - 64px)"></div>
  <!-- Modal Toggle Button -->
  <!-- 버튼 클릭 시 모달 열기 -->
  <!-- <button @click="openModal" class="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded z-50">
    리뷰 보기
  </button> -->

  <!-- 리뷰 모달 컴포넌트 -->
  <CrewReview
    v-if="isReviewModalOpen"
    :reviews="filteredReviews"
    :selectedRegion="selectedRegionSido"
    :selectedRegionSigungu="selectedRegionSigungu"
    @close="ReviewModalClose"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, watch } from 'vue'
import axios from 'axios'
import type { Review } from '@/types/Review'
import CrewReview from '@/components/Crew/CrewReview.vue'

export default defineComponent({
  components: { CrewReview },
  props: {
    // currentCrewReview의 타입을 명시적으로 정의
    currentCrewReview: {
      type: Array as PropType<Review[]>,
      required: true,
    },
  },
  setup(props) {
    // 맵관련ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    // 지도 및 폴리곤 관련 상태
    const kakaoMap = ref<kakao.maps.Map | undefined>(undefined)
    const polygons = ref<kakao.maps.Polygon[]>([])
    const detailMode = ref(false)
    const isModalOpen = ref(false) // 맵 모달 상태
    const selectedRegionSido = ref<{ sidoCode: string; sidoEngNm: string; sidoKorNm: string } | null>(null)
    const selectedRegionSigungu = ref<{
      sidoCode: string
      gugunCode: string
      sigunguEngNm: string
      sigunguKorNm: string
    } | null>(null)

    // 필터링된 리뷰 상태
    const filteredReviews = ref<Review[]>([])
    const isReviewModalOpen = ref(false)

    //리뷰 모달 오픈
    const openModal = () => {
      isReviewModalOpen.value = true
    }

    //리뷰 모달 닫기
    const ReviewModalClose = () => {
      isReviewModalOpen.value = false
    }

    // 데이터 변경 감지
    watch(
      () => props.currentCrewReview,
      (newVal) => {
        if (newVal && newVal.length > 0) {
          // console.log('watch 작동 - currentCrewReview 변경됨:', newVal)
          // filterReviews(newVal);
        }
      },
      { immediate: true }, // 컴포넌트 초기화 시에도 실행
    )

    // 스크립트 동적 로드
    const loadKakaoMapScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (document.getElementById('kakao-map-script')) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.id = 'kakao-map-script'
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${import.meta.env.VITE_KAKAO_MAPS_API_KEY}`
        script.onload = () => {
          kakao.maps.load(() => resolve())
        }
        script.onerror = () => reject(new Error('카카오맵 스크립트를 로드하지 못했습니다.'))
        document.head.appendChild(script)
      })
    }

    // 지도 초기화
    const initializeMap = () => {
      const mapContainer = document.getElementById('map')
      if (!mapContainer) return

      kakaoMap.value = new kakao.maps.Map(mapContainer, {
        center: new kakao.maps.LatLng(36.11655, 128.3467778),
        level: 12,
      })

      kakao.maps.event.addListener(kakaoMap.value, 'zoom_changed', handleZoomChange)
      loadPolygonsSido('sido.json') // 초기 폴리곤 로드
    }

    // 줌 변경 이벤트 핸들러
    const handleZoomChange = () => {
      if (!kakaoMap.value) return

      const level = kakaoMap.value.getLevel()
      if (detailMode.value && level > 10) {
        detailMode.value = false
        clearPolygons()
        loadPolygonsSido('sido.json')
      } else if (!detailMode.value && level <= 10) {
        detailMode.value = true
        clearPolygons()
        loadPolygonsSigungu('sigungu_modify.json')
      }
    }
    // 폴리곤 데이터 로드 - 시도
    const loadPolygonsSido = async (url: string) => {
      try {
        const response = await axios.get(`/${url}`)
        const features = response.data.features

        features.forEach((feature: any) => {
          const path = feature.geometry.coordinates[0].map(
            (coord: number[]) => new kakao.maps.LatLng(coord[1], coord[0]),
          )

          const polygon = new kakao.maps.Polygon({
            map: kakaoMap.value,
            path,
            strokeWeight: 2,
            strokeColor: '#004c80',
            strokeOpacity: 0.8,
            fillColor: '#fff',
            fillOpacity: 0.7,
          })

          polygons.value.push(polygon)

          kakao.maps.event.addListener(polygon, 'mouseover', () => {
            polygon.setOptions({ fillColor: '#09f' })
          })

          kakao.maps.event.addListener(polygon, 'mouseout', () => {
            polygon.setOptions({ fillColor: '#fff' })
          })

          kakao.maps.event.addListener(polygon, 'click', () => {
            // selectedRegionSido.value = {
            //   sidoCode: feature.properties.CTPRVN_CD || 'N/A',
            //   sidoEngNm: feature.properties.CTP_ENG_NM || 'N/A',
            //   sidoKorNm: feature.properties.SIG_KOR_NM || 'N/A',
            // }
            // isModalOpen.value = true
            handleSidoClick(feature)
          })
        })
      } catch (error) {
        console.error('폴리곤 데이터 로드 실패:', error)
      }
    }

    // 폴리곤 데이터 로드 시군구
    const loadPolygonsSigungu = async (url: string) => {
      try {
        const response = await axios.get(`/${url}`)
        const features = response.data.features

        features.forEach((feature: any) => {
          const path = feature.geometry.coordinates[0].map(
            (coord: number[]) => new kakao.maps.LatLng(coord[1], coord[0]),
          )

          const polygon = new kakao.maps.Polygon({
            map: kakaoMap.value,
            path,
            strokeWeight: 2,
            strokeColor: '#004c80',
            strokeOpacity: 0.8,
            fillColor: '#fff',
            fillOpacity: 0.7,
          })

          polygons.value.push(polygon)

          kakao.maps.event.addListener(polygon, 'mouseover', () => {
            polygon.setOptions({ fillColor: '#09f' })
          })

          kakao.maps.event.addListener(polygon, 'mouseout', () => {
            polygon.setOptions({ fillColor: '#fff' })
          })

          kakao.maps.event.addListener(polygon, 'click', () => {
            // selectedRegionSigungu.value = {
            //   sidoCode: feature.properties.sido_code || 'N/A',
            //   gugunCode: feature.properties.gugun_code || 'N/A',
            //   sidoEngNm: feature.properties.SIG_ENG_NM || 'N/A',
            //   sidoKorNm: feature.properties.SIG_KOR_NM || 'N/A',
            // }
            // isModalOpen.value = true
            handleSigunguClick(feature)
          })
        })
      } catch (error) {
        console.error('폴리곤 데이터 로드 실패:', error)
      }
    }

    // 폴리곤 제거
    const clearPolygons = () => {
      polygons.value.forEach((polygon) => polygon.setMap(null))
      polygons.value = []
    }

    //리뷰 필터링 기능(폴리곤 선택시 필터) ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    // 시도 선택 시 데이터 필터링
    const filterReviewsBySido = () => {
      if (!props.currentCrewReview || !Array.isArray(props.currentCrewReview)) {
        console.warn('시도 currentCrewReview is not a valid array:', props.currentCrewReview)
        return
      }

      if (selectedRegionSido.value) {
        filteredReviews.value = props.currentCrewReview.filter(
          (review) => review.gugunSidoId === Number(selectedRegionSido.value?.sidoCode),
        )
      }

      console.log(filteredReviews.value, selectedRegionSido.value?.sidoKorNm)
      openModal()
    }

    // 시군구 선택 시 데이터 필터링
    const filterReviewsBySigungu = () => {
      if (!props.currentCrewReview || !Array.isArray(props.currentCrewReview)) {
        console.warn('군구currentCrewReview is not a valid array:', props.currentCrewReview)
        return
      }

      if (selectedRegionSigungu.value) {
        filteredReviews.value = props.currentCrewReview.filter(
          (review) =>
            review.gugunSidoId === Number(selectedRegionSigungu.value?.sidoCode) &&
            review.gugunId === Number(selectedRegionSigungu.value?.gugunCode),
        )
      }
      console.log(filteredReviews.value, selectedRegionSigungu.value?.sigunguKorNm)
      openModal()
    }

    // 폴리곤 클릭 시 필터링 실행
    const handleSidoClick = (feature: any) => {
      selectedRegionSido.value = {
        sidoCode: feature.properties.CTPRVN_CD || 'N/A',
        sidoEngNm: feature.properties.CTP_ENG_NM || 'N/A',
        sidoKorNm: feature.properties.SIG_KOR_NM || 'N/A',
      }
      // console.log('handleSidoClick 작동!')
      filterReviewsBySido()
    }

    const handleSigunguClick = (feature: any) => {
      selectedRegionSigungu.value = {
        sidoCode: feature.properties.sido_code || 'N/A',
        gugunCode: feature.properties.gugun_code || 'N/A',
        sigunguEngNm: feature.properties.SIG_ENG_NM || 'N/A',
        sigunguKorNm: feature.properties.SIG_KOR_NM || 'N/A',
      }
      filterReviewsBySigungu()
    }

    onMounted(async () => {
      try {
        await loadKakaoMapScript() // Kakao Maps 스크립트 로드
        initializeMap() // 지도 초기화
        console.log('초기값 currentCrewReview:', props.currentCrewReview)
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error)
      }
    })

    return {
      isModalOpen,
      selectedRegionSido,
      selectedRegionSigungu,
      kakaoMap,
      filteredReviews,
      filterReviewsBySido,
      filterReviewsBySigungu,
      isReviewModalOpen,
      openModal,
      ReviewModalClose,
    }
  },
})
</script>

<style scoped>
/* Tailwind 스타일 사용 */
</style>
