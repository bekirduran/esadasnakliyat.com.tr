const $ = (selector) => document.querySelector(selector);
const status = $('#admin-status');
const notice = (text) => {
  status.textContent = text;
};
async function api(path, options = {}) {
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      $('#admin-content').hidden = true;
      $('#login-form').hidden = false;
    }
    throw Error(result.error || 'İşlem tamamlanamadı.');
  }
  return result;
}
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const jsonOptions = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
let geography = [];
let requestSequence = 0;
async function loadMedia() {
  const data = await api('/api/admin/media');
  const list = $('#media-list');
  list.replaceChildren();
  const labels = {
    hero: 'Ana sayfa büyük görsel',
    moving: 'Evden eve nakliyat',
    lift: 'Asansörlü taşıma',
    intercity: 'Şehirler arası taşıma',
    storage: 'Depolama',
    office: 'Ofis taşıma',
    partial: 'Parça eşya',
    team: 'Hakkımızda / ekip',
  };
  for (const slot of data.slots) {
    const record = data.items.find((m) => m.slot === slot);
    const form = element('form', undefined, 'admin-card');
    form.append(element('h3', labels[slot]));
    const img = element('img');
    img.src = '/media/' + slot + '?v=' + Date.now();
    img.alt = record?.alt || 'Temsili görsel';
    form.append(img);
    const fileLabel = element('label', 'Yeni fotoğraf');
    const file = element('input');
    file.type = 'file';
    file.accept = 'image/jpeg,image/png,image/webp';
    file.required = true;
    fileLabel.append(file);
    const altLabel = element('label', 'Görsel açıklaması');
    const alt = element('input');
    alt.value = record?.alt || '';
    alt.required = true;
    alt.minLength = 8;
    alt.maxLength = 240;
    altLabel.append(alt);
    const button = element('button', 'Görseli güncelle ↗', 'button');
    button.type = 'submit';
    form.append(fileLabel, altLabel, button);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const selected = file.files[0];
      if (!selected) return;
      if (selected.size > 8 * 1024 * 1024) {
        notice('Görsel en fazla 8 MB olabilir.');
        return;
      }
      button.disabled = true;
      try {
        await api('/api/admin/media/' + slot + '?alt=' + encodeURIComponent(alt.value), {
          method: 'PUT',
          headers: { 'Content-Type': selected.type },
          body: selected,
        });
        img.src = '/media/' + slot + '?v=' + Date.now();
        img.alt = alt.value;
        notice('Görsel ve alternatif metin güncellendi.');
        file.value = '';
      } catch (error) {
        notice(error.message);
      } finally {
        button.disabled = false;
      }
    });
    list.append(form);
  }
}
function addOption(select, value, label) {
  const o = element('option', label);
  o.value = value;
  select.append(o);
}
function selectedPath() {
  const city = geography.find((p) => p.slug === $('#city-select').value);
  return (
    '/hizmetler/' +
    $('#service-select').value +
    '/' +
    city.slug +
    '/' +
    ($('#district-select').value ? $('#district-select').value + '/' : '')
  );
}
function fillDistricts() {
  const city = geography.find((p) => p.slug === $('#city-select').value);
  const select = $('#district-select');
  select.replaceChildren();
  addOption(select, '', 'İl geneli');
  for (const district of city.districts) addOption(select, district.slug, district.name);
}
async function loadLocation() {
  const seq = ++requestSequence;
  const path = selectedPath();
  const data = await api('/api/admin/locations?path=' + encodeURIComponent(path));
  if (seq !== requestSequence) return;
  $('#keyword-brief').textContent = data.brief
    ? 'İçerik odağı: ' +
      data.brief.primary +
      ' · İlgili aramalar: ' +
      data.brief.related.join(', ') +
      ' · ' +
      data.brief.intent
    : '';
  const form = $('#location-form');
  form.reset();
  form.elements.path.value = path;
  const city = geography.find((p) => p.slug === $('#city-select').value);
  const district = city.districts.find((d) => d.slug === $('#district-select').value);
  form.elements.title.value =
    (district ? city.name + ' ' + district.name : city.name) +
    ' ' +
    ($('#service-select').value === 'bolgeler'
      ? 'Nakliyat ve Taşınma Planlama'
      : $('#service-select').selectedOptions[0].textContent);
  if (data.location) {
    for (const key of ['title', 'description', 'local_details', 'evidence_url', 'status'])
      form.elements[key].value = data.location[key];
    form.elements.service_confirmed.checked = Boolean(data.location.service_confirmed);
  }
  $('#region-preview').href = path;
  const saved = $('#saved-locations');
  saved.replaceChildren();
  for (const row of data.records) {
    const a = element(
      'a',
      row.title + ' — ' + (row.status === 'published' ? 'Yayında' : 'Taslak'),
      'admin-card',
    );
    a.href = row.path;
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.display = 'block';
    saved.append(a);
  }
}
async function loadLeads() {
  const { items } = await api('/api/admin/leads');
  const list = $('#lead-list');
  list.replaceChildren();
  if (!items.length) list.append(element('p', 'Henüz teklif talebi yok.'));
  for (const lead of items) {
    const article = element('article', undefined, 'admin-lead');
    article.append(
      element('h3', lead.name),
      element('p', lead.phone + ' · ' + lead.service),
      element('p', lead.origin + ' → ' + lead.destination + ' · ' + lead.date),
      element('p', lead.details),
      element('small', 'Talep: ' + lead.id + ' · ' + lead.created_at),
    );
    const label = element('label', 'Durum');
    const select = element('select');
    for (const [v, l] of [
      ['new', 'Yeni'],
      ['contacted', 'İletişime geçildi'],
      ['completed', 'Tamamlandı'],
    ])
      addOption(select, v, l);
    select.value = lead.status;
    select.addEventListener('change', async () => {
      select.disabled = true;
      try {
        await api('/api/admin/leads/' + lead.id, jsonOptions('PUT', { status: select.value }));
        notice('Talep durumu güncellendi.');
      } catch (error) {
        notice(error.message);
      } finally {
        select.disabled = false;
      }
    });
    label.append(select);
    article.append(label);
    list.append(article);
  }
}
async function loadAudits() {
  const { items } = await api('/api/admin/audits');
  const list = $('#audit-list');
  list.replaceChildren();
  if (!items.length) list.append(element('p', 'İlk günlük denetim henüz çalışmadı.'));
  for (const row of items) {
    const data = JSON.parse(row.result);
    const card = element('article', undefined, 'admin-card');
    card.append(
      element('h3', row.created_at),
      element(
        'p',
        data.provinces +
          ' il · ' +
          data.districts +
          ' ilçe · ' +
          data.published +
          ' yayınlanmış bölge',
      ),
      element('p', 'Taslağa dönen: ' + data.returnedToDraft.length),
    );
    list.append(card);
  }
}
async function initialize() {
  const session = await api('/api/admin/session');
  $('#login-form').hidden = session.authenticated;
  $('#admin-content').hidden = !session.authenticated;
  if (!session.authenticated) {
    notice('Yönetici parolanızla giriş yapın.');
    return;
  }
  $('#environment').textContent = session.environment;
  notice('Yönetim paneli hazır.');
  await loadMedia();
  const data = await api('/api/admin/locations');
  geography = data.provinces;
  $('#city-select').replaceChildren();
  for (const p of geography) addOption($('#city-select'), p.slug, p.name);
  $('#city-select').value = 'ankara';
  fillDistricts();
  await loadLocation();
}
$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  try {
    await api(
      '/api/admin/login',
      jsonOptions('POST', { password: event.currentTarget.elements.password.value }),
    );
    $('#login-form').reset();
    await initialize();
  } catch (error) {
    notice(error.message);
  } finally {
    button.disabled = false;
  }
});
$('#logout').addEventListener('click', async () => {
  try {
    await api('/api/admin/logout', { method: 'POST' });
    $('#media-list').replaceChildren();
    $('#lead-list').replaceChildren();
    await initialize();
  } catch (error) {
    notice(error.message);
  }
});
document.querySelectorAll('[data-panel]').forEach((button) =>
  button.addEventListener('click', async () => {
    document
      .querySelectorAll('[data-panel]')
      .forEach((b) => b.setAttribute('aria-selected', String(b === button)));
    document
      .querySelectorAll('[role=tabpanel]')
      .forEach((p) => (p.hidden = p.id !== button.dataset.panel));
    try {
      if (button.dataset.panel === 'leads-panel') await loadLeads();
      if (button.dataset.panel === 'audits-panel') await loadAudits();
    } catch (error) {
      notice(error.message);
    }
  }),
);
$('#city-select').addEventListener('change', () => {
  fillDistricts();
  loadLocation().catch((e) => notice(e.message));
});
$('#district-select').addEventListener('change', () =>
  loadLocation().catch((e) => notice(e.message)),
);
$('#location-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    const payload = Object.fromEntries(new FormData(form));
    payload.service_confirmed = form.elements.service_confirmed.checked;
    const result = await api('/api/admin/locations', jsonOptions('PUT', payload));
    notice(
      result.status === 'published'
        ? 'İçerik yayınlandı. Production alan adında sitemap ve indeksleme otomatik güncellendi.'
        : 'Taslak kaydedildi; indekslemeye kapalı.',
    );
    await loadLocation();
  } catch (error) {
    notice(error.message);
  } finally {
    button.disabled = false;
  }
});
$('#refresh-leads').addEventListener('click', () => loadLeads().catch((e) => notice(e.message)));
initialize().catch((error) => notice(error.message));

$('#service-select').addEventListener('change', () =>
  loadLocation().catch((error) => notice(error.message)),
);
