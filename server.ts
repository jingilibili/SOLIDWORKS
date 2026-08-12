import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "SolidWorks Master Assistant", time: new Date().toISOString() });
  });

  // SolidWorks AI Assistant Endpoint using Gemini API with intelligent Persian CAD fallback
  app.post("/api/solidworks/ask", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        // Intelligent Persian Fallback Response if Gemini Key is not provided
        return res.json({
          source: "offline_kb",
          text: `[پاسخ آفلاین دستیار سالیدورک]:
${generateOfflineCadAnswer(prompt)}`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `شما یک مهندس ارشد طراحی مکانیک و متخصص کارشناس سالیدورک (SolidWorks CAD/CAM) هستید.
وظیفه شما راهنمایی کاربر به زبان فارسی روان، دقیق، و تخصصی در تمام زمینه‌های سالیدورک است:
1. مدلسازی سه بعدی (Part Modeling, Sheet Metal, Weldments, Mold Design, Surface)
2. مونتاژ و قیود (Assembly & Mates, Smart Fasteners)
3. نقشه‌کشی (Drafting, BoM, GD&T)
4. طراحی کابینت و سازه‌های چوبی و MDF (Cabinetry, Woodwork, Cut Lists)
5. یراق‌آلات و اتصالات (Hinges, Sliders, Minifix, Cam Locks)
6. ماشین‌کاری و CNC (Lathe, Milling, SolidWorks CAM, Turning profiles)
7. ماکرونویسی و API سالیدورک (VBA Macros, Python win32com.client, Automation)

پاسخ‌های شما باید کاملاً کاربردی، گام‌به‌گام، شامل میانبرهای صفحه‌کلید سالیدورک و در صورت نیاز همراه با نمونه کد ماکرو VBA یا پایتون باشد.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nزمینه (Context): ${context || 'سوال عمومی سالیدورک'}\n\nسوال کاربر: ${prompt}` }] }
        ]
      });

      return res.json({
        source: "gemini",
        text: response.text || "پاسخی از مدل دریافت نشد."
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.json({
        source: "offline_kb",
        text: `[پاسخ آفلاین سالیدورک (به دلیل خطای ارتباط با سرور AI)]:
${generateOfflineCadAnswer(req.body.prompt || '')}`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SolidWorks Master Assistant Server running on http://localhost:${PORT}`);
  });
}

function generateOfflineCadAnswer(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("کابینت") || p.includes("چوب") || p.includes("mdf") || p.includes("برش")) {
    return `برای طراحی کابینت در سالیدورک:
1. ابتدا از محیط Part برای ایجاد بدنه اصلی (دیواره‌های چپ و راست، کف، سقف و فیبر پشت) استفاده کنید.
2. ضخامت استاندارد ورق‌های MDF در ایران 16 میلیمتر و برای فیبر پشت 3 میلیمتر است.
3. برای بادخور درب‌ها: از هر طرف 1.5 تا 2 میلیمتر بادخور (Clearance) منظور کنید (یعنی طول و عرض درب 3 تا 4 میلیمتر کمتر از دهانه یونیت).
4. برای سوراخ‌کاری لولا گازور: سوراخ لولا به قطر 35mm و فاصله مرکز سوراخ تا لبه درب معمولاً 22.5mm است.
5. می‌توانید با ابزار Weldments یا Sheet Metal به راحتی یونیت‌های کابینت را به صورت پارامتریک و با Cut List خودکار طراحی کنید.`;
  } else if (p.includes("تراش") || p.includes("cnc") || p.includes("شفت") || p.includes("رزوه")) {
    return `برای طراحی قطعات تراشکاری CNC در سالیدورک:
1. در محیط Sketch، نیم‌رخ (Half-Profile) شفت یا قطعه دورانی را روی صفحه Front Plane بکشید.
2. خط مرکز (Centerline) افقی به عنوان محور تقارن قرار دهید.
3. از دستور Revolved Boss/Base (360 درجه) برای ساخت بدنه اصلی استفاده کنید.
4. برای رزوه زنی: از ابزار Thread (در بخش Hole Wizard) استفاده کنید یا با Sweep Cut و مارپیچ Helix/Spiral گام رزوه را پیاده‌سازی کنید.
5. برای فاز یا چمفر (Chamfer): معمولاً فازهای 1×45° یا 1.5×45° در ورودی شفت‌ها برای جازدن راحت‌تر استفاده می‌شود.`;
  } else if (p.includes("لولا") || p.includes("ریل") || p.includes("یراق") || p.includes("مینی فیکس")) {
    return `راهنمای طراحی و جانمایی یراق‌آلات در سالیدورک:
1. لولا گازور: سوراخ کاسه لولا قطر 35mm و عمق 11.5mm روی درب. پایه لولا روی بدنه در فاصله 37mm از لبه جلویی یونیت پیچ می‌شود.
2. ریل ساچمه‌ای (Drawer Slider): فاصله بادخور ریل ساچمه‌ای بین بدنه یونیت و کشو کلاً 26mm است (13mm سمت راست + 13mm سمت چپ).
3. الگوبرداری از مینی‌فیکس (Minifix): سوراخ خرچنگی مینی‌فیکس به قطر 15mm و عمق 12.5mm در فاصله 24mm یا 34mm از لبه قرار می‌گیرد.`;
  } else if (p.includes("ماکرو") || p.includes("پایتون") || p.includes("کد") || p.includes("vba")) {
    return `دستورالعمل اجرای ماکرو در سالیدورک:
1. در سالیدورک به مسیر Tools > Macro > Run بروید.
2. فایل با پسوند .swp یا .bas تولید شده توسط این برنامه را انتخاب کرده و Run بزنید.
3. همچنین می‌توانید در پایتون با نصب کتابخانه pywin32 کد زیر را اجرا کنید تا سالیدورک به صورت خودکار کنترل شود:
   import win32com.client
   swApp = win32com.client.Dispatch("SldWorks.Application")
   swApp.Visible = True
   swModel = swApp.NewDocument("Part", 0, 0, 0)`;
  }
  return `برای کار حرفه‌ای با سالیدورک:
• کلید F: زوم کردن و جا دادن کل مدل در صفحه (Fit to Screen)
• کلید Ctrl + 8: عمود شدن بر صفحه اسکتچ انتخاب شده (Normal To)
• کلید S: باز شدن منوی میانبر سریع ابزارها روی صفحه
• کلید Ctrl + B: بازسازی مجدد مدل (Rebuild)
• برای تغییر ابعاد قطعات پارامتریک، از منوی Tools > Equations استفاده کنید تا تمام ابعاد به هم مرتبط و خودکار به‌روزرسانی شوند.`;
}

startServer();
