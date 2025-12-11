<!-- <script setup>
import { ref, onMounted, computed } from "vue";
import.meta.url;

defineProps(["openCumparaBilete"]);

const awayTeamName = ref("");
const matchDate = ref("");
const matchTime = ref("");
const awayTeamLogo = ref("");
const allMatches = ref([]);
const mainMatchId = ref(null);

console.log("awayTeamLogo", awayTeamLogo);

// Funcție pentru verificarea dacă un meci este disponibil pentru achiziționarea de bilete
const isMatchAvailableForTickets = (matchDateStr) => {
  if (!matchDateStr) return false;

  const today = new Date();
  const matchDate = new Date(matchDateStr);

  // Calculăm data limită (o lună de la azi)
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  // Meciul trebuie să fie în viitor și în următoarea lună
  return matchDate >= today && matchDate <= oneMonthFromNow;
};

// Computed property pentru verificarea meciului principal
const isMainMatchAvailable = computed(() => {
  console.log("matchDate.value", matchDate.value);

  return isMatchAvailableForTickets(matchDate.value);
});

// Funcție pentru verificarea fiecărui meci din lista completă
const isMatchTicketAvailable = (match) => {
  return isMatchAvailableForTickets(match.matchDate);
};

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/away-team");
    const data = await res.json();

    console.log("data", data);

    awayTeamName.value = data.awayTeamName || "Echipă necunoscută";
    mainMatchId.value = data.matchId;
    console.log("MainContent - matchId primit de la API:", data.matchId);
    console.log("MainContent - tip matchId:", typeof data.matchId);
    const awayTeamId = data.awayTeamId;
    console.log("awayTeamId", awayTeamId);

    const matchDateRes = await fetch(
      `http://localhost:3000/api/match-date?id=${awayTeamId}`
    );
    const matchDateData = await matchDateRes.json();
    matchDate.value = matchDateData.matchDate || "Data nu a fost gasită";

    const matchTimeRes = await fetch(
      `http://localhost:3000/api/match-time?id=${awayTeamId}`
    );
    const matchTimeData = await matchTimeRes.json();
    matchTime.value = matchTimeData.matchTime || "Ora nu a fost gasită";

    const awayTeamLogoRes = await fetch(
      `http://localhost:3000/api/logos?id=${awayTeamId}`
    );
    const awayTeamLogoData = await awayTeamLogoRes.json();

    console.log("awayTeamLogoData", awayTeamLogoData);

    awayTeamLogo.value = awayTeamLogoData.awayTeamLogo || "Logo neexistent";

    const allMatchesRes = await fetch("http://localhost:3000/api/all-matches");
    const allMatchesData = await allMatchesRes.json();
    allMatches.value = allMatchesData.matches || [];
  } catch (error) {
    console.error("Eroare la preluarea datelor:", error);
  }
});
</script>

