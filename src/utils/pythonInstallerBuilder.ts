/**
 * Desktop Exe & Python Installer Package Builder
 * Generates ready-to-run Python Tkinter GUI script & PyInstaller build scripts.
 */

export function generatePythonDesktopAppScript(): string {
  return `# ============================================================
# SolidWorks Master Assistant - Native Windows Desktop Application
# Language: Python 3 (Tkinter GUI / win32com COM Automation)
# Complete offline SolidWorks Controller & Parametric CAD Generator
# ============================================================

import sys
import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import win32com.client

class SolidWorksMasterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("دستیار هوشمند سالیدورک (SolidWorks CAD Master Desktop)")
        self.root.geometry("900x700")
        self.root.configure(bg="#1e293b")

        # Configure Persian / RTL styling
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TLabel', background='#1e293b', foreground='#f8fafc', font=('Tahoma', 10))
        style.configure('TButton', font=('Tahoma', 10, 'bold'), background='#0284c7', foreground='#ffffff')
        style.map('TButton', background=[('active', '#0369a1')])

        self.sw_app = None

        self.create_widgets()

    def create_widgets(self):
        # Header Frame
        header = tk.Frame(self.root, bg="#0f172a", py=15)
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
            text="طراحی کابینت، یراق‌آلات و تراشکاری CNC با اتصال مستقیم به SolidWorks COM API",
            font=("Tahoma", 10),
            bg="#0f172a",
            fg="#94a3b8"
        )
        subtitle_label.pack()

        # SW Link Status Bar
        status_frame = tk.Frame(self.root, bg="#334155", py=8, px=10)
        status_frame.pack(fill=tk.X, pady=10)

        self.status_label = tk.Label(
            status_frame,
            text="وضعیت اتصال: آماده اتصال به سالیدورک",
            font=("Tahoma", 10, "bold"),
            bg="#334155",
            fg="#facc15"
        )
        self.status_label.pack(side=tk.LEFT)

        btn_connect = tk.Button(
            status_frame,
            text="🔗 اتصال به SolidWorks",
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
        tab_cab = tk.Frame(notebook, bg="#1e293b", p=10)
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
        tab_cnc = tk.Frame(notebook, bg="#1e293b", p=10)
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
        try:
            self.sw_app = win32com.client.Dispatch("SldWorks.Application")
            self.sw_app.Visible = True
            self.status_label.config(text="وضعیت اتصال: متصل به SolidWorks ✅", fg="#4ade80")
            messagebox.showinfo("اتصال موفق", "نرم‌افزار سالیدورک با موفقیت به برنامه متصل شد!")
        except Exception as e:
            self.status_label.config(text="وضعیت اتصال: خطا در اتصال ❌", fg="#f87171")
            messagebox.showerror("خطا", f"امکان اتصال به سالیدورک وجود ندارد:\\n{e}")

    def build_cabinet_in_sw(self):
        if not self.sw_app:
            self.connect_solidworks()
        if not self.sw_app:
            return

        w = float(self.ent_w.get()) / 1000.0
        h = float(self.ent_h.get()) / 1000.0
        d = float(self.ent_d.get()) / 1000.0

        try:
            part = self.sw_app.NewDocument("", 0, 0, 0)
            if not part:
                part = self.sw_app.ActiveDoc

            part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
            part.SketchManager.InsertSketch(True)
            part.SketchManager.CreateRectangle(0, 0, 0, w, h, 0)
            part.FeatureManager.FeatureExtrusion3(True, False, False, 0, 0, d, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)
            part.ViewZoomtofit2()
            messagebox.showinfo("تکمیل", "کابینت با موفقیت در سالیدورک رسم شد!")
        except Exception as e:
            messagebox.showerror("خطا", f"خطا در ساخت مدل: {e}")

    def build_cnc_in_sw(self):
        if not self.sw_app:
            self.connect_solidworks()
        if not self.sw_app:
            return

        l = float(self.ent_cnc_l.get()) / 1000.0
        d = (float(self.ent_cnc_d.get()) / 2.0) / 1000.0

        try:
            part = self.sw_app.NewDocument("", 0, 0, 0)
            if not part:
                part = self.sw_app.ActiveDoc

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
title ساخت فایل نصبی دسکتاپ SolidWorks Master (PyInstaller)
echo ============================================================
echo   تولید فایل اجرایی دسکتاپ (.EXE) برای دستیار سالیدورک
echo ============================================================
echo.

echo 1. نصب کتابخانه های مورد نیاز...
pip install pyinstaller pywin32 pyautogui

echo.
echo 2. ساخت فایل exe مستقل...
pyinstaller --noconfirm --onedir --windowed --name "SolidWorks_Master" --icon=NONE SolidWorks_Master_App.pyw

echo.
echo ============================================================
echo فایل EXE با موفقیت در پوشه dist\\SolidWorks_Master ایجاد شد!
echo می توانید برنامه را مستقیماً اجرا کرده یا به کاربرا بدهید.
echo ============================================================
pause
`;
}
