<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user.js";

const router = useRouter();
const userStore = useUserStore();
const userEmail = localStorage.getItem("userEmail");

// State
const activeTab = ref("stats");
const loading = ref(false);
const stats = ref({ totalBilete: 0, totalVenituri: 0, totalMeciuri: 0, totalUseri: 0 });
const soldTickets = ref([]);
const teams = ref([]);
const matches = ref([]);

// Formulare
const newMatch = ref({ data: "", ora: "", echipa_deplasare_id: "" });
const newTeam = ref({ nume: "", logo_url: "" });
const message = ref({ text: "", type: "" });

// Edit match state
const editingMatch = ref(null);
const editForm = ref({ data: "", ora: "", echipa_deplasare_id: "" });

// Fetch helpers
const apiBase = "http://localhost:3000/api/admin";

const showMessage = (text, type = "success") => {
  message.value = { text, type };
  setTimeout(() => { message.value = { text: "", type: "" }; }, 4000);
};

const fetchStats = async () => {
  try {
    const res = await fetch(`${apiBase}/stats?email=${userEmail}`);
    if (res.ok) stats.value = await res.json();
  } catch (e) { console.error("Eroare stats:", e); }
};

const fetchSoldTickets = async () => {
  try {
    const res = await fetch(`${apiBase}/sold-tickets?email=${userEmail}`);
    if (res.ok) {
      const data = await res.json();
      soldTickets.value = data.tickets || [];
    }
  } catch (e) { console.error("Eroare bilete:", e); }
};

const fetchTeams = async () => {
  try {
    const res = await fetch(`${apiBase}/teams?email=${userEmail}`);
    if (res.ok) {
      const data = await res.json();
      teams.value = data.teams || [];
    }
  } catch (e) { console.error("Eroare echipe:", e); }
};

const fetchMatches = async () => {
  try {
    const res = await fetch(`${apiBase}/matches?email=${userEmail}`);
    if (res.ok) {
      const data = await res.json();
      matches.value = data.matches || [];
    }
  } catch (e) { console.error("Eroare meciuri:", e); }
};

const addMatch = async () => {
  if (!newMatch.value.data || !newMatch.value.ora || !newMatch.value.echipa_deplasare_id) {
    showMessage("Completează toate câmpurile!", "error");
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${apiBase}/add-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMatch.value, email: userEmail }),
    });
    if (res.ok) {
      showMessage("Meci adăugat cu succes!");
      newMatch.value = { data: "", ora: "", echipa_deplasare_id: "" };
      await fetchMatches();
      await fetchStats();
    } else {
      const err = await res.json();
      showMessage(err.error || "Eroare la adăugare", "error");
    }
  } catch (e) { showMessage("Eroare de rețea", "error"); }
  loading.value = false;
};

const addTeam = async () => {
  if (!newTeam.value.nume) {
    showMessage("Numele echipei este obligatoriu!", "error");
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${apiBase}/add-team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTeam.value, email: userEmail }),
    });
    if (res.ok) {
      showMessage("Echipă adăugată cu succes!");
      newTeam.value = { nume: "", logo_url: "" };
      await fetchTeams();
    } else {
      const err = await res.json();
      showMessage(err.error || "Eroare la adăugare", "error");
    }
  } catch (e) { showMessage("Eroare de rețea", "error"); }
  loading.value = false;
};

const startEditMatch = (match) => {
  editingMatch.value = match;
  editForm.value = {
    data: match.matchDate,
    ora: match.matchTime,
    echipa_deplasare_id: teams.value.find(t => t.nume === match.awayTeamName)?.id || "",
  };
};

const cancelEdit = () => {
  editingMatch.value = null;
  editForm.value = { data: "", ora: "", echipa_deplasare_id: "" };
};