<template>
  <div class="main-container">
    <div class="match-container">
      <h1>Următorul meci de acasă al echipei:</h1>
      <div class="match-info">
        <img
          src="@/assets/images/FC-Hermannstadt-Sibiu.png"
          alt="FC_Hermannstadt_logo"
          class="hermannstadt-logo"
        />
        <p class="hermannstadt-text">AFC HERMANNSTADT</p>
        <span> vs </span>
        <p class="away-team-text">{{ awayTeamName }}</p>
        <img :src="awayTeamLogo" :alt="awayTeamLogo" class="away-team-logo" />
      </div>
      <div class="match-date">
        <p>{{ matchDate }}</p>
        <p>{{ matchTime }}</p>
        <p>Stadionul Municipal Sibiu</p>
      </div>
      <div
        class="buy-ticket-button"
        :class="{ disabled: !isMainMatchAvailable }"
        @click="
          isMainMatchAvailable &&
            openCumparaBilete(
              awayTeamName,
              awayTeamLogo,
              matchDate,
              matchTime,
              mainMatchId
            )
        "
      >
        <p v-if="isMainMatchAvailable">CUMPĂRĂ BILETE ACUM</p>
        <p v-else>MOMENTAN BILETE INDISPONIBILE 1</p>
      </div>
    </div>
    <div class="next-events-container">
      <p>Toate meciurile rămase:</p>
      <div v-for="(match, index) in allMatches" :key="index" class="next-match">
        <img
          src="@/assets/images/FC-Hermannstadt-Sibiu.png"
          alt="FC_Hermannstadt_logo"
          class="hermannstadt-logo"
          style="margin-left: 5%"
        />
        <img
          :src="match.awayTeamLogo"
          :alt="match.awayTeamLogo"
          class="away-team-logo"
          style="margin-left: 2%"
        />
        <div
          class="next-event-teams"
          style="display: flex; white-space: nowrap"
        >
          <p style="font-size: 15px; font-weight: bold">AFC HERMANNSTADT</p>
          <span style="font-size: 15px; font-weight: bold; padding-top: 4%">
            -
          </span>
          <p style="font-size: 15px; font-weight: bold">
            {{ match.awayTeamName }}
          </p>
        </div>
        <div
          class="match-details"
          style="display: flex; flex-direction: column; padding: 2% 6%"
        >
          <p style="font-size: 1.2rem">Data: {{ match.matchDate }}</p>
          <p style="font-size: 1.2rem">Ora: {{ match.matchTime }}</p>
          <p style="font-size: 1.2rem; white-space: nowrap">
            Locatia: Stadionul Municipal Sibiu
          </p>
        </div>
        <div
          class="rezerva-bilete"
          :class="{ disabled: !isMatchTicketAvailable(match) }"
          @click="
            isMatchTicketAvailable(match) &&
              openCumparaBilete(
                match.awayTeamName,
                match.awayTeamLogo,
                match.matchDate,
                match.matchTime,
                match.id
              )
          "
        >
          <p v-if="isMatchTicketAvailable(match)">REZERVĂ BILETE</p>
          <p v-else>MOMENTAN BILETE INDISPONIBILE</p>
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

.main-container {
  font-family: "Noto Sans", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  min-height: 100vh;
  width: 100%;
}

.match-container {
  border: 1px solid;
  border-radius: 40px;
  box-shadow: 10px 10px 50px oklch(41% 0.159 10.272);
  margin-top: 5%;
  width: 50%;
  height: 75%;
}

.next-events-container {
  border: 1px solid;
  border-radius: 40px;
  box-shadow: 10px 10px 50px oklch(41% 0.159 10.272);
  min-width: 75%;
  height: 75%;
}

.match-container h1 {
  padding: 5%;
  text-align: center;
  font-size: 25px;
}

.match-info {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  text-align: center;
}

