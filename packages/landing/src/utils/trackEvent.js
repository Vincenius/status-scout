import { create } from 'zustand'

const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const useTrackStore = create((set) => ({
  trackedEvents: {},
  addTrackedEvent: (name) => set((state) => ({ trackedEvents: { ...state.trackedEvents, [name]: true } })),
}))

export const trackEvent = (name, data) => {
  if (isAnalyticsEnabled && window.umami) {
    umami.track(name, data);
  }
}

export const trackUniqueEvent = (name, data) => {
  const { trackedEvents, addTrackedEvent } = useTrackStore.getState()
  if (isAnalyticsEnabled && !trackedEvents[name]) {
    umami.track(name, data);
    addTrackedEvent(name)
  }
}

