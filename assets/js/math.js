(() => {
  if (typeof renderMathInElement !== 'function') return;
  document.querySelectorAll('.post-content').forEach(element => {
    renderMathInElement(element, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true},
        ...['equation', 'equation*', 'align', 'align*', 'alignat', 'gather', 'CD'].map(env => ({
          left: '\\begin{' + env + '}', right: '\\end{' + env + '}', display: true
        }))
      ],
      throwOnError: false
    });
  });
})();
