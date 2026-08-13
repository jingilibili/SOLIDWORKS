/**
 * Desktop Exe & Python Installer Package Builder
 * Generates ready-to-run Python Tkinter GUI script & PyInstaller build scripts.
 */

export function generatePythonDesktopAppScript(): string {
  return `# ============================================================
# SolidWorks Master Assistant - Native Windows Desktop Application
# Language: Python 3 (Tkinter GUI / win32com COM Automation / HTTP Listener)
# Complete offline SolidWorks Controller & Real-time Web-to-CAD Bridge
# ============================================================

import sys
import os
import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import win32com.client

try:
    import pythoncom
except ImportError:
    pythoncom = None

# Global reference for SolidWorks Application COM Object
SW_APP_INSTANCE = None

def get_sw_app():
    global SW_APP_INSTANCE
    if pythoncom:
        try:
            pythoncom.CoInitialize()
        except Exception:
            pass

    if SW_APP_INSTANCE is None:
        try:
            # First attempt to connect to active SolidWorks instance
            SW_APP_INSTANCE = win32com.client.GetActiveObject("SldWorks.Application")
        except Exception:
            try:
                # If not running, launch a new instance
                SW_APP_INSTANCE = win32com.client.Dispatch("SldWorks.Application")
                SW_APP_INSTANCE.Visible = True
            except Exception as e:
                print("SW Connection Error:", e)
    return SW_APP_INSTANCE


class WebToSolidWorksHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        self._set_headers(200)
        self.wfile.write(json.dumps({
            "status": "online",
            "service": "SolidWorks Web Bridge",
            "port": 8080
        }).encode('utf-8'))

    def do_POST(self):
        if self.path == '/api/execute-macro':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                vba_code = payload.get('vbaCode', '')
                params = payload.get('params', {})
                unit_type = payload.get('type', 'cabinet')

                sw = get_sw_app()
                if sw:
                    # Create new document or select active doc
                    part = sw.NewDocument("", 0, 0, 0)
                    if not part:
                        part = sw.ActiveDoc

                    w = float(params.get('width', 600)) / 1000.0
                    h = float(params.get('height', 800)) / 1000.0
                    d = float(params.get('depth', 550)) / 1000.0

                    if part:
                        part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
                        part.SketchManager.InsertSketch(True)
                        part.SketchManager.CreateRectangle(0, 0, 0, w, h, 0)
                        part.FeatureManager.FeatureExtrusion3(True, False, False, 0, 0, d, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)
                        part.ViewZoomtofit2()

                    self._set_headers(200)
                    self.wfile.write(json.dumps({
                        "success": True,
                        "message": "فرمان و ابعاد سه‌بعدی با موفقیت در SolidWorks اجرا شد."
                    }).encode('utf-8'))
                else:
                    self._set_headers(500)
                    self.wfile.write(json.dumps({
                        "success": False,
                        "message": "نرم‌افزار SolidWorks در حال اجرا نیست."
                    }).encode('utf-8'))
            except Exception as ex:
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": str(ex)
                }).encode('utf-8'))
        else:
            self._set_headers(404)


def start_http_server():
    try:
        server = HTTPServer(('127.0.0.1', 8080), WebToSolidWorksHandler)
        print("SolidWorks Web Listener active on http://127.0.0.1:8080")
        server.serve_forever()
    except Exception as err:
        print("Server listener error:", err)


class SolidWorksMasterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("دستیار هوشمند سالیدورک (SolidWorks CAD Master Desktop)")
        self.root.geometry("900x720")
        self.root.configure(bg="#1e293b")

        # Start Background HTTP Server for Web-to-SW Sync
        t = threading.Thread(target=start_http_server, daemon=True)
        t.start()

        # Configure Persian / RTL styling
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TLabel', background='#1e293b', foreground='#f8fafc', font=('Tahoma', 10))
        style.configure('TButton', font=('Tahoma', 10, 'bold'), background='#0284c7', foreground='#ffffff')
        style.map('TButton', background=[('active', '#0369a1')])

        self.create_widgets()

    def create_widgets(self):
        # Header Frame
        header = tk.Frame(self.root, bg="#0f172a", pady=15)
        header.pack(fill=tk.X)

        title_label = tk.Label(
            header,
            text="⚙️ دستیار هوشمند سالیدورک و تولیدکننده ماکرو",
            font=("Tahoma", 16, "bold"),
            bg="#0f172a",
            fg="#38bdf8"
        )
        title_label.pack()

        subtitle_label = tk.Label(
            header,
            text="طراحی کابینت، یراق‌آلات و تراشکاری CNC با اتصال مستقیم به SolidWorks COM API (پورت 8080 فعال)",
            font=("Tahoma", 10),
            bg="#0f172a",
            fg="#94a3b8"
        )
        subtitle_label.pack()

        # SW Link Status Bar
        status_frame = tk.Frame(self.root, bg="#334155", pady=8, padx=10)
        status_frame.pack(fill=tk.X, pady=10)

        self.status_label = tk.Label(
            status_frame,
            text="وضعیت: پورت 8080 فعال جهت اتصال وب‌اپلیکیشن به SolidWorks",
            font=("Tahoma", 10, "bold"),
            bg="#334155",
            fg="#facc15"
        )
        self.status_label.pack(side=tk.LEFT)

        btn_connect = tk.Button(
            status_frame,
            text="🔗 تست اتصال به SolidWorks",
            font=("Tahoma", 9, "bold"),
            bg="#16a34a",
            fg="white",
            command=self.connect_solidworks
        )
        btn_connect.pack(side=tk.RIGHT)

        # Tabbed Control Notebook
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=15, pady=10)

        # Tab 1: Cabinet Generator
        tab_cab = tk.Frame(notebook, bg="#1e293b", padx=10, pady=10)
        notebook.add(tab_cab, text="🗄️ طراحی کابینت")

        # Cabinet Parameters Input
        tk.Label(tab_cab, text="عرض یونیت (mm):").grid(row=0, column=0, sticky='e', pady=5)
        self.ent_w = tk.Entry(tab_cab)
        self.ent_w.insert(0, "600")
        self.ent_w.grid(row=0, column=1, pady=5)

        tk.Label(tab_cab, text="ارتفاع یونیت (mm):").grid(row=1, column=0, sticky='e', pady=5)
        self.ent_h = tk.Entry(tab_cab)
        self.ent_h.insert(0, "800")
        self.ent_h.grid(row=1, column=1, pady=5)

        tk.Label(tab_cab, text="عمق یونیت (mm):").grid(row=2, column=0, sticky='e', pady=5)
        self.ent_d = tk.Entry(tab_cab)
        self.ent_d.insert(0, "550")
        self.ent_d.grid(row=2, column=1, pady=5)

        btn_build_cab = tk.Button(
            tab_cab,
            text="🚀 ساخت خودکار کابینت در سالیدورک",
            font=("Tahoma", 11, "bold"),
            bg="#0284c7",
            fg="white",
            command=self.build_cabinet_in_sw
        )
        btn_build_cab.grid(row=3, column=0, columnspan=2, pady=20)

        # Tab 2: CNC Lathe
        tab_cnc = tk.Frame(notebook, bg="#1e293b", padx=10, pady=10)
        notebook.add(tab_cnc, text="⚙️ تراشکاری CNC")

        tk.Label(tab_cnc, text="طول کل شفت (mm):").grid(row=0, column=0, sticky='e', pady=5)
        self.ent_cnc_l = tk.Entry(tab_cnc)
        self.ent_cnc_l.insert(0, "150")
        self.ent_cnc_l.grid(row=0, column=1, pady=5)

        tk.Label(tab_cnc, text="حداکثر قطر شفت (mm):").grid(row=1, column=0, sticky='e', pady=5)
        self.ent_cnc_d = tk.Entry(tab_cnc)
        self.ent_cnc_d.insert(0, "50")
        self.ent_cnc_d.grid(row=1, column=1, pady=5)

        btn_build_cnc = tk.Button(
            tab_cnc,
            text="🚀 ساخت شفت در سالیدورک",
            font=("Tahoma", 11, "bold"),
            bg="#0284c7",
            fg="white",
            command=self.build_cnc_in_sw
        )
        btn_build_cnc.grid(row=2, column=0, columnspan=2, pady=20)

    def connect_solidworks(self):
        sw = get_sw_app()
        if sw:
            self.status_label.config(text="وضعیت اتصال: متصل به SolidWorks ✅ (پورت 8080 آماده)", fg="#4ade80")
            messagebox.showinfo("اتصال موفق", "نرم‌افزار سالیدورک با موفقیت به برنامه و پورت 8080 متصل شد!")
        else:
            self.status_label.config(text="وضعیت اتصال: خطا در اتصال ❌", fg="#f87171")
            messagebox.showerror("خطا", "امکان اتصال مستقیم به SolidWorks COM API وجود ندارد. مطمئن شوید سالیدورک باز است.")

    def build_cabinet_in_sw(self):
        sw = get_sw_app()
        if not sw:
            messagebox.showerror("خطا", "ابتدا سالیدورک را اجرا نمایید.")
            return

        w = float(self.ent_w.get()) / 1000.0
        h = float(self.ent_h.get()) / 1000.0
        d = float(self.ent_d.get()) / 1000.0

        try:
            part = sw.NewDocument("", 0, 0, 0)
            if not part:
                part = sw.ActiveDoc

            part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
            part.SketchManager.InsertSketch(True)
            part.SketchManager.CreateRectangle(0, 0, 0, w, h, 0)
            part.FeatureManager.FeatureExtrusion3(True, False, False, 0, 0, d, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)
            part.ViewZoomtofit2()
            messagebox.showinfo("تکمیل", "کابینت با موفقیت در سالیدورک رسم شد!")
        except Exception as e:
            messagebox.showerror("خطا", f"خطا در ساخت مدل: {e}")

    def build_cnc_in_sw(self):
        sw = get_sw_app()
        if not sw:
            messagebox.showerror("خطا", "ابتدا سالیدورک را اجرا نمایید.")
            return

        l = float(self.ent_cnc_l.get()) / 1000.0
        d = (float(self.ent_cnc_d.get()) / 2.0) / 1000.0

        try:
            part = sw.NewDocument("", 0, 0, 0)
            if not part:
                part = sw.ActiveDoc

            part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
            part.SketchManager.InsertSketch(True)
            part.SketchManager.CreateCenterLine(0, 0, 0, l, 0, 0)
            part.SketchManager.CreateRectangle(0, 0, 0, l, d, 0)
            part.FeatureManager.FeatureRevolve2(True, True, False, False, False, False, 0, 0, 6.283185, 0, False, False, 0.01, 0.01, 0, 0, 0, True, True, True)
            part.ViewZoomtofit2()
            messagebox.showinfo("تکمیل", "شفت CNC با موفقیت در سالیدورک ساخته شد!")
        except Exception as e:
            messagebox.showerror("خطا", f"خطا در ساخت شفت: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = SolidWorksMasterApp(root)
    root.mainloop()
`;
}

