<template>
  <div class="flex flex-col min-h-screen">
    <Nav class="mb-2 h-[100px]" />
    <div class="flex-grow">
      <div class="flex w-full h-full">
        <KakaoMap
          :lat="mapStore.lat"
          :lng="mapStore.lng"
          :width="'100%'"
          :height="'calc(100vh - 100px)'"
          :level="5"
          @onLoadKakaoMap="onLoadKakaoMap"
          v-if="loaded"
        >
          <div class="w-[450px] absolute z-[8] p-5 h-full flex flex-col">
            <div class="flex items-center gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="검색어를 입력하세요"
                class="flex-grow p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#A8B087]"
                @keyup.enter="search"
              />
              <button @click="search" class="bg-[#A8B087] p-2 rounded-md hover:bg-[#BCC199] flex justify-items-center">
                <Search class="w-6 h-6" />
              </button>
            </div>

            <div class="mt-4 flex-grow overflow-y-auto bg-white rounded-lg flex flex-col scrollbar-hide">
              <div class="p-3 space-y-2">
                <div v-if="area.length > 0">
                  <div
                    v-for="(item, index) in area"
                    :key="index"
                    class="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-100 mb-2"
                    @click="searchByRegion(item.areaCode, null)"
                  >
                    <Location class="w-6 h-6 mr-2" />
                    <p>{{ item.title }} 로 검색하시겠습니까?</p>
                  </div>
                </div>

                <div v-if="sigungu.length > 0">
                  <div
                    v-for="(item, index) in sigungu"
                    :key="index"
                    class="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-100 mb-2"
                    @click="searchByRegion(item.areaCode, item.siGunGuCode)"
                  >
                    <Location class="w-6 h-6 mr-2" />
                    <p>{{ item.title }} 로 검색하시겠습니까?</p>
                  </div>
                </div>
              </div>

              <p v-if="check" class="text-sm text-gray-500 p-3">검색 결과가 없습니다.</p>
              <MapModal class="h-full" :map="filteredPlaces" />
            </div>
          </div>
          <Weather :lat="mapStore.lat" :lng="mapStore.lng" class="absolute z-[2] right-2 top-16" />

          <!-- 현재위치 -->
          <KakaoMapMarker
            :lat="currentPosition.lat"
            :lng="currentPosition.lng"
            :image="{
              imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1731910823267_Location.svg',
              imageWidth: 35,
              imageHeight: 35,
            }"
          />
          <!--마커 등록 -->
          <KakaoMapMarker
            v-for="(place, index) in marker"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="{
              imageSrc:
                'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732349826078_solar_star-circle-bold-duotone.svg',
              imageWidth: 40,
              imageHeight: 40,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(12)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(14)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(15)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(25)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(28)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(32)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(38)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />
          <KakaoMapMarker
            v-for="(place, index) in getMarkersByContentType(39)"
            :key="index"
            :lat="place.latitude"
            :lng="place.longitude"
            :image="getMarkerStyle(place.contentTypeId)"
            :infoWindow="{
              content: `<div style='padding:6px; font-size:14px; color:#333;'>${place.title}</div>`,
            }"
          />

          <button
            class="fixed left-[50%] top-[20%] bg-[#A8B087] text-white p-2 rounded z-[2] bg-opacity-70"
            style="round: 10px"
            @click="getInfo"
          >
            이 지역에서 검색
          </button>
        </KakaoMap>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, computed } from 'vue'
