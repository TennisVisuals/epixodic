import { env } from './env';
import { getAvailableFormats } from '../services/matchObject/formatMigration';

export function displayFormats() {
  // Use Factory formats from migration helper
  const formats = getAvailableFormats();
  // FACTORY-FIRST: Use modern code accessor
  const current = env.match.format.code;
  
  let html = '';
  if (!formats.length) return false;
  
  // Group by category
  const categories = [...new Set(formats.map(f => f.category))];
  
  categories.forEach(category => {
    const categoryFormats = formats.filter(f => f.category === category);
    html += `<div class="format-category"><h4>${category}</h4>`;
    categoryFormats.forEach((format: any) => {
      html += formatEntry(format, format.code === current);
    });
    html += '</div>';
  });
  
  const matchFormatList = document.getElementById('matchformatlist');
  if (matchFormatList) matchFormatList.innerHTML = html;
}

function formatEntry(format: any, isCurrent: boolean) {
  const { code, name } = format;
  const color = isCurrent ? 'lightgreen' : 'white';
  return `
  <div class='changeFormat flexjustifystart mf_format' newFormat="${code}" style="background-color: ${color}">
      <div class='changeFormat flexcols'>
        <div class='changeFormat mf_name'> <b class='changeFormat'>${name}</b> </div>
        <div class='changeFormat mf_code'> <small>${code}</small> </div>
      </div>
  </div>
  `;
}
