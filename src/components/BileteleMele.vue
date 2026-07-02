<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NavbarComponentStadionMunicipal from '@/components/StadionMunicipalComponenets/NavbarComponentStadionMunicipal.vue';

const router = useRouter();
const userStore = useUserStore();
const bilete = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/user/login');
    return;
  }
  
  try {
    const response = await axios.get(`http://localhost:3000/api/user/bilete?email=${userStore.userEmail}`);
    bilete.value = response.data;
  } catch (error) {
    console.error("Eroare la preluarea biletelor:", error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5);
};

const formatRand = (randString) => {
  if (!randString) return '-';
  try {
    const parsed = JSON.parse(randString);
    if (Array.isArray(parsed)) {
      const rows = parsed.map(p => p.rand);
      return [...new Set(rows)].join(', ');
    }
  } catch(e) {

    return randString;
  }
  return randString;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <NavbarComponentStadionMunicipal />
    
    <div style="padding:50px;" class="flex-grow container mx-auto px-4 py-12 max-w-5xl">
      <h1 class="text-3xl font-black text-blue-900 uppercase tracking-tight mb-2">Biletele Melee</h1>
      <p style="margin-bottom: 20px;" class="text-gray-500 mb-8">Aici poți vizualiza toate biletele achiziționate anterior.</p>

      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>

      <div v-else-if="bilete.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-blue-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Nu ai niciun bilet achiziționat</h3>
        <p class="text-gray-500 mb-6">Se pare că nu ai participat la niciun meci încă.</p>
        <button @click="router.push('/bilete-stadion-municipal')" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200">
          Cumpără Bilete Acum
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="bilet in bilete" :key="bilet.ticket_id" 
             class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow relative">
             
 
          <div class="absolute -right-6 -bottom-6 text-gray-100 font-black text-6xl transform rotate-[-15deg] select-none pointer-events-none z-0">
            #{{ bilet.ticket_id }}
          </div>

   
          <div class="bg-gradient-to-r from-blue-800 to-blue-600 p-4 text-white flex justify-between items-center relative z-10">
            <div class="flex items-center gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg" alt="U Craiova" class="h-8 object-contain drop-shadow-md bg-white rounded-full p-1" />
              <span class="font-bold text-sm">vs</span>
              <img 
                v-if="bilet.echipa_oaspete_logo" 
                :src="'http://localhost:3000' + bilet.echipa_oaspete_logo" 
                :alt="bilet.echipa_oaspete" 
                class="h-8 object-contain drop-shadow-md bg-white rounded-full p-1"
                @error="bilet.echipa_oaspete_logo = null"
              />
              <span v-else class="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                {{ bilet.echipa_oaspete }}
              </span>
            </div>
            <div class="text-right">
              <div class="text-blue-200 text-xs font-medium uppercase tracking-wider">SuperLiga</div>
              <div class="font-bold">{{ formatDate(bilet.match_date) }}</div>
              <div class="text-sm">Ora {{ formatTime(bilet.match_time) }}</div>
            </div>
          </div>


          <div class="p-5 flex-grow flex justify-between relative z-10">
            <div class="space-y-4 w-2/3">
              <div>
                <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Sector / Tribună</p>
                <p class="text-xl font-black text-gray-800">{{ bilet.tribuna }} - {{ bilet.sector }}</p>
              </div>
              <div class="flex gap-8">
                <div>
                  <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Rând</p>
                  <p class="text-2xl font-black text-blue-600">{{ formatRand(bilet.rand) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Locuri</p>
                  <p class="text-2xl font-black text-blue-600 truncate max-w-[120px]">{{ bilet.locuri }}</p>
                </div>
              </div>
            </div>

            <div class="w-1/3 flex flex-col items-end justify-between border-l border-dashed border-gray-300 pl-4">
              <div class="text-right">
                <p class="text-xs text-gray-400 uppercase font-bold">Preț</p>
                <p class="text-lg font-bold text-gray-800">{{ bilet.pret }} RON</p>
              </div>
              
              <div class="mt-auto pt-4 flex flex-col items-center">
                <!-- QR Code Placeholder (se poate integra o librarie reala pe viitor) -->
                <div class="w-20 h-20 bg-gray-100 p-2 border border-gray-200 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                </div>
                <p class="text-[10px] text-gray-400 mt-1 font-mono break-all text-center leading-tight">
                  {{ bilet.invitation_code }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="h-1 w-full bg-blue-600"></div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>

</style>
