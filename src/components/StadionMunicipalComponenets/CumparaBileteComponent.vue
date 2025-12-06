
<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useShoppingCartStore } from '@/stores/cosCumparaturi'
import { storeToRefs } from 'pinia'
import {useRouter} from "vue-router";
import { emitter } from '@/stores/cosCumparaturi'
const router = useRouter()
const emit = defineEmits(['goBack'])
const userStore = useUserStore()
const shoppingCartStore = useShoppingCartStore()
const { isLoggedIn } = storeToRefs(userStore)
const sectorsData = reactive({})
const sectors = ['A1', 'A2', 'A3', 'VIP', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'D4', 'D5', 'B1', 'B2', 'B3']
const showSectorsT1 = ref(false)
const showSectorsT2 = ref(false)
const showSectorsPN = ref(false)
const showSectorsPS = ref(false)
const selectedSector = ref(null)
const showSeatPicker = ref(false);
const seats = ref([]) // lista locurilor dintr-un sector
const picked = reactive(new Set()); // track selecții
const maxRow = ref(0)
const maxCol = ref(0)
const selectedSeats = ref(0);
const totalPrice = ref(0);
const showLoginWarning = ref(false)
const showSeatsWarning = ref(false)

const toggleSectorsT1 = () => {
  console.log('Toggle T1 called');
  showSectorsT1.value = !showSectorsT1.value;
}
const toggleSectorsT2 = () => {
  showSectorsT2.value = !showSectorsT2.value;
}
const toggleSectorsPN = () => {
  showSectorsPN.value = !showSectorsPN.value;
}
const toggleSectorsPS = () => {
  showSectorsPS.value = !showSectorsPS.value;
}
const enter = (el) => {
  el.style.maxHeight = '0';
  el.style.transition = 'max-height 0.4s ease';
  el.offsetHeight; // trigger reflow
  el.style.maxHeight = el.scrollHeight + 'px';
}
const leave = (el) => {
  el.style.maxHeight = el.scrollHeight + 'px';
  el.offsetHeight; // trigger reflow
  el.style.transition = 'max-height 0.4s ease';
  el.style.maxHeight = '0';
}
function handleSvgClick(sector) {
  if (selectedSector.value === sector) {
    selectedSector.value = null
    showSectorsT1.value = false
    showSectorsT2.value = false
    showSectorsPN.value = false
    showSectorsPS.value = false
  } else {
    selectedSector.value = sector
    showSectorsT1.value = sector.startsWith('A') || sector === 'VIP'
    showSectorsT2.value = sector.startsWith('C')
    showSectorsPN.value = sector.startsWith('D')
    showSectorsPS.value = sector.startsWith('B')
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
    required: true
  }
})
async function fetchSectorData() {
  console.log('=== fetchSectorData called ===');
  console.log('MatchId pentru request:', props.matchId);

  // Resetăm sectorsData pentru a asigura informații proaspete
  Object.assign(sectorsData, {});

  for (const sector of sectors) {
    try {
      console.log(`Încărcare date pentru sectorul ${sector} - meciul ${props.matchId}...`);

      const requestParams = {
        sector: sector,
        matchId: props.matchId, // Include matchId
        _t: Date.now()
      };

      console.log('Request params:', requestParams);

      const res = await axios.get(`http://localhost:3000/api/sector-info`, {
        params: requestParams
      });

      console.log(`Răspuns pentru sectorul ${sector}:`, res.data);

      sectorsData[sector] = { ...res.data };
    } catch (error) {
      console.error(`Eroare la sectorul ${sector}:`, error);
      sectorsData[sector] = { disponibile: 0, pret: 0 };
    }
  }

  // Dacă un sector este selectat, reîncărcăm și datele despre locuri
  if (selectedSector.value && showSeatPicker.value) {
    try {
      console.log(`Reîncărcare locuri pentru sectorul ${selectedSector.value} - meciul ${props.matchId}...`);
      const res = await axios.get(`http://localhost:3000/api/seats`, {
        params: {
          sector: selectedSector.value,
          matchId: props.matchId, // Include matchId
          _t: Date.now()
        }
      });
      seats.value = res.data;
      console.log(`Locuri actualizate pentru sectorul ${selectedSector.value}:`, seats.value);
    } catch (e) {
      console.error('Nu am putut reîncărca locurile:', e);
    }
  }
}
async function handlePickSeats(sector) {
  console.log('=== handlePickSeats called ===');
  console.log('Sector:', sector);
  console.log('MatchId:', props.matchId);

  if (!isLoggedIn.value) {
    showLoginWarning.value = true
    return
  }

  selectedSector.value = sector;
  showSeatPicker.value = true;

  try {
    const res = await axios.get(`http://localhost:3000/api/seats`, {
      params: {
        sector: sector,
        matchId: props.matchId // Include matchId
      }
    });

    console.log('Seats response:', res.data);

    seats.value = res.data;
    maxRow.value = Math.max(...seats.value.map(s => s.rand))
    maxCol.value = Math.max(...seats.value.map(s => s.loc))

    // Resetăm picked și apoi încărcăm locurile salvate din coș
    picked.clear();

    // Încărcăm locurile selectate din store pentru acest meci specific
    const savedSeats = shoppingCartStore.getSelectedSeatsForSector(sector, props.matchId);
    console.log('Loading saved seats for sector', sector, 'match', props.matchId, savedSeats);

    if (savedSeats && savedSeats.length > 0) {
      savedSeats.forEach(key => picked.add(key));
      selectedSeats.value = picked.size;
      totalPrice.value = Math.floor(sectorsData[selectedSector.value]?.pret * picked.size) || 0;
    } else {
      selectedSeats.value = 0;
      totalPrice.value = 0;
    }
  } catch (e) {
    console.error('Nu am putut prelua locurile:', e);
    seats.value = [];
  }
}

function closeSeatPicker(){
  showSeatPicker.value = false;
  selectedSector.value = !selectedSector.value;
}
function displayRow(r) {
  return maxRow.value - r + 1
}
function toggleSeat(seat) {
  const key = `${seat.rand}-${seat.loc}`;
  const isSelected = picked.has(key);

  if (isSelected) {
    picked.delete(key);
  } else {
    picked.add(key);
  }

  // Actualizăm contoarele locale
  selectedSeats.value = picked.size;
  const pret = sectorsData[selectedSector.value]?.pret || 0;
  totalPrice.value = Math.floor(pret * picked.size);

  // Sincronizăm cu store-ul, includând matchId
  shoppingCartStore.updateSeatSelection(selectedSector.value, key, !isSelected, props.matchId);
}
// Modifică funcția addToCart pentru a include matchId
function addToCart() {
  if (picked.size === 0) {
    showSeatsWarning.value = true;
    return;
  }

  const selectedSeatsDetails = Array.from(picked).map(key => {
    const [rand, loc] = key.split('-');
    return { rand, loc };
  });

  const seatsGroupedByRow = {};
  selectedSeatsDetails.forEach(seat => {
    if (!seatsGroupedByRow[seat.rand]) {
      seatsGroupedByRow[seat.rand] = [];
    }
    seatsGroupedByRow[seat.rand].push(seat.loc);
  });

  const formattedSeats = Object.entries(seatsGroupedByRow)
      .map(([rand, locuri]) => ({ rand, locuri: locuri.join(', ') }));

  const ticketDetails = {
    numarBilete: picked.size,
    sector: selectedSector.value,
    tribuna: getSectorTribuna(selectedSector.value),
    pret: totalPrice.value,
    randuriSiLocuri: formattedSeats,
    selectedSeatsKeys: Array.from(picked),
    matchId: props.matchId, // Ensure matchId is included
    matchInfo: {
      awayTeamName: props.awayTeamName,
      matchDate: props.matchDate,
      matchTime: props.matchTime
    }
  };

  console.log('Adding tickets to cart with matchId:', ticketDetails);
  shoppingCartStore.addTickets(ticketDetails);
  shoppingCartStore.showShoppingCart();

  selectedSeats.value = picked.size;
  totalPrice.value = Math.floor(sectorsData[selectedSector.value]?.pret * picked.size) || 0;
}
function getSectorTribuna(sector) {
  if (sector.startsWith('A') || sector === 'VIP') {
    return 'TRIBUNA 1';
  } else if (sector.startsWith('C')) {
    return 'TRIBUNA 2';
  } else if (sector.startsWith('D')) {
    return 'PELUZA NORD';
  } else if (sector.startsWith('B')) {
    return 'PELUZA SUD';
  }
  return '';
}

onMounted(() => {
  // Inițial încărcăm datele despre sectoare
  fetchSectorData();

  // Verificăm dacă există un flag pentru actualizarea datelor după o plată recentă
  if (localStorage.getItem('paymentComplete') === 'true') {
    console.log('Flag de plată detectat la încărcare, reîmprospătare date.');
    fetchSectorData();
    localStorage.removeItem('paymentComplete');
  }

  // Ascultăm pentru schimbări în localStorage pentru a detecta actualizări
  window.addEventListener('storage', function(event) {
    if (event.key === 'paymentComplete' && event.newValue === 'true') {
      console.log('Eveniment storage detectat: reîmprospătare date despre sectoare după plată.');
      fetchSectorData();
      localStorage.removeItem('paymentComplete');
    }
  });

  // Pentru a ne asigura că un eveniment storage este generat chiar și atunci când plata
  // se face în aceeași fereastră, adăugăm un interval care verifică localStorage
  const checkPaymentComplete = setInterval(() => {
    if (localStorage.getItem('paymentComplete') === 'true') {
      console.log('Flag de plată detectat în interval, reîmprospătare date.');
      fetchSectorData();
      localStorage.removeItem('paymentComplete');
    }
  }, 1000);

  // Ascultăm evenimentul de deselectare pentru a actualiza UI-ul
  emitter.on('deselectSeats', (ticketToRemove) => {
    console.log('deselectSeats event received', ticketToRemove);

    if (selectedSector.value === ticketToRemove.sector) {
      console.log('Updating UI for sector:', selectedSector.value);

      // Resetăm picked și reîncărcăm locurile rămase din store
      picked.clear();

      const remainingSeats = shoppingCartStore.getSelectedSeatsForSector(selectedSector.value, props.matchId);
      remainingSeats.forEach(key => picked.add(key));

      // Actualizăm contoarele
      selectedSeats.value = picked.size;
      totalPrice.value = Math.floor(sectorsData[selectedSector.value]?.pret * picked.size) || 0;
    }
  });

  // Curățăm interval-ul când componenta este demontată
  onBeforeUnmount(() => {
    clearInterval(checkPaymentComplete);
    // De asemenea, oprim ascultarea evenimentului la dezmontare
    window.removeEventListener('storage', function(event) {
      if (event.key === 'paymentComplete' && event.newValue === 'true') {
        fetchSectorData();
        localStorage.removeItem('paymentComplete');
      }
    });
  });
});

