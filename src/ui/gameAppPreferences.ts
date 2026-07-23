export type GameAppStorageKeys = {
  sidebarKey: string;
  fontKey: string;
  timedChoiceKey: string;
  sceneArtHighlightKey: string;
  sectionTitleKey: string;
  campAutoSaveKey: string;
  devModeKey: string;
  onboardingPrimerKey: string;
  hubLoopPrimerKey: string;
  campPrimerKey: string;
  explorationPrimerKey: string;
  legacyBriefingKey: string;
};

export function buildGameAppStorageKeys(campaignId: string): GameAppStorageKeys {
  return {
    sidebarKey: `${campaignId}_sidebar_sections_v1`,
    fontKey: `${campaignId}_font_step_v1`,
    timedChoiceKey: `${campaignId}_timed_choice_v1`,
    sceneArtHighlightKey: `${campaignId}_scene_art_highlight_v1`,
    sectionTitleKey: `${campaignId}_section_title_v1`,
    campAutoSaveKey: `${campaignId}_camp_auto_save_v1`,
    devModeKey: `${campaignId}_dev_mode`,
    onboardingPrimerKey: `${campaignId}_onboarding_primer_v1`,
    hubLoopPrimerKey: `${campaignId}_hub_loop_primer_v1`,
    campPrimerKey: `${campaignId}_camp_primer_v1`,
    explorationPrimerKey: `${campaignId}_exploration_primer_v1`,
    legacyBriefingKey: `${campaignId}_legacy_briefing_v1`,
  };
}

export function loadFontStep(fontKey: string): number {
  try {
    const raw = localStorage.getItem(fontKey);
    const n = raw != null ? parseInt(raw, 10) : 0;
    if (n === 1 || n === 2) return n;
    return 0;
  } catch {
    return 0;
  }
}

export function saveFontStep(fontKey: string, fontStep: number): void {
  try {
    localStorage.setItem(fontKey, String(fontStep));
  } catch {
    /* noop */
  }
}

export function loadDevMode(devModeKey: string): boolean {
  try {
    return localStorage.getItem(devModeKey) === '1';
  } catch {
    return false;
  }
}

export function saveDevMode(devModeKey: string, enabled: boolean): void {
  try {
    localStorage.setItem(devModeKey, enabled ? '1' : '0');
  } catch {
    /* noop */
  }
}

export function loadTimedChoiceMode(timedChoiceKey: string): boolean {
  try {
    return localStorage.getItem(timedChoiceKey) === '1';
  } catch {
    return false;
  }
}

export function saveTimedChoiceMode(timedChoiceKey: string, enabled: boolean): void {
  try {
    localStorage.setItem(timedChoiceKey, enabled ? '1' : '0');
  } catch {
    /* noop */
  }
}

export function loadSceneArtHighlightEnabled(sceneArtHighlightKey: string): boolean {
  try {
    return localStorage.getItem(sceneArtHighlightKey) !== '0';
  } catch {
    return true;
  }
}

export function saveSceneArtHighlightEnabled(sceneArtHighlightKey: string, enabled: boolean): void {
  try {
    localStorage.setItem(sceneArtHighlightKey, enabled ? '1' : '0');
  } catch {
    /* noop */
  }
}

export function loadSectionTitleEnabled(sectionTitleKey: string): boolean {
  try {
    return localStorage.getItem(sectionTitleKey) !== '0';
  } catch {
    return true;
  }
}

export function saveSectionTitleEnabled(sectionTitleKey: string, enabled: boolean): void {
  try {
    localStorage.setItem(sectionTitleKey, enabled ? '1' : '0');
  } catch {
    /* noop */
  }
}

/** Auto-save ao descansar no acampamento (ligado por omissão). */
export function loadCampAutoSaveEnabled(campAutoSaveKey: string): boolean {
  try {
    return localStorage.getItem(campAutoSaveKey) !== '0';
  } catch {
    return true;
  }
}

export function saveCampAutoSaveEnabled(campAutoSaveKey: string, enabled: boolean): void {
  try {
    localStorage.setItem(campAutoSaveKey, enabled ? '1' : '0');
  } catch {
    /* noop */
  }
}

export function loadOnboardingPrimerVisible(onboardingPrimerKey: string): boolean {
  try {
    return localStorage.getItem(onboardingPrimerKey) !== '0';
  } catch {
    return true;
  }
}

export function saveOnboardingPrimerVisible(onboardingPrimerKey: string, visible: boolean): void {
  try {
    localStorage.setItem(onboardingPrimerKey, visible ? '1' : '0');
  } catch {
    /* noop */
  }
}

/** true = ainda não dispensado (mostrar aviso do hub). */
export function loadHubLoopPrimerVisible(hubLoopPrimerKey: string): boolean {
  try {
    return localStorage.getItem(hubLoopPrimerKey) !== '0';
  } catch {
    return true;
  }
}

export function saveHubLoopPrimerVisible(hubLoopPrimerKey: string, visible: boolean): void {
  try {
    localStorage.setItem(hubLoopPrimerKey, visible ? '1' : '0');
  } catch {
    /* noop */
  }
}

/** true = ainda não dispensado (mostrar aviso do acampamento). */
export function loadCampPrimerVisible(campPrimerKey: string): boolean {
  try {
    return localStorage.getItem(campPrimerKey) !== '0';
  } catch {
    return true;
  }
}

export function saveCampPrimerVisible(campPrimerKey: string, visible: boolean): void {
  try {
    localStorage.setItem(campPrimerKey, visible ? '1' : '0');
  } catch {
    /* noop */
  }
}

/** true = ainda não dispensado (mostrar aviso de exploração). */
export function loadExplorationPrimerVisible(explorationPrimerKey: string): boolean {
  try {
    return localStorage.getItem(explorationPrimerKey) !== '0';
  } catch {
    return true;
  }
}

export function saveExplorationPrimerVisible(explorationPrimerKey: string, visible: boolean): void {
  try {
    localStorage.setItem(explorationPrimerKey, visible ? '1' : '0');
  } catch {
    /* noop */
  }
}

export function loadSidebarSections(sidebarKey: string): Record<string, boolean> {
  const defaults: Record<string, boolean> = { recursos: true, missao: true };
  try {
    const raw = sessionStorage.getItem(sidebarKey);
    if (!raw) return { ...defaults };
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o === null) return { ...defaults };
    return { ...defaults, ...(o as Record<string, boolean>) };
  } catch {
    return { ...defaults };
  }
}

export function saveSidebarSections(sidebarKey: string, sections: Record<string, boolean>): void {
  try {
    sessionStorage.setItem(sidebarKey, JSON.stringify(sections));
  } catch {
    /* noop */
  }
}
