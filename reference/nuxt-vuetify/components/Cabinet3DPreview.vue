<template>
  <div class="cabinet-3d-wrap">
    <div class="cabinet-3d" :style="cubeStyle">
      <div
        v-for="side in SIDES"
        :key="side"
        class="face"
        :class="[`face-${side}`, { 'face-active': side === store.currentSide }]"
        :style="faceStyle(side)"
        @click="store.setSide(side)"
      >
        <span class="face-label">{{ side }}</span>
        <div
          v-for="el in store.sideElements[side]"
          :key="el.id"
          class="face-el"
          :style="elStyle(el, side)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
import { CABINETS, SIDES, SIDE_ROTATIONS } from '~/utils/constants';
import type { Side, PanelElement } from '~/utils/types';

const store = useConfiguratorStore();

const S = 0.28; // scale factor

const cab = computed(() => CABINETS[store.currentCabinet]);
const cw = computed(() => cab.value.w * S);
const ch = computed(() => cab.value.h * S);
const cd = computed(() => cab.value.d * S);

const cubeStyle = computed(() => {
  const rot = SIDE_ROTATIONS[store.currentSide];
  return {
    width: `${cw.value}px`,
    height: `${ch.value}px`,
    transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
  };
});

function faceStyle(side: Side) {
  const w = cw.value, h = ch.value, d = cd.value;
  const map: Record<Side, string> = {
    front:  `width:${w}px;height:${h}px;transform:translateZ(${d / 2}px)`,
    back:   `width:${w}px;height:${h}px;transform:rotateY(180deg) translateZ(${d / 2}px)`,
    left:   `width:${d}px;height:${h}px;transform:rotateY(-90deg) translateZ(${w / 2}px)`,
    right:  `width:${d}px;height:${h}px;transform:rotateY(90deg) translateZ(${w / 2}px)`,
    top:    `width:${w}px;height:${d}px;transform:rotateX(90deg) translateZ(${h / 2}px)`,
    bottom: `width:${w}px;height:${d}px;transform:rotateX(-90deg) translateZ(${h / 2}px)`,
  };
  return map[side];
}

function elStyle(el: PanelElement, side: Side) {
  const fw = ['left', 'right'].includes(side) ? cab.value.d : cab.value.w;
  const fh = ['top', 'bottom'].includes(side) ? cab.value.d : cab.value.h;
  return {
    left: `${(el.x / fw) * 100}%`,
    top: `${(el.y / fh) * 100}%`,
    width: `${(el.w / fw) * 100}%`,
    height: `${(el.h / fh) * 100}%`,
    borderRadius: el.type === 'hole' ? '50%' : '2px',
    background: el.type === 'hole' ? '#1565C0' : el.type === 'rect' ? '#00ACC1' : '#F9A825',
  };
}
</script>

<style scoped>
.cabinet-3d-wrap {
  perspective: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.cabinet-3d {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}
.face {
  position: absolute;
  top: 50%; left: 50%;
  transform-origin: center;
  margin-top: calc(-50%);
  margin-left: calc(-50%);
  backface-visibility: visible;
  border: 1px solid rgba(21,101,192,0.25);
  background: rgba(21,101,192,0.06);
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.face:hover { background: rgba(21,101,192,0.12); }
.face-active { border-color: rgb(21,101,192); background: rgba(21,101,192,0.15); }
.face-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(21,101,192,0.6);
  pointer-events: none;
}
.face-el {
  position: absolute;
  opacity: 0.85;
  pointer-events: none;
}
</style>
