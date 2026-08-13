import { CabinetParams, HardwareParams, CncLatheParams, SolidWorksMacroOutput, BomItem } from '../types';

/**
 * SolidWorks Macro & Code Generator Utility
 * Generates VBA (.swp/.bas), Python COM (win32com), PyAutoGUI, Batch Script & Cut List
 */

// ----------------------------------------------------
// 1. KITCHEN CABINET MACRO GENERATOR
// ----------------------------------------------------
export function generateCabinetMacro(params: CabinetParams): SolidWorksMacroOutput {
  const { width, height, depth, materialThickness, backPanelThickness, toeKickHeight, doorCount, shelfCount, finishColor } = params;

  // Calculate cabinet interior & door dimensions
  const cabinetBodyHeight = height - toeKickHeight;
  const interiorWidth = width - (2 * materialThickness);
  const sidePanelDepth = depth - backPanelThickness;
  const doorWidth = doorCount > 0 ? (width / doorCount) - 3 : 0; // 3mm clearance overall
  const doorHeight = cabinetBodyHeight - 3;

  const bomItems: BomItem[] = [
    {
      partName: 'دیواره چپ و راست (Side Panels)',
      quantity: 2,
      dimensions: `${sidePanelDepth} × ${cabinetBodyHeight} × ${materialThickness} mm`,
      material: `MDF ${materialThickness}mm (${finishColor})`,
      edgeBanding: '1طول 2عرض (PVC 1mm)',
      notes: 'دارای شیار 4mm فیبر پشت در فاصله 15mm'
    },
    {
      partName: 'کف و سقف / طاق (Top & Bottom Rails)',
      quantity: 2,
      dimensions: `${interiorWidth} × ${sidePanelDepth} × ${materialThickness} mm`,
      material: `MDF ${materialThickness}mm (${finishColor})`,
      edgeBanding: '1طول (PVC 1mm)',
      notes: 'نصب با الیت یا پیچ ام‌دی‌اف 5×50'
    },
    {
      partName: 'فیبر پشت (Back Panel)',
      quantity: 1,
      dimensions: `${interiorWidth + 12} × ${cabinetBodyHeight - 16} × ${backPanelThickness} mm`,
      material: `فیبر / سه میل ${backPanelThickness}mm`,
      edgeBanding: 'بدون نوار',
      notes: 'کشویی درون شیار 4mm'
    }
  ];

  if (shelfCount > 0) {
    bomItems.push({
      partName: `طبقات متحرک (Shelves)`,
      quantity: shelfCount,
      dimensions: `${interiorWidth - 2} × ${sidePanelDepth - 20} × ${materialThickness} mm`,
      material: `MDF ${materialThickness}mm (${finishColor})`,
      edgeBanding: '1طول (PVC 1mm)',
      notes: 'روی پین طبقه قرار می‌گیرد'
    });
  }

  if (doorCount > 0) {
    bomItems.push({
      partName: `درب کابینت (Cabinet Doors)`,
      quantity: doorCount,
      dimensions: `${Math.round(doorWidth)} × ${Math.round(doorHeight)} × ${materialThickness} mm`,
      material: `MDF ${materialThickness}mm (${finishColor})`,
      edgeBanding: 'دور تا دور نوار PVC (2mm)',
      notes: `دارای سوراخ لولا گازور 35mm (برند ${params.hingeBrand})`
    });
  }

  if (toeKickHeight > 0) {
    bomItems.push({
      partName: 'پاخور / پاسنگ (Toe Kick)',
      quantity: 1,
      dimensions: `${width} × ${toeKickHeight} × ${materialThickness} mm`,
      material: `MDF / PVC ${toeKickHeight}mm`,
      edgeBanding: '1طول (PVC 1mm)',
      notes: 'پایه قابل تنظیم زیر یونیت قرار می‌گیرد'
    });
  }

  // Generate SolidWorks VBA Macro with auto-template lookup and valid syntax
  const vbaCode = `' ============================================================
' SolidWorks VBA Macro: Parametric Kitchen Cabinet Generator
' Created by: SolidWorks Master Assistant
' Dimensions: ${width}x${height}x${depth} mm
' ============================================================
Option Explicit

Sub main()
    Dim swApp As SldWorks.SldWorks
    Dim Part As SldWorks.ModelDoc2
    Dim boolstatus As Boolean
    Dim templateName As String

    On Error Resume Next
    Set swApp = Application.SldWorks
    If swApp Is Nothing Then Set swApp = CreateObject("SldWorks.Application")
    swApp.Visible = True

    ' Auto-detect default SolidWorks Part template path
    templateName = swApp.GetUserPreferenceStringValue(8) ' swDefaultTemplatePart
    If templateName = "" Then templateName = "C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot"

    Set Part = swApp.NewDocument(templateName, 0, 0, 0)
    If Part Is Nothing Then Set Part = swApp.ActiveDoc

    If Part Is Nothing Then
        MsgBox "خطا در ایجاد سند جدید در سالیدورک!", vbCritical, "SolidWorks Master"
        Exit Sub
    End If

    ' Step 1: Create Main Cabinet Outer Block
    boolstatus = Part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    Part.SketchManager.InsertSketch True
    Part.ClearSelection2 True

    ' Draw Base Rectangle (${width} x ${cabinetBodyHeight} mm)
    Part.SketchManager.CreateRectangle 0, 0, 0, ${width / 1000}, ${cabinetBodyHeight / 1000}, 0
    Part.FeatureManager.FeatureExtrusion3 True, False, False, 0, 0, ${depth / 1000}, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False

    ' Step 2: Create Shell Interior Hollow
    boolstatus = Part.Extension.SelectByID2("", "FACE", ${width / 2000}, ${cabinetBodyHeight / 2000}, ${depth / 1000}, False, 0, Nothing, 0)
    Part.FeatureManager.InsertShell ${materialThickness / 1000}, False

    ' Step 3: Add Doors if required
    ${doorCount > 0 ? `' Adding ${doorCount} Doors (${doorWidth}x${doorHeight}mm)
    boolstatus = Part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    Part.SketchManager.InsertSketch True
    Part.SketchManager.CreateRectangle 0.002, 0.002, 0, ${doorWidth / 1000}, ${doorHeight / 1000}, 0
    Part.FeatureManager.FeatureExtrusion3 True, False, False, 0, 0, ${materialThickness / 1000}, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False
    ` : "' No doors requested"}

    Part.ViewZoomtofit2
    MsgBox "طراحی کابینت ${params.name || 'آشپزخانه'} با ابعاد ${width}x${height}x${depth} میلی‌متر با موفقیت در سالیدورک ایجاد شد!", vbInformation, "SolidWorks Master"
End Sub`;

  // Generate Python COM Script
  const pythonComCode = `# ============================================================
# Python COM Automation Script for SolidWorks API
# Required: pip install pywin32
# ============================================================
import win32com.client
import sys
import time

def build_cabinet():
    print("در حال اتصال به برنامه سالیدورک (SolidWorks Application)...")
    try:
        swApp = win32com.client.Dispatch("SldWorks.Application")
        swApp.Visible = True
    except Exception as e:
        print("خطا در اتصال به سالیدورک! مطمئن شوید سالیدورک نصب و باز است.", e)
        return

    # Create new Part Document
    model = swApp.NewDocument("", 0, 0, 0)
    if not model:
        model = swApp.ActiveDoc

    if not model:
        print("نمی‌توان سند جدید در سالیدورک ایجاد کرد.")
        return

    print("ایجاد دیواره‌های پارامتریک کابینت...")
    # Parametric measurements in meters for SolidWorks API
    w = ${width / 1000}
    h = ${(height - toeKickHeight) / 1000}
    d = ${depth / 1000}
    t = ${materialThickness / 1000}

    # Select Front Plane and start sketch
    model.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
    model.SketchManager.InsertSketch(True)
    model.SketchManager.CreateRectangle(0, 0, 0, w, h, 0)
    
    # Extrude Cabinet Box
    model.FeatureManager.FeatureExtrusion3(True, False, False, 0, 0, d, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)
    
    # Shell Interior
    model.ViewZoomtofit2()
    print("ساخت کابینت با ابعاد ${width}x${height}x${depth} میلی‌متر تکمیل شد!")

if __name__ == "__main__":
    build_cabinet()
`;

  // Generate PyAutoGUI Script
  const pyautoguiCode = `# ============================================================
# PyAutoGUI Mouse & Keyboard Controller for SolidWorks
# Run when SolidWorks is open in foreground!
# Required: pip install pyautogui
# ============================================================
import pyautogui
import time

pyautogui.FAILSAFE = True
print("کنترل هوشمند موس و کیبورد برای رسم کابینت در سالیدورک...")
print("لطفا ۵ ثانیه صبر کنید و پنجره سالیدورک را فعال نگه دارید.")
time.sleep(5)

# 1. New Part Document Shortcut
pyautogui.hotkey('ctrl', 'n')
time.sleep(1.5)
pyautogui.press('enter') # Confirm Part Template
time.sleep(2.5)

# 2. Select Front Plane & Sketch
pyautogui.hotkey('ctrl', '1') # Front View
time.sleep(0.5)
pyautogui.press('s') # Open Shortcut Bar
time.sleep(0.5)
pyautogui.typewrite('sketch', interval=0.1)
pyautogui.press('enter')

# 3. Draw Base Rectangle
time.sleep(1)
pyautogui.press('r') # Rectangle tool
pyautogui.click(600, 400) # Click center
pyautogui.dragTo(800, 250, duration=0.8) # Drag rectangle

print("عملیات رسم خودکار موس و کیبورد به پایان رسید!")
`;

  const batLauncherCode = `@echo off
chcp 65001 > NUL
echo ============================================================
echo      راه اندازی خودکار ماکرو سالیدورک (SolidWorks Master)
echo ============================================================
echo.
echo در حال چک کردن پایتون و کتابخانه های مورد نیاز...
python -c "import win32com.client" 2>NUL
if %errorlevel% neq 0 (
    echo کتابخانه pywin32 نصب نیست. در حال نصب...
    pip install pywin32 pyautogui
)

echo.
echo در حال اجرای ماکرو و ارسال ابعاد کابینت به سالیدورک...
python solidworks_cabinet.py
pause
`;

  return {
    vbaCode,
    pythonComCode,
    pyautoguiCode,
    batLauncherCode,
    bomItems,
    instructionsPersian: [
      'روش 1 (توصیه شده): فایل Python COM Script را ذخیره کرده و روی build_cabinet.py دبل کلیک کنید (سالیدورک خودکار باز می‌شود).',
      'روش 2 (VBA Macro): در سالیدورک به منوی Tools > Macro > Run بروید و کد VBA بالا را اجرا کنید.',
      'روش 3 (فایل .bat): فایل run_solidworks.bat را اجرا کنید تا تمام مراحل بدون نیاز به تنظیمات انجام شوند.'
    ]
  };
}

