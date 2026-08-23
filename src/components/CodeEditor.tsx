import { useEffect, useRef } from 'react';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { HighlightStyle, syntaxHighlighting, indentUnit, bracketMatching } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/** Warna diambil dari blok kode pada mockup (bg #2e2b25, chrome #474238). */
const sorotan = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword], color: '#aebf92' },
  { tag: [t.function(t.variableName), t.standard(t.variableName)], color: '#f6a06b' },
  { tag: [t.string, t.special(t.string)], color: '#ffc6a5' },
  { tag: t.number, color: '#ffc6a5' },
  { tag: t.bool, color: '#aebf92' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#82796a', fontStyle: 'italic' },
  { tag: t.definition(t.variableName), color: '#f9f4ed' },
  { tag: t.propertyName, color: '#f6a06b' },
  { tag: [t.operator, t.punctuation, t.bracket], color: '#c0b6a5' },
]);

function tema(fontSize: number): Extension {
  return EditorView.theme(
    {
      '&': { color: '#f9f4ed', backgroundColor: 'transparent', fontSize: `${fontSize}px` },
      '.cm-gutters': { backgroundColor: 'transparent', color: '#645c50', border: 'none' },
      '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '18px', paddingRight: '14px', minWidth: '44px' },
      '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,.05)' },
      '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#c0b6a5' },
      '.cm-cursor': { borderLeftColor: '#f6a06b', borderLeftWidth: '2px' },
      '.cm-matchingBracket': { backgroundColor: 'rgba(198,113,57,.3)', outline: 'none' },
      '.cm-content': { caretColor: '#f6a06b' },
    },
    { dark: true },
  );
}

export interface CodeEditorProps {
  nilai: string;
  onChange?: (kode: string) => void;
  /** F-A01 — tempel diblokir selama ujian. */
  blokirTempel?: boolean;
  readOnly?: boolean;
  fontSize?: number;
  minHeight?: number;
  /** Ctrl/Cmd + Enter. */
  onJalankan?: () => void;
  ariaLabel?: string;
}

export function CodeEditor({
  nilai, onChange, blokirTempel = false, readOnly = false,
  fontSize = 14, minHeight = 180, onJalankan, ariaLabel = 'Editor kode Python',
}: CodeEditorProps) {
  const kotak = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onJalankanRef = useRef(onJalankan);
  const onChangeRef = useRef(onChange);
  onJalankanRef.current = onJalankan;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!kotak.current) return;

    const ekstensi: Extension[] = [
      lineNumbers(),
      history(),
      bracketMatching(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      python(),
      syntaxHighlighting(sorotan),
      indentUnit.of('    '),
      keymap.of([
        {
          key: 'Mod-Enter',
          preventDefault: true,
          run: () => { onJalankanRef.current?.(); return true; },
        },
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      EditorView.lineWrapping,
      tema(fontSize),
      EditorState.readOnly.of(readOnly),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onChangeRef.current?.(u.state.doc.toString());
      }),
      EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
      EditorView.theme({ '.cm-scroller': { minHeight: `${minHeight}px` } }),
    ];

    if (blokirTempel) {
      ekstensi.push(
        EditorView.domEventHandlers({
          paste: (e) => { e.preventDefault(); return true; },
          drop: (e) => { e.preventDefault(); return true; },
          contextmenu: (e) => { e.preventDefault(); return true; },
        }),
      );
    }

    const v = new EditorView({
      state: EditorState.create({ doc: nilai, extensions: ekstensi }),
      parent: kotak.current,
    });
    view.current = v;
    return () => { v.destroy(); view.current = null; };
    // Konfigurasi editor dibuat ulang hanya bila salah satu opsi ini berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blokirTempel, readOnly, fontSize, minHeight, ariaLabel]);

  // Sinkronkan bila nilai diganti dari luar (mis. "Atur ulang" atau pindah soal).
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const sekarang = v.state.doc.toString();
    if (sekarang !== nilai) {
      v.dispatch({ changes: { from: 0, to: sekarang.length, insert: nilai } });
    }
  }, [nilai]);

  return <div ref={kotak} />;
}
