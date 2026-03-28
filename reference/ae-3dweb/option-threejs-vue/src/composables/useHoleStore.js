import { reactive, ref } from 'vue';

const holes = reactive([]);
let nextId = 1;

// Panel dimensions in mm (default: generic rectangle)
const panelWidth = ref(500);
const panelHeight = ref(350);
const panelThickness = ref(2);

function addHole(x, y, radius = 15) {
  const hole = { id: nextId++, x, y, radius };
  holes.push(hole);
  return hole;
}

function updateHole(id, props) {
  const hole = holes.find(h => h.id === id);
  if (hole) Object.assign(hole, props);
}

function removeHole(id) {
  const idx = holes.findIndex(h => h.id === id);
  if (idx !== -1) holes.splice(idx, 1);
}

export function useHoleStore() {
  return {
    holes,
    panelWidth,
    panelHeight,
    panelThickness,
    addHole,
    updateHole,
    removeHole,
  };
}
