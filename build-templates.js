const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templateDir = path.join(__dirname, 'templates');
const templateFolders = fs.readdirSync(templateDir).filter(f =>
  fs.statSync(path.join(templateDir, f)).isDirectory()
);

templateFolders.forEach(folder => {
  const folderPath = path.join(templateDir, folder);
  const hbsPath = path.join(folderPath, `${folder}.hbs`);
  const txtPath = path.join(folderPath, `${folder}.txt`);
  const subjectPath = path.join(folderPath, 'subject.txt');

  if (!fs.existsSync(hbsPath) || !fs.existsSync(txtPath)) {
    console.error(`Template ${folder} is missing .hbs or .txt file.`);
    return;
  }

  const html = fs.readFileSync(hbsPath, 'utf8').trim();
  const text = fs.readFileSync(txtPath, 'utf8').trim();
  let subject = 'Hello from open brighton!';
  if (fs.existsSync(subjectPath)) {
    subject = fs.readFileSync(subjectPath, 'utf8').trim();
  }

  // Compile with Handlebars to check for errors, but output raw for SES
  try {
    Handlebars.precompile(html);
    Handlebars.precompile(text);
    Handlebars.precompile(subject);
  } catch (e) {
    console.error(`Handlebars compilation error in template ${folder}:`, e.message);
    return;
  }

  const json = {
    Template: {
      TemplateName: folder,
      SubjectPart: subject,
      TextPart: text,
      HtmlPart: html
    }
  };

  const outPath = path.join(folderPath, `${folder}.json`);
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log(`Built template: ${outPath}`);
}); 