function handleBack() {
  emit('goBack');
}
</script>

<template>
  <div class="pagina-cumparare">
    <button class="back-btn" @click="handleBack" >
      <img src="@/assets/images/Icons/menu_arrow_icon.png" alt="arrow-back" class="back-arrow">
      <p class="back-text">Înapoi</p>
    </button>
    <div class="info-container">
      <p>Bilete la AFC Hermannstadt vs {{ awayTeamName }} </p>
      <div class="ora_data_info">
        <img src="@/assets/images/Icons/clock_icon.png" alt="clock_icon" >
        <p>Data: {{ matchDate }}  Ora: {{ matchTime }}</p>
      </div>
      <div class="locatie_info">
        <img src="@/assets/images/Icons/locatie_icon.png" alt="locatie_icon" >
        <p>Locație: Stadionul Municipal Sibiu </p>
        <a class="map-link" href="https://www.google.com/maps/search/Sibiu%2c+Stadion+Municipal" target="_blank">
          <p style="overflow:hidden; white-space: nowrap;">vezi pe harta</p>
        </a>
        <img src="@/assets/images/Icons/map_icon.png" alt="map_icon" style="margin-left:0.5rem;margin-top:0.1rem;width:20px;">
      </div>
    </div>
    <div class="cumpara-bilete-container">
      <div class="map-container">
        <h1 style="font-weight: bold">Hartă interactivă</h1>
        <p style="text-align: center;font-size: 1.3rem">Alegeți sectorul unde doriți să stați</p>
        <div class="svg-wrapper" style="transform: scale(1.25);">
        <svg width="401" height="302" viewBox="0 0 401 302" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_3_180)">
              <g filter="url(#filter0_d_3_180)">
                <ellipse cx="200.667" cy="147.084" rx="200" ry="126.5" transform="rotate(0.92228 200.667 147.084)" fill="#A5AAA5"/>
              </g>
              <ellipse cx="200.667" cy="147.084" rx="171" ry="93.5" transform="rotate(0.92228 200.667 147.084)" fill="#008000"/>
              <rect x="237.46" y="40.6528" width="65.66" height="37" transform="rotate(0.92228 237.46 40.6528)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('C3')" id="sector-C3" :class="{'svg-selected': selectedSector === 'C3'}" cursor="pointer"/>
              <rect x="169.469" y="39.5582" width="65.66" height="37" transform="rotate(0.92228 169.469 39.5582)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('C2')" id="sector-C2" :class="{'svg-selected': selectedSector === 'C2'}" cursor="pointer"/>
              <rect x="101.477" y="38.4637" width="65.66" height="37" transform="rotate(0.92228 101.477 38.4637)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('C1')" id="sector-C1" :class="{'svg-selected': selectedSector === 'C1'}" cursor="pointer"/>
              <path d="M134.019 53.5591C133.563 53.5518 133.15 53.6251 132.779 53.7792C132.409 53.9253 132.093 54.1482 131.832 54.448C131.571 54.7399 131.37 55.1007 131.227 55.5304C131.084 55.9522 131.008 56.431 130.999 56.967C130.988 57.6709 131.086 58.2845 131.294 58.8079C131.509 59.3315 131.831 59.7367 132.258 60.0236C132.694 60.3107 133.24 60.4595 133.895 60.47C134.271 60.4761 134.628 60.4498 134.965 60.3912C135.302 60.3327 135.631 60.2579 135.953 60.1671L135.938 61.103C135.616 61.2178 135.282 61.3005 134.937 61.3509C134.601 61.4015 134.196 61.423 133.724 61.4154C132.852 61.4014 132.127 61.2097 131.549 60.8403C130.971 60.471 130.539 59.9519 130.254 59.2833C129.977 58.6147 129.845 57.8325 129.86 56.9366C129.87 56.2887 129.968 55.6982 130.152 55.1651C130.345 54.6321 130.616 54.1724 130.967 53.786C131.325 53.3997 131.762 53.1067 132.277 52.907C132.792 52.6993 133.382 52.6008 134.046 52.6114C134.486 52.6185 134.909 52.6693 135.316 52.7639C135.722 52.8585 136.084 52.9883 136.402 53.1534L135.955 54.0584C135.693 53.9341 135.399 53.8214 135.072 53.7201C134.754 53.619 134.403 53.5653 134.019 53.5591ZM140.899 61.4109L139.867 61.3943L139.964 55.4071C139.967 55.1751 139.971 54.9791 139.973 54.8191C139.984 54.6593 139.994 54.5114 140.004 54.3756C140.015 54.2317 140.025 54.0839 140.036 53.932C139.905 54.0579 139.788 54.1641 139.682 54.2504C139.577 54.3367 139.443 54.4466 139.281 54.58L138.357 55.3092L137.817 54.5924L140.161 52.8299L141.037 52.844L140.899 61.4109Z" fill="black"/>
              <path d="M201.01 54.6376C200.554 54.6302 200.141 54.7036 199.77 54.8576C199.4 55.0037 199.084 55.2266 198.823 55.5265C198.563 55.8183 198.361 56.1791 198.218 56.6089C198.075 57.0306 197.999 57.5095 197.991 58.0454C197.979 58.7493 198.078 59.363 198.285 59.8864C198.501 60.4099 198.822 60.8151 199.25 61.1021C199.685 61.3891 200.231 61.5379 200.887 61.5485C201.263 61.5545 201.619 61.5283 201.956 61.4697C202.293 61.4111 202.622 61.3364 202.944 61.2455L202.929 62.1814C202.607 62.2963 202.274 62.3789 201.929 62.4294C201.592 62.4799 201.187 62.5014 200.716 62.4938C199.844 62.4798 199.119 62.2881 198.541 61.9188C197.962 61.5494 197.531 61.0304 197.245 60.3617C196.968 59.6932 196.837 58.9109 196.851 58.0151C196.862 57.3671 196.959 56.7766 197.144 56.2435C197.336 55.7106 197.608 55.2509 197.958 54.8645C198.316 54.4782 198.753 54.1852 199.268 53.9854C199.784 53.7777 200.373 53.6792 201.037 53.6899C201.477 53.697 201.9 53.7478 202.307 53.8423C202.714 53.9369 203.075 54.0667 203.393 54.2319L202.946 55.1368C202.684 55.0126 202.39 54.8998 202.064 54.7985C201.745 54.6974 201.394 54.6437 201.01 54.6376ZM209.87 62.5212L204.207 62.43L204.221 61.5541L206.501 59.3226C206.94 58.8976 207.31 58.5195 207.612 58.1883C207.913 57.8571 208.142 57.5327 208.3 57.2152C208.457 56.8897 208.538 56.535 208.545 56.151C208.552 55.6791 208.418 55.3209 208.142 55.0764C207.866 54.8239 207.504 54.6941 207.056 54.6869C206.64 54.6802 206.271 54.7463 205.949 54.8851C205.634 55.024 205.311 55.2189 204.979 55.4696L204.427 54.7526C204.654 54.5642 204.9 54.3962 205.167 54.2484C205.441 54.1008 205.735 53.9855 206.049 53.9026C206.37 53.8197 206.711 53.7812 207.071 53.787C207.606 53.7956 208.065 53.895 208.446 54.0852C208.827 54.2753 209.119 54.5441 209.321 54.8914C209.532 55.2308 209.633 55.6365 209.625 56.1084C209.62 56.4444 209.563 56.7635 209.454 57.0658C209.345 57.3601 209.193 57.6497 208.996 57.9345C208.799 58.2194 208.563 58.5076 208.286 58.7992C208.009 59.0908 207.704 59.3939 207.371 59.7086L205.555 61.4436L205.554 61.4916L209.886 61.5613L209.87 62.5212Z" fill="black"/>
              <path d="M265.65 55.6782C265.194 55.6708 264.781 55.7442 264.41 55.8982C264.04 56.0443 263.724 56.2672 263.464 56.5671C263.203 56.8589 263.001 57.2197 262.858 57.6495C262.715 58.0712 262.639 58.5501 262.631 59.086C262.62 59.7899 262.718 60.4036 262.925 60.927C263.141 61.4505 263.462 61.8557 263.89 62.1427C264.325 62.4297 264.871 62.5785 265.527 62.5891C265.903 62.5951 266.259 62.5689 266.596 62.5103C266.933 62.4517 267.262 62.377 267.584 62.2861L267.569 63.222C267.247 63.3369 266.914 63.4195 266.569 63.47C266.232 63.5205 265.828 63.542 265.356 63.5344C264.484 63.5204 263.759 63.3287 263.181 62.9593C262.602 62.59 262.171 62.071 261.885 61.4023C261.608 60.7338 261.477 59.9515 261.491 59.0557C261.502 58.4077 261.599 57.8172 261.784 57.2841C261.976 56.7512 262.248 56.2915 262.598 55.9051C262.956 55.5188 263.393 55.2258 263.908 55.026C264.424 54.8183 265.013 54.7198 265.677 54.7305C266.117 54.7376 266.541 54.7884 266.947 54.8829C267.354 54.9775 267.716 55.1073 268.033 55.2725L267.586 56.1774C267.324 56.0532 267.03 55.9404 266.704 55.8391C266.385 55.738 266.034 55.6843 265.65 55.6782ZM274.292 56.9934C274.286 57.3774 274.209 57.7082 274.06 57.9858C273.912 58.2635 273.7 58.4881 273.425 58.6597C273.158 58.8314 272.844 58.9504 272.483 59.0166L272.482 59.0646C273.169 59.1556 273.678 59.3798 274.008 59.7372C274.338 60.0946 274.499 60.5572 274.49 61.1251C274.482 61.6211 274.358 62.0632 274.12 62.4514C273.882 62.8316 273.517 63.1258 273.026 63.3339C272.542 63.5421 271.921 63.6401 271.161 63.6279C270.713 63.6207 270.298 63.578 269.915 63.4998C269.532 63.4296 269.166 63.3037 268.817 63.1221L268.833 62.1382C269.19 62.32 269.575 62.4662 269.99 62.5769C270.404 62.6796 270.803 62.734 271.187 62.7402C271.955 62.7526 272.509 62.6135 272.85 62.3229C273.199 62.0245 273.378 61.6113 273.386 61.0834C273.392 60.7234 273.301 60.4339 273.112 60.2149C272.932 59.9879 272.662 59.8196 272.304 59.7098C271.946 59.6 271.515 59.5411 271.011 59.5329L270.183 59.5196L270.197 58.6197L271.037 58.6333C271.509 58.6408 271.902 58.5792 272.216 58.4482C272.539 58.3174 272.782 58.1333 272.945 57.8959C273.117 57.6506 273.206 57.368 273.211 57.048C273.218 56.6321 273.083 56.3099 272.807 56.0814C272.53 55.8449 272.152 55.7228 271.672 55.7151C271.368 55.7102 271.092 55.7378 270.843 55.7978C270.594 55.8498 270.361 55.93 270.143 56.0385C269.933 56.1392 269.719 56.2597 269.501 56.4002L268.985 55.6718C269.195 55.5152 269.434 55.371 269.7 55.2393C269.974 55.1077 270.276 55.0045 270.605 54.9298C270.934 54.8551 271.291 54.8208 271.675 54.827C272.57 54.8414 273.231 55.0521 273.657 55.459C274.09 55.866 274.302 56.3775 274.292 56.9934Z" fill="black"/>
              <rect x="102.057" y="214.716" width="65.66" height="24.35" transform="rotate(0.92228 102.057 214.716)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('A1')" id="sector-A1" :class="{'svg-selected': selectedSector === 'A1'}" cursor="pointer"/>
              <rect x="170.731" y="215.411" width="65.66" height="24.35" transform="rotate(0.92228 170.731 215.411)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('A2')" id="sector-A2" :class="{'svg-selected': selectedSector === 'A2'}" cursor="pointer"/>
              <rect x="239.722" y="216.522" width="65.66" height="24.35" transform="rotate(0.92228 239.722 216.522)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('A3')" id="sector-A3" :class="{'svg-selected': selectedSector === 'A3'}" cursor="pointer"/>
              <rect x="102.289" y="242.313" width="203" height="14" transform="rotate(0.92228 102.289 242.313)" fill="#F9E2E2" stroke="black" @click="handleSvgClick('VIP')" id="sector-VIP" :class="{'svg-selected': selectedSector === 'VIP'}" cursor="pointer"/>
              <path d="M188.942 253.978L183.993 253.899L184.004 253.219L187.854 247.62L184.215 247.562L184.228 246.762L188.957 246.838L188.946 247.518L185.096 253.116L188.955 253.179L188.942 253.978ZM194.887 251.384C194.88 251.83 194.814 252.226 194.688 252.571C194.57 252.909 194.398 253.196 194.174 253.433C193.957 253.669 193.691 253.848 193.376 253.97C193.067 254.085 192.723 254.139 192.343 254.133C191.99 254.128 191.664 254.062 191.366 253.937C191.068 253.806 190.811 253.618 190.595 253.375C190.379 253.131 190.21 252.839 190.089 252.497C189.975 252.148 189.921 251.751 189.928 251.304C189.938 250.711 190.046 250.212 190.252 249.809C190.459 249.399 190.751 249.09 191.127 248.883C191.504 248.669 191.949 248.566 192.462 248.574C192.949 248.582 193.374 248.699 193.737 248.925C194.107 249.144 194.392 249.462 194.592 249.879C194.798 250.289 194.897 250.791 194.887 251.384ZM190.838 251.319C190.831 251.739 190.879 252.106 190.98 252.421C191.089 252.729 191.258 252.969 191.489 253.139C191.719 253.31 192.015 253.398 192.375 253.404C192.735 253.409 193.033 253.331 193.269 253.168C193.505 253.005 193.678 252.771 193.79 252.466C193.908 252.155 193.971 251.789 193.978 251.369C193.984 250.943 193.934 250.578 193.825 250.277C193.717 249.975 193.547 249.742 193.316 249.578C193.092 249.408 192.797 249.32 192.43 249.314C191.884 249.305 191.484 249.479 191.232 249.835C190.98 250.191 190.848 250.685 190.838 251.319ZM198.906 248.678C199.546 248.688 200.027 248.853 200.348 249.171C200.67 249.483 200.825 249.986 200.814 250.679L200.758 254.169L199.888 254.155L199.943 250.725C199.95 250.292 199.859 249.967 199.669 249.751C199.479 249.534 199.178 249.423 198.764 249.416C198.171 249.406 197.758 249.566 197.526 249.896C197.294 250.226 197.173 250.704 197.163 251.33L197.119 254.11L196.239 254.096L196.325 248.737L197.035 248.748L197.153 249.48L197.203 249.481C197.326 249.296 197.475 249.145 197.65 249.028C197.832 248.904 198.031 248.814 198.245 248.757C198.459 248.701 198.68 248.674 198.906 248.678ZM204.537 248.779C205.19 248.789 205.671 248.94 205.98 249.232C206.289 249.524 206.438 249.983 206.428 250.609L206.369 254.259L205.729 254.249L205.571 253.486L205.531 253.485C205.375 253.676 205.212 253.837 205.044 253.968C204.882 254.092 204.693 254.182 204.479 254.239C204.271 254.295 204.018 254.321 203.718 254.316C203.398 254.311 203.109 254.25 202.851 254.132C202.599 254.015 202.402 253.838 202.259 253.603C202.116 253.36 202.048 253.059 202.054 252.699C202.062 252.166 202.279 251.759 202.703 251.48C203.128 251.193 203.777 251.044 204.651 251.031L205.561 251.016L205.566 250.696C205.573 250.249 205.482 249.937 205.291 249.761C205.101 249.585 204.829 249.494 204.476 249.488C204.196 249.483 203.928 249.522 203.674 249.605C203.419 249.681 203.181 249.77 202.959 249.874L202.7 249.209C202.935 249.086 203.214 248.984 203.535 248.903C203.856 248.814 204.19 248.773 204.537 248.779ZM204.751 251.643C204.084 251.659 203.619 251.758 203.356 251.94C203.1 252.123 202.969 252.384 202.963 252.724C202.958 253.024 203.045 253.245 203.223 253.388C203.407 253.531 203.643 253.605 203.929 253.61C204.382 253.617 204.761 253.5 205.065 253.258C205.369 253.009 205.525 252.625 205.534 252.105L205.541 251.625L204.751 251.643ZM215.886 247.271L213.221 254.369L212.321 254.355L209.887 247.175L210.827 247.19L212.363 251.795C212.433 251.99 212.493 252.177 212.544 252.358C212.594 252.539 212.638 252.713 212.675 252.88C212.719 253.041 212.757 253.202 212.787 253.362C212.823 253.203 212.863 253.04 212.905 252.874C212.955 252.708 213.007 252.536 213.064 252.356C213.127 252.177 213.193 251.989 213.263 251.79L214.936 247.256L215.886 247.271ZM218.747 254.458L216.167 254.417L216.175 253.897L217.018 253.72L217.11 248.011L216.274 247.798L216.282 247.278L218.862 247.319L218.853 247.839L218.01 248.026L217.918 253.735L218.755 253.938L218.747 254.458ZM222.13 247.372C223.063 247.387 223.74 247.581 224.161 247.955C224.581 248.328 224.786 248.848 224.776 249.515C224.771 249.808 224.716 250.09 224.612 250.362C224.514 250.627 224.354 250.865 224.13 251.074C223.907 251.284 223.611 251.449 223.242 251.57C222.874 251.684 222.423 251.737 221.89 251.728L221.07 251.715L221.025 254.495L220.125 254.48L220.24 247.341L222.13 247.372ZM222.037 248.14L221.128 248.126L221.082 250.945L221.802 250.957C222.255 250.964 222.633 250.924 222.934 250.835C223.236 250.74 223.462 250.587 223.612 250.376C223.762 250.165 223.84 249.886 223.845 249.54C223.853 249.08 223.711 248.734 223.422 248.503C223.132 248.271 222.671 248.151 222.037 248.14Z" fill="black"/>
              <path d="M270.407 232.518L269.582 230.294L266.753 230.249L265.867 232.445L264.957 232.43L267.862 225.306L268.672 225.319L271.336 232.533L270.407 232.518ZM268.56 227.317C268.541 227.264 268.509 227.166 268.465 227.026C268.42 226.885 268.376 226.741 268.332 226.593C268.294 226.44 268.263 226.322 268.237 226.242C268.202 226.375 268.163 226.511 268.121 226.65C268.085 226.783 268.047 226.906 268.005 227.018C267.97 227.131 267.938 227.227 267.91 227.307L267.065 229.453L269.325 229.49L268.56 227.317ZM276.361 227.143C276.355 227.463 276.291 227.738 276.167 227.97C276.043 228.201 275.867 228.388 275.638 228.531C275.416 228.674 275.154 228.774 274.853 228.829L274.853 228.869C275.425 228.945 275.848 229.131 276.124 229.429C276.399 229.727 276.533 230.113 276.525 230.586C276.519 230.999 276.416 231.368 276.217 231.691C276.019 232.008 275.715 232.253 275.305 232.426C274.903 232.6 274.384 232.682 273.751 232.672C273.378 232.665 273.032 232.63 272.713 232.565C272.394 232.506 272.089 232.401 271.798 232.25L271.811 231.43C272.109 231.582 272.43 231.703 272.775 231.796C273.121 231.881 273.453 231.927 273.773 231.932C274.413 231.942 274.875 231.826 275.159 231.584C275.45 231.335 275.599 230.991 275.606 230.551C275.61 230.251 275.534 230.01 275.377 229.827C275.227 229.638 275.002 229.498 274.704 229.406C274.405 229.315 274.046 229.266 273.626 229.259L272.936 229.248L272.948 228.498L273.648 228.509C274.042 228.516 274.369 228.464 274.631 228.355C274.899 228.246 275.102 228.093 275.238 227.895C275.382 227.69 275.455 227.455 275.46 227.188C275.465 226.842 275.353 226.573 275.123 226.383C274.892 226.186 274.577 226.084 274.177 226.078C273.924 226.073 273.694 226.096 273.486 226.146C273.279 226.19 273.084 226.257 272.903 226.347C272.728 226.431 272.55 226.531 272.368 226.648L271.938 226.041C272.113 225.911 272.312 225.791 272.534 225.681C272.762 225.571 273.013 225.485 273.288 225.423C273.562 225.361 273.859 225.332 274.179 225.337C274.926 225.349 275.477 225.525 275.831 225.864C276.192 226.203 276.369 226.63 276.361 227.143Z" fill="black"/>
              <path d="M204.415 231.455L203.591 229.232L200.761 229.186L199.876 231.382L198.966 231.368L201.871 224.243L202.681 224.256L205.345 231.47L204.415 231.455ZM202.569 226.255C202.549 226.201 202.518 226.104 202.473 225.963C202.429 225.823 202.385 225.679 202.34 225.531C202.303 225.377 202.271 225.26 202.246 225.18C202.21 225.312 202.172 225.448 202.129 225.588C202.094 225.721 202.055 225.843 202.013 225.956C201.978 226.069 201.947 226.165 201.919 226.244L201.074 228.391L203.334 228.428L202.569 226.255ZM210.551 231.554L205.832 231.478L205.843 230.748L207.744 228.889C208.109 228.534 208.418 228.219 208.669 227.943C208.92 227.667 209.111 227.397 209.242 227.132C209.373 226.861 209.441 226.566 209.446 226.246C209.453 225.852 209.341 225.554 209.111 225.35C208.881 225.14 208.579 225.031 208.206 225.025C207.859 225.02 207.552 225.075 207.283 225.191C207.021 225.306 206.752 225.469 206.475 225.678L206.015 225.08C206.204 224.923 206.409 224.783 206.631 224.66C206.86 224.537 207.105 224.441 207.366 224.372C207.634 224.303 207.918 224.271 208.218 224.276C208.665 224.283 209.047 224.366 209.364 224.524C209.682 224.683 209.925 224.906 210.093 225.196C210.269 225.479 210.353 225.817 210.347 226.21C210.343 226.49 210.295 226.756 210.204 227.008C210.114 227.253 209.986 227.494 209.822 227.732C209.659 227.969 209.461 228.209 209.231 228.452C209 228.695 208.746 228.948 208.468 229.21L206.955 230.656L206.954 230.696L210.564 230.754L210.551 231.554Z" fill="black"/>
              <path d="M137.021 230.37L136.197 228.147L133.368 228.101L132.482 230.297L131.572 230.283L134.477 223.159L135.287 223.172L137.951 230.385L137.021 230.37ZM135.175 225.17C135.156 225.116 135.124 225.019 135.08 224.878C135.035 224.738 134.991 224.594 134.947 224.446C134.909 224.292 134.878 224.175 134.852 224.095C134.817 224.227 134.778 224.363 134.736 224.503C134.7 224.636 134.662 224.758 134.62 224.871C134.585 224.984 134.553 225.08 134.525 225.16L133.68 227.306L135.94 227.343L135.175 225.17ZM141.508 230.443L140.648 230.429L140.728 225.439C140.731 225.246 140.734 225.083 140.736 224.949C140.745 224.816 140.753 224.693 140.762 224.58C140.771 224.46 140.779 224.337 140.788 224.21C140.679 224.315 140.581 224.404 140.494 224.476C140.406 224.547 140.294 224.639 140.159 224.75L139.389 225.358L138.939 224.761L140.893 223.292L141.623 223.304L141.508 230.443Z" fill="black"/>
              <path d="M197.167 119.084C211.003 119.084 222.167 129.634 222.167 142.584C222.167 155.535 211.003 166.084 197.167 166.084C183.33 166.084 172.167 155.535 172.167 142.584C172.167 129.634 183.33 119.084 197.167 119.084Z" fill="#008000" stroke="white"/>
              <line x1="198.167" y1="78.5842" x2="198.183" y2="216.584" stroke="white"/>
              <line x1="101.167" y1="74.5807" x2="102.167" y2="216.581" stroke="white"/>
              <line x1="298.167" y1="77.5843" x2="298.167" y2="216.584" stroke="white"/>
              <rect x="102.167" y="119.084" width="42" height="53" fill="#008000" stroke="white"/>
              <rect x="97.1666" y="137.084" width="4" height="17" fill="#008000" stroke="white"/>
              <rect x="297.443" y="134.712" width="4" height="17" fill="#008000" stroke="white"/>
              <rect x="255.167" y="116.084" width="42" height="53" fill="#008000" stroke="white"/>
              <rect x="281.603" y="124.637" width="15.4547" height="33.0082" fill="#008000" stroke="white"/>
              <rect x="101.513" y="128.742" width="15.4547" height="33.0082" fill="#008000" stroke="white"/>
              <path d="M63.8305 107.912L35.7523 95.4169C41.0845 82.8644 46.2329 76.1206 60.345 64.7624L87.3008 80.7197C75.8672 89.1391 70.6854 95.051 63.8305 107.912Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('B3')" id="sector-B3" :class="{'svg-selected': selectedSector === 'B3'}" cursor="pointer"/>
              <path d="M59.1441 165.439L32.6683 186.128C20.2253 154.725 17.9837 135.198 33.4518 100.079L62.2386 110.841C54.1341 130.894 53.4137 142.84 59.1441 165.439Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('B2')" id="sector-B2" :class="{'svg-selected': selectedSector === 'B2'}" cursor="pointer"/>
              <path d="M36.2715 191.286L60.5046 167.432C67.9587 185.856 74.63 194.222 91.4518 205.264L68.1095 224.94C52.2455 214.33 45.4139 206.858 36.2715 191.286Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('B1')" id="sector-B1" :class="{'svg-selected': selectedSector === 'B1'}" cursor="pointer"/>
              <path d="M56.9835 81.4948C57.6954 81.5062 58.2902 81.5838 58.768 81.7275C59.2537 81.8714 59.6141 82.1012 59.849 82.417C60.092 82.733 60.2093 83.1509 60.2009 83.6708C60.1955 84.0068 60.1267 84.3057 59.9944 84.5676C59.8703 84.8217 59.6829 85.0347 59.4321 85.2067C59.1894 85.3708 58.8916 85.482 58.5386 85.5403L58.5376 85.6003C58.8967 85.6621 59.219 85.7713 59.5045 85.9279C59.798 86.0847 60.0265 86.3044 60.19 86.587C60.3534 86.8697 60.4316 87.235 60.4243 87.683C60.416 88.2029 60.2888 88.6449 60.043 89.009C59.7972 89.3651 59.4488 89.6355 58.9978 89.8203C58.5549 89.9972 58.0254 90.0807 57.4095 90.0707L54.3979 90.0223L54.5358 81.4554L56.9835 81.4948ZM57.1408 85.1458C57.8767 85.1576 58.3825 85.0497 58.6582 84.8222C58.934 84.5866 59.0756 84.2368 59.0831 83.7729C59.0907 83.3009 58.9281 82.9623 58.5954 82.7569C58.2708 82.5436 57.7445 82.4311 57.0166 82.4194L55.6008 82.3966L55.557 85.1203L57.1408 85.1458ZM55.5425 86.0202L55.4925 89.1278L57.2202 89.1556C57.9801 89.1678 58.5104 89.0283 58.8112 88.7371C59.1119 88.4459 59.2661 88.0604 59.2738 87.5804C59.2787 87.2765 59.215 87.0114 59.0826 86.7852C58.9582 86.5592 58.741 86.3837 58.431 86.2587C58.1291 86.1258 57.7142 86.0551 57.1863 86.0466L55.5425 86.0202ZM67.0586 83.6612C67.0524 84.0452 66.9751 84.376 66.8266 84.6536C66.6781 84.9313 66.4665 85.1559 66.1917 85.3275C65.9249 85.4992 65.6109 85.6182 65.2498 85.6844L65.2491 85.7324C65.9357 85.8234 66.4441 86.0476 66.7744 86.405C67.1047 86.7624 67.2653 87.225 67.2562 87.7929C67.2482 88.2889 67.125 88.7309 66.8868 89.1192C66.6486 89.4994 66.2838 89.7935 65.7924 90.0017C65.309 90.2099 64.6873 90.3079 63.9274 90.2957C63.4795 90.2885 63.0641 90.2458 62.6813 90.1676C62.2984 90.0974 61.9324 89.9715 61.5833 89.7899L61.5991 88.806C61.9562 88.9878 62.3419 89.134 62.7562 89.2447C63.1706 89.3474 63.5698 89.4018 63.9537 89.408C64.7216 89.4203 65.2759 89.2813 65.6167 88.9907C65.9655 88.6923 66.1442 88.2791 66.1527 87.7512C66.1585 87.3912 66.0671 87.1017 65.8786 86.8826C65.6983 86.6557 65.4289 86.4874 65.0706 86.3776C64.7124 86.2678 64.2813 86.2088 63.7773 86.2007L62.9494 86.1874L62.9639 85.2875L63.8038 85.301C64.2758 85.3086 64.6688 85.247 64.9829 85.116C65.3051 84.9852 65.5481 84.8011 65.7119 84.5637C65.8839 84.3184 65.9725 84.0358 65.9776 83.7158C65.9843 83.2999 65.8495 82.9777 65.5731 82.7492C65.2969 82.5127 64.9188 82.3906 64.4389 82.3829C64.1349 82.378 63.8584 82.4055 63.6094 82.4655C63.3606 82.5175 63.1272 82.5978 62.9095 82.7063C62.6998 82.8069 62.4858 82.9275 62.2676 83.068L61.7512 82.3396C61.9618 82.183 62.2001 82.0388 62.4663 81.9071C62.7404 81.7755 63.0421 81.6723 63.3714 81.5976C63.7006 81.5229 64.0572 81.4886 64.4412 81.4948C65.337 81.5092 65.9977 81.7199 66.4232 82.1268C66.8567 82.5338 67.0685 83.0453 67.0586 83.6612Z" fill="black"/>
              <path d="M38.2016 137.2C38.9135 137.211 39.5084 137.289 39.9861 137.432C40.4719 137.576 40.8322 137.806 41.0672 138.122C41.3101 138.438 41.4274 138.856 41.419 139.376C41.4136 139.712 41.3448 140.011 41.2126 140.273C41.0884 140.527 40.901 140.74 40.6502 140.912C40.4075 141.076 40.1097 141.187 39.7567 141.245L39.7557 141.305C40.1148 141.367 40.4371 141.476 40.7226 141.633C41.0161 141.79 41.2446 142.009 41.4081 142.292C41.5715 142.575 41.6497 142.94 41.6425 143.388C41.6341 143.908 41.507 144.35 41.2611 144.714C41.0153 145.07 40.6669 145.34 40.2159 145.525C39.773 145.702 39.2436 145.786 38.6276 145.776L35.616 145.727L35.7539 137.16L38.2016 137.2ZM38.3589 140.851C39.0948 140.863 39.6006 140.755 39.8763 140.527C40.1521 140.291 40.2938 139.942 40.3012 139.478C40.3088 139.006 40.1463 138.667 39.8135 138.462C39.4889 138.249 38.9627 138.136 38.2347 138.124L36.8189 138.102L36.7751 140.825L38.3589 140.851ZM36.7606 141.725L36.7106 144.833L38.4383 144.86C39.1982 144.873 39.7286 144.733 40.0293 144.442C40.33 144.151 40.4842 143.765 40.492 143.285C40.4969 142.981 40.4331 142.716 40.3007 142.49C40.1764 142.264 39.9592 142.089 39.6491 141.964C39.3472 141.831 38.9323 141.76 38.4044 141.752L36.7606 141.725ZM48.495 145.934L42.8318 145.843L42.8459 144.967L45.1261 142.736C45.565 142.311 45.9351 141.933 46.2365 141.602C46.5379 141.27 46.7671 140.946 46.9243 140.629C47.0815 140.303 47.1632 139.948 47.1694 139.564C47.177 139.092 47.0428 138.734 46.7667 138.49C46.4907 138.237 46.1287 138.107 45.6808 138.1C45.2648 138.093 44.8957 138.16 44.5735 138.298C44.2592 138.437 43.936 138.632 43.6039 138.883L43.0514 138.166C43.2784 137.977 43.5252 137.809 43.7916 137.662C44.066 137.514 44.3599 137.399 44.6733 137.316C44.9947 137.233 45.3353 137.194 45.6953 137.2C46.2312 137.209 46.6897 137.308 47.0707 137.498C47.4516 137.689 47.7434 137.957 47.9458 138.305C48.1564 138.644 48.2578 139.05 48.2502 139.522C48.2448 139.858 48.1877 140.177 48.0788 140.479C47.9701 140.773 47.8174 141.063 47.6208 141.348C47.4242 141.633 47.1875 141.921 46.9108 142.212C46.634 142.504 46.3291 142.807 45.996 143.122L44.1798 144.857L44.1791 144.905L48.5105 144.975L48.495 145.934Z" fill="black"/>
              <path d="M57.1644 194.512C57.8763 194.524 58.4711 194.601 58.9489 194.745C59.4346 194.889 59.795 195.119 60.0299 195.435C60.2729 195.751 60.3901 196.168 60.3818 196.688C60.3764 197.024 60.3075 197.323 60.1753 197.585C60.0512 197.839 59.8638 198.052 59.613 198.224C59.3703 198.388 59.0725 198.5 58.7195 198.558L58.7185 198.618C59.0776 198.68 59.3998 198.789 59.6854 198.945C59.9789 199.102 60.2074 199.322 60.3708 199.605C60.5343 199.887 60.6124 200.253 60.6052 200.701C60.5969 201.22 60.4697 201.662 60.2238 202.027C59.9781 202.383 59.6297 202.653 59.1786 202.838C58.7357 203.015 58.2063 203.098 57.5904 203.088L54.5788 203.04L54.7167 194.473L57.1644 194.512ZM57.3216 198.163C58.0575 198.175 58.5633 198.067 58.839 197.84C59.1149 197.604 59.2565 197.254 59.264 196.79C59.2716 196.318 59.109 195.98 58.7763 195.774C58.4517 195.561 57.9254 195.449 57.1975 195.437L55.7817 195.414L55.7378 198.138L57.3216 198.163ZM55.7234 199.038L55.6733 202.145L57.4011 202.173C58.161 202.185 58.6913 202.046 58.992 201.755C59.2928 201.463 59.447 201.078 59.4547 200.598C59.4596 200.294 59.3959 200.029 59.2635 199.803C59.1391 199.577 58.9219 199.401 58.6119 199.276C58.31 199.143 57.8951 199.073 57.3671 199.064L55.7234 199.038ZM65.4781 203.215L64.4462 203.199L64.5426 197.211C64.5463 196.979 64.5495 196.783 64.552 196.624C64.5626 196.464 64.573 196.316 64.5832 196.18C64.5935 196.036 64.6039 195.888 64.6143 195.736C64.4843 195.862 64.3666 195.968 64.2612 196.055C64.1558 196.141 64.022 196.251 63.8598 196.384L62.936 197.114L62.3954 196.397L64.7401 194.634L65.616 194.648L65.4781 203.215Z" fill="black"/>
              <path d="M350.763 206.898L331.384 180.112C321.826 189.624 316.074 194.072 305.276 200.307L325.57 223.468C335.852 218.759 341.301 214.866 350.763 206.898Z" fill="#F9E2E2"/>
              <path d="M331.123 179.751L350.763 206.898C341.301 214.866 335.852 218.759 325.57 223.468L305.276 200.307C316.154 194.026 321.911 189.558 331.597 179.9" fill="#F9E2E2" stroke="black" @click="handleSvgClick('D5')" id="sector-D5" :class="{'svg-selected': selectedSector === 'D5'}" cursor="pointer"/>
              <path d="M377.354 164.34L346.042 152.848C343.255 162.541 340.741 167.745 334.493 176.594L357.735 200.174C367.752 187.896 371.933 179.966 377.354 164.34Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('D4')" id="sector-D4" :class="{'svg-selected': selectedSector === 'D4'}" cursor="pointer"/>
              <path d="M348.234 125.077L379.217 117.507C382.871 130.194 383.022 142.952 380.305 156.505L348.288 149.077C349.655 139.791 349.905 134.553 348.234 125.077Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('D3')" id="sector-D3" :class="{'svg-selected': selectedSector === 'D3'}" cursor="pointer"/>
              <path d="M334.166 100.433L356.299 77.9609C366.287 87.8633 370.887 94.2644 376.372 107.996L346.821 121.088C344.259 111.887 341.513 107.35 334.166 100.433Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('D2')" id="sector-D2" :class="{'svg-selected': selectedSector === 'D2'}" cursor="pointer"/>
              <path d="M305.489 77.1732L327.086 54.3622C336.239 58.856 341.006 62.345 348.799 70.4566L329.667 96.4626C323.192 88.4069 317.997 84.1659 305.489 77.1732Z" fill="#F9E2E2" stroke="black" @click="handleSvgClick('D1')" id="sector-D1" :class="{'svg-selected': selectedSector === 'D1'}" cursor="pointer"/>
              <path d="M329.923 75.287C329.908 76.2469 329.715 77.0479 329.345 77.69C328.982 78.3323 328.466 78.812 327.797 79.1293C327.128 79.4466 326.321 79.5976 325.378 79.5824L322.99 79.544L323.128 70.9771L325.767 71.0196C326.631 71.0335 327.377 71.2055 328.003 71.5357C328.63 71.8658 329.111 72.3456 329.444 72.975C329.778 73.5965 329.938 74.3672 329.923 75.287ZM328.783 75.3047C328.795 74.5448 328.677 73.9188 328.429 73.4267C328.189 72.9348 327.827 72.5689 327.343 72.3291C326.866 72.0814 326.285 71.952 325.597 71.941L324.193 71.9184L324.085 78.6375L325.248 78.6562C326.408 78.6749 327.281 78.4049 327.866 77.8463C328.459 77.2797 328.765 76.4325 328.783 75.3047ZM334.85 79.7349L333.818 79.7183L333.914 73.7311C333.918 73.4991 333.921 73.3031 333.924 73.1432C333.935 72.9833 333.945 72.8355 333.955 72.6996C333.965 72.5557 333.976 72.4079 333.986 72.256C333.856 72.382 333.738 72.4881 333.633 72.5744C333.528 72.6607 333.394 72.7706 333.232 72.904L332.308 73.6332L331.767 72.9164L334.112 71.1539L334.988 71.168L334.85 79.7349Z" fill="black"/>
              <path d="M357.265 99.5305C357.25 100.49 357.057 101.291 356.687 101.933C356.324 102.576 355.808 103.055 355.139 103.373C354.47 103.69 353.663 103.841 352.72 103.826L350.332 103.787L350.47 95.2205L353.109 95.263C353.973 95.2769 354.719 95.449 355.345 95.7791C355.972 96.1092 356.453 96.589 356.786 97.2185C357.12 97.8399 357.28 98.6106 357.265 99.5305ZM356.125 99.5481C356.137 98.7882 356.019 98.1622 355.771 97.6702C355.531 97.1783 355.169 96.8124 354.685 96.5726C354.208 96.3249 353.626 96.1955 352.939 96.1844L351.535 96.1618L351.427 102.881L352.59 102.9C353.75 102.918 354.623 102.648 355.208 102.09C355.801 101.523 356.107 100.676 356.125 99.5481ZM364.172 104.01L358.508 103.919L358.523 103.043L360.803 100.812C361.242 100.387 361.612 100.008 361.913 99.6773C362.215 99.3461 362.444 99.0218 362.601 98.7043C362.758 98.3787 362.84 98.024 362.846 97.6401C362.854 97.1681 362.719 96.8099 362.443 96.5654C362.167 96.313 361.805 96.1831 361.357 96.1759C360.941 96.1692 360.572 96.2353 360.25 96.3741C359.936 96.5131 359.613 96.7079 359.281 96.9586L358.728 96.2416C358.955 96.0532 359.202 95.8852 359.468 95.7374C359.743 95.5898 360.037 95.4746 360.35 95.3916C360.671 95.3088 361.012 95.2702 361.372 95.276C361.908 95.2847 362.366 95.384 362.747 95.5742C363.128 95.7644 363.42 96.0331 363.622 96.3804C363.833 96.7198 363.934 97.1255 363.927 97.5975C363.921 97.9334 363.864 98.2525 363.755 98.5548C363.647 98.8491 363.494 99.1387 363.297 99.4236C363.101 99.7084 362.864 99.9967 362.587 100.288C362.311 100.58 362.006 100.883 361.673 101.198L359.856 102.933L359.856 102.981L364.187 103.05L364.172 104.01Z" fill="black"/>
              <path d="M365.551 136.669C365.536 137.629 365.343 138.43 364.973 139.072C364.61 139.714 364.094 140.194 363.425 140.511C362.756 140.828 361.95 140.979 361.006 140.964L358.618 140.926L358.756 132.359L361.396 132.401C362.259 132.415 363.005 132.587 363.632 132.917C364.258 133.247 364.739 133.727 365.073 134.357C365.407 134.978 365.566 135.749 365.551 136.669ZM364.411 136.686C364.423 135.926 364.305 135.3 364.057 134.808C363.817 134.316 363.455 133.951 362.971 133.711C362.495 133.463 361.913 133.334 361.225 133.323L359.821 133.3L359.713 140.019L360.877 140.038C362.036 140.057 362.909 139.787 363.494 139.228C364.087 138.661 364.393 137.814 364.411 136.686ZM372.239 134.58C372.233 134.964 372.156 135.295 372.007 135.572C371.859 135.85 371.647 136.075 371.373 136.246C371.106 136.418 370.792 136.537 370.431 136.603L370.43 136.651C371.117 136.742 371.625 136.966 371.955 137.324C372.286 137.681 372.446 138.144 372.437 138.712C372.429 139.208 372.306 139.65 372.068 140.038C371.829 140.418 371.465 140.712 370.973 140.92C370.49 141.129 369.868 141.227 369.108 141.215C368.66 141.207 368.245 141.165 367.862 141.086C367.479 141.016 367.113 140.89 366.764 140.709L366.78 139.725C367.137 139.907 367.523 140.053 367.937 140.164C368.351 140.266 368.751 140.321 369.135 140.327C369.902 140.339 370.457 140.2 370.798 139.91C371.146 139.611 371.325 139.198 371.334 138.67C371.339 138.31 371.248 138.021 371.059 137.801C370.879 137.575 370.61 137.406 370.252 137.296C369.893 137.187 369.462 137.128 368.958 137.12L368.13 137.106L368.145 136.206L368.985 136.22C369.457 136.227 369.85 136.166 370.164 136.035C370.486 135.904 370.729 135.72 370.893 135.482C371.065 135.237 371.153 134.955 371.158 134.635C371.165 134.219 371.03 133.897 370.754 133.668C370.478 133.432 370.1 133.309 369.62 133.302C369.316 133.297 369.039 133.324 368.79 133.384C368.541 133.436 368.308 133.517 368.09 133.625C367.881 133.726 367.667 133.846 367.448 133.987L366.932 133.258C367.143 133.102 367.381 132.958 367.647 132.826C367.921 132.694 368.223 132.591 368.552 132.516C368.881 132.442 369.238 132.407 369.622 132.414C370.518 132.428 371.179 132.639 371.604 133.046C372.038 133.453 372.249 133.964 372.239 134.58Z" fill="black"/>
              <path d="M356.941 174.535C356.925 175.495 356.732 176.296 356.362 176.938C356 177.58 355.484 178.06 354.815 178.377C354.145 178.695 353.339 178.846 352.395 178.83L350.007 178.792L350.145 170.225L352.785 170.268C353.649 170.281 354.394 170.453 355.021 170.784C355.648 171.114 356.128 171.594 356.462 172.223C356.796 172.844 356.956 173.615 356.941 174.535ZM355.8 174.553C355.813 173.793 355.695 173.167 355.447 172.675C355.206 172.183 354.844 171.817 354.36 171.577C353.884 171.329 353.302 171.2 352.614 171.189L351.21 171.166L351.102 177.885L352.266 177.904C353.426 177.923 354.298 177.653 354.883 177.094C355.476 176.528 355.782 175.68 355.8 174.553ZM364.262 177.077L363.015 177.057L362.983 179.001L361.963 178.984L361.995 177.041L357.891 176.975L357.906 176.075L362.03 170.368L363.122 170.386L363.03 176.109L364.278 176.129L364.262 177.077ZM362.053 173.393C362.057 173.185 362.06 172.997 362.062 172.829C362.073 172.653 362.084 172.489 362.094 172.338C362.105 172.186 362.111 172.042 362.113 171.906C362.124 171.762 362.134 171.626 362.144 171.498L362.096 171.498C362.029 171.649 361.947 171.811 361.848 171.986C361.749 172.16 361.655 172.307 361.565 172.425L358.938 176.043L362.01 176.093L362.053 173.393Z" fill="black"/>
              <path d="M328.51 201.081C328.494 202.041 328.301 202.842 327.931 203.484C327.569 204.126 327.053 204.606 326.384 204.923C325.714 205.24 324.908 205.391 323.964 205.376L321.576 205.338L321.714 196.771L324.354 196.813C325.218 196.827 325.963 196.999 326.59 197.329C327.217 197.66 327.697 198.139 328.031 198.769C328.365 199.39 328.525 200.161 328.51 201.081ZM327.369 201.098C327.382 200.339 327.264 199.713 327.016 199.22C326.775 198.729 326.413 198.363 325.929 198.123C325.453 197.875 324.871 197.746 324.183 197.735L322.779 197.712L322.671 204.431L323.835 204.45C324.995 204.469 325.867 204.199 326.452 203.64C327.046 203.073 327.351 202.226 327.369 201.098ZM332.561 200.258C333.145 200.267 333.651 200.375 334.08 200.582C334.509 200.789 334.836 201.083 335.062 201.462C335.296 201.834 335.409 202.288 335.4 202.824C335.391 203.416 335.255 203.926 334.992 204.354C334.729 204.773 334.356 205.095 333.872 205.32C333.396 205.536 332.823 205.639 332.151 205.628C331.711 205.621 331.295 205.574 330.905 205.488C330.522 205.402 330.2 205.281 329.939 205.124L329.955 204.128C330.24 204.309 330.585 204.455 330.992 204.565C331.406 204.668 331.801 204.722 332.177 204.728C332.601 204.735 332.97 204.677 333.284 204.554C333.606 204.423 333.858 204.223 334.038 203.954C334.218 203.677 334.312 203.33 334.319 202.915C334.328 202.355 334.163 201.924 333.823 201.622C333.484 201.313 332.943 201.152 332.199 201.14C331.975 201.137 331.719 201.152 331.43 201.188C331.141 201.223 330.909 201.259 330.732 201.297L330.21 200.952L330.599 196.914L334.894 196.983L334.879 197.943L331.483 197.888L331.239 200.369C331.376 200.347 331.56 200.322 331.793 200.294C332.025 200.265 332.281 200.253 332.561 200.258Z" fill="black"/>
            </g>
            <rect x="1.16656" y="1.08426" width="399" height="300" stroke="black"/>
            <defs>
              <filter id="filter0_d_3_180" x="0.681892" y="20.5589" width="399.969" height="253.051" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3_180"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3_180" result="shape"/>
              </filter>
              <clipPath id="clip0_3_180">
                <rect x="0.666565" y="0.584259" width="400" height="301" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      <div class="stadium-seats-container">
        <div v-if="showLoginWarning" class="warning-overlay">
          <div class="warning-box">
            <p>Trebuie să intrați în cont pentru a rezerva bilete!</p>
            <button @click="showLoginWarning = false">Închide</button>
          </div>
        </div>

        <div v-if="showSeatsWarning" class="warning-overlay">
          <div class="warning-box">
            <p>Nu ați selectat nici un bilet!</p>
            <button @click="showSeatsWarning = false">Închide</button>
          </div>
        </div>

        <h1 class="pick-seats-text">Alegeți locurile</h1>

        <div class="tribuna1-container">
          <div class="zona-stadion-wrapper"  @click="toggleSectorsT1">
            <h1 class="text-zona"> TRIBUNA 1</h1>
            <img class="drop-down-icon"   :class="{ rotated: showSectorsT1}" src="@/assets/images/Icons/arrow_drop_down_icon.png" alt="drop-down-arrow"  @click.stop="toggleSectorsT1">
          </div>
          <Transition name="slide" @enter="enter" @leave="leave">
            <div class="zone-sectors" v-if="showSectorsT1">
              <div
                  class="sector-stadion-wrapper"
                  v-for="sector in ['A1', 'A2', 'A3', 'VIP']"
                  :key="sector"
                  v-show="selectedSector === null || selectedSector === sector || selectedSector != sector"
              >
                <p class="text-sector"> Sector {{ sector }}</p>
                <p class="bilete-disponibile">  Bilete disponibile: {{ sectorsData[sector]?.disponibile ?? '...loading' }}</p>
                <p class="pret-bilet"> Preț bilet: {{ sectorsData[sector]?.pret ?? '...loading' }} RON</p>
                <button class="pick-seat-btn" @click="handlePickSeats(sector)">
                  ALEGE LOCURILE
                </button>
                <Transition name="slide-down">
                  <div  v-if="showSeatPicker" class="seat-picker"  >
                    <div class="seat-picker-header">
                      <p style="padding-top: 1%"> Ai selectat : {{ selectedSeats }} locuri</p>
                      <p style="padding-top: 1%">Prețul total al biletelor : {{ totalPrice }} RON </p>
                      <button  class="continue-btn"  @click="addToCart" >Adaugă în coș</button>
                      <button @click="closeSeatPicker" class="close-btn">Închide</button>
                    </div>
                    <h2 style="margin-bottom: 1%;margin-top: 1%"> Locuri Sector {{ selectedSector }}</h2>
                    <!-- Wrapper general -->
                    <div class="grid-container">
                      <!-- Etichete randuri + grid locuri -->
                      <div class="grid-wrapper">
                        <!-- Randuri -->
                        <div  class="row-labels"  :style="{ gridTemplateRows: `repeat(${maxRow}, 1fr)` }">
                          <div v-for="r in [...Array(maxRow).keys()].reverse()" :key="'label-'+r" class="row-label" :style="{gridRow: displayRow(r+1), gridColumn: 1}">
                            Rand {{ r + 1 }}
                          </div>
                        </div>
                        <!-- Locuri -->
                        <div  class="grid-2d" :style="{gridTemplateRows: `repeat(${maxRow}, 1fr)`, gridTemplateColumns: `repeat(${maxCol}, 1fr)` }" >
                          <div   v-for="seat in seats"  :key="seat.rand + '-' + seat.loc"  class="seat"
                                 :class="{ rezervat: seat.status !== 'disponibil', selected: picked.has(`${seat.rand}-${seat.loc}`)  }"
                                 :style="{ gridRow: displayRow(seat.rand), gridColumn: seat.loc }"
                                 @click="seat.status === 'disponibil' && toggleSeat(seat)" >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="show-field">
                      <p> TEREN</p>
                    </div>
                    <div class="seat-legend">
                      <div class="legend-item">
                        <div class="legend-box disponibil"></div>
                        <span>Disponibil</span>
                      </div>
                      <div class="legend-item">
                        <div class="legend-box selected"></div>
                        <span>Selectat</span>
                      </div>
                      <div class="legend-item">
                        <div class="legend-box rezervat"></div>
                        <span>Rezervat</span>
                      </div>
                    </div>

                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div class="tribuna2">
          <div class="zona-stadion-wrapper"  @click="toggleSectorsT2">
            <h1 class="text-zona"> TRIBUNA 2</h1>
            <img class="drop-down-icon"   :class="{ rotated: showSectorsT2 }" src="@/assets/images/Icons/arrow_drop_down_icon.png" alt="drop-down-arrow"  @click.stop="toggleSectorsT2">
          </div>
          <Transition name="slide" @enter="enter" @leave="leave">

            <div class="zone-sectors" v-show="showSectorsT2">
              <div
                  class="sector-stadion-wrapper"
                  v-for="sector in ['C1', 'C2', 'C3']"
                  :key="sector"
                  v-show="selectedSector === null || selectedSector === sector || selectedSector != sector"
              >
                <p class="text-sector">Sector {{ sector }}</p>
                <p class="bilete-disponibile">  Bilete disponibile: {{ sectorsData[sector]?.disponibile ?? '...loading' }}</p>
                <p class="pret-bilet"> Preț bilet: {{ sectorsData[sector]?.pret ?? '...loading' }} RON</p>
                <button class="pick-seat-btn"  @click="handlePickSeats(sector)">ALEGE LOCURILE</button>
                <Transition name="slide-down">

                  <div  v-if="showSeatPicker" class="seat-picker"  >
                    <div class="seat-picker-header">
                      <p style="padding-top: 1%"> Ai selectat : {{ selectedSeats }} locuri</p>
                      <p style="padding-top: 1%">Prețul total al biletelor : {{ totalPrice }} RON </p>
                      <button  class="continue-btn"  @click="addToCart" >Adaugă în coș</button>
                      <button @click="closeSeatPicker" class="close-btn">Închide</button>
                    </div>
                    <h2 style="margin-bottom: 1%;margin-top: 1%">Locuri Sector {{ selectedSector }}</h2>
                    <!-- Wrapper general -->
                    <div class="grid-container">
                      <!-- Etichete randuri + grid locuri -->
                      <div class="grid-wrapper">
                        <!-- Randuri -->
                        <div  class="row-labels"  :style="{ gridTemplateRows: `repeat(${maxRow}, 1fr)` }">
                          <div v-for="r in [...Array(maxRow).keys()].reverse()" :key="'label-'+r" class="row-label" :style="{gridRow: displayRow(r+1), gridColumn: 1}">
                            Rand {{ r + 1 }}
                          </div>
                        </div>
                        <!-- Locuri -->
                        <div  class="grid-2d" :style="{gridTemplateRows: `repeat(${maxRow}, 1fr)`, gridTemplateColumns: `repeat(${maxCol}, 1fr)` }" >
                          <div   v-for="seat in seats"  :key="seat.rand + '-' + seat.loc"  class="seat"
                                 :class="{ rezervat: seat.status !== 'disponibil', selected: picked.has(`${seat.rand}-${seat.loc}`)  }"
                                 :style="{ gridRow: displayRow(seat.rand), gridColumn: seat.loc }"
                                 @click="seat.status === 'disponibil' && toggleSeat(seat)" >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="show-field">
                      <p> TEREN</p>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div class="peluza-nord">
          <div class="zona-stadion-wrapper"  @click="toggleSectorsPN">
            <h1 class="text-zona"> PELUZA NORD</h1>
            <img class="drop-down-icon"   :class="{ rotated: showSectorsPN}" src="@/assets/images/Icons/arrow_drop_down_icon.png" alt="drop-down-arrow"  @click.stop="toggleSectorsPN">
          </div>
          <Transition name="slide" @enter="enter" @leave="leave">
            <div class="zone-sectors" v-show="showSectorsPN">
              <div
                  class="sector-stadion-wrapper"
                  v-for="sector in ['D1', 'D2', 'D3','D4','D5']"
                  :key="sector"
                  v-show="selectedSector === null || selectedSector === sector || selectedSector != sector "
              >
                <p class="text-sector">Sector {{ sector }}</p>
                <p class="bilete-disponibile">  Bilete disponibile: {{ sectorsData[sector]?.disponibile ?? '...loading' }}</p>
                <p class="pret-bilet"> Preț bilet: {{ sectorsData[sector]?.pret ?? '...loading' }} RON</p>
                <button class="pick-seat-btn" @click="handlePickSeats(sector)">ALEGE LOCURILE</button>
                <Transition name="slide-down">
                  <div  v-if="showSeatPicker" class="seat-picker" >
                    <div class="seat-picker-header">
                      <p style="padding-top: 1%"> Ai selectat : {{ selectedSeats }} locuri</p>
                      <p style="padding-top: 1%">Prețul total al biletelor : {{ totalPrice }} RON </p>
                      <button  class="continue-btn"  @click="addToCart" >Adaugă în coș</button>
                      <button @click="closeSeatPicker" class="close-btn">Închide</button>
                    </div>
                    <h2 style="margin-bottom: 1%;margin-top: 1%">Locuri Sector {{ selectedSector }}</h2>
                    <!-- Wrapper general -->
                    <div class="grid-container">
                      <!-- Etichete randuri + grid locuri -->
                      <div class="grid-wrapper">
                        <!-- Randuri -->
                        <div  class="row-labels"  :style="{ gridTemplateRows: `repeat(${maxRow}, 1fr)` }">
                          <div v-for="r in Array.from({ length: maxRow - 6 }, (_, i) => i + 6)"
                               class="row-label" :style="{gridRow: displayRow(r+1), gridColumn: 1}">
                            Rand {{ r + 1 }}
                          </div>
                        </div>
                        <!-- Locuri -->
                        <div  class="grid-2d" :style="{gridTemplateRows: `repeat(${maxRow}, 1fr)`, gridTemplateColumns: `repeat(${maxCol}, 1fr)` }" >
                          <div   v-for="seat in seats"  :key="seat.rand + '-' + seat.loc"  class="seat"
                                 :class="{ rezervat: seat.status !== 'disponibil', selected: picked.has(`${seat.rand}-${seat.loc}`)  }"
                                 :style="{ gridRow: displayRow(seat.rand), gridColumn: seat.loc }"
                                 @click="seat.status === 'disponibil' && toggleSeat(seat)" >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="show-field">
                      <p> TEREN </p>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div class="peluza-sud">
          <div class="zona-stadion-wrapper"  @click="toggleSectorsPS">
            <h1 class="text-zona"> PELUZA SUD</h1>
            <img class="drop-down-icon"   :class="{ rotated: showSectorsPS}" src="@/assets/images/Icons/arrow_drop_down_icon.png" alt="drop-down-arrow"  @click.stop="toggleSectorsPS">
          </div>
          <Transition name="slide" @enter="enter" @leave="leave">
            <div class="zone-sectors" v-show="showSectorsPS">
              <div
                  class="sector-stadion-wrapper"
                  v-for="sector in ['B1', 'B2', 'B3']"
                  :key="sector"
                  v-show="selectedSector === null || selectedSector === sector || selectedSector != sector"
              >
                <p class="text-sector">Sector {{ sector }}</p>
                <p class="bilete-disponibile">  Bilete disponibile: {{ sectorsData[sector]?.disponibile ?? '...loading' }}</p>
                <p class="pret-bilet"> Preț bilet: {{ sectorsData[sector]?.pret ?? '...loading' }} RON</p>
                <button class="pick-seat-btn" @click="handlePickSeats(sector)">ALEGE LOCURILE</button>
                <Transition name="slide-down">
                  <div  v-if="showSeatPicker" class="seat-picker"  >
                    <div class="seat-picker-header">
                      <p style="padding-top: 1%"> Ai selectat : {{ selectedSeats }} locuri</p>
                      <p style="padding-top: 1%">Prețul total al biletelor : {{ totalPrice }} RON </p>
                      <button  class="continue-btn"  @click="addToCart" >Adaugă în coș</button>
                      <button  @click="closeSeatPicker" class="close-btn">Închide</button>
                    </div>
                    <h2 style="margin-bottom: 1%;margin-top: 1%">Locuri Sector {{ selectedSector }}</h2>
                    <!-- Wrapper general -->
                    <div class="grid-container">
                      <!-- Etichete randuri + grid locuri -->
                      <div class="grid-wrapper">
                        <!-- Randuri -->
                        <div  class="row-labels"  :style="{ gridTemplateRows: `repeat(${maxRow}, 1fr)` }">
                          <div v-for="r in Array.from({ length: maxRow - 6 }, (_, i) => i + 6)"
                               class="row-label" :style="{gridRow: displayRow(r+1), gridColumn: 1}">
                           Rand {{ r }}
                          </div>
                        </div>
                        <!-- Locuri -->
                        <div  class="grid-2d" :style="{gridTemplateRows: `repeat(${maxRow}, 1fr)`, gridTemplateColumns: `repeat(${maxCol}, 1fr)` }" >
                          <div   v-for="seat in seats"  :key="seat.rand + '-' + seat.loc"  class="seat"
                                 :class="{ rezervat: seat.status !== 'disponibil', selected: picked.has(`${seat.rand}-${seat.loc}`)  }"
                                 :style="{ gridRow: displayRow(seat.rand), gridColumn: seat.loc }"
                                 @click="seat.status === 'disponibil' && toggleSeat(seat)" >
                            {{ seat.loc }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="show-field">
                      <p> TEREN</p>
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.back-btn{
  display:flex;
  background-color: oklch(70.4% 0.191 22.216);
  border: none;
  border-radius: 12px;
  margin-bottom: 1%;
  margin-right: 2%;
  color:oklch(97.7% 0.013 236.62);
  cursor:pointer;
  width:6%;
  aspect-ratio: 16/5;
  margin-top: 2%;
  margin-left:2%;
  position:absolute;
}
.back-btn:hover{
  cursor:pointer;
  background-color:oklch(63.7% 0.237 25.331) ;
}
.back-arrow{
  transform: rotate(180deg);
  height: 1.6rem;
}
.back-text{
  font-family: "Noto Sans", sans-serif;
  font-size: 1.2rem;
}
.pagina-cumparare {
  display: flex;
  flex-direction: column;
  min-width: 100%;
}
.info-container{
  width:100%;
  height: 25vh;
  border-width: 1px;
  border-style: hidden hidden solid hidden ;
}
.info-container p{
  font-family: "Noto Sans", sans-serif;
  font-size: 1.5rem;
  margin-left: 15%;
  padding-top: 2%;
}
.ora_data_info{
  display: flex;
  margin-left: 15%;
  margin-top: 1%;
}
.ora_data_info img{
  width: 2%;
  height: auto;
}
.ora_data_info p{
  font-size: 1.0rem;
  margin-left: 1%;
  padding-top: 0;
  margin-bottom: 0;
}
.locatie_info{
  display:flex;
  margin-left: 15%;
  margin-top:1%;
}
.locatie_info img{
  width: 2%;
  height: 1%;
}
.locatie_info p{
  font-size: 1.0rem;
  margin-left: 1%;
  padding-top: 0;
  margin-bottom: 0;
}
.map-link{
  color:blue;
  text-decoration: none;
  margin-left: 1%;
}
.map-link:hover{
  text-decoration: underline;
}
.cumpara-bilete-container{
  font-family: "Noto Sans", sans-serif;
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
}
.map-container{
  border-width: 1px;
  border-style: hidden solid hidden hidden;
}
.map-container svg {
  margin-left: 25%;
  margin-top: 7%;
}
.map-container h1{
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  padding-top: 2%;
}
.svg-wrapper {
  transition: transform 0.3s ease;
  transform-origin: center center;
  max-width: 95%;
}
.stadium-seats-container{
  font-family: "Noto Sans", sans-serif;
  display: flex;
  flex-direction: column;
  padding-top: 2%;
}
.pick-seats-text{
  text-align: center;
}
 .zona-stadion-wrapper{
   display:flex;
   justify-content: space-between;
   background-color: oklch(93.6% 0.032 17.717);
   min-height: 10%;
   min-width: 100%;
   border-style: solid solid solid hidden;
   border-width: 1px;
   margin-top: 2%;
   cursor:pointer;
 }
 .text-zona{
   padding-top: 2%;
   padding-left: 2%;
 }
 .drop-down-icon{
   cursor: pointer;
   transition: transform 0.2s ease;
 }
 .drop-down-icon:hover{
   transform: scale(1.4);
 }
.sector-stadion-wrapper{
  display:flex;
  justify-content: space-between;
  background-color: oklch(93.6% 0.032 17.717);
  max-height: 50%;
  max-width: 99%;
  border-style: hidden solid solid solid;
  border-width: 1px;
  margin-left: 7%;
  padding-top: 1%;
  padding-left: 2%;
  font-size: 1.2rem;
}
.pick-seat-btn{
  background-color: oklch(74.6% 0.16 232.661);
  border: none;
  margin-bottom: 1%;
  margin-right: 2%;
  padding:1%;
  color:oklch(97.7% 0.013 236.62);
  border-radius: 15px;
  cursor:pointer;
}
.pick-seat-btn:hover{
  background-color: oklch(58.8% 0.158 241.966);
}
.slide-enter-active, .slide-leave-active {
  transition: max-height 0.4s ease;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
}
.slide-enter-to, .slide-leave-from {
  max-height: 800px; /* ajustează după conținut */
}
.drop-down-icon {
  transition: transform 0.3s ease;
}
.drop-down-icon.rotated {
  transform: rotate(180deg);
}
.svg-selected {
  stroke: #0066ff;
  stroke-width: 3;
  fill: oklch(86.5% 0.127 207.078);
  filter: drop-shadow(0 0 4px #0066ff);
}
.warning-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.warning-box {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  z-index:1001;
}
.warning-box p {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
.warning-box button {
  padding: 0.5rem 1rem;
  background: #ff5252;
  border: none;
  color: #fff;
  border-radius: 0.25rem;
  cursor: pointer;
}

.seat-picker {
  position: absolute;
  top: 9%; left: 0; right: 0;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,.6);
  z-index: 100;
}

.seat-picker-header{
  display:flex;
  justify-content:space-evenly;
  border-color:lightgrey;
  border-style: hidden hidden solid hidden;
  padding:1rem
}

.close-btn{
  background-color: oklch(70.4% 0.191 22.216);
  border-radius: 10px;
  border: hidden;
  color:oklch(97.7% 0.013 236.62);
  cursor:pointer;
  width:auto;
  padding: 1%;
  margin-bottom: 1%;
}
.close-btn:hover{
  background-color:oklch(63.7% 0.237 25.331) ;
}

.continue-btn{
  background-color: oklch(74.6% 0.16 232.661);
  border: hidden;
  border-radius: 10px;
  color:oklch(97.7% 0.013 236.62);
  cursor:pointer;
  width:auto;
  overflow: hidden;
  white-space: nowrap;
  padding: 1%;
  margin-bottom: 1%;
}

.continue-btn:hover{
  background-color: oklch(58.8% 0.158 241.966);
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.col-labels {
  display: grid;
  margin-left: 60px; /* loc pentru etichetele de rand */
  margin-bottom: 6px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: bold;
  width: 100%;
}

.col-label {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  display:none;
}

.grid-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.row-labels {
  display: grid;
  margin-right: 10px;
  text-align: right;
  font-size: 0.75rem;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
}

.row-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding-right: 4px;
}

.grid-2d {
  display: grid;
  width: 100%;
  gap: 5px;
}

.seat {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid #999;
  cursor: pointer;
  background: #ffea80;
  font-size: 0.75rem;
  width: 100%;
  height: auto;
}

.seat.rezervat {
  background: #ccc;
  cursor: not-allowed;
}

.seat.selected {
  background: #0066ff;
  color: #fff;
}

.show-field{
  margin-top: 2%;
  background-color: oklch(62.7% 0.194 149.214);
  text-align: center;
  min-height: 9vh;
}
.show-field p{
  font-family: "Noto Sans", sans-serif;
  font-size: 1.7rem;
  padding-top:1%;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #999;
}

.legend-box.disponibil {
  background: #ffea80; /* culoarea galbenă pentru locuri disponibile */
}

.legend-box.selected {
  background: #0066ff; /* culoarea albastră pentru locuri selectate */
  color: #fff;
}

.legend-box.rezervat {
  background: #ccc; /* culoarea gri pentru locuri rezervate */
}

/* Asigurăm că locurile respectă aceeași schemă de culori */
.seat {
  background: #ffea80; /* disponibil (galben) */
}

.seat.selected {
  background: #0066ff; /* selectat (albastru) */
  color: #fff;
}

.seat.rezervat {
  background: #ccc; /* rezervat (gri) */
  cursor: not-allowed;
}

/* slide-down */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform .3s ease, opacity .3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}


</style>