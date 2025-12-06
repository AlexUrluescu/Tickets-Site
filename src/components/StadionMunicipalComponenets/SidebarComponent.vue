<script setup>
import { ref } from 'vue';

const isSidebarVisible = ref(false);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
}
</script>

<template>
  <aside class="sidebar-container" :class="{'sidebar-hidden': !isSidebarVisible}">
    <img src="@/assets/images/Icons/menu_arrow_icon.png"
         alt="menu-icon"
         class="menu-icon"
         :class="{ 'rotated': isSidebarVisible}"
         @click="toggleSidebar"
    />
    <ul class="sidebar-list" v-show="isSidebarVisible">
      <li class="list-element element-container">Cumpără bilete</li>
      <li class="list-element element-container">Detalii despre echipă</li>
      <li class="list-element element-container">Detalii despre stadion</li>
    </ul>
  </aside>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.sidebar-container{
  width:350px;
  height:auto;
  transition: width 0.3s ease;
  overflow: hidden;
  border-width: 1px;
  border-style: hidden solid hidden hidden;
  display: flex;
  position:relative;
  flex-direction: column;
}

.sidebar-container:not(.sidebar-hidden) {
  width: 250px;
}


.sidebar-list{
  margin-top:15%;
  list-style-type: none;
}

.sidebar-hidden{
  width: 100px;
}

.list-element{
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  padding-bottom: 5px;
  padding-top:5px;
}

.element-container{
  border-radius: 5px;
  margin-left:50px;
  margin-right:50px;
}

.element-container:hover{
  background-color: indianred;
  cursor:pointer;
}


.menu-icon{
  position:absolute;
  right:20px;
  top:20px;
  width:35px;
  transition: all 0.4s;
  cursor:pointer;
}

.menu-icon.rotated{
  transform : rotate(180deg);
}




</style>