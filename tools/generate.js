const fs = require('fs');
const path = require('path');
const copy = require('recursive-copy');
const glob = require('glob-promise');

const base = (...args) => path.join(__dirname, '..', ...args);
const layout = readSrc('layout.html');

const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
});

glob(base('src', 'pages', '*.md'))
  .then(function(files) {
    return Promise.all(
      files.map(function(file) {
        const base = path.basename(file, '.md');
        return renderMarkdown(base);
      })
    );
  })
  .then(copyFiles);

function readSrc(...file) {
  return fs.readFileSync(base('src', ...file)).toString('utf8');
}

function renderMarkdown(name) {
  const text = md.render(readSrc('pages', `${name}.md`));
  const result = template(layout, { CONTENT: text });

  fs.writeFileSync(base('docs', `${name}.html`), result);
  console.log(`Created ${name}.html`);
}

function copyFiles() {
  copy(base('src', 'static'), base('docs'), {
    overwrite: true
  })
    .then(function(r) {
      console.info(`Copied public files (${r.length} files)`);
    })
    .catch(function(error) {
      console.error('Error copying public files: ' + error);
    });
}

function template(text, obj) {
  return text.replace(
    /\{\{([A-Z]+)\}\}/g,
    (_, key) => obj[key] || ''
  );
}