.hermannstadt-logo,
.away-team-logo {
  width: 80px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.match-info span,
.hermannstadt-text,
.away-team-text {
  font-size: 1.2rem;
  margin-left: 4%;
}

.match-date {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
}

.buy-ticket-button {
  margin: 5% 25% 5% 25%;
  min-width: 15px;
  text-align: center;
  padding-top: 1%;
  padding-bottom: 1%;
  min-height: 35px;
  border-style: none;
  border-radius: 21px;
  font-size: 1.1rem;
  background-color: oklch(58.6% 0.253 17.585);
  cursor: pointer;
  transition: all 0.3s ease;
}

.buy-ticket-button:hover:not(.disabled) {
  background-color: oklch(51.4% 0.222 16.935);
}

.buy-ticket-button.disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

.buy-ticket-button.disabled:hover {
  background-color: #cccccc;
}

.next-events-container p {
  padding: 5%;
  text-align: center;
  font-size: 1.6rem;
}

.match-details p {
  padding: 1px;
}

.next-match {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  border-width: 1px 0;
  border-style: solid;
  border-color: rgba(255, 0, 0, 0.5);
}

.rezerva-bilete {
  margin-top: 3%;
  margin-bottom: 3%;
  white-space: nowrap;
  background-color: oklch(57.7% 0.245 27.325);
  border-radius: 15px;
  margin-right: 5%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rezerva-bilete p {
  font-size: 1.3rem;
  padding: 10px;
}

.rezerva-bilete:hover:not(.disabled) {
  background-color: oklch(50.5% 0.213 27.518);
}

.rezerva-bilete.disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

.rezerva-bilete.disabled:hover {
  background-color: #cccccc;
}
</style> -->

<script setup>
import { ref, onMounted, computed } from "vue";
import ChatComponent from "../ChatComponent.vue";
import.meta.url;

defineProps(["openCumparaBilete"]);

const awayTeamName = ref("");
const matchDate = ref("");
const matchTime = ref("");
const awayTeamLogo = ref("");
const allMatches = ref([]);
const mainMatchId = ref(null);
const showChat = ref(false);

console.log("awayTeamLogo", awayTeamLogo);

const toggleChat = () => {
  showChat.value = !showChat.value;
};

// Funcție pentru verificarea dacă un meci este disponibil pentru achiziționarea de bilete
const isMatchAvailableForTickets = (matchDateStr) => {
  if (!matchDateStr) return false;

  const today = new Date();
  const matchDate = new Date(matchDateStr);

  // Calculăm data limită (o lună de la azi)
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  // Meciul trebuie să fie în viitor și în următoarea lună
  return matchDate >= today && matchDate <= oneMonthFromNow;
};

// Computed property pentru verificarea meciului principal
const isMainMatchAvailable = computed(() => {
  console.log("matchDate.value", matchDate.value);

  return isMatchAvailableForTickets(matchDate.value);
});

// Funcție pentru verificarea fiecărui meci din lista completă
const isMatchTicketAvailable = (match) => {
  return isMatchAvailableForTickets(match.matchDate);
};

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/away-team");
    const data = await res.json();

    console.log("data", data);

    awayTeamName.value = data.awayTeamName || "Echipă necunoscută";
    mainMatchId.value = data.matchId;
    console.log("MainContent - matchId primit de la API:", data.matchId);
    console.log("MainContent - tip matchId:", typeof data.matchId);
    const awayTeamId = data.awayTeamId;
    console.log("awayTeamId", awayTeamId);

    const matchDateRes = await fetch(
      `http://localhost:3000/api/match-date?id=${awayTeamId}`
    );
    const matchDateData = await matchDateRes.json();
    matchDate.value = matchDateData.matchDate || "Data nu a fost gasită";

    const matchTimeRes = await fetch(
      `http://localhost:3000/api/match-time?id=${awayTeamId}`
    );
    const matchTimeData = await matchTimeRes.json();
    matchTime.value = matchTimeData.matchTime || "Ora nu a fost gasită";

    const awayTeamLogoRes = await fetch(
      `http://localhost:3000/api/logos?id=${awayTeamId}`
    );
    const awayTeamLogoData = await awayTeamLogoRes.json();

    console.log("awayTeamLogoData", awayTeamLogoData);

    awayTeamLogo.value = awayTeamLogoData.awayTeamLogo || "Logo neexistent";

    const allMatchesRes = await fetch("http://localhost:3000/api/all-matches");
    const allMatchesData = await allMatchesRes.json();
    allMatches.value = allMatchesData.matches || [];
  } catch (error) {
    console.error("Eroare la preluarea datelor:", error);
  }
});
</script>