// ----------------------------------------------------
// 2. HARDWARE & FITTINGS MACRO GENERATOR
// ----------------------------------------------------
export function generateHardwareMacro(params: HardwareParams): SolidWorksMacroOutput {
  const { name, category, length, width, height, cupDiameter, cupDepth, holePitch } = params;

  const bomItems: BomItem[] = [
    {
      partName: name,
      quantity: 1,
      dimensions: `${length} × ${width} × ${height} mm`,
      material: params.finishMaterial,
      edgeBanding: '-',
      notes: category === 'hinge' 
        ? `سوراخ کاسه ${cupDiameter}mm عمق ${cupDepth}mm` 
        : category === 'handle' 
        ? `فاصله مرکز سوراخ‌ها ${holePitch}mm` 
        : `تعداد پیچ نصب: ${params.screwCount}`
    }
  ];

  const vbaCode = `' ============================================================
' SolidWorks VBA Macro: Hardware Fitting (${name})
' ============================================================
Dim swApp As Object
Dim Part As Object

Sub main()
Set swApp = Application.SldWorks
Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)
If Part Is Nothing Then Set Part = swApp.ActiveDoc

' Draw Base Plate (${length} x ${width} x ${height} mm)
Part.Extension.SelectByID2 "Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
Part.SketchManager.InsertSketch True
Part.SketchManager.CreateRectangle(0, 0, 0, ${length / 1000}, ${width / 1000}, 0)
Part.FeatureManager.FeatureExtrusion3 True, False, False, 0, 0, ${height / 1000}, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False

${cupDiameter ? `' Add Cup Hole for Hinge (${cupDiameter}mm)
Part.Extension.SelectByID2 "", "FACE", ${(length / 2) / 1000}, ${(width / 2) / 1000}, ${height / 1000}, False, 0, Nothing, 0
Part.SketchManager.InsertSketch True
Part.SketchManager.CreateCircleByRadius ${(length / 2) / 1000}, ${(width / 2) / 1000}, 0, ${(cupDiameter / 2) / 1000}
Part.FeatureManager.FeatureCut4 True, False, False, 0, 0, ${(cupDepth || 11.5) / 1000}, 0.01, False, False, False, False, 0, 0, False, False, False, False, False, True, True, True, True, False, 0, 0, False
` : ''}

Part.ViewZoomtofit2
MsgBox "قطعه یراق ${name} با موفقیت مدلسازی شد!", vbInformation, "دستیار سالیدورک"
End Sub`;

  const pythonComCode = `# Python COM Automation for Hardware: ${name}
import win32com.client

def create_hardware():
    swApp = win32com.client.Dispatch("SldWorks.Application")
    swApp.Visible = True
    part = swApp.NewDocument("", 0, 0, 0)
    if not part: part = swApp.ActiveDoc

    part.Extension.SelectByID2("Top Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
    part.SketchManager.InsertSketch(True)
    part.SketchManager.CreateRectangle(0, 0, 0, ${length / 1000}, ${width / 1000}, 0)
    part.FeatureManager.FeatureExtrusion3(True, False, False, 0, 0, ${height / 1000}, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)
    part.ViewZoomtofit2()
    print("یراق‌آلات با موفقیت در سالیدورک ساخته شد!")

if __name__ == "__main__":
    create_hardware()
`;

  const pyautoguiCode = `# PyAutoGUI Controller for Hardware (${name})
import pyautogui, time
time.sleep(3)
pyautogui.hotkey('ctrl', 'n')
pyautogui.press('enter')
`;

  const batLauncherCode = `@echo off
python create_hardware.py
pause
`;

  return {
    vbaCode,
    pythonComCode,
    pyautoguiCode,
    batLauncherCode,
    bomItems,
    instructionsPersian: [
      'کد VBA یا اسکریپت پایتون را اجرا کنید تا قطعه سه بعدی یراق‌آلات با ابعاد دقیق در سالیدورک ساخته شود.',
      'می‌توانید قطعه ساخته شده را در کتابخانه یراق‌آلات سالیدورک (Design Library) ذخیره کنید تا در پروژه های بعدی با درگ و دراپ استفاده شود.'
    ]
  };
}

