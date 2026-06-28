
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import mitt from "mitt";

export const emitter = mitt();

export const useShoppingCartStore = defineStore("shoppingCart", () => {
  const isShoppingCartVisible = ref(false);
  const items = ref([]);

  const selectedSeatsMap = ref(new Map());

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + item.pret, 0);
  });

  function showShoppingCart() {
    isShoppingCartVisible.value = true;
  }

  function hideShoppingCart() {
    isShoppingCartVisible.value = false;
  }

  function toggleShoppingCart() {
    isShoppingCartVisible.value = !isShoppingCartVisible.value;
  }

  function addTickets(ticketDetails) {
    items.value.push(ticketDetails);


    if (ticketDetails.selectedSeatsKeys) {
      const matchKey = ticketDetails.matchId || "default";
      if (!selectedSeatsMap.value.has(matchKey)) {
        selectedSeatsMap.value.set(matchKey, new Map());
      }
      const matchSeats = selectedSeatsMap.value.get(matchKey);
      matchSeats.set(ticketDetails.sector, ticketDetails.selectedSeatsKeys);
    }
  }

  function removeTickets(index) {
    const ticketToRemove = items.value[index];


    if (ticketToRemove.sector && ticketToRemove.matchId) {
      const matchKey = ticketToRemove.matchId || "default";
      const matchSeats = selectedSeatsMap.value.get(matchKey);
      if (matchSeats) {
        matchSeats.delete(ticketToRemove.sector);
        if (matchSeats.size === 0) {
          selectedSeatsMap.value.delete(matchKey);
        }
      }
     
      emitter.emit("deselectSeats", ticketToRemove);
    }

    items.value.splice(index, 1);
  }

  function updateSeatSelection(
    sector,
    seatKey,
    isSelected,
    matchId = "default"
  ) {
    const matchKey = matchId || "default";

    if (!selectedSeatsMap.value.has(matchKey)) {
      selectedSeatsMap.value.set(matchKey, new Map());
    }

    const matchSeats = selectedSeatsMap.value.get(matchKey);

    if (!matchSeats.has(sector)) {
      matchSeats.set(sector, []);
    }

    const sectorSeats = matchSeats.get(sector);

    if (isSelected) {
      if (!sectorSeats.includes(seatKey)) {
        sectorSeats.push(seatKey);
      }
    } else {
      const index = sectorSeats.indexOf(seatKey);
      if (index > -1) {
        sectorSeats.splice(index, 1);
      }
    }
  }

  function getSelectedSeatsForSector(sector, matchId = "default") {
    const matchKey = matchId || "default";
    const matchSeats = selectedSeatsMap.value.get(matchKey);
    return matchSeats ? matchSeats.get(sector) || [] : [];
  }

  function clearCart() {
    items.value = [];
    selectedSeatsMap.value.clear();
    isShoppingCartVisible.value = false;
  }


  function clearMatchData(matchId) {
    const matchKey = matchId || "default";


    items.value = items.value.filter(
      (item) => (item.matchId || "default") !== matchKey
    );


    selectedSeatsMap.value.delete(matchKey);
  }

  return {
    isShoppingCartVisible,
    items,
    total,
    showShoppingCart,
    hideShoppingCart,
    toggleShoppingCart,
    addTickets,
    removeTickets,
    updateSeatSelection,
    getSelectedSeatsForSector,
    clearCart,
    clearMatchData,
  };
});
