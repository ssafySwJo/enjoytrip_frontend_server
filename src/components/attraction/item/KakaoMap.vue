<template>
  <div>
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { tripInfoStore } from '@/stores/tripInfoStore'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch, watchEffect } from 'vue'
import { getLocalTripData } from '@/api/tripApi'

var map = null
const positions = ref([])
const markers = ref([])

const attractionInform = ref()
const tripinfoStore = tripInfoStore()
const { selectedState, selectedCity, selectedType, selectedPgno } = storeToRefs(tripinfoStore)

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    initMap()
  } else {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=63b138442d63d32e8905bf20dab9be5d&libraries=services,clusterer`
    /* global kakao */
    script.onload = () => kakao.maps.load(() => initMap())
    document.head.appendChild(script)
  }
})

const initMap = () => {
  const container = document.getElementById('map')
  const options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 3
  }
  map = new kakao.maps.Map(container, options)

  // loadMarkers();
}

watchEffect(() => {
  ;(async () => {
    attractionInform.value = await getLocalTripData(
      selectedState.value,
      selectedCity.value,
      selectedType.value,
      selectedPgno.value
    )

    positions.value = []
    attractionInform.value.forEach((attraction) => {
      let obj = {}
      obj.latlng = new kakao.maps.LatLng(attraction.mapy, attraction.mapx)
      obj.title = attraction.title

      positions.value.push(obj)
    })
    loadMarkers()
  })()
})

const loadMarkers = () => {
  // 현재 표시되어있는 marker들이 있다면 map에 등록된 marker를 제거한다.
  deleteMarkers()

  // 마커 이미지를 생성합니다
  //   const imgSrc = require("@/assets/map/markerStar.png");
  // 마커 이미지의 이미지 크기 입니다
  //   const imgSize = new kakao.maps.Size(24, 35);
  // const markerImage = new kakao.maps.MarkerImage(imgSrc, imgSize);

  // 마커를 생성합니다
  markers.value = []
  positions.value.forEach((position) => {
    const marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: position.latlng, // 마커를 표시할 위치
      title: position.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됨.
      clickable: true // // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
      // image: markerImage, // 마커의 이미지
    })
    markers.value.push(marker)
  })

  // 4. 지도를 이동시켜주기
  // 배열.reduce( (누적값, 현재값, 인덱스, 요소)=>{ return 결과값}, 초기값);
  const bounds = positions.value.reduce(
    (bounds, position) => bounds.extend(position.latlng),
    new kakao.maps.LatLngBounds()
  )

  map.setBounds(bounds)
}

const deleteMarkers = () => {
  if (markers.value.length > 0) {
    markers.value.forEach((marker) => marker.setMap(null))
  }
}
</script>

<style>
.map {
  width: 100%;
  height: 500px;
}
</style>
