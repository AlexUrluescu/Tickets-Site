<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  watch,
} from "vue";
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useShoppingCartStore } from "@/stores/cosCumparaturi";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { emitter } from "@/stores/cosCumparaturi";

const router = useRouter();
const emit = defineEmits(["goBack"]);
const userStore = useUserStore();
const shoppingCartStore = useShoppingCartStore();
const { isLoggedIn } = storeToRefs(userStore);
const sectorsData = reactive({});
const sectors = [
  "A1",
  "A2",
  "A3",
  "VIP",
  "C1",
  "C2",
  "C3",
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "B1",
  "B2",
  "B3",
];
const showSectorsT1 = ref(false);
const showSectorsT2 = ref(false);
const showSectorsPN = ref(false);
const showSectorsPS = ref(false);
const selectedSector = ref(null);
const showSeatPicker = ref(false);
const seats = ref([]);
const picked = reactive(new Set());
const maxRow = ref(0);
const maxCol = ref(0);
const selectedSeats = ref(0);
const totalPrice = ref(0);
const showLoginWarning = ref(false);
const showSeatsWarning = ref(false);

const toggleSectorsT1 = () => {
  showSectorsT1.value = !showSectorsT1.value;
};
const toggleSectorsT2 = () => {
  showSectorsT2.value = !showSectorsT2.value;
};
const toggleSectorsPN = () => {
  showSectorsPN.value = !showSectorsPN.value;
};
const toggleSectorsPS = () => {
  showSectorsPS.value = !showSectorsPS.value;
};

// Animation hooks kept exactly as requested
const enter = (el) => {
  el.style.maxHeight = "0";
  el.style.transition = "max-height 0.4s ease";
  el.offsetHeight;
  el.style.maxHeight = el.scrollHeight + "px";
};
const leave = (el) => {
  el.style.maxHeight = el.scrollHeight + "px";
  el.offsetHeight;
  el.style.transition = "max-height 0.4s ease";
  el.style.maxHeight = "0";
};

function handleSvgClick(sector) {
  if (selectedSector.value === sector) {
    selectedSector.value = null;
    showSectorsT1.value = false;
    showSectorsT2.value = false;
    showSectorsPN.value = false;
    showSectorsPS.value = false;
  } else {
    selectedSector.value = sector;
    showSectorsT1.value = sector.startsWith("A") || sector === "VIP";
    showSectorsT2.value = sector.startsWith("C");
    showSectorsPN.value = sector.startsWith("D");
    showSectorsPS.value = sector.startsWith("B");
  }
  fetchSectorData();
}

const props = defineProps({
  awayTeamName: String,
  awayTeamLogo: String,
  matchDate: String,
  matchTime: String,
  matchId: {
    type: [String, Number],
    required: true,
  },
});

async function fetchSectorData() {
  // Logic preserved
  Object.assign(sectorsData, {});
  for (const sector of sectors) {
    try {
      const requestParams = {
        sector: sector,
        matchId: props.matchId,
        _t: Date.now(),
      };
      const res = await axios.get(`http://localhost:3000/api/sector-info`, {
        params: requestParams,
      });
      sectorsData[sector] = { ...res.data };
    } catch (error) {
      console.error(`Eroare la sectorul ${sector}:`, error);
      sectorsData[sector] = { disponibile: 0, pret: 0 };
    }
  }
  if (selectedSector.value && showSeatPicker.value) {
    try {
      const res = await axios.get(`http://localhost:3000/api/seats`, {
        params: {
          sector: selectedSector.value,
          matchId: props.matchId,
          _t: Date.now(),
        },
      });
      seats.value = res.data;
    } catch (e) {
      console.error("Nu am putut reîncărca locurile:", e);
    }
  }
}

async function handlePickSeats(sector) {
  if (!isLoggedIn.value) {
    showLoginWarning.value = true;
    return;
  }
  selectedSector.value = sector;
  showSeatPicker.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/api/seats`, {
      params: { sector: sector, matchId: props.matchId },
    });
    seats.value = res.data;
    maxRow.value = Math.max(...seats.value.map((s) => s.rand));
    maxCol.value = Math.max(...seats.value.map((s) => s.loc));
    picked.clear();
    const savedSeats = shoppingCartStore.getSelectedSeatsForSector(
      sector,
      props.matchId
    );
    if (savedSeats && savedSeats.length > 0) {
      savedSeats.forEach((key) => picked.add(key));
      selectedSeats.value = picked.size;
      totalPrice.value =
        Math.floor(sectorsData[selectedSector.value]?.pret * picked.size) || 0;
    } else {
      selectedSeats.value = 0;
      totalPrice.value = 0;
    }
  } catch (e) {
    console.error("Nu am putut prelua locurile:", e);
    seats.value = [];
  }
}

function closeSeatPicker() {
  showSeatPicker.value = false;
  selectedSector.value = !selectedSector.value;
}
function displayRow(r) {
  return maxRow.value - r + 1;
}
function toggleSeat(seat) {
  const key = `${seat.rand}-${seat.loc}`;
  const isSelected = picked.has(key);
  if (isSelected) {
    picked.delete(key);
  } else {
    picked.add(key);
  }
  selectedSeats.value = picked.size;
  const pret = sectorsData[selectedSector.value]?.pret || 0;
  totalPrice.value = Math.floor(pret * picked.size);
  shoppingCartStore.updateSeatSelection(
    selectedSector.value,
    key,
    !isSelected,
    props.matchId
  );
}
function addToCart() {
  if (picked.size === 0) {
    showSeatsWarning.value = true;
    return;
  }
  const selectedSeatsDetails = Array.from(picked).map((key) => {
    const [rand, loc] = key.split("-");
    return { rand, loc };
  });
  const seatsGroupedByRow = {};
  selectedSeatsDetails.forEach((seat) => {
    if (!seatsGroupedByRow[seat.rand]) {
      seatsGroupedByRow[seat.rand] = [];
    }
    seatsGroupedByRow[seat.rand].push(seat.loc);
  });
  const formattedSeats = Object.entries(seatsGroupedByRow).map(
    ([rand, locuri]) => ({ rand, locuri: locuri.join(", ") })
  );

  const ticketDetails = {
    numarBilete: picked.size,
    sector: selectedSector.value,
    tribuna: getSectorTribuna(selectedSector.value),
    pret: totalPrice.value,
    randuriSiLocuri: formattedSeats,
    selectedSeatsKeys: Array.from(picked),
    matchId: props.matchId,
    matchInfo: {
      awayTeamName: props.awayTeamName,
      matchDate: props.matchDate,
      matchTime: props.matchTime,
    },
  };
  shoppingCartStore.addTickets(ticketDetails);
  shoppingCartStore.showShoppingCart();
  selectedSeats.value = picked.size;
  totalPrice.value =
    Math.floor(sectorsData[selectedSector.value]?.pret * picked.size) || 0;
}
function getSectorTribuna(sector) {
  if (sector.startsWith("A") || sector === "VIP") return "TRIBUNA 1";
  else if (sector.startsWith("C")) return "TRIBUNA 2";
  else if (sector.startsWith("D")) return "PELUZA NORD";
  else if (sector.startsWith("B")) return "PELUZA SUD";
  return "";
}

onMounted(() => {
  fetchSectorData();
  if (localStorage.getItem("paymentComplete") === "true") {
    fetchSectorData();
    localStorage.removeItem("paymentComplete");
  }
  window.addEventListener("storage", function (event) {
    if (event.key === "paymentComplete" && event.newValue === "true") {
      fetchSectorData();
      localStorage.removeItem("paymentComplete");
    }
  });
  const checkPaymentComplete = setInterval(() => {
    if (localStorage.getItem("paymentComplete") === "true") {
      fetchSectorData();
      localStorage.removeItem("paymentComplete");
    }
  }, 1000);
  emitter.on("deselectSeats", (ticketToRemove) => {
    if (selectedSector.value === ticketToRemove.sector) {
      picked.clear();
      const remainingSeats = shoppingCartStore.getSelectedSeatsForSector(
        selectedSector.value,
        props.matchId
      );
      remainingSeats.forEach((key) => picked.add(key));
      selectedSeats.value = picked.size;
      totalPrice.value =
        Math.floor(sectorsData[selectedSector.value]?.pret * picked.size) || 0;
    }
  });
  onBeforeUnmount(() => {
    clearInterval(checkPaymentComplete);
    window.removeEventListener("storage", function (event) {});
  });
});
function handleBack() {
  emit("goBack");
}
</script>

<template>
  <div
    style="width: 100%"
    class="min-h-screen bg-gray-50 flex flex-col font-sans pb-10"
  >
    <div
      style="width: 100%"
      class="w-full bg-white shadow-sm z-20 px-4 py-4 md:px-8 flex items-center gap-4 sticky top-0"
    >
      <button
        class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium text-sm md:text-base"
        @click="handleBack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Înapoi
      </button>

      <div class="flex-1 text-center md:text-left">
        <h2 class="text-lg md:text-xl font-bold text-gray-800">
          Universitatea Craiova
          <span class="text-gray-400 font-light mx-2">vs</span>
          {{ awayTeamName }}
        </h2>
      </div>
    </div>

    <div style="margin-top: 15px" class="w-full px-4 mt-8">
      <div
        class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 relative overflow-hidden"
      >
        <div class="absolute left-0 top-0 h-full w-2 bg-blue-600"></div>

        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
              />
            </svg>
          </div>
          <div>
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              Kick-off
            </p>
            <p class="text-lg font-bold text-slate-900">
              {{ matchDate }} • {{ matchTime }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <div>
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              Arena
            </p>
            <p class="text-lg font-bold text-slate-900 flex items-center gap-2">
              Stadionul "Ion Oblemenco"
              <a
                href="#"
                class="text-xs text-blue-500 underline ml-2 hover:text-blue-700"
                >Hartă</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      style="margin-top: 50px"
      class="w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full"
    >
      <div class="flex flex-col">
        <div
          class="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
        >
          <div class="text-center z-10 mb-8">
            <h2
              class="text-2xl font-black text-slate-800 uppercase tracking-tight"
            >
              Harta Arenei
            </h2>
            <p class="text-slate-500 text-sm mt-1">
              Selectează zona dorită de pe planul stadionului
            </p>
          </div>

          <div
            class="w-full flex items-center justify-center transform hover:scale-105 transition-transform duration-500 ease-out"
          >
            <svg
              width="401"
              height="302"
              viewBox="0 0 401 302"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-full h-auto max-w-lg drop-shadow-2xl select-none font-sans"
            >
              <g clip-path="url(#clip0_3_180)">
                <g filter="url(#filter0_d_3_180)">
                  <ellipse
                    cx="200.667"
                    cy="147.084"
                    rx="200"
                    ry="126.5"
                    transform="rotate(0.92228 200.667 147.084)"
                    fill="#f1f5f9"
                  />
                </g>
                <ellipse
                  cx="200.667"
                  cy="147.084"
                  rx="171"
                  ry="93.5"
                  transform="rotate(0.92228 200.667 147.084)"
                  fill="#10b981"
                />

                <path
                  d="M197.167 119.084C211.003 119.084 222.167 129.634 222.167 142.584C222.167 155.535 211.003 166.084 197.167 166.084C183.33 166.084 172.167 155.535 172.167 142.584C172.167 129.634 183.33 119.084 197.167 119.084Z"
                  fill="#10b981"
                  stroke="white"
                  stroke-width="2"
                />
                <line
                  x1="198.167"
                  y1="78.5842"
                  x2="198.183"
                  y2="216.584"
                  stroke="white"
                  stroke-opacity="0.6"
                />
                <line
                  x1="101.167"
                  y1="74.5807"
                  x2="102.167"
                  y2="216.581"
                  stroke="white"
                  stroke-opacity="0.6"
                />
                <line
                  x1="298.167"
                  y1="77.5843"
                  x2="298.167"
                  y2="216.584"
                  stroke="white"
                  stroke-opacity="0.6"
                />

                <rect
                  class="svg-sector"
                  x="237.46"
                  y="40.6528"
                  width="65.66"
                  height="37"
                  transform="rotate(0.92228 237.46 40.6528)"
                  @click="handleSvgClick('C3')"
                  id="sector-C3"
                  :class="{ 'svg-selected': selectedSector === 'C3' }"
                />
                <rect
                  class="svg-sector"
                  x="169.469"
                  y="39.5582"
                  width="65.66"
                  height="37"
                  transform="rotate(0.92228 169.469 39.5582)"
                  @click="handleSvgClick('C2')"
                  id="sector-C2"
                  :class="{ 'svg-selected': selectedSector === 'C2' }"
                />
                <rect
                  class="svg-sector"
                  x="101.477"
                  y="38.4637"
                  width="65.66"
                  height="37"
                  transform="rotate(0.92228 101.477 38.4637)"
                  @click="handleSvgClick('C1')"
                  id="sector-C1"
                  :class="{ 'svg-selected': selectedSector === 'C1' }"
                />

                <rect
                  class="svg-sector"
                  x="102.057"
                  y="214.716"
                  width="65.66"
                  height="24.35"
                  transform="rotate(0.92228 102.057 214.716)"
                  @click="handleSvgClick('A1')"
                  id="sector-A1"
                  :class="{ 'svg-selected': selectedSector === 'A1' }"
                />
                <rect
                  class="svg-sector"
                  x="170.731"
                  y="215.411"
                  width="65.66"
                  height="24.35"
                  transform="rotate(0.92228 170.731 215.411)"
                  @click="handleSvgClick('A2')"
                  id="sector-A2"
                  :class="{ 'svg-selected': selectedSector === 'A2' }"
                />
                <rect
                  class="svg-sector"
                  x="239.722"
                  y="216.522"
                  width="65.66"
                  height="24.35"
                  transform="rotate(0.92228 239.722 216.522)"
                  @click="handleSvgClick('A3')"
                  id="sector-A3"
                  :class="{ 'svg-selected': selectedSector === 'A3' }"
                />
                <rect
                  class="svg-sector"
                  x="102.289"
                  y="242.313"
                  width="203"
                  height="14"
                  transform="rotate(0.92228 102.289 242.313)"
                  @click="handleSvgClick('VIP')"
                  id="sector-VIP"
                  :class="{ 'svg-selected': selectedSector === 'VIP' }"
                />

                <path
                  class="svg-sector"
                  d="M63.8305 107.912L35.7523 95.4169C41.0845 82.8644 46.2329 76.1206 60.345 64.7624L87.3008 80.7197C75.8672 89.1391 70.6854 95.051 63.8305 107.912Z"
                  @click="handleSvgClick('B3')"
                  id="sector-B3"
                  :class="{ 'svg-selected': selectedSector === 'B3' }"
                />
                <path
                  class="svg-sector"
                  d="M59.1441 165.439L32.6683 186.128C20.2253 154.725 17.9837 135.198 33.4518 100.079L62.2386 110.841C54.1341 130.894 53.4137 142.84 59.1441 165.439Z"
                  @click="handleSvgClick('B2')"
                  id="sector-B2"
                  :class="{ 'svg-selected': selectedSector === 'B2' }"
                />
                <path
                  class="svg-sector"
                  d="M36.2715 191.286L60.5046 167.432C67.9587 185.856 74.63 194.222 91.4518 205.264L68.1095 224.94C52.2455 214.33 45.4139 206.858 36.2715 191.286Z"
                  @click="handleSvgClick('B1')"
                  id="sector-B1"
                  :class="{ 'svg-selected': selectedSector === 'B1' }"
                />

                <path
                  class="svg-sector"
                  d="M331.123 179.751L350.763 206.898C341.301 214.866 335.852 218.759 325.57 223.468L305.276 200.307C316.154 194.026 321.911 189.558 331.597 179.9"
                  @click="handleSvgClick('D5')"
                  id="sector-D5"
                  :class="{ 'svg-selected': selectedSector === 'D5' }"
                />
                <path
                  class="svg-sector"
                  d="M377.354 164.34L346.042 152.848C343.255 162.541 340.741 167.745 334.493 176.594L357.735 200.174C367.752 187.896 371.933 179.966 377.354 164.34Z"
                  @click="handleSvgClick('D4')"
                  id="sector-D4"
                  :class="{ 'svg-selected': selectedSector === 'D4' }"
                />
                <path
                  class="svg-sector"
                  d="M348.234 125.077L379.217 117.507C382.871 130.194 383.022 142.952 380.305 156.505L348.288 149.077C349.655 139.791 349.905 134.553 348.234 125.077Z"
                  @click="handleSvgClick('D3')"
                  id="sector-D3"
                  :class="{ 'svg-selected': selectedSector === 'D3' }"
                />
                <path
                  class="svg-sector"
                  d="M334.166 100.433L356.299 77.9609C366.287 87.8633 370.887 94.2644 376.372 107.996L346.821 121.088C344.259 111.887 341.513 107.35 334.166 100.433Z"
                  @click="handleSvgClick('D2')"
                  id="sector-D2"
                  :class="{ 'svg-selected': selectedSector === 'D2' }"
                />
                <path
                  class="svg-sector"
                  d="M305.489 77.1732L327.086 54.3622C336.239 58.856 341.006 62.345 348.799 70.4566L329.667 96.4626C323.192 88.4069 317.997 84.1659 305.489 77.1732Z"
                  @click="handleSvgClick('D1')"
                  id="sector-D1"
                  :class="{ 'svg-selected': selectedSector === 'D1' }"
                />

                <g
                  class="pointer-events-none font-bold text-xs"
                  fill="black"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  <text x="134" y="58">C1</text>
                  <text x="202" y="59">C2</text>
                  <text x="270" y="60">C3</text>
                  <text x="135" y="227">A1</text>
                  <text x="203" y="228">A2</text>
                  <text x="272" y="229">A3</text>
                  <text x="203" y="249" font-size="10">VIP</text>
                  <text x="60" y="85">B3</text>
                  <text x="45" y="145">B2</text>
                  <text x="60" y="205">B1</text>
                  <text x="325" y="75">D1</text>
                  <text x="345" y="105">D2</text>
                  <text x="360" y="135">D3</text>
                  <text x="350" y="175">D4</text>
                  <text x="328" y="205">D5</text>
                </g>
              </g>
              <defs>
                <filter
                  id="filter0_d_3_180"
                  x="0.681892"
                  y="20.5589"
                  width="399.969"
                  height="253.051"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_3_180"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_3_180"
                    result="shape"
                  />
                </filter>
                <clipPath id="clip0_3_180">
                  <rect
                    x="0.666565"
                    y="0.584259"
                    width="400"
                    height="301"
                    fill="white"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 relative">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Alegeți sectorul</h1>

        <div
          v-if="showLoginWarning"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div
            class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center"
          >
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"
            >
              <svg
                class="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Autentificare Necesară
            </h3>
            <p class="text-gray-500 mb-6">
              Trebuie să intrați în cont pentru a rezerva bilete!
            </p>
            <button
              @click="showLoginWarning = false"
              class="w-full bg-gray-900 text-white rounded-lg py-2 hover:bg-gray-800 transition"
            >
              Închide
            </button>
          </div>
        </div>

        <div
          v-if="showSeatsWarning"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div
            class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Atenție</h3>
            <p class="text-gray-500 mb-6">Nu ați selectat nici un bilet!</p>
            <button
              @click="showSeatsWarning = false"
              class="w-full bg-gray-900 text-white rounded-lg py-2 hover:bg-gray-800 transition"
            >
              Închide
            </button>
          </div>
        </div>

        <div
          class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <div
            class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleSectorsT1"
          >
            <h3 class="font-bold text-lg text-gray-800">TRIBUNA 1</h3>
            <img
              class="w-5 h-5 transition-transform duration-300 opacity-60"
              :class="{ 'rotate-180': showSectorsT1 }"
              src="@/assets/images/Icons/arrow_drop_down_icon.png"
              alt="arrow"
            />
          </div>
          <Transition name="expand" @enter="enter" @leave="leave">
            <div
              v-if="showSectorsT1"
              class="bg-gray-50 border-t border-gray-100"
            >
              <div
                v-for="sector in ['A1', 'A2', 'A3', 'VIP']"
                :key="sector"
                class="p-4 border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors"
                v-show="
                  selectedSector === null ||
                  selectedSector === sector ||
                  selectedSector != sector
                "
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <p class="font-bold text-gray-900">Sector {{ sector }}</p>
                    <p class="text-sm text-gray-500">
                      Disponibile:
                      {{ sectorsData[sector]?.disponibile ?? "..." }}
                    </p>
                    <p
                      style="color: #027be6"
                      class="text-sm font-semibold mt-1"
                    >
                      {{ sectorsData[sector]?.pret ?? "..." }} RON
                    </p>
                  </div>
                  <button
                    style="cursor: pointer"
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-md"
                    @click="handlePickSeats(sector)"
                  >
                    ALEGE LOCURI
                  </button>
                </div>
                <Transition name="slide-fade">
                  <div
                    v-if="showSeatPicker && selectedSector === sector"
                    class="mt-4 bg-white rounded-xl shadow-inner p-4 border border-gray-200 relative"
                  >
                    <div class="absolute top-2 right-2">
                      <button
                        @click="closeSeatPicker"
                        class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div
                      class="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-3"
                    >
                      <div>
                        <p class="text-sm text-gray-500">
                          Selectate:
                          <span class="font-bold text-gray-900">{{
                            selectedSeats
                          }}</span>
                        </p>
                        <p class="text-sm text-gray-500">
                          Total:
                          <span style="color: #027be6" class="font-bold text-lg"
                            >{{ totalPrice }} RON</span
                          >
                        </p>
                      </div>
                      <button
                        style="background-color: #027be6"
                        class="px-6 py-2 text-white rounded-lg font-bold shadow-lg transition transform active:scale-95"
                        @click="addToCart"
                      >
                        Adaugă în coș
                      </button>
                    </div>

                    <div class="w-full overflow-x-auto pb-2">
                      <div class="flex min-w-max">
                        <div
                          class="grid gap-1 mr-2 text-xs font-bold text-gray-400 pt-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="r in [...Array(maxRow).keys()].reverse()"
                            :key="'label-' + r"
                            class="flex items-center justify-end h-6"
                          >
                            R{{ r + 1 }}
                          </div>
                        </div>
                        <div
                          class="grid gap-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                            gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="seat in seats"
                            :key="seat.rand + '-' + seat.loc"
                            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-150 border select-none"
                            :class="[
                              seat.status !== 'disponibil'
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                : picked.has(`${seat.rand}-${seat.loc}`)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-110'
                                : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer',
                            ]"
                            :style="{
                              gridRow: displayRow(seat.rand),
                              gridColumn: seat.loc,
                            }"
                            @click="
                              seat.status === 'disponibil' && toggleSeat(seat)
                            "
                          >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-6">
                      <div
                        class="h-12 bg-gradient-to-b from-green-600 to-green-800 rounded-lg flex items-center justify-center text-white/80 font-bold tracking-widest text-sm shadow-inner mb-4"
                      >
                        TEREN
                      </div>
                      <div
                        class="flex justify-center gap-6 text-xs text-gray-600 font-medium"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-green-100 border border-green-200"
                          ></div>
                          Disponibil
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-blue-600 border border-blue-700"
                          ></div>
                          Selectat
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"
                          ></div>
                          Rezervat
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div
          class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <div
            class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleSectorsT2"
          >
            <h3 class="font-bold text-lg text-gray-800">TRIBUNA 2</h3>
            <img
              class="w-5 h-5 transition-transform duration-300 opacity-60"
              :class="{ 'rotate-180': showSectorsT2 }"
              src="@/assets/images/Icons/arrow_drop_down_icon.png"
              alt="arrow"
            />
          </div>
          <Transition name="expand" @enter="enter" @leave="leave">
            <div
              v-if="showSectorsT2"
              class="bg-gray-50 border-t border-gray-100"
            >
              <div
                v-for="sector in ['C1', 'C2', 'C3']"
                :key="sector"
                class="p-4 border-b border-gray-200 last:border-0 hover:bg-gray-100"
                v-show="
                  selectedSector === null ||
                  selectedSector === sector ||
                  selectedSector != sector
                "
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <p class="font-bold text-gray-900">Sector {{ sector }}</p>
                    <p class="text-sm text-gray-500">
                      Disponibile:
                      {{ sectorsData[sector]?.disponibile ?? "..." }}
                    </p>
                    <p
                      style="color: #027be6"
                      class="text-sm font-semibold mt-1"
                    >
                      {{ sectorsData[sector]?.pret ?? "..." }} RON
                    </p>
                  </div>
                  <button
                    style="cursor: pointer"
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-md"
                    @click="handlePickSeats(sector)"
                  >
                    ALEGE LOCURI
                  </button>
                </div>
                <Transition name="slide-fade">
                  <div
                    v-if="showSeatPicker && selectedSector === sector"
                    class="mt-4 bg-white rounded-xl shadow-inner p-4 border border-gray-200 relative"
                  >
                    <div class="absolute top-2 right-2">
                      <button
                        @click="closeSeatPicker"
                        class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div
                      class="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-3"
                    >
                      <div>
                        <p class="text-sm text-gray-500">
                          Selectate:
                          <span class="font-bold text-gray-900">{{
                            selectedSeats
                          }}</span>
                        </p>
                        <p class="text-sm text-gray-500">
                          Total:
                          <span style="color: #027be6" class="font-bold text-lg"
                            >{{ totalPrice }} RON</span
                          >
                        </p>
                      </div>
                      <button
                        style="background-color: #027be6"
                        class="px-6 py-2 text-white rounded-lg font-bold shadow-lg transition transform active:scale-95"
                        @click="addToCart"
                      >
                        Adaugă în coș
                      </button>
                    </div>
                    <div class="w-full overflow-x-auto pb-2">
                      <div class="flex min-w-max">
                        <div
                          class="grid gap-1 mr-2 text-xs font-bold text-gray-400 pt-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="r in [...Array(maxRow).keys()].reverse()"
                            :key="'label-' + r"
                            class="flex items-center justify-end h-6"
                          >
                            R{{ r + 1 }}
                          </div>
                        </div>
                        <div
                          class="grid gap-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                            gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="seat in seats"
                            :key="seat.rand + '-' + seat.loc"
                            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-150 border select-none"
                            :class="[
                              seat.status !== 'disponibil'
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                : picked.has(`${seat.rand}-${seat.loc}`)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-110'
                                : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer',
                            ]"
                            :style="{
                              gridRow: displayRow(seat.rand),
                              gridColumn: seat.loc,
                            }"
                            @click="
                              seat.status === 'disponibil' && toggleSeat(seat)
                            "
                          >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-6">
                      <div
                        class="h-12 bg-gradient-to-b from-green-600 to-green-800 rounded-lg flex items-center justify-center text-white/80 font-bold tracking-widest text-sm shadow-inner mb-4"
                      >
                        TEREN
                      </div>
                      <div
                        class="flex justify-center gap-6 text-xs text-gray-600 font-medium"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-green-100 border border-green-200"
                          ></div>
                          Disponibil
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-blue-600 border border-blue-700"
                          ></div>
                          Selectat
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"
                          ></div>
                          Rezervat
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div
          class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <div
            class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleSectorsPN"
          >
            <h3 class="font-bold text-lg text-gray-800">PELUZA NORD</h3>
            <img
              class="w-5 h-5 transition-transform duration-300 opacity-60"
              :class="{ 'rotate-180': showSectorsPN }"
              src="@/assets/images/Icons/arrow_drop_down_icon.png"
              alt="arrow"
            />
          </div>
          <Transition name="expand" @enter="enter" @leave="leave">
            <div
              v-if="showSectorsPN"
              class="bg-gray-50 border-t border-gray-100"
            >
              <div
                v-for="sector in ['D1', 'D2', 'D3', 'D4', 'D5']"
                :key="sector"
                class="p-4 border-b border-gray-200 last:border-0 hover:bg-gray-100"
                v-show="
                  selectedSector === null ||
                  selectedSector === sector ||
                  selectedSector != sector
                "
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <p class="font-bold text-gray-900">Sector {{ sector }}</p>
                    <p class="text-sm text-gray-500">
                      Disponibile:
                      {{ sectorsData[sector]?.disponibile ?? "..." }}
                    </p>
                    <p
                      style="color: #027be6"
                      class="text-sm font-semibold mt-1"
                    >
                      {{ sectorsData[sector]?.pret ?? "..." }} RON
                    </p>
                  </div>
                  <button
                    style="cursor: pointer"
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-md"
                    @click="handlePickSeats(sector)"
                  >
                    ALEGE LOCURI
                  </button>
                </div>
                <Transition name="slide-fade">
                  <div
                    v-if="showSeatPicker && selectedSector === sector"
                    class="mt-4 bg-white rounded-xl shadow-inner p-4 border border-gray-200 relative"
                  >
                    <div class="absolute top-2 right-2">
                      <button
                        @click="closeSeatPicker"
                        class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div
                      class="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-3"
                    >
                      <div>
                        <p class="text-sm text-gray-500">
                          Selectate:
                          <span class="font-bold text-gray-900">{{
                            selectedSeats
                          }}</span>
                        </p>
                        <p class="text-sm text-gray-500">
                          Total:
                          <span style="color: #027be6" class="font-bold text-lg"
                            >{{ totalPrice }} RON</span
                          >
                        </p>
                      </div>
                      <button
                        style="background-color: #027be6"
                        class="px-6 py-2 text-white rounded-lg font-bold shadow-lg transition transform active:scale-95"
                        @click="addToCart"
                      >
                        Adaugă în coș
                      </button>
                    </div>
                    <div class="w-full overflow-x-auto pb-2">
                      <div class="flex min-w-max">
                        <div
                          class="grid gap-1 mr-2 text-xs font-bold text-gray-400 pt-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="r in Array.from(
                              { length: maxRow - 6 },
                              (_, i) => i + 6
                            )"
                            class="flex items-center justify-end h-6"
                          >
                            R{{ r }}
                          </div>
                        </div>
                        <div
                          class="grid gap-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                            gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="seat in seats"
                            :key="seat.rand + '-' + seat.loc"
                            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-150 border select-none"
                            :class="[
                              seat.status !== 'disponibil'
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                : picked.has(`${seat.rand}-${seat.loc}`)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-110'
                                : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer',
                            ]"
                            :style="{
                              gridRow: displayRow(seat.rand),
                              gridColumn: seat.loc,
                            }"
                            @click="
                              seat.status === 'disponibil' && toggleSeat(seat)
                            "
                          >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-6">
                      <div
                        class="h-12 bg-gradient-to-b from-green-600 to-green-800 rounded-lg flex items-center justify-center text-white/80 font-bold tracking-widest text-sm shadow-inner mb-4"
                      >
                        TEREN
                      </div>
                      <div
                        class="flex justify-center gap-6 text-xs text-gray-600 font-medium"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-green-100 border border-green-200"
                          ></div>
                          Disponibil
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-blue-600 border border-blue-700"
                          ></div>
                          Selectat
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"
                          ></div>
                          Rezervat
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div
          class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <div
            class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleSectorsPS"
          >
            <h3 class="font-bold text-lg text-gray-800">PELUZA SUD</h3>
            <img
              class="w-5 h-5 transition-transform duration-300 opacity-60"
              :class="{ 'rotate-180': showSectorsPS }"
              src="@/assets/images/Icons/arrow_drop_down_icon.png"
              alt="arrow"
            />
          </div>
          <Transition name="expand" @enter="enter" @leave="leave">
            <div
              v-if="showSectorsPS"
              class="bg-gray-50 border-t border-gray-100"
            >
              <div
                v-for="sector in ['B1', 'B2', 'B3']"
                :key="sector"
                class="p-4 border-b border-gray-200 last:border-0 hover:bg-gray-100"
                v-show="
                  selectedSector === null ||
                  selectedSector === sector ||
                  selectedSector != sector
                "
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <p class="font-bold text-gray-900">Sector {{ sector }}</p>
                    <p class="text-sm text-gray-500">
                      Disponibile:
                      {{ sectorsData[sector]?.disponibile ?? "..." }}
                    </p>
                    <p
                      style="color: #027be6"
                      class="text-sm font-semibold mt-1"
                    >
                      {{ sectorsData[sector]?.pret ?? "..." }} RON
                    </p>
                  </div>
                  <button
                    style="cursor: pointer"
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-md"
                    @click="handlePickSeats(sector)"
                  >
                    ALEGE LOCURI
                  </button>
                </div>
                <Transition name="slide-fade">
                  <div
                    v-if="showSeatPicker && selectedSector === sector"
                    class="mt-4 bg-white rounded-xl shadow-inner p-4 border border-gray-200 relative"
                  >
                    <div class="absolute top-2 right-2">
                      <button
                        @click="closeSeatPicker"
                        class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div
                      class="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-3"
                    >
                      <div>
                        <p class="text-sm text-gray-500">
                          Selectate:
                          <span class="font-bold text-gray-900">{{
                            selectedSeats
                          }}</span>
                        </p>
                        <p class="text-sm text-gray-500">
                          Total:
                          <span style="color: #027be6" class="font-bold text-lg"
                            >{{ totalPrice }} RON</span
                          >
                        </p>
                      </div>
                      <button
                        style="background-color: #027be6"
                        class="px-6 py-2 text-white rounded-lg font-bold shadow-lg transition transform active:scale-95"
                        @click="addToCart"
                      >
                        Adaugă în coș
                      </button>
                    </div>
                    <div class="w-full overflow-x-auto pb-2">
                      <div class="flex min-w-max">
                        <div
                          class="grid gap-1 mr-2 text-xs font-bold text-gray-400 pt-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="r in Array.from(
                              { length: maxRow - 6 },
                              (_, i) => i + 6
                            )"
                            class="flex items-center justify-end h-6"
                          >
                            R{{ r }}
                          </div>
                        </div>
                        <div
                          class="grid gap-1"
                          :style="{
                            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
                            gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
                          }"
                        >
                          <div
                            v-for="seat in seats"
                            :key="seat.rand + '-' + seat.loc"
                            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-150 border select-none"
                            :class="[
                              seat.status !== 'disponibil'
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                : picked.has(`${seat.rand}-${seat.loc}`)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-110'
                                : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer',
                            ]"
                            :style="{
                              gridRow: displayRow(seat.rand),
                              gridColumn: seat.loc,
                            }"
                            @click="
                              seat.status === 'disponibil' && toggleSeat(seat)
                            "
                          >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-6">
                      <div
                        class="h-12 bg-gradient-to-b from-green-600 to-green-800 rounded-lg flex items-center justify-center text-white/80 font-bold tracking-widest text-sm shadow-inner mb-4"
                      >
                        TEREN
                      </div>
                      <div
                        class="flex justify-center gap-6 text-xs text-gray-600 font-medium"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-green-100 border border-green-200"
                          ></div>
                          Disponibil
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-blue-600 border border-blue-700"
                          ></div>
                          Selectat
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"
                          ></div>
                          Rezervat
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Standard CSS for specific SVG styling that requires logic interaction 
   or properties not easily mapped to utility classes in complex SVGs */
.svg-sector {
  fill: #f9e2e2;
  stroke: black;
  cursor: pointer;
  transition: all 0.3s ease;
}

.svg-sector:hover {
  fill: #ffcdcd;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}

.svg-selected {
  stroke: #0066ff !important;
  stroke-width: 3 !important;
  fill: #3b82f6 !important; /* Tailwind blue-500 */
  filter: drop-shadow(0 0 6px #3b82f6) !important;
}

/* Transitions for Vue Animations */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.4s ease, opacity 0.4s ease;
  overflow: hidden;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
