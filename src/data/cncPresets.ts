import { CncLatheParams } from '../types';

export const DEFAULT_CNC_PRESETS: CncLatheParams[] = [
  {
    id: 'stepped_shaft_threaded',
    partName: 'شفت پله‌ای رزوه دار (Stepped Threaded Shaft)',
    overallLength: 160,
    maxDiameter: 50,
    boreDiameter: 12,
    boreDepth: 40,
    material: 'Steel_1045',
    segments: [
      {
        id: 'seg_1',
        type: 'thread',
        startDiameter: 20,
        endDiameter: 20,
        length: 30,
        chamferStart: 2,
        threadPitch: 2.5,
        threadType: 'metric'
      },
      {
        id: 'seg_2',
        type: 'cylinder',
        startDiameter: 35,
        endDiameter: 35,
        length: 50,
        filletRadius: 3
      },
      {
        id: 'seg_3',
        type: 'groove',
        startDiameter: 30,
        endDiameter: 30,
        length: 10
      },
      {
        id: 'seg_4',
        type: 'cylinder',
        startDiameter: 50,
        endDiameter: 50,
        length: 70,
        chamferEnd: 1.5
      }
    ]
  },
  {
    id: 'conical_nozzle',
    partName: 'نازل مخروطی CNC (Conical Turning Nozzle)',
    overallLength: 120,
    maxDiameter: 60,
    boreDiameter: 20,
    boreDepth: 120,
    material: 'Brass_C360',
    segments: [
      {
        id: 'seg_c1',
        type: 'cylinder',
        startDiameter: 25,
        endDiameter: 25,
        length: 30,
        chamferStart: 1.5
      },
      {
        id: 'seg_c2',
        type: 'cone',
        startDiameter: 25,
        endDiameter: 60,
        length: 60
      },
      {
        id: 'seg_c3',
        type: 'cylinder',
        startDiameter: 60,
        endDiameter: 60,
        length: 30
      }
    ]
  }
];
