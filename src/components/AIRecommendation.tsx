import { FormEvent, useState } from 'react';
import { ArrowRight, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildSearchUrl } from '../lib/smartSearch';
import { fetchOpenRouterMovieRecommendations, type OpenRouterMovieRecommendation } from '../lib/openrouter';

const EXAMPLE_PROMPTS = [
  'Suggest sci-fi movies like Interstellar',
  'Best Telugu comedy movies',
  'Dark thrillers with a smart twist',
];

export default function AIRecommendation() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<OpenRouterMovieRecommendation[]>([]);
  const [submittedPrompt, setSubmittedPrompt] = useState('');

  const handleGenerate = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const rows = await fetchOpenRouterMovieRecommendations(prompt);
      setRecommendations(rows);
      setSubmittedPrompt(prompt.trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load movie recommendations right now.';
      setError(message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/20 sm:p-6 lg:p-8">
      {/* Decorative background layers keep the section visually distinct without affecting readability. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.14),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300/80">AI Movie Assistant</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">AI Movie Assistant</h2>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label htmlFor="ai-movie-prompt" className="mb-2 block text-sm font-semibold text-slate-200">
                Describe the kind of movie night you want
              </label>
              <textarea
                id="ai-movie-prompt"
                rows={4}
                value={prompt}
                onChange={event => setPrompt(event.target.value)}
                placeholder="Suggest sci-fi movies like Interstellar"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Generate recommendations'}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map(example => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
            >
              {example}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {recommendations.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300/80">Recommendations</p>
                <p className="mt-1 text-sm text-slate-400">
                  Results for <span className="font-semibold text-slate-100">{submittedPrompt}</span>
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                {recommendations.length} picks
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="group flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">#{index + 1}</p>
                      <h3 className="mt-2 text-xl font-black text-white">{item.title}</h3>
                    </div>
                    {item.year ? (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                        {item.year}
                      </span>
                    ) : null}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {item.genre ? (
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {item.genre}
                      </span>
                    ) : null}
                    {item.language ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                        {item.language}
                      </span>
                    ) : null}
                  </div>

                  <p className="flex-1 text-sm leading-6 text-slate-300">{item.reason}</p>

                  <Link
                    to={buildSearchUrl(item.searchQuery || item.title)}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Search this title
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
            Enter a prompt above to get a clean, movie-only recommendation list powered by OpenRouter.
          </div>
        )}
      </div>
    </section>
  );
}
