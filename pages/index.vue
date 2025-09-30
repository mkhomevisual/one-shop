<template>
  <div>

    <OSNavbar />

    <Hero />

  

    <Stats />

    <AboutUs />

    <SectionDivider class="my-0 sm:my-0" />

    <OSMap />

    <SectionDivider class="my-0 sm:my-0" />

    <OsKategorieGrid />

      <SectionDivider class="my-0 sm:my-0" />

    <OurTeam />

  <News />

    <SectionDivider class="my-0 sm:my-0" />

    <Sales />

    <FooterOS />
  </div>
</template>

<script setup>
import OSNavbar from '~/components/OSNavbar.vue'
import Hero from '~/components/Hero.vue'
import AboutUs from '~/components/AboutUs.vue'
import FooterOS from '~/components/FooterOS.vue'
import Stats from '~/components/Stats.vue'
import Sales from '~/components/Sales.vue'
import OsKategorieGrid from '~/components/OsKategorieGrid.vue'
import OSMap from '~/components/OSMap.vue'
import OurTeam from '~/components/OurTeam.vue'
import SectionDivider from '~/components/SectionDivider.vue'
import News from '~/components/News.vue'
</script>
