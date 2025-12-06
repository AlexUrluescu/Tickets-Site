<script setup>
 import {ref,computed} from 'vue'
 import { useRoute } from 'vue-router'
 import { useRouter } from 'vue-router';
 import eyeOpen from '@/assets/images/Icons/hidePasswordIcon.png'
 import eyeClosed from '@/assets/images/Icons/showPasswordIcon.png'
 import {useUserStore} from "@/stores/user.js";

 const route = useRoute();
 const router = useRouter();
 const emailFromLogin = route.query.email;
 const nume=ref('')
 const parola=ref('')
 const confirmaParola = ref('')
 const parolaVizibila = ref(false)
 const esteFocusParola = ref(false)
 const confirmaVizibila = ref(false)
 const userStore = useUserStore();

 const eroareNume = computed(() => {
   if (nume.value === '') return 'Câmp obligatoriu'
   if (nume.value.length < 3) return 'Numele trebuie să conțină minim 3 caractere'
   return ''
 })

 const clasaInput = computed(() => {
   return eroareNume.value ? 'name-input eroare' : 'name-input'
 })

 const validareParola = computed(()=>({
   lungime:parola.value.length >=6,
   majuscula:/[A-Z]/.test(parola.value),
   minuscula:/[a-z]/.test(parola.value),
   special: /[^A-Za-z0-9]/.test(parola.value),
 }))

 const toateConditiile = computed(() => {
   const v = validareParola.value
   return v.lungime && v.majuscula && v.minuscula && v.special
 })

 const eroareParola = computed(() => {
   if (parola.value === '') return 'Câmp obligatoriu'
   if (!toateConditiile.value) return 'Parola este prea slabă'
   return ''
 })

 const eroareConfirmare = computed(() => {
   if (confirmaParola.value === '') return 'Câmp obligatoriu'
   if (parola.value !== confirmaParola.value) return 'Parolele nu sunt identice'
   return ''
 })

 const tipParola = computed(() => parolaVizibila.value ? 'text' : 'password')
 const tipConfirmare = computed(() => confirmaVizibila.value ? 'text' : 'password')

 const handleCreazaCont = async () => {
   if (parola.value === confirmaParola.value && nume.value !== '' && parola.value !== '' && confirmaParola.value !=='' && toateConditiile.value === true) {
     const response = await fetch('http://localhost:3000/api/add-user', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({username: nume.value, email: emailFromLogin , password:parola.value}),
     })
     const token = 'dummy-token';
     const userData = { name: nume.value };

     // Salvează email-ul în localStorage
     localStorage.setItem('userEmail', emailFromLogin);

     userStore.login(token, userData);
     router.push({name:'StadionMunicipal'});
   }
 }

</script>

<template>
<div class="grid-container">
  <img src="@/assets/images/Icons/Logo.png" alt="logo" class="logo">
  <div class="signup-container">
    <h1 class="text">Bine ai venit!</h1>
    <p class="text">{{emailFromLogin}}</p>
    <p class="text">Se pare că nu aveți cont , haide să creăm unul!</p>

    <h1 class="text" style="font-size:  1.3rem">Nume si prenume</h1>
    <input  :class="clasaInput" v-model="nume"/>
    <p v-if="eroareNume" class="text-eroare">{{eroareNume}}</p>

    <p class="text" style="font-size: 1.3rem">Crează o parolă sigură</p>
    <div class="input-wrapper">
      <input
          :type="tipParola"
          class="password-input"
          v-model="parola"
          @focus="esteFocusParola = true"
          @blur="esteFocusParola = false"
      />
      <span class="toggle-password" @click="parolaVizibila = !parolaVizibila">
        <img
         :src="parolaVizibila ? eyeOpen : eyeClosed"
          alt="toggle password"
          class="icon-parola"
        />
      </span>
    </div>
    <p v-if="eroareParola" class="text-eroare">{{ eroareParola }}</p>

    <div v-if="esteFocusParola" class="parola-hints">
      <ul>
        <li :class="{ valid: validareParola.lungime }">Minim 6 caractere</li>
        <li :class="{ valid: validareParola.majuscula }">Minim o majusculă</li>
        <li :class="{ valid: validareParola.minuscula }">Minim o minusculă</li>
        <li :class="{ valid: validareParola.special }">Minim un caracter special : ! @ ?</li>
      </ul>
    </div>

    <p class="text" style="font-size: 1.3rem">Confirmă parola</p>
    <div class="input-wrapper">
      <input
          :type="tipConfirmare"
          class="password-input"
          v-model="confirmaParola"
      />
    </div>
    <p v-if="eroareConfirmare" class="text-eroare">{{ eroareConfirmare }}</p>
    <button type="submit" class="creaza-contul" @click="handleCreazaCont">Crează contul!</button>

  </div>
</div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.grid-container{
  display:grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
  min-height: 650px;
  max-width:400px;
  margin: 0 auto;
  padding: 20px;
  place-content: center;
}

.signup-container{
  width:400px;
  height:600px;
  flex-direction: column;
  border-style:solid;
  border-radius:2%;
  border-color: oklch(0.723 0.219 149.579);
  box-shadow: 10px 10px 18px oklch(0.527 0.154 150.069);
  background-color: oklch(0.982 0.018 155.826);
}

.logo{
  display:block;
  margin-left:auto;
  margin-right:auto;
}

.text{
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  margin-top:5%;
  font-size: 18px;
}

.name-input{
  display:block;
  margin-left:auto;
  margin-right:auto;
  margin-top:3%;
  min-height: 35px;
  min-width: 85%;
  border:1px solid;
  border-radius: 21px;
  background-color: oklch(0.982 0.018 155.826);
  padding: 6px 35px 6px 10px;
  font-family: "Noto Sans", sans-serif;
  font-size:14px;
}



.text-eroare {
  color: red;
  font-size: 14px;
  text-align: left;
  margin-left:8%;
  margin-top: 1%;
  font-family: "Noto Sans", sans-serif;
}

.password-input{
  display:block;
  margin-left:auto;
  margin-right:auto;
  margin-top:3%;
  min-height: 35px;
  min-width: 85%;
  border:1px solid;
  border-radius: 21px;
  background-color: oklch(0.982 0.018 155.826);
  padding: 6px 40px 6px 10px;
}

.parola-hints {
  background-color: oklch(98% 0.04 25);
  font-family: "Noto Sans", sans-serif;
  border: 1px solid red;
  border-radius: 10px;
  padding: 10px;
  margin: 10px auto;
  width: 85%;
  font-size: 14px;
  color: red;
}

.parola-hints ul {
  list-style-type: none;
  padding: 0;
}

.parola-hints li {
  margin-bottom: 4px;
}

.parola-hints li.valid {
  color: green;
}

.input-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-input {
  width: 85%;
  padding-right: 40px; /* spațiu pentru icon */
}

.toggle-password {
  position: absolute;
  right: 30px;
  cursor: pointer;
  font-size: 18px;
  user-select: none;
}

.icon-parola {
  margin-left: 5%;
  margin-top: 25%;
  width:50px;
  height: 24px;
  object-fit: contain;
}

.creaza-contul{
  display:block;
  margin-left:auto;
  margin-right:auto;
  margin-top:20px;
  min-height: 35px;
  min-width:85%;
  border-style: none;
  border-radius: 21px;
  font-family: "Noto Sans", sans-serif;
  font-size:18px;
  color:white;
  background-color:oklch(0.723 0.219 149.579) ;
}

.creaza-contul:hover{
  background-color: oklch(0.627 0.194 149.214);
  cursor:pointer;
}

</style>