const saveMatch = async () => {
  if (!editForm.value.data || !editForm.value.ora || !editForm.value.echipa_deplasare_id) {
    showMessage("Completează toate câmpurile!", "error");
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${apiBase}/edit-match`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingMatch.value.id,
        ...editForm.value,
        email: userEmail,
      }),
    });
    if (res.ok) {
      showMessage("Meci actualizat cu succes!");
      cancelEdit();
      await fetchMatches();
      await fetchStats();
    } else {
      const err = await res.json();
      showMessage(err.error || "Eroare la actualizare", "error");
    }
  } catch (e) { showMessage("Eroare de rețea", "error"); }
  loading.value = false;
};

const goBack = () => {
  router.push("/bilete-stadion-municipal");
};

const logout = () => {
  userStore.logout();
  router.push("/");
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCurrency = (val) => {
  return Number(val || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 }) + " RON";
};

const formatSeats = (randData, locuriData) => {
  try {
    let parsed = randData;
    if (typeof randData === "string") {
      parsed = JSON.parse(randData);
    }
    if (Array.isArray(parsed)) {
      return parsed.map(item => `Rând ${item.rand}, Loc ${item.locuri}`).join(" | ");
    }
  } catch (e) {
    // not JSON, fall through
  }
  // Fallback for simple values
  return `Rând ${randData || '-'}, Loc ${locuriData || '-'}`;
};

onMounted(async () => {
  await Promise.all([fetchStats(), fetchSoldTickets(), fetchTeams(), fetchMatches()]);
});

const tabs = [
  { id: "stats", label: "Statistici", icon: "📊" },
  { id: "tickets", label: "Bilete Vândute", icon: "🎫" },
  { id: "matches", label: "Meciuri", icon: "⚽" },
  { id: "teams", label: "Echipe", icon: "🏟️" },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 font-sans">
    <!-- Header -->
    <header style="width: 100%;" class="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p class="text-xs text-blue-300">Panou de administrare</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="goBack" class="px-4 py-2 text-sm font-bold text-blue-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            ← Înapoi la site
          </button>
          <button @click="logout" class="px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
            Deconectare
          </button>
        </div>
      </div>
    </header>

    <!-- Message -->
    <div v-if="message.text" class="fixed top-20 right-6 z-50 animate-slide-in">
      <div :class="[
        'px-6 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2',
        message.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
      ]">
        <span>{{ message.type === 'error' ? '✕' : '✓' }}</span>
        {{ message.text }}
      </div>
    </div>

    <div class="px-6 py-8">
      <!-- Tabs -->
      <div class="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-sm border border-white/5">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300',
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          ]"
        >
          <span>{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- TAB: Statistici -->
      <div style="margin-top: 10px" v-if="activeTab === 'stats'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl shadow-blue-600/20 border border-blue-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-xl"><span class="text-2xl">🎫</span></div>
            <span class="text-blue-200 text-xs font-bold uppercase tracking-wider">Bilete</span>
          </div>
          <p class="text-4xl font-black text-white mb-1">{{ stats.totalBilete }}</p>
          <p class="text-blue-200 text-sm font-medium">Bilete vândute total</p>
        </div>

        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-emerald-600/20 border border-emerald-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-xl"><span class="text-2xl">💰</span></div>
            <span class="text-emerald-200 text-xs font-bold uppercase tracking-wider">Venituri</span>
          </div>
          <p class="text-4xl font-black text-white mb-1">{{ formatCurrency(stats.totalVenituri) }}</p>
          <p class="text-emerald-200 text-sm font-medium">Venituri totale</p>
        </div>

        <div class="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 shadow-xl shadow-violet-600/20 border border-violet-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-xl"><span class="text-2xl">⚽</span></div>
            <span class="text-violet-200 text-xs font-bold uppercase tracking-wider">Meciuri</span>
          </div>
          <p class="text-4xl font-black text-white mb-1">{{ stats.totalMeciuri }}</p>
          <p class="text-violet-200 text-sm font-medium">Meciuri viitoare</p>
        </div>

        <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 shadow-xl shadow-amber-600/20 border border-amber-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-xl"><span class="text-2xl">👥</span></div>
            <span class="text-amber-200 text-xs font-bold uppercase tracking-wider">Utilizatori</span>
          </div>
          <p class="text-4xl font-black text-white mb-1">{{ stats.totalUseri }}</p>
          <p class="text-amber-200 text-sm font-medium">Utilizatori înregistrați</p>
        </div>
      </div>

      <!-- TAB: Bilete Vândute -->
      <div style="margin-top: 10px"  v-if="activeTab === 'tickets'" class="bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-white/10">
          <h2 class="text-lg font-bold text-white">Bilete Vândute</h2>
          <p class="text-sm text-slate-400 mt-1">Lista completă a biletelor achiziționate</p>
        </div>

        <div v-if="soldTickets.length === 0" class="p-12 text-center">
          <span class="text-4xl mb-4 block">🎫</span>
          <p class="text-slate-400 text-lg font-medium">Nu există bilete vândute încă</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left border-b border-white/10">
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Comandă</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Meci</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sector</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Locuri</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nr. Bilete</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Preț</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ticket in soldTickets"
                :key="ticket.ticket_id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">{{ ticket.order_id }}</span>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-bold text-white">{{ ticket.user_name || '-' }}</p>
                  <p class="text-xs text-slate-400">{{ ticket.user_email }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-white">vs {{ ticket.awayTeamName || '-' }}</p>
                  <p class="text-xs text-slate-400">{{ formatDate(ticket.matchDate) }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-slate-300 font-medium">{{ ticket.sector }}</td>
                <td class="px-6 py-4 text-sm text-slate-300">{{ formatSeats(ticket.rand, ticket.locuri) }}</td>
                <td class="px-6 py-4">
                  <span class="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg text-xs font-bold">{{ ticket.numar_bilete }}</span>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-emerald-400">{{ formatCurrency(ticket.pret) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: Meciuri -->
      <div style="margin-top: 10px;"  v-if="activeTab === 'matches'" class="space-y-6">
        <!-- Formular adăugare meci -->
        <div class="bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
          <h2 style="margin-bottom: 10px;"  class="text-lg font-bold text-white mb-6">Adaugă Meci Nou</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style="margin-bottom: 10px;">
              <label style="margin-bottom: 5px" class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Data meciului</label>
              <input
                type="date"
                v-model="newMatch.data"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label  style="margin-bottom: 5px" class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Ora</label>
              <input
                type="time"
                v-model="newMatch.ora"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label style="margin-bottom: 5px" class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Echipa Deplasare</label>
              <select
                v-model="newMatch.echipa_deplasare_id"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="" disabled class="bg-slate-800">Selectează echipa</option>
                <option v-for="team in teams" :key="team.id" :value="team.id" class="bg-slate-800">
                  {{ team.nume }}
                </option>
              </select>
            </div>
          </div>
          <button
            @click="addMatch"
            :disabled="loading"
            style="margin-top: 10px;"
            class="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {{ loading ? 'Se adaugă...' : '+ Adaugă Meci' }}
          </button>
        </div>

        <!-- Lista meciuri -->
        <div class="bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-white/10">
            <h2 class="text-lg font-bold text-white">Meciuri Programate</h2>
          </div>

          <div v-if="matches.length === 0" class="p-12 text-center">
            <span class="text-4xl mb-4 block">⚽</span>
            <p class="text-slate-400 text-lg font-medium">Nu există meciuri</p>
          </div>

          <div v-else class="divide-y divide-white/5">
            <div
              v-for="match in matches"
              :key="match.id"
              class="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
            >
              <img
                v-if="match.awayTeamLogo"
                :src="match.awayTeamLogo"
                :alt="match.awayTeamName"
                class="w-10 h-10 object-contain rounded-lg bg-white/5 p-1"
              />
              <div v-else class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                {{ match.awayTeamName?.charAt(0) || '?' }}
              </div>
              <div class="flex-1">
                <p class="text-white font-bold">Universitatea Craiova vs {{ match.awayTeamName }}</p>
                <p class="text-slate-400 text-sm">{{ formatDate(match.matchDate) }} • {{ match.matchTime }}</p>
              </div>
              <button
                @click="startEditMatch(match)"
                class="px-4 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Editează
              </button>
              <span class="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold">
                ID: {{ match.id }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Echipe -->
      <div style="margin-top: 10px"  v-if="activeTab === 'teams'" class="space-y-6">
        <!-- Formular adăugare echipă -->
        <div class="bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
          <h2 style="margin-bottom: 10px;" class="text-lg font-bold text-white mb-6">Adaugă Echipă Nouă</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nume echipă</label>
              <input
                type="text"
                v-model="newTeam.nume"
                placeholder="Ex: FC Dinamo București"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Logo URL (opțional)</label>
              <input
                type="text"
                v-model="newTeam.logo_url"
                placeholder="https://example.com/logo.png"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <button
            @click="addTeam"
            :disabled="loading"
            style="margin-top: 10px;"
            class="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {{ loading ? 'Se adaugă...' : '+ Adaugă Echipă' }}
          </button>
        </div>

        <!-- Lista echipe -->
        <div style="margin-top: 10px;" class="bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-white/10">
            <h2 class="text-lg font-bold text-white">Echipe Disponibile</h2>
          </div>

          <div v-if="teams.length === 0" class="p-12 text-center">
            <span class="text-4xl mb-4 block">🏟️</span>
            <p class="text-slate-400 text-lg font-medium">Nu există echipe</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            <div
              v-for="team in teams"
              :key="team.id"
              class="flex items-center gap-4 bg-slate-700/30 rounded-xl p-4 border border-white/5 hover:border-blue-500/30 transition-all"
            >
              <img
                v-if="team.logo_url"
                :src="team.logo_url"
                :alt="team.nume"
                class="w-12 h-12 object-contain rounded-lg bg-white/5 p-1.5"
              />
              <div v-else class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-lg">
                {{ team.nume?.charAt(0) || '?' }}
              </div>
              <div>
                <p class="text-white font-bold">{{ team.nume }}</p>
                <p class="text-slate-400 text-xs">ID: {{ team.id }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: Editare Meci -->
      <div v-if="editingMatch" class="edit-modal-overlay" @click.self="cancelEdit">
        <div class="edit-modal-content">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="bg-amber-500/20 p-2.5 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-amber-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Editare Meci</h3>
                
              </div>
            </div>
            <button @click="cancelEdit" class="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div style="margin-top: 20px; margin-bottom: 10px;">
              <label style="margin-bottom: 5px" class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Data meciului</label>
              <input
                type="date"
                v-model="editForm.data"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <div style="margin-top: 20px; margin-bottom: 10px;">
              <label style="margin-bottom: 5px" class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Ora</label>
              <input
                type="time"
                v-model="editForm.ora"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <div style="margin-top: 20px; margin-bottom: 10px;">
              <label style="margin-bottom: 5px" class="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Echipa Deplasare</label>
              <select
                v-model="editForm.echipa_deplasare_id"
                class="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              >
                <option value="" disabled class="bg-slate-800">Selectează echipa</option>
                <option v-for="team in teams" :key="team.id" :value="team.id" class="bg-slate-800">
                  {{ team.nume }}
                </option>
              </select>
            </div>
          </div>

          <div style="margin-top: 20px; margin-bottom: 10px;" class="flex gap-3 mt-6">
            <button
              @click="cancelEdit"
              class="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold text-sm uppercase tracking-wider rounded-xl transition-all"
            >
              Anulează
            </button>
            <button
              @click="saveMatch"
              :disabled="loading"
              class="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/30 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {{ loading ? 'Se salvează...' : '✓ Salvează' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Edit Modal */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease-out;
}

.edit-modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  padding: 1.75rem;
  width: 100%;
  max-width: 480px;
  margin: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