import axios from 'axios'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'
import Search from '@/assets/Map/search.svg'
import { useMapStore } from '@/stores/Map'
import MapModal from '@/components/Map/MapModal.vue'
import type { Map } from '@/types/Map'
import type { area } from '@/types/Map'
import type { sigungu } from '@/types/Map'
import AlterImg from '@/assets/Map/AlterImg.jpg'
import Location from '@/assets/Map/Location.svg'
import { Marker } from '@/types/Marker'
import Nav from '@/components/common/WhiteNav.vue'
import Weather from '@/components/Map/MapWeather.vue'
import { useToast } from 'vue-toast-notification'
export default defineComponent({
  components: {
    Search,
    KakaoMap,
    KakaoMapMarker,
    MapModal,
    Location,
    Nav,
    Weather,
  },
  setup() {
    const toast = useToast()
    const mapStore = useMapStore()
    const searchQuery = ref('')
    const loaded = ref(false)
    const filteredPlaces = ref<Map[]>([])
    const area = ref<area[]>([])
    const sigungu = ref<sigungu[]>([])
    const check = ref(true)
    const map = ref()
    const marker = ref<Marker[]>([])
    const markerStyles: { [key: number]: { imageSrc: string; imageWidth: number; imageHeight: number } } = {
      12: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732478857080_1.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
      14: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479448441_2.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
      15: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479511222_3.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
      25: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479518702_4.svg',
        imageWidth: 40,
        imageHeight: 40,
      },
      28: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479527573_5.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
      32: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479534723_6.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
      38: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479543198_7.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
      39: {
        imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/image_1732479549261_8.svg',
        imageWidth: 35,
        imageHeight: 35,
      },
    }

    const onLoadKakaoMap = (mapRef: any) => {
      map.value = mapRef
      // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
      const mapTypeControl = new kakao.maps.MapTypeControl()
      // 지도 타입 컨트롤을 지도에 표시합니다
      map.value.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)
    }

    const getInfo = async () => {
      if (map.value) {
        // 지도의 현재 중심좌표를 얻어옵니다
        const center = map.value.getCenter()
        const latitude = center.getLat()
        const longitude = center.getLng()
        const radius = 3000 // 반경 3km 설정

        // 중심 좌표를 mapStore에 업데이트
        mapStore.setCoordinates(latitude, longitude)

        // console.log('현재 중심 좌표:', latitude, longitude)

        try {
          // API 호출
          const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/search/nearby`, {
            params: { latitude, longitude, radius },
          })

          const attractions = response.data || []
          filteredPlaces.value = attractions.map((place: any) => ({
            ...place,
            Image: place.firstImage1 ? place.firstImage1 : AlterImg,
          }))
          check.value = !filteredPlaces.value.length

          // console.log('근처 검색 결과:', filteredPlaces.value)
        } catch (error) {
          console.error('근처 검색 중 오류가 발생했습니다:', error)
          filteredPlaces.value = []
        }
      }
    }

    const currentPosition = ref({
      lat: 37.566826,
      lng: 126.9786567,
    })
    const search = async () => {
      if (!searchQuery.value.trim()) {
        toast.error('검색어를 입력해주세요.')
        return
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/search/title`, {
          params: { title: searchQuery.value },
        })

        const attractions = response.data.attractions || []
        // console.log(attractions)
        const areaData = response.data.area || []
        const sigunguData = response.data.sigungu || []
        filteredPlaces.value = attractions.map((place: any) => ({
          ...place,
          Image: place.firstImage1 ? place.firstImage1 : AlterImg,
        }))

        if (filteredPlaces.value.length > 0) {
          const lat = filteredPlaces.value[0].latitude
          const lng = filteredPlaces.value[0].longitude
          mapStore.setCoordinates(lat, lng)
        }

        area.value = areaData
        sigungu.value = sigunguData

        // 검색 결과가 없는 경우
        check.value = !(areaData.length || sigunguData.length || filteredPlaces.value.length)
      } catch (error) {
        console.error('검색 중 오류가 발생했습니다:', error)
        filteredPlaces.value = []
        area.value = []
        sigungu.value = []
        check.value = true
      }
    }

    const searchByRegion = async (areaCode: number, siGunGuCode: number | null) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/search/region`, {
          params: { areaCode, siGunGuCode },
        })
        // console.log(response.data)

        const attractions = response.data || []
        filteredPlaces.value = attractions.map((place: any) => ({
          ...place,
          Image: place.firstImage1 ? place.firstImage1 : AlterImg,
        }))

        if (filteredPlaces.value.length > 0) {
          const lat = filteredPlaces.value[0].latitude
          const lng = filteredPlaces.value[0].longitude
          mapStore.setCoordinates(lat, lng)
        }

        check.value = !filteredPlaces.value.length
      } catch (error) {
        console.error('지역 검색 중 오류가 발생했습니다:', error)
        filteredPlaces.value = []
        check.value = true
      }
    }
    const token = sessionStorage.getItem('accessToken')
    const fetchMarker = async () => {
      if (!token) {
        return
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/v1/map/marker`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        marker.value = response.data
        // console.log(marker.value)
      } catch (error) {
        console.error('마커 정보를 불러오는 데 실패했습니다:', error)
      }
    }
    const getMarkerStyle = (contentType: number) => {
      return (
        markerStyles[contentType] || {
          imageSrc: 'https://dangnagi-buket.s3.ap-northeast-2.amazonaws.com/Vector.svg',
          imageWidth: 30,
          imageHeight: 30,
        }
      )
    }
    const getMarkersByContentType = (type: number) => {
      return filteredPlaces.value.filter((place) => place.contentTypeId === type)
    }

    onMounted(() => {
      fetchMarker()
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            currentPosition.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            mapStore.setCoordinates(position.coords.latitude, position.coords.longitude)
            loaded.value = true
          },
          (error) => {
            console.error('위치 정보를 가져오는 데 실패했습니다:', error)
            loaded.value = true // 오류 발생 시에도 지도 표시
          },
        )
      } else {
        console.error('Geolocation을 지원하지 않는 브라우저입니다.')
        loaded.value = true
      }
    })

    return {
      currentPosition,
      searchQuery,
      filteredPlaces,
      mapStore,
      loaded,
      search,
      area,
      sigungu,
      check,
      searchByRegion,
      onLoadKakaoMap,
      getInfo,
      marker,
      token,
      fetchMarker,
      getMarkerStyle,
      getMarkersByContentType,
    }
  },
})
</script>

<style scoped>
/* Scrollbar 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge, Opera */
}
</style>
