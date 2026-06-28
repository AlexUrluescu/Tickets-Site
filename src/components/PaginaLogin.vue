
<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user.js";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  email: "",
  password: "",
  eroareEmail: "",
  eroareParola: "",
  isPasswordHidden: false,
  isEmailHidden: true,
});

const validateEmail = () => {
  if (form.email === "") {
    form.eroareEmail = "Câmp obligatoriu";
    return false;
  }
  form.eroareEmail = "";
  return true;
};

const validatePassword = () => {
  if (form.password === "") {
    form.eroareParola = "Câmp obligatoriu";
    return false;
  }
  form.eroareParola = "";
  return true;
};

const handleContinue = async () => {
  if (validateEmail()) {
    const response = await fetch("http://localhost:3000/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await response.json();
    console.log(data.found);

    if (data.found === 1) {
      console.log("Emailul exista");
      form.isPasswordHidden = true;
      form.isEmailHidden = false;
    } else {
      console.log("Emailul nu exista");
      router.push({ name: "PaginaSignUp", query: { email: form.email } });
    }
  }
};

const handlePasswordContinue = async () => {
  if (validatePassword()) {
    const passwordRes = await fetch(
      "http://localhost:3000/api/check-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      }
    );

    const nameRes = await fetch("http://localhost:3000/api/get-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    const passwordData = await passwordRes.json();
    const nameData = await nameRes.json();

    if (form.password === passwordData.password) {
      console.log("Parola este identica!");
      const token = "dummy-token";
      const role = nameData.role || passwordData.role || "user";
      const userData = { name: nameData.numeUser, role: role };

      localStorage.setItem("userEmail", form.email);

      userStore.login(token, userData);

      if (role === "admin") {
        router.push({ name: "PaginaAdmin" });
      } else {
        router.push({ name: "StadionMunicipal" });
      }
    } else {
      form.eroareParola = "Parola este incorectă!";
    }
  }
};

const handleBackButton = () => {
  form.isEmailHidden = true;
  form.isPasswordHidden = false;
  console.log(form.isEmailHidden);
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans"
  >
    <div
      class="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
    >
      <div
        class="h-32 bg-blue-600 relative overflow-hidden flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"
        ></div>
        <div
          class="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-2xl opacity-50"
        ></div>

        <img
          src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
          alt="Logo"
          class="h-20 w-auto object-contain relative z-10 drop-shadow-lg transform translate-y-4"
        />
      </div>

      <div class="px-8 pb-10 pt-12">
        <div v-if="form.isEmailHidden" class="space-y-6 animate-fade-in">
          <div class="text-center">
            <h1
              class="text-2xl font-black text-slate-800 uppercase tracking-tight"
            >
              Bine ai venit
            </h1>
            <p class="text-slate-500 text-sm mt-1">
              Introdu adresa de email pentru a continua
            </p>
          </div>

          <div style="margin-top: 20px" class="space-y-2">
            <label
              for="email"
              class="block text-xs font-bold text-slate-500 uppercase ml-1"
              >Email</label
            >
            <div class="relative">
              <input
                id="email"
                type="email"
                v-model="form.email"
                autofocus
                placeholder="nume@exemplu.ro"
                class="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
                :class="{
                  'border-red-500 ring-1 ring-red-500 bg-red-50':
                    form.eroareEmail,
                }"
              />
            </div>
            <p
              v-if="form.eroareEmail"
              class="text-xs text-red-600 font-bold ml-1 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-3 h-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ form.eroareEmail }}
            </p>
          </div>

          <button
            style="margin-top: 20px; cursor: pointer"
            @click="handleContinue"
            class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all transform active:scale-95"
          >
            Continuă
          </button>

          <p style="margin-top: 20px;"   class="text-center text-xs text-slate-400 mt-4">
            Contul se va crea automat dacă nu există.
          </p>
        </div>

        <div v-if="form.isPasswordHidden" class="space-y-6 animate-slide-in">
          <div class="flex items-center gap-4 mb-6">
            <button
              @click="handleBackButton"
              class="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-slate-800">Parola Ta</h2>
              <p class="text-xs text-slate-500">{{ form.email }}</p>
            </div>
          </div>

          <div style="margin-top: 20px; margin-bottom: 20px" class="space-y-2">
            <label
              for="password"
              class="block text-xs font-bold text-slate-500 uppercase ml-1"
              >Parolă</label
            >
            <input
              id="password"
              type="password"
              v-model="form.password"
              autofocus
              class="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
              :class="{
                'border-red-500 ring-1 ring-red-500 bg-red-50':
                  form.eroareParola,
              }"
            />
            <p
              v-if="form.eroareParola"
              class="text-xs text-red-600 font-bold ml-1 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-3 h-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ form.eroareParola }}
            </p>
          </div>

          <button
            @click="handlePasswordContinue"
            class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all transform active:scale-95"
          >
            Intră în Cont
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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
</style>
