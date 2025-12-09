<script setup>
import { ref, watch, onMounted } from "vue";
import NavbarComponentStadionMunicipal from "@/components/StadionMunicipalComponenets/NavbarComponentStadionMunicipal.vue";
import SidebarComponent from "@/components/StadionMunicipalComponenets/SidebarComponent.vue";
import MainContentComponent from "@/components/StadionMunicipalComponenets/MainContentComponent.vue";
import CumparaBileteComponent from "@/components/StadionMunicipalComponenets/CumparaBileteComponent.vue";
import CosCumparaturiComponent from "@/components/StadionMunicipalComponenets/CosCumparaturiComponent.vue";
import { useShoppingCartStore } from "@/stores/cosCumparaturi.js";
import { storeToRefs } from "pinia";

const showCumparaBilete = ref(false);
const STORAGE_KEY = "showCumparaBilete";
const awayTeamName = ref("");
const awayTeamLogo = ref("");
const matchDate = ref("");
const matchTime = ref("");
const matchId = ref(""); // Adaugă matchId
const shoppingCartStore = useShoppingCartStore();
const { isShoppingCartVisible } = storeToRefs(shoppingCartStore);

// Modifică funcția pentru a include matchId
const openCumparaBilete = (teamName, logo, date, time, matchIdValue) => {
  console.log("=== openCumparaBilete called ===");
  console.log("Params:", { teamName, logo, date, time, matchIdValue });

  // NU mai genera string-uri! Folosește doar ID-ul numeric
  if (!matchIdValue) {
    console.error("EROARE: matchId lipsește!");
    alert("Eroare: ID-ul meciului lipsește!");
    return;
  }

  showCumparaBilete.value = true;
  awayTeamName.value = teamName;
  awayTeamLogo.value = logo;
  matchDate.value = date;
  matchTime.value = time;
  matchId.value = matchIdValue; // Folosește doar ID-ul numeric

  localStorage.setItem(
    "selectedMatch",
    JSON.stringify({
      awayTeamName: teamName,
      awayTeamLogo: logo,
      matchDate: date,
      matchTime: time,
      matchId: matchIdValue, // Folosește doar ID-ul numeric
    })
  );
};

onMounted(() => {
  const saved = localStorage.getItem("selectedMatch");
  if (saved) {
    const data = JSON.parse(saved);
    awayTeamName.value = data.awayTeamName;
    awayTeamLogo.value = data.awayTeamLogo;
    matchDate.value = data.matchDate;
    matchTime.value = data.matchTime;
    matchId.value =
      data.matchId ||
      `${data.awayTeamName}-${data.matchDate}-${data.matchTime}`
        .replace(/\s+/g, "-")
        .toLowerCase();
    showCumparaBilete.value = true;
  }
});

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  showCumparaBilete.value = saved === "true";
});

watch(showCumparaBilete, (val) => {
  localStorage.setItem(STORAGE_KEY, val ? "true" : "false");
});

function goBackToMain() {
  showCumparaBilete.value = false;
}
</script>

<template>
  <NavbarComponentStadionMunicipal />
  <CosCumparaturiComponent />
  <div class="page-layout">
    <!--<SidebarComponent />-->
    <component
      :is="showCumparaBilete ? CumparaBileteComponent : MainContentComponent"
      :openCumparaBilete="openCumparaBilete"
      :awayTeamName="awayTeamName"
      @goBack="goBackToMain"
      :awayTeamLogo="awayTeamLogo"
      :matchDate="matchDate"
      :matchTime="matchTime"
      :matchId="matchId"
    />
    <!-- <Transition name="fade">
      <div
          v-if="isShoppingCartVisible"
          class="blur-overlay"
          @click="shoppingCartStore.hideShoppingCart()"
      ></div>
    </Transition> -->
  </div>
</template>

<style scoped>
.page-layout {
  background-image: linear-gradient(
    to right,
    oklch(1 0 0),
    oklch(0.577 0.245 27.325)
  );
  display: flex;
  height: auto;
  width: auto;
  overflow: hidden;
}

.blur-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
