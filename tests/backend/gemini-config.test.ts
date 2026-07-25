import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveGeminiModelName } from '../../geminiConfig';

test('uses the supported Gemini default when no model is configured', () => {
  const result = resolveGeminiModelName(undefined);
  assert.equal(result.modelName, 'gemini-2.5-flash');
  assert.equal(result.isSupported, true);
});

test('rejects unsupported Gemini model names with a clear error', () => {
  const result = resolveGeminiModelName('gemini-3.5-flash');
  assert.equal(result.isSupported, false);
  assert.match(result.error || '', /unavailable/i);
});
