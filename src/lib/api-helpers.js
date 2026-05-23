export function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function validateQuizQuestions(questions) {
  for (const q of questions) {
    if (!q.questionText || typeof q.questionText !== 'string' || !q.questionText.trim()) {
      return 'Each question must have non-empty questionText';
    }
    if (!Array.isArray(q.options) || q.options.length === 0) {
      return 'Each question must have a non-empty options array';
    }
    for (const opt of q.options) {
      if (!opt.text || typeof opt.text !== 'string') {
        return 'Each option must have a text field';
      }
      if (typeof opt.isCorrect !== 'boolean') {
        return 'Each option must have an isCorrect boolean';
      }
    }
    if (!q.options.some((o) => o.isCorrect)) {
      return 'Each question must have at least one correct option';
    }
  }
  return null;
}