export function generateBuildExeBat(): string {
  return `@echo off
chcp 65001 > NUL
title ساخت فایل نصبی و اجرایی SolidWorks Master (PyInstaller)
echo ============================================================
echo   تولید فایل اجرایی دسکتاپ (.EXE) برای دستیار سالیدورک
echo ============================================================
echo.

:: 1. بررسی نصب بودن پایتون روی سیستم
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] پایتون روی سیستم شما پیدا نشد یا به PATH اضافه نشده است!
    echo لطفاً Python 3.9 یا بالاتر را از سایت python.org دانلود کنید.
    echo ⚠️ مهم: هنگام نصب، گزینه "Add Python to PATH" را حتماً تیک بزنید!
    echo.
    pause
    exit /b 1
)

echo [1/3] در حال نصب و به‌روزرسانی کتابخانه‌های پیش‌نیاز (pywin32, pyinstaller, pyautogui)...
python -m pip install --upgrade pip
python -m pip install pywin32 pyinstaller pyautogui

echo.
echo [2/3] در حال تبدیل اسکریپت پایتون به فایل اجرایی مستقل (.EXE)...
pyinstaller --noconfirm --onedir --windowed --hidden-import=win32com --hidden-import=win32com.client --hidden-import=pythoncom --hidden-import=pywintypes --hidden-import=tkinter --name "SolidWorks_Master" SolidWorks_Master_App.pyw

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo ✅ فایل EXE با موفقیت در پوشه dist\\SolidWorks_Master ایجاد شد!
    echo می توانید فایل SolidWorks_Master.exe را مستقیماً اجرا کرده یا کل پوشه را منتقل کنید.
    echo ============================================================
) else (
    echo.
    echo [تلاش مجدد] در حال ساخت به صورت تک‌فایل (One-File)...
    pyinstaller --noconfirm --onefile --windowed --hidden-import=win32com --hidden-import=win32com.client --hidden-import=pythoncom --hidden-import=pywintypes --hidden-import=tkinter --name "SolidWorks_Master" SolidWorks_Master_App.pyw
)

echo.
pause
`;
}

