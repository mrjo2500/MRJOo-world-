import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Generate Endless Arabic Questions
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { excludeQuestions = [], category = 'all', count = 5, difficulty = 'medium' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        message: 'No GEMINI_API_KEY provided; client fallback active',
        questions: [],
      });
    }

    const categoryPrompt = category && category !== 'all' 
      ? `المجال المطلوب بالتحديد: "${category}".` 
      : `نوّع الأسئلة بين: (تاريخ، علوم وتكنولوجيا، جغرافيا، ثقافة عامة، سينما وفنون، رياضة، إسلاميات، ألغاز وذكاء).`;

    const difficultyPrompt = difficulty && difficulty !== 'all'
      ? `مستوى الصعوبة: ${difficulty}.`
      : `نوّع مستوى الصعوبة بين السهل والمتوسط والصعب.`;

    const excludeText = Array.isArray(excludeQuestions) && excludeQuestions.length > 0
      ? `هام جداً: تجنب تماماً هذه الأسئلة التي طُرحت سابقاً ولا تكرر أياً منها أو أي فكرة مشابهة لها إطلاقاً:\n${excludeQuestions.slice(-30).map((q: string, i: number) => `- ${q}`).join('\n')}`
      : '';

    const prompt = `أنت العقل المدبر ومبتكر الأسئلة الأسطوري للعبة المسابقات التفاعلية "MRJOOWORLD".
قم بتوليد ${Math.min(Math.max(count, 3), 8)} أسئلة مسابقات عربية ممتازة وممتعة ودقيقة مئة بالمئة وصحيحة علمياً وتاريخياً.

الشروط:
1. ${categoryPrompt}
2. ${difficultyPrompt}
3. كل سؤال له 4 خيارات حصرية ودقيقة، وخيار واحد فقط صحيح لا لبس فيه.
4. مؤشر الإجابة الصحيحة correctIndex هو رقم من 0 إلى 3 يحدد موقع الإجابة الصحيحة بدقة.
5. قدم شرحاً ممتعاً وموجزاً (explanation) لكل سؤال يثري ثقافة اللاعب.
6. قدم تلميحاً ذكياً ومساعداً (hint) لا يكشف الإجابة مباشرة بل يوجه التفكير.
7. لا تكرر الأسئلة إطلاقاً واجعل الأسئلة مشوقة وغير تقليدية وتناسب لعبة كبرى.
${excludeText}`;

    // Prefer high-throughput, low-latency gemini-3.1-flash-lite with fallback options
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: unknown = null;
    let questions: any[] = [];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: 'أنت خبير مسابقات موسوعي باللغة العربية الفصحى الأنيقة للعبة MRJOOWORLD. تولد أسئلة ثقافية ممتعة، خالية من الأخطاء، مع 4 خيارات واضحة وتفسير شيق.',
            temperature: 0.8,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'معرف فريد للسؤال' },
                  question: { type: Type.STRING, description: 'نص السؤال باللغة العربية' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'مصفوفة من 4 خيارات بالضبط',
                  },
                  correctIndex: { type: Type.INTEGER, description: 'فهرس الإجابة الصحيحة من 0 إلى 3' },
                  explanation: { type: Type.STRING, description: 'شرح موجز وممتع للإجابة' },
                  category: { type: Type.STRING, description: 'تصنيف السؤال' },
                  difficulty: { type: Type.STRING, description: 'مستوى الصعوبة: easy أو medium أو hard' },
                  hint: { type: Type.STRING, description: 'تلميح ذكي للاعب' },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'category', 'difficulty'],
              },
            },
          },
        });

        const jsonText = response.text || '[]';
        questions = JSON.parse(jsonText);
        if (Array.isArray(questions) && questions.length > 0) {
          break; // successfully received questions
        }
      } catch (err: unknown) {
        lastError = err;
        console.log(`[Gemini Info] Model ${modelName} encountered temporary limit, evaluating next model...`);
      }
    }

    // Validate structure
    const validQuestions = Array.isArray(questions)
      ? questions.filter((q: { question?: string; options?: string[]; correctIndex?: number }) => (
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctIndex === 'number' &&
          q.correctIndex >= 0 &&
          q.correctIndex <= 3
        ))
      : [];

    return res.json({
      success: validQuestions.length > 0,
      source: validQuestions.length > 0 ? 'gemini' : 'fallback',
      questions: validQuestions,
      message: validQuestions.length === 0 && lastError instanceof Error ? lastError.message : undefined,
    });
  } catch (err: unknown) {
    console.error('Error in questions endpoint handler:', err);
    return res.status(200).json({
      success: false,
      source: 'fallback_on_error',
      message: err instanceof Error ? err.message : 'Unknown error',
      questions: [],
    });
  }
});

// Start Server with Vite or Static Dist
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDev = process.env.NODE_ENV === 'development' || (!hasDist && process.env.NODE_ENV !== 'production');

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MR JOO WORLD Server running at http://0.0.0.0:${PORT} (Mode: ${isDev ? 'dev' : 'production'})`);
  });
}

startServer();
