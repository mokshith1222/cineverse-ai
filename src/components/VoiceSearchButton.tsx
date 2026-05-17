import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
  autoSubmit?: boolean;
}

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

function transcriptFromEvent(event: unknown): string {
  const e = event as { results?: ArrayLike<ArrayLike<{ transcript?: string }>> };
  const results = e.results;
  if (!results || results.length === 0) return '';
  const last = results[results.length - 1];
  return Array.from(last).map(item => item.transcript || '').join(' ').trim();
}

export default function VoiceSearchButton({
  onTranscript,
  className = '',
  disabled = false,
}: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);

  useEffect(() => {
    const Recognition = getSpeechRecognition();
    setSupported(Boolean(Recognition));
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = event => {
      const transcript = transcriptFromEvent(event);
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [onTranscript]);

  const toggle = () => {
    if (!supported || disabled) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    setListening(true);
    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!supported || disabled}
      title={supported ? (listening ? 'Stop listening' : 'Voice search') : 'Voice search is not supported in this browser'}
      className={`${className} ${listening ? 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10 animate-pulse' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
      aria-pressed={listening}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
