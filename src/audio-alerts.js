export const MATCH_ALERT_TYPES = {
  GOAL: "goal",
  START: "start",
  END: "end",
};

const ALERT_COOLDOWN_MS = 10 * 60 * 1000;
const RECENT_ALERT_LIMIT = 48;

function toScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function getEventKey(event) {
  return [
    event.type,
    event.matchId,
    event.homeScore ?? "-",
    event.awayScore ?? "-",
    event.status || "",
  ].join(":");
}

export function getMatchAlertEvents(previousSnapshot, nextSnapshot) {
  if (!previousSnapshot?.matches?.length || !nextSnapshot?.matches?.length || nextSnapshot.stale) {
    return [];
  }

  const previousById = new Map(previousSnapshot.matches.map((match) => [match.id, match]));
  const events = [];

  for (const match of nextSnapshot.matches) {
    const previous = previousById.get(match.id);
    if (!previous) continue;

    if (previous.status !== "live" && match.status === "live") {
      events.push({
        type: MATCH_ALERT_TYPES.START,
        matchId: match.id,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        match,
      });
    }

    const previousHome = toScore(previous.homeScore);
    const previousAway = toScore(previous.awayScore);
    const nextHome = toScore(match.homeScore);
    const nextAway = toScore(match.awayScore);
    const scoreIncreased = (
      previousHome !== null
      && previousAway !== null
      && nextHome !== null
      && nextAway !== null
      && (nextHome > previousHome || nextAway > previousAway)
    );

    if ((match.status === "live" || match.status === "final") && scoreIncreased) {
      events.push({
        type: MATCH_ALERT_TYPES.GOAL,
        matchId: match.id,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        match,
      });
    }

    if (previous.status !== "final" && match.status === "final") {
      events.push({
        type: MATCH_ALERT_TYPES.END,
        matchId: match.id,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        match,
      });
    }
  }

  return events;
}

export class WhistleAlertPlayer {
  constructor({ win = window, doc = document } = {}) {
    this.win = win;
    this.doc = doc;
    this.context = null;
    this.unlocked = false;
    this.recentAlerts = new Map();
    this.unlock = this.unlock.bind(this);
  }

  bindUnlockListeners() {
    const options = { passive: true };
    this.doc.addEventListener("pointerdown", this.unlock, options);
    this.doc.addEventListener("keydown", this.unlock);
    this.doc.addEventListener("touchstart", this.unlock, options);
  }

  async unlock() {
    const context = this.getContext();
    if (!context) return false;

    try {
      await context.resume();
      this.playSilentUnlockTone(context);
      this.unlocked = context.state === "running";
      return this.unlocked;
    } catch {
      return false;
    }
  }

  playEvents(events = [], now = Date.now()) {
    const uniqueEvents = [];

    for (const event of events) {
      const key = getEventKey(event);
      const lastPlayedAt = this.recentAlerts.get(key);
      if (lastPlayedAt && now - lastPlayedAt < ALERT_COOLDOWN_MS) continue;
      this.recentAlerts.set(key, now);
      uniqueEvents.push(event);
    }

    this.pruneRecentAlerts(now);
    if (!uniqueEvents.length) return false;

    uniqueEvents.forEach((event, index) => {
      this.play(event.type, index * 0.72);
    });
    return true;
  }

  play(type = MATCH_ALERT_TYPES.GOAL, delaySeconds = 0) {
    const context = this.getContext();
    if (!context || context.state !== "running") {
      this.unlocked = false;
      return false;
    }

    const now = context.currentTime + 0.02 + delaySeconds;

    if (type === MATCH_ALERT_TYPES.START) {
      this.scheduleWhistle(context, now, [0, 0.22], 0.16, 0.16);
      return true;
    }

    if (type === MATCH_ALERT_TYPES.END) {
      this.scheduleWhistle(context, now, [0, 0.34], 0.28, 0.12);
      return true;
    }

    this.scheduleWhistle(context, now, [0, 0.16, 0.34], 0.13, 0.2);
    return true;
  }

  getContext() {
    const AudioContext = this.win.AudioContext || this.win.webkitAudioContext;
    if (!AudioContext) return null;

    if (!this.context) {
      this.context = new AudioContext();
    }

    return this.context;
  }

  playSilentUnlockTone(context) {
    const gain = context.createGain();
    const oscillator = context.createOscillator();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.01);
  }

  scheduleWhistle(context, startTime, offsets, duration, lift) {
    for (const [index, offset] of offsets.entries()) {
      const chirpStart = startTime + offset;
      const chirpEnd = chirpStart + duration;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const noise = this.createNoiseSource(context, duration);
      const noiseGain = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(1860 + index * 110, chirpStart);
      oscillator.frequency.exponentialRampToValueAtTime(2420 + index * 90 + lift * 420, chirpEnd);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400 + index * 160, chirpStart);
      filter.Q.setValueAtTime(8, chirpStart);

      gain.gain.setValueAtTime(0.0001, chirpStart);
      gain.gain.exponentialRampToValueAtTime(0.12, chirpStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, chirpEnd);

      noiseGain.gain.setValueAtTime(0.0001, chirpStart);
      noiseGain.gain.exponentialRampToValueAtTime(0.045, chirpStart + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, chirpEnd);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      noise.connect(noiseGain);
      noiseGain.connect(filter);

      oscillator.start(chirpStart);
      oscillator.stop(chirpEnd + 0.03);
      noise.start(chirpStart);
      noise.stop(chirpEnd + 0.03);
    }
  }

  createNoiseSource(context, duration) {
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.ceil(sampleRate * (duration + 0.05)), sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.45;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  pruneRecentAlerts(now) {
    for (const [key, playedAt] of this.recentAlerts.entries()) {
      if (now - playedAt > ALERT_COOLDOWN_MS) {
        this.recentAlerts.delete(key);
      }
    }

    while (this.recentAlerts.size > RECENT_ALERT_LIMIT) {
      const oldestKey = this.recentAlerts.keys().next().value;
      this.recentAlerts.delete(oldestKey);
    }
  }
}
