<script setup>
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
</style>
