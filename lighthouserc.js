module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:3000/'],
      startServerCommand: 'npm run start -- --hostname 127.0.0.1 --port 3000',
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'total-byte-weight': ['warn', { maxNumericValue: 1500000 }],
        'unused-javascript': ['warn', { maxNumericValue: 150000 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './artifacts/lighthouse' },
  },
};
