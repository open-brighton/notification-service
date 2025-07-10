const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templateDir = path.join(__dirname, 'templates');
const hbsFiles = fs.readdirSync(templateDir).filter(f => f.endsWith('.hbs'));

hbsFiles.forEach(file => {
  const filePath = path.join(templateDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Split the template into Subject, Text, and Html parts
  const subjectMatch = content.match(/^Subject: (.*)$/m);
  const textMatch = content.match(/^Text:\n([\s\S]*?)^Html:/m);
  const htmlMatch = content.match(/^Html:\n([\s\S]*)$/m);

  if (!subjectMatch || !textMatch || !htmlMatch) {
    console.error(`Template ${file} is missing required sections.`);
    return;
  }

  const templateName = path.basename(file, '.hbs');

  // Compile with Handlebars to check for errors, but output raw for SES
  const subject = subjectMatch[1].trim();
  const text = textMatch[1].trim();
  const html = htmlMatch[1].trim();

  const json = {
    Template: {
      TemplateName: templateName,
      SubjectPart: subject,
      TextPart: text,
      HtmlPart: html
    }
  };

  const outPath = path.join(templateDir, `${templateName}.json`);
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log(`Built SES template: ${outPath}`);
}); 