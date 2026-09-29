import { useCallback, useEffect, useRef, useState } from 'react';
import '@wterm/dom/css';
import { GhosttyCore } from '@wterm/ghostty';
import { Terminal, type TerminalHandle } from '@wterm/react';
import '@wterm/react/css';
import { Alert, Button, Loader, Stack, Text } from '@mantine/core';

const WASM_PATH = '/ghostty-vt.wasm';
const FOREGROUND_COLOR = '#ededed';
const BACKGROUND_COLOR = '#0a0a0a';
const LOADING_CAPTION = 'Loading terminal core...';

type Status = 'loading' | 'ready' | 'error';

export function TerminalPanel() {
  const [status, setStatus] = useState<Status>('loading');
  const [core, setCore] = useState<GhosttyCore | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const terminalRef = useRef<TerminalHandle | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    setStatus('loading');
    setError(null);

    GhosttyCore.load({
      wasmPath: WASM_PATH,
      foregroundColor: FOREGROUND_COLOR,
      backgroundColor: BACKGROUND_COLOR,
    })
      .then((loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        setCore(loaded);
        setStatus('ready');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        const wrapped = reason instanceof Error ? reason : new Error(String(reason));
        setError(wrapped);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const observer = new ResizeObserver(() => {
      terminalRef.current?.instance?.fit();
    });

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, [status]);

  const onRetry = useCallback(() => {
    if (core) {
      core.dispose();
      setCore(null);
    }
    setAttempt((current) => current + 1);
  }, [core]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {status === 'loading' && (
        <Stack align="center" justify="center" gap="sm" style={{ flex: 1, minHeight: 0 }}>
          <Loader size="md" />
          <Text c="dimmed" size="sm">
            {LOADING_CAPTION}
          </Text>
        </Stack>
      )}

      {status === 'error' && (
        <Stack
          align="center"
          justify="center"
          gap="md"
          style={{ flex: 1, minHeight: 0, padding: 'var(--mantine-spacing-md)' }}
        >
          <Alert color="red" title="Terminal core failed to load" style={{ maxWidth: 480 }}>
            {error?.message ?? 'Unknown error'}
          </Alert>
          <Button onClick={onRetry} variant="default">
            Retry
          </Button>
        </Stack>
      )}

      {status === 'ready' && core && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <Terminal ref={terminalRef} core={core} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}
