import { useState } from 'react';
import '../styles/globals.css';

const INITIAL_FORM = {
  name: '',
  jobTitle: '',
  experience: '',
  skills: '',
  education: '',
};

export default function Home() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState({ resume: false, cover: false });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 2000);
  };

  return (
    <div className="container">
      <header>
        <h1>Get<span>Drafted</span></h1>
        <p>AI-powered resume &amp; cover letter — ready in seconds</p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ahmed Al-Shenawi"
                required
              />
            </div>

            <div className="field">
              <label>Target Job Title</label>
              <input
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="Senior Software Engineer"
                required
              />
            </div>

            <div className="field full">
              <label>Work Experience</label>
              <textarea
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows={5}
                placeholder="List your jobs, roles, and key achievements. E.g.:&#10;IT Specialist at Mediserv (2020–present) — managed HL7 integrations across 28 hospital sites&#10;Junior Developer at XYZ (2018–2020) — built internal dashboards"
                required
              />
            </div>

            <div className="field full">
              <label>Skills</label>
              <textarea
                name="skills"
                value={form.skills}
                onChange={handleChange}
                rows={3}
                placeholder="E.g.: Python, React Native, HL7/Mirth Connect, SQL, Azure, project management"
                required
              />
            </div>

            <div className="field full">
              <label>Education (optional)</label>
              <input
                name="education"
                value={form.education}
                onChange={handleChange}
                placeholder="B.Sc. Computer Science — King Saud University, 2018"
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Generating your documents...' : 'Generate Resume & Cover Letter'}
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <>
          <div className="card">
            <div className="result-header">
              <h2>Resume</h2>
              <button className="copy-btn" onClick={() => copyText('resume', result.resume)}>
                {copied.resume ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="result-text">{result.resume}</div>
          </div>

          <div className="card">
            <div className="result-header">
              <h2>Cover Letter</h2>
              <button className="copy-btn" onClick={() => copyText('cover', result.coverLetter)}>
                {copied.cover ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="result-text">{result.coverLetter}</div>
          </div>
        </>
      )}

      <footer>
        <p>GetDrafted — Free AI resume builder &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
