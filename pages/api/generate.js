export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, jobTitle, experience, skills, education } = req.body;

  if (!name || !jobTitle || !experience || !skills) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' });
  }

  const prompt = `You are a professional resume and cover letter writer. Create TWO documents:

1. A polished, ATS-optimized resume
2. A compelling cover letter

For this candidate:
- Name: ${name}
- Target Job: ${jobTitle}
- Work Experience: ${experience}
- Skills: ${skills}
- Education: ${education || 'Not specified'}

Format your response EXACTLY like this:

=== RESUME ===
[Full resume here, properly formatted with sections: Summary, Experience, Skills, Education]

=== COVER LETTER ===
[Full cover letter here, addressed to Hiring Manager, 3-4 paragraphs]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Generation failed' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const [, resumePart, coverPart] = text.split(/=== RESUME ===|=== COVER LETTER ===/);

    return res.status(200).json({
      resume: resumePart?.trim() || '',
      coverLetter: coverPart?.trim() || '',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate documents' });
  }
}