<template>
  <div
    class="min-h-screen w-full bg-slate-50 font-sans py-12 px-4 sm:px-6 flex flex-col items-center gap-12"
  >
    <div class="w-full max-w-5xl relative group">
      <div
        class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[45px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"
      ></div>

      <div class="relative bg-white rounded-[40px] shadow-2xl overflow-hidden">
        <div
          class="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-center relative overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
          ></div>
          <h1
            class="text-xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md relative z-10"
          >
            Următoarea Bătălie pe Oblemenco
          </h1>
        </div>

        <div class="p-8 md:p-12 flex flex-col items-center">
          <div
            class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full mb-10"
          >
            <div class="flex flex-col items-center gap-4 w-48">
              <div class="relative">
                <div
                  class="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"
                ></div>
                <img
                  src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
                  alt="universitatea_craiova_logo"
                  class="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110 hover:-rotate-3"
                />
              </div>
              <h2
                class="font-extrabold text-blue-900 text-center text-xl leading-tight"
              >
                Universitatea<br />Craiova
              </h2>
            </div>

            <div class="flex flex-col items-center justify-center relative">
              <span
                class="text-6xl md:text-8xl font-black text-slate-100 absolute select-none"
                >VS</span
              >
              <!-- <span class="text-3xl font-bold text-slate-300 relative z-10"
                >vs</span
              > -->
            </div>

            <div class="flex flex-col items-center gap-4 w-48">
              <img
                :src="awayTeamLogo"
                :alt="awayTeamName"
                class="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl transition-transform duration-500 hover:scale-110 hover:rotate-3"
              />
              <h2
                class="font-extrabold text-slate-800 text-center text-xl leading-tight"
              >
                {{ awayTeamName }}
              </h2>
            </div>
          </div>

          <div
            style="margin-top: 15px"
            class="flex flex-col items-center w-full max-w-2xl bg-slate-50 rounded-2xl p-6 border border-slate-100"
          >
            <div
              class="flex flex-wrap justify-center gap-4 text-slate-600 mb-6 font-medium"
            >
              <div
                class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200"
              >
                <span class="text-blue-600">📅</span> {{ matchDate }}
              </div>
              <div
                class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200"
              >
                <span class="text-blue-600">⏰</span> {{ matchTime }}
              </div>
              <div
                class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200"
              >
                <span class="text-blue-600">📍</span> Stadionul Ion Oblemenco
              </div>
            </div>

            <button
              style="margin-top: 25px; cursor: pointer"
              class="w-full md:w-auto px-12 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-blue-500/40 transform active:scale-95"
              :class="[
                isMainMatchAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none',
              ]"
              :disabled="!isMainMatchAvailable"
              @click="
                isMainMatchAvailable &&
                  openCumparaBilete(
                    awayTeamName,
                    awayTeamLogo,
                    matchDate,
                    matchTime,
                    mainMatchId
                  )
              "
            >
              {{
                isMainMatchAvailable
                  ? "Prinde-ți Locul în Tribună"
                  : "Biletele nu sunt încă disponibile"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-5xl">
      <div class="flex items-center gap-4 mb-8 pl-4 border-l-4 border-blue-600">
        <h2
          class="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight"
        >
          Calendar Competițional
        </h2>
      </div>

      <div style="margin-top: 10px" class="grid gap-5">
        <div
          v-for="(match, index) in allMatches"
          :key="index"
          class="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-col md:flex-row">
            <div
              class="bg-slate-100 md:w-32 flex flex-row md:flex-col items-center justify-center gap-1 p-4 border-b md:border-b-0 md:border-r border-dashed border-slate-300"
            >
              <span class="text-blue-600 text-lg">📅</span>
              <span class="font-bold text-slate-700 text-sm text-center">{{
                match.matchDate
              }}</span>
              <span class="text-slate-400 text-xs">{{ match.matchTime }}</span>
            </div>

            <div class="flex-1 p-6 flex flex-col justify-center">
              <div class="flex items-center justify-between gap-4 mb-2">
                <div class="flex items-center gap-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
                    alt="home_logo"
                    class="w-10 h-10 object-contain"
                  />
                  <span class="font-bold text-slate-800 text-lg hidden sm:block"
                    >Univ. Craiova</span
                  >
                </div>
                <span class="text-slate-300 font-black text-xl italic">VS</span>
                <div class="flex items-center gap-3 justify-end">
                  <span
                    class="font-bold text-slate-800 text-lg hidden sm:block text-right"
                    >{{ match.awayTeamName }}</span
                  >
                  <img
                    :src="match.awayTeamLogo"
                    :alt="match.awayTeamName"
                    class="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <div class="flex justify-center sm:hidden mt-2">
                <p class="text-sm font-bold text-slate-800">
                  {{ match.awayTeamName }}
                </p>
              </div>
              <p
                class="text-center text-xs text-slate-400 mt-2 uppercase tracking-wide"
              >
                Stadionul Ion Oblemenco
              </p>
            </div>

            <div
              class="p-6 flex items-center justify-center bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100"
            >
              <button
                style="cursor: pointer"
                class="w-full md:w-auto px-6 py-2 rounded-lg text-sm font-bold uppercase transition-colors duration-200 border-2"
                :class="[
                  isMatchTicketAvailable(match)
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    : 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed',
                ]"
                :disabled="!isMatchTicketAvailable(match)"
                @click="
                  isMatchTicketAvailable(match) &&
                    openCumparaBilete(
                      match.awayTeamName,
                      match.awayTeamLogo,
                      match.matchDate,
                      match.matchTime,
                      match.id
                    )
                "
              >
                {{ isMatchTicketAvailable(match) ? "Rezervă" : "Indisponibil" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="fixed bottom-8 right-8 z-50">
    <button
      style="cursor: pointer"
      @click="toggleChat"
      class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-8 h-8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    </button>
  </div>

  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <ChatComponent
      v-if="showChat"
      class="fixed bottom-24 right-8 z-50"
      @close="toggleChat"
    />
  </Transition>
</template>

<style scoped>
/* Scoped styles kept clean as requested */
</style>
