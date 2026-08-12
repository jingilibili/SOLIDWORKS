import { StandardPartItem } from '../types';

export const STANDARD_PARTS_CATALOG: StandardPartItem[] = [
  {
    id: 'part-mdf-screw-4x50',
    namePersian: 'پیچ ام‌دی‌اف (MDF Screw 4x50mm)',
    category: 'fastener',
    subCategory: 'پیچ چوب و MDF',
    standardCode: 'DIN 7981 / ISO 7049',
    material: 'فولاد سخت‌کاری شده با روکش گالوانیزه',
    parameters: {
      length: 50,
      width: 4,
      height: 4,
      diameter: 4,
      threadPitch: 1.8,
      finishColor: '#38bdf8'
    },
    macroTemplate: `' SolidWorks VBA Macro for Standard MDF Screw 4x50mm
Sub main()
    Set swApp = Application.SldWorks
    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    ' Revolve Shaft & Cut Thread Pitch
    Part.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    Part.SketchManager.InsertSketch True
    Part.SketchManager.CreateCircle 0, 0, 0, 0.002, 0, 0
    Part.FeatureManager.FeatureExtrude2 True, False, False, 0, 0, 0.05, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False
End Sub`
  },
  {
    id: 'part-din912-m6',
    namePersian: 'پیچ آلن سر استوانه‌ای (Hex Socket Screw M6x30mm)',
    category: 'fastener',
    subCategory: 'پیچ‌های صنعتی',
    standardCode: 'DIN 912 / ISO 4762',
    material: 'فولاد آلیاژی 8.8 / Stainless Steel 304',
    parameters: {
      length: 30,
      width: 10,
      height: 10,
      diameter: 6,
      threadSize: 'M6',
      threadPitch: 1.0,
      finishColor: '#94a3b8'
    },
    macroTemplate: `' SolidWorks VBA Macro for DIN 912 M6x30
Sub main()
    Set swApp = Application.SldWorks
    Set Part = swApp.NewDocument("", 0, 0, 0)
    ' Extrude Cylinder M6x30 with Hex Head
End Sub`
  },
  {
    id: 'part-minifix-cam',
    namePersian: 'پین و قفل مینی‌فیکس / الیت (Minifix Cam & Bolt)',
    category: 'fitting',
    subCategory: 'اتصالات الیت',
    standardCode: 'Hafele Minifix 15',
    material: 'زاماک (Zamak) + پیچ فولادی',
    parameters: {
      length: 34,
      width: 15,
      height: 15,
      diameter: 15,
      holeCount: 2,
      holeSpacing: 32,
      finishColor: '#cbd5e1'
    },
    macroTemplate: `' SolidWorks VBA Macro for Minifix Fitting Assembly
Sub main()
    ' Generates 15mm Housing Hole & 8mm Bolt Slot
End Sub`
  },
  {
    id: 'part-dowel-8x30',
    namePersian: 'پین چوبی / دوبل شیاردار (Wooden Dowel 8x30mm)',
    category: 'fitting',
    subCategory: 'پین و دوبل',
    standardCode: 'DIN 68150',
    material: 'چوب راش طبیعی خشکانده شده',
    parameters: {
      length: 30,
      width: 8,
      height: 8,
      diameter: 8,
      finishColor: '#f59e0b'
    },
    macroTemplate: `' SolidWorks VBA Macro for Wooden Dowel 8x30mm
Sub main()
    ' Creates 8mm Diameter Cylinder with Fluted Ridges
End Sub`
  },
  {
    id: 'part-hinge-35mm',
    namePersian: 'لولا گازور ۳۵ میلیمتر آرام‌بند (35mm Soft-Close Hinge)',
    category: 'hardware',
    subCategory: 'لولای کابینت',
    standardCode: 'Blum Clip Top / Hettich Sensys',
    material: 'فولاد با روکش نیکل براق',
    parameters: {
      length: 110,
      width: 65,
      height: 25,
      diameter: 35,
      holeCount: 4,
      holeSpacing: 48,
      finishColor: '#e2e8f0'
    },
    macroTemplate: `' SolidWorks VBA Macro for 35mm Concealed Cabinet Hinge
Sub main()
    ' Creates Cup Bore (35mm Dia, 11.5mm Depth) + Mounting Plate Holes
End Sub`
  },
  {
    id: 'part-slide-ballbearing',
    namePersian: 'ریل ساچمه‌ای ۳ زمانه سنگین (Ball Bearing Slide 450mm)',
    category: 'hardware',
    subCategory: 'ریل کشو',
    standardCode: 'Heavy Duty 45mm Width',
    material: 'ورق فولادی گالوانیزه ۱.۲ میلیمتر',
    parameters: {
      length: 450,
      width: 45,
      height: 12.7,
      holeCount: 8,
      holeSpacing: 32,
      finishColor: '#64748b'
    },
    macroTemplate: `' SolidWorks VBA Macro for 450mm Slide Assembly
Sub main()
    ' Creates Inner, Middle, and Outer Rail Components
End Sub`
  },
  {
    id: 'part-profile-g-handle',
    namePersian: 'پروفیل آلومینیوم G دستگیره مخفی (G-Profile Aluminium)',
    category: 'profile',
    subCategory: 'پروفیل کابینتی',
    standardCode: 'G-Handle Profile 3M',
    material: 'آلومینیوم اکسترود شده آنودایز مات',
    parameters: {
      length: 600,
      width: 20,
      height: 38,
      finishColor: '#94a3b8'
    },
    macroTemplate: `' SolidWorks VBA Macro for Extruded G Profile
Sub main()
    ' Sweeps G-Section profile along length
End Sub`
  },
  {
    id: 'part-square-tube-40',
    namePersian: 'پروفیل قوطی فولادی صنعتی (Square Tube 40x40x2mm)',
    category: 'profile',
    subCategory: 'پروفیل‌های صنعتی',
    standardCode: 'DIN 2395 / EN 10219',
    material: 'ST37 Steel Structural Tubing',
    parameters: {
      length: 1000,
      width: 40,
      height: 40,
      diameter: 2, // wall thickness
      finishColor: '#475569'
    },
    macroTemplate: `' SolidWorks VBA Macro for Square Steel Tube 40x40x2
Sub main()
    ' Extrudes hollow 40x40 box with 2mm wall thickness
End Sub`
  }
];
