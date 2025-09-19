<template>
  <!-- Full-width, výšku řídí prop `height` -->
  <div class="pointer-events-none select-none w-screen" :style="{ height: `${height}px` }">
    <svg :viewBox="`0 0 1200 ${vbH}`" preserveAspectRatio="none" class="w-full h-full">
      <defs>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Linky -->
      <g :style="{ color }" filter="url(#softGlow)" opacity="0.85">
        <!-- kolem středu `cy` kmitáme o ±amp -->
        <path class="route slow"
              :d="`M0 ${cy} C 200 ${cy - amp}, 360 ${cy + amp}, 560 ${cy} S 960 ${cy - amp}, 1200 ${cy}`" />
        <path class="route"
              :d="`M0 ${cy + amp*0.2} C 240 ${cy - amp*0.1}, 360 ${cy - amp*0.1}, 560 ${cy + amp*0.2} S 980 ${cy + amp*0.5}, 1200 ${cy}`" />
        <path class="route fast"
              :d="`M0 ${cy - amp*0.4} C 240 ${cy + amp}, 420 ${cy - amp*0.9}, 600 ${cy} S 1000 ${cy + amp*0.5}, 1200 ${cy - amp*0.4}`" />
      </g>

      <!-- Dekorativní body (volitelné) -->
      <g :style="{ color }" opacity="0.5">
        <circle class="node" :cx="240" :cy="cy + 10" r="3"/>
        <circle class="node" :cx="600" :cy="cy" r="3"/>
        <circle class="node" :cx="960" :cy="cy + 10" r="3"/>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: string
  height?: number   // výška pásu v px (vnější wrapper)
  amp?: number      // amplituda (rozpětí křivek od středu) v px v rámci viewBoxu
}>(), {
  color: 'currentColor',
  height: 200,
  amp: 150
})

/**
 * viewBox výška – necháme 240, ale můžeš klidně změnit.
 * Střed (cy) tedy = vbH/2
 */
const vbH = 240
const cy = vbH / 2
const color = props.color
const height = props.height
const amp = props.amp
</script>

<style scoped>
.route {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke-dasharray: 12 20;
  animation: flow 30s linear infinite;
}
.route.slow { animation-duration: 28s; }
.route.fast { animation-duration: 12s; }

.node {
  fill: currentColor;
  animation: pulse 3.2s ease-in-out infinite;
}

@keyframes flow {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -520; }
}
@keyframes pulse {
  0%,100% { r: 2; opacity:.3 }
  50%     { r: 4; opacity:.7 }
}

@media (prefers-reduced-motion: reduce) {
  .route, .node { animation: none !important; }
}
</style>
