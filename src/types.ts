/**
 * Types & Interfaces for SolidWorks Master Assistant
 */

export type ActiveTab = 
  | 'dashboard' 
  | 'inspiration_gallery'
  | 'room_planner'
  | 'cabinet' 
  | 'murphy_bed'
  | 'nesting'
  | 'laser_cnc'
  | 'procurement'
  | 'standard_parts'
  | 'hardware' 
  | 'cnc' 
  | 'voice_cad'
  | 'wizard' 
  | 'macro_guide'
  | 'manual' 
  | 'solidworks_link' 
  | 'ai_assistant';

export interface LearnedPattern {
  id: string;
  title: string;
  cabinetType: string;
  width: number;
  height: number;
  depth: number;
  materialThickness: number;
  doorCount: number;
  hingeBrand: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface StandardPartItem {
  id: string;
  namePersian: string;
  category: 'fastener' | 'hardware' | 'profile' | 'fitting';
  subCategory: string;
  standardCode: string; // e.g. DIN 912, ISO 4014, MDF-Screw-4x50
  material: string;
  parameters: {
    length: number;
    width: number;
    height: number;
    threadSize?: string; // M4, M6, M8
    threadPitch?: number; // mm
    holeCount?: number;
    holeSpacing?: number;
    diameter?: number;
    finishColor?: string;
  };
  macroTemplate: string;
}

export interface CabinetParams {
  id: string;
  name: string;
  cabinetType?: 'base' | 'wall' | 'pantry' | 'drawer_chest' | 'corner' | 'sink';
  width: number; // mm (e.g. 600)
  height: number; // mm (e.g. 800)
  depth: number; // mm (e.g. 550)
  materialThickness: number; // mm (16 or 18)
  backPanelThickness: number; // mm (3 or 6)
  toeKickHeight: number; // mm (100)
  doorCount: number; // 1 or 2
  shelfCount: number; // e.g. 1, 2
  doorType: 'full_overlay' | 'half_overlay' | 'inset';
  hingeBrand: 'Blum' | 'Hettich' | 'Fantoni' | 'Standard';
  hasDrawers: boolean;
  drawerCount: number;
  finishColor: string; // hex or name
  edgeBandingThickness: number; // mm (e.g. 1 or 2)
  handleType?: 'knob' | 'bar' | 'g_profile' | 'j_pull' | 'push_open';
}

export interface HardwareParams {
  id: string;
  name: string;
  category: 'hinge' | 'slide' | 'minifix' | 'handle' | 'bracket';
  length: number; // mm
  width: number; // mm
  height: number; // mm
  cupDiameter?: number; // mm (35 for hinges)
  cupDepth?: number; // mm (11.5)
  holePitch?: number; // mm (96, 128, 160 for handles)
  slideLength?: number; // mm (300, 350, 400, 450, 500)
  loadCapacityKg?: number; // kg
  screwCount: number;
  finishMaterial: string;
}

export interface CncSegment {
  id: string;
  type: 'cylinder' | 'cone' | 'groove' | 'thread';
  startDiameter: number; // mm
  endDiameter: number; // mm (for cone/taper)
  length: number; // mm
  chamferStart?: number; // mm
  chamferEnd?: number; // mm
  filletRadius?: number; // mm
  threadPitch?: number; // mm (for thread type e.g. 1.5, 2.0)
  threadType?: 'metric' | 'bsw' | 'acme';
}

export interface CncLatheParams {
  id: string;
  partName: string;
  overallLength: number; // mm
  maxDiameter: number; // mm
  boreDiameter: number; // mm (center hole)
  boreDepth: number; // mm
  material: 'Steel_1045' | 'Aluminum_6061' | 'Brass_C360' | 'Stainless_304';
  segments: CncSegment[];
}

export interface BomItem {
  partName: string;
  quantity: number;
  dimensions: string;
  material: string;
  edgeBanding: string; // e.g. "2L 2W"
  notes?: string;
}

export interface SolidWorksMacroOutput {
  vbaCode: string;
  pythonComCode: string;
  pyautoguiCode: string;
  batLauncherCode: string;
  bomItems: BomItem[];
  instructionsPersian: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'sketch' | 'part' | 'assembly' | 'drawing' | 'cabinetry' | 'hardware' | 'cnc' | 'macros' | 'troubleshooting';
  summaryPersian: string;
  detailedContentPersian: string;
  shortcuts?: string[];
  steps?: string[];
  codeSnippet?: string;
}

export interface WizardStep {
  id: number;
  title: string;
  question: string;
  description: string;
  field: string;
  type: 'select' | 'number' | 'toggle' | 'segments';
  options?: { label: string; value: any; subtext?: string }[];
  defaultValue: any;
  recommendationPersian?: string;
}
