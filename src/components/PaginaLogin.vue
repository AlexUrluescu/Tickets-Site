<script setup>
import { reactive } from "vue";
import { useRouter } from 'vue-router';
import {useUserStore} from "@/stores/user.js";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  email: '',
  password: '',
  eroareEmail: '',
  eroareParola: '',
  isPasswordHidden: false,
  isEmailHidden: true,
});

const validateEmail = () => {
  if (form.email === '') {
    form.eroareEmail = 'Câmp obligatoriu';
    return false;
  }
  form.eroareEmail = '';
  return true;
};

const validatePassword = () => {
  if (form.password === '') {
    form.eroareParola = 'Câmp obligatoriu';
    return false;
  }
  form.eroareParola = '';
  return true;
};

const handleContinue = async () => {
  if (validateEmail()) {
    const response = await fetch('http://localhost:3000/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      router.push({ name: 'PaginaSignUp', query: { email: form.email } });
    }
  }
};

const handlePasswordContinue = async () => {
  if (validatePassword()) {
    const passwordRes = await fetch('http://localhost:3000/api/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });

    const nameRes = await fetch ('http://localhost:3000/api/get-name' , {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:form.email}),
    });

    const passwordData = await passwordRes.json();
    const nameData = await nameRes.json();

    if (form.password === passwordData.password) {
      console.log("Parola este identica!");
      const token = 'dummy-token';
      const userData = { name: nameData.numeUser };

      // Salvează email-ul în localStorage
      localStorage.setItem('userEmail', form.email);

      userStore.login(token, userData);
      router.push({ name: 'StadionMunicipal'});
    } else {
      form.eroareParola = 'Parola este incorectă!';
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
  <div class="grid-container">
    <img src="@/assets/images/Icons/Logo.png" alt="logo" class="logo" />
    <div v-if="form.isEmailHidden" class="login-container">
      <h1 class="text">Salut!</h1>
      <p class="text">Introdu adresa de email</p>

      <input type="email" class="input" v-model="form.email" autofocus/>
      <p v-if="form.eroareEmail" class="text-eroare">{{ form.eroareEmail }}</p>

      <button  class="btn continue-button" @click="handleContinue">
       Continuă
      </button>

      <p class="text">Dacă nu aveți cont, îl puteți crea la următorul pas</p>
      <div class="separator">sau intră în cont cu</div>
      <button class="btn btn-social facebook">Facebook</button>
      <button class="btn google-login-btn">Google</button>
    </div>

    <div v-if="form.isPasswordHidden" class="password-container">
      <button  class="back-button" @click="handleBackButton">
        <img class="back-arrow-icon" src="@/assets/images/Icons/menu_arrow_icon.png" alt="back-arrow-icon">
        Înapoi
      </button>
      <h1 class="text">Introduceți parola pentru a intra în cont</h1>
      <input type="password" class="input" v-model="form.password" autofocus/>
      <p v-if="form.eroareParola" class="text-eroare">{{ form.eroareParola }}</p>
      <button  class="btn continue-button" @click="handlePasswordContinue">
        Continuă
      </button>

    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.grid-container {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
  min-height: 650px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  place-content: center;
}

.login-container {
  width: 400px;
  flex-direction: column;
  border-style: solid;
  border-radius: 2%;
  border-color: oklch(0.723 0.219 149.579);
  box-shadow: 10px 10px 18px oklch(0.527 0.154 150.069);
  background-color: oklch(0.982 0.018 155.826);
  padding: 20px;
}

.password-container{
  width: 400px;
  height: 250px;
  flex-direction: column;
  border-style: solid;
  border-radius: 2%;
  border-color: oklch(0.723 0.219 149.579);
  box-shadow: 10px 10px 18px oklch(0.527 0.154 150.069);
  background-color: oklch(0.982 0.018 155.826);
  padding: 20px;
  position:relative;
}

.back-button{
  display:flex;
  position:relative;
  height: 25px;
  width: 75px;
  border: none;
  background-color: oklch(0.723 0.219 149.579);
  font-family: "Noto Sans", sans-serif;
  padding-top:1%;
  border-radius: 10px;
}

.back-arrow-icon{
    position:relative;
    width:25px;
    transform : rotate(180deg);
    padding-top: 2%;
}

.back-button:hover{
  background-color: oklch(0.627 0.194 149.214);
  cursor: pointer;
}

.logo {
  display: block;
  margin: 0 auto;
}

.text {
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  margin-top: 5%;
  font-size: 18px;
}

.text-eroare {
  color: red;
  font-size: 14px;
  text-align: left;
  margin-left:8%;
  margin-top: 1%;
  font-family: "Noto Sans", sans-serif;
}


.input {
  display: block;
  margin: 8% auto 0 auto;
  min-height: 35px;
  min-width: 85%;
  border: 1px solid;
  border-radius: 21px;
  padding: 6px 35px 6px 10px;
  font-family: "Noto Sans", sans-serif;
  font-size: 14px;
}

.btn {
  display: block;
  margin: 20px auto 0 auto;
  min-height: 35px;
  min-width: 85%;
  border: none;
  border-radius: 21px;
  font-family: "Noto Sans", sans-serif;
  font-size: 18px;
  color: white;
}

.continue-button {
  background-color: oklch(0.723 0.219 149.579);
}

.continue-button:hover {
  background-color: oklch(0.627 0.194 149.214);
  cursor: pointer;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin-top: 8%;
  margin-left: 9%;
  margin-right: 9%;
  font-family: "Noto Sans", sans-serif;
  font-size: 15px;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid oklch(0.723 0.219 149.579);
}

.separator:not(:empty)::before {
  margin-right: .30em;
}

.separator:not(:empty)::after {
  margin-left: .30em;
}

.facebook {
  background-color: #415a94;
}

.facebook:hover {
  background-color: #314471;
  cursor: pointer;
}

.google-login-btn {
  background-color: #cf553d;
}

.google-login-btn:hover {
  background-color: #ae412b;
  cursor: pointer;
}



</style>