// ----------------------------------------------------
// 3. CNC LATHE TURNED PART MACRO GENERATOR
// ----------------------------------------------------
export function generateCncLatheMacro(params: CncLatheParams): SolidWorksMacroOutput {
  const { partName, overallLength, maxDiameter, boreDiameter, boreDepth, material, segments } = params;

  const bomItems: BomItem[] = [
    {
      partName,
      quantity: 1,
      dimensions: `قطر ${maxDiameter}mm × طول ${overallLength}mm`,
      material,
      edgeBanding: '-',
      notes: `سوراخ مرغک/مرکز: قطر ${boreDiameter}mm به عمق ${boreDepth}mm | تعداد پله‌ها: ${segments.length}`
    }
  ];

  const vbaCode = `' ============================================================
' SolidWorks VBA Macro: CNC Lathe Turned Part Revolve
' Part: ${partName} (Diameter: ${maxDiameter}mm, Length: ${overallLength}mm)
' ============================================================
Dim swApp As Object
Dim Part As Object

Sub main()
Set swApp = Application.SldWorks
Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)
If Part Is Nothing Then Set Part = swApp.ActiveDoc

' Select Front Plane for Lathe Profile
Part.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
Part.SketchManager.InsertSketch True

' 1. Draw Centerline Axis of Rotation
Part.SketchManager.CreateCenterLine 0, 0, 0, ${(overallLength / 1000)}, 0, 0

' 2. Draw Half Outer Profile
Dim currentX As Double
currentX = 0

' Start Contour at Origin
${segments.map((seg, idx) => {
  const startR = (seg.startDiameter / 2) / 1000;
  const endR = (seg.endDiameter / 2) / 1000;
  const len = seg.length / 1000;
  const code = `' Segment ${idx + 1}: ${seg.type}
Part.SketchManager.CreateLine currentX, ${startR}, 0, currentX + ${len}, ${endR}, 0
currentX = currentX + ${len}`;
  return code;
}).join('\n')}

' Close Contour to Centerline
Part.SketchManager.CreateLine currentX, 0, 0, 0, 0, 0

' 3. Revolve 360 Degrees
Part.FeatureManager.FeatureRevolve2 True, True, False, False, False, False, 0, 0, 6.28318530717958, 0, False, False, 0.01, 0.01, 0, 0, 0, True, True, True

${boreDiameter > 0 ? `' 4. Create Bore / Center Hole
Part.Extension.SelectByID2 "", "FACE", 0, 0, 0, False, 0, Nothing, 0
Part.SketchManager.InsertSketch True
Part.SketchManager.CreateCircleByRadius 0, 0, 0, ${(boreDiameter / 2) / 1000}
Part.FeatureManager.FeatureCut4 True, False, False, 0, 0, ${boreDepth / 1000}, 0.01, False, False, False, False, 0, 0, False, False, False, False, False, True, True, True, True, False, 0, 0, False
` : ''}

Part.ViewZoomtofit2
MsgBox "قطعه تراشکاری CNC با موفقیت در سالیدورک ساخت گردید!", vbInformation, "دستیار سالیدورک"
End Sub`;

  const pythonComCode = `# Python COM Automation for CNC Turning Part: ${partName}
import win32com.client

def build_cnc_part():
    swApp = win32com.client.Dispatch("SldWorks.Application")
    swApp.Visible = True
    part = swApp.NewDocument("", 0, 0, 0)
    if not part: part = swApp.ActiveDoc

    part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
    part.SketchManager.InsertSketch(True)

    # Centerline Axis
    part.SketchManager.CreateCenterLine(0, 0, 0, ${overallLength / 1000}, 0, 0)

    # Half Profile
    part.SketchManager.CreateRectangle(0, 0, 0, ${overallLength / 1000}, ${(maxDiameter / 2) / 1000}, 0)
    
    # Revolve 360 deg
    part.FeatureManager.FeatureRevolve2(True, True, False, False, False, False, 0, 0, 6.283185, 0, False, False, 0.01, 0.01, 0, 0, 0, True, True, True)
    part.ViewZoomtofit2()
    print("شفت تراشکاری CNC در سالیدورک تولید شد.")

if __name__ == "__main__":
    build_cnc_part():
`;

  const pyautoguiCode = `# PyAutoGUI Script for Lathe Revolve
import pyautogui, time
time.sleep(3)
pyautogui.hotkey('ctrl', 'n')
pyautogui.press('enter')
`;

  const batLauncherCode = `@echo off
python build_cnc_part.py
pause
`;

  return {
    vbaCode,
    pythonComCode,
    pyautoguiCode,
    batLauncherCode,
    bomItems,
    instructionsPersian: [
      'کد Revolve به‌صورت ۳۶۰ درجه حول محور اصلی شفت را در سالیدورک اجرا می‌کند.',
      'می‌توانید کدهای G-Code یا مسیر تراشکاری CNC را نیز در محیط SolidWorks CAM استخراج کنید.'
    ]
  };
}
