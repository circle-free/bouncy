export function getSpeciesImageName(speciesId) {
  return `species-${speciesId}`;
}

export function getStoredData() {
  const exportedStateString = localStorage.getItem('exported-optimistic-mon-mon-state');

  return exportedStateString ? JSON.parse(exportedStateString) : {};
}

export function canSave() {
  const savedQueueLength = getStoredData().oriState.localQueue.length;
  const localQueueLength = window.optimisticMonMon.export().oriState.localQueue.length;

  return savedQueueLength !== localQueueLength;
}

export function canSync() {
  return !!window.optimisticMonMon.export().oriState.localQueue.length;
}