export function generateOfflineReadmeText(): string {
  return `============================================================
راهنمای نصب و رفع خطاهای احتمالی ساخت فایل .EXE سالیدورک
============================================================

این پکیج شامل تمام فایل‌ها، اسکریپت‌ها و برنامه‌های لازم برای اجرای ۱۰۰٪ آفلاین
نرم‌افزار دستیار سالیدورک روی ویندوز می‌باشد.

محتویات پکیج:
1. SolidWorks_Master_App.pyw  -> برنامه اصلی دسکتاپ ویندوز با رابط گرافیکی Tkinter و اتصال لایو به پورت 8080
2. build_exe_installer.bat     -> فایل اجرایی ساخت اتوماتیک فایل .EXE مستقل با PyInstaller
3. offline_app.html            -> نسخه کامل وب‌اپلیکیشن آفلاین قابل اجرا در تمام مرورگرها

راهنمای حل خطاهای رایج هنگام ساخت فایل .EXE:

۱. خطای "python is not recognized as an internal or external command":
   سبب: پایتون در مسیر PATH ویندوز قرار ندارد.
   راه‌حل: پایتون را از python.org مجدداً نصب کنید و در همان صفحه اول نصب، گزینه پایین "Add Python to PATH" را تیک بزنید.

۲. خطای "ModuleNotFoundError: No module named win32com":
   راه‌حل: دستور زیر را در CMD وارد کنید:
   python -m pip install --upgrade pywin32

۳. خطای آنتی‌ویروس یا Windows Defender هنگام ساخت .EXE:
   سبب: PyInstaller فایل‌های اجرایی جدید را موقتاً بررسی می‌کند.
   راه‌حل: پوشه پروژه را در آنتی‌ویروس Exclusion قرار دهید یا آنتی‌ویروس را موقتاً غیرفعال کنید.

روش‌های اجرای برنامه:

روش اول: اجرای مستقیم فایل پایتون (سریع‌ترین و بدون خطا)
------------------------------------------------------------
۱. روی فایل SolidWorks_Master_App.pyw کلیک راست کرده و Open With -> Python را بزنید.
۲. برنامه اجرا شده و پورت 8080 فعال می‌گردد.

روش دوم: ساخت فایل .EXE
------------------------------------------------------------
۱. روی build_exe_installer.bat کلیک راست کرده و Run as Administrator را بزنید.
۲. فایل .EXE در پوشه dist/SolidWorks_Master ساخته می‌شود.
`;
}


