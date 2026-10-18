const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

async function register(page, name = 'Pessoa E2E') {
  if (process.env.E2E_MUTATE_PROFILE === '1') {
    // Sensitivity experiment: mutate the actual module served to Chromium, not
    // an assertion or a mock. src/** stays untouched; unset the flag to restore.
    await page.route('**/src/presentation/components/CompleteProfileView.js', async route => {
      const response = await route.fetch();
      const original = await response.text();
      expect(original).toContain('Seu apelido');
      await route.fulfill({ response, body: original.replaceAll('Seu apelido', 'Apelido removido pela mutação') });
    });
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  const email = `${randomUUID()}@example.test`;
  await page.getByPlaceholder('E-mail', { exact: true }).fill(email);
  await page.getByPlaceholder('Confirme o e-mail', { exact: true }).fill(email);
  await page.getByPlaceholder('Senha', { exact: true }).fill('E2e-password-123!');
  await page.getByPlaceholder('Confirme a senha', { exact: true }).fill('E2e-password-123!');
  await page.locator('form').getByRole('button', { name: 'Registrar', exact: true }).click();
  await page.getByPlaceholder('Seu apelido').fill(name);
  await page.getByRole('button', { name: 'Masculino', exact: true }).click();
  await page.locator('input[type=date]').fill('1990-01-01');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vincular Contas' })).toBeVisible();
}

async function pair(browser) {
  const a = await browser.newContext(); const b = await browser.newContext();
  a.setDefaultTimeout(12000); b.setDefaultTimeout(12000);
  const inviter = await a.newPage(); const acceptor = await b.newPage();
  try {
  await register(inviter, 'Alice'); await register(acceptor, 'Bruno');
  await inviter.getByRole('button', { name: 'Gerar Código de Convite' }).click();
  const code = inviter.locator('p.tracking-widest');
  await expect(code).toHaveText(/^[A-Z0-9]+$/);
  const invitation = (await code.textContent()).trim();
  await acceptor.getByPlaceholder('Insira o código aqui').fill(invitation);
  await acceptor.getByRole('button', { name: 'Conectar', exact: true }).click();
  await expect(inviter.getByRole('heading', { name: /Bem-vindos à sua nova aventura/ })).toBeVisible();
  await expect(acceptor.getByRole('heading', { name: /Bem-vindos à sua nova aventura/ })).toBeVisible();
  const p = await identity(inviter); const q = await identity(acceptor);
  expect(p.coupleId).toBeTruthy();
  expect(q.coupleId).toBe(p.coupleId);
  expect(p.partnerId).toBe(q.uid); expect(q.partnerId).toBe(p.uid);
  await expect.poll(async () => (await adminRead(`duomatches/${p.coupleId}`)).fields.members.arrayValue.values.map(v => v.stringValue).sort()).toEqual([p.uid, q.uid].sort());
  const consumed = await fetch(`${documents}/inviteCodes/${invitation}`, { headers: { Authorization: 'Bearer owner' } });
  expect(consumed.status).toBe(404);
  return { inviter, acceptor, contexts: [a, b] };
  } catch (error) {
    await Promise.all([a.close(), b.close()]);
    throw error;
  }
}

async function finishTour(page) {
  const titles = ['Bem-vindos à sua nova aventura!', 'Tudo Começa na Rodada', 'Central de Notificações', 'Atividades e Desafios', 'Crie Seus Próprios Momentos', 'Conquistas', 'A Hot Zone', 'Lista de Desejos', 'A Loja dos Sonhos', 'Sua Carteira de Recompensas', 'Ciclo', 'Tudo Pronto Para Começar!'];
  for (let i = 0; i < titles.length; i++) {
    await expect(page.getByRole('heading', { name: new RegExp(titles[i]), level: 3 })).toBeVisible();
    // Keyboard activation is a genuine user interaction and does not race the
    // tour's delayed target measurement/coordinate transitions.
    await page.getByRole('button', { name: i === titles.length - 1 ? 'Vamos Começar!' : 'Próximo', exact: true }).press('Enter');
  }
  await expect(page.getByRole('button', { name: 'Fechar tutorial' })).toHaveCount(0);
}

test('onboarding completo e convite conectam os dois navegadores e persistem', async ({ browser }) => {
  const { inviter, acceptor, contexts } = await pair(browser);
  try {
    await finishTour(inviter); await finishTour(acceptor);
    await inviter.reload(); await acceptor.reload();
    await expect(inviter.getByRole('button', { name: 'Fechar tutorial' })).toHaveCount(0);
    await expect(acceptor.getByRole('button', { name: 'Fechar tutorial' })).toHaveCount(0);
    await expect(inviter.locator('[data-tour-id="rounds-card"]')).toBeVisible();
    await expect(acceptor.locator('[data-tour-id="rounds-card"]')).toBeVisible();
    await expect(inviter.getByText('Conectado com Bruno', { exact: false })).toBeVisible();
    await expect(acceptor.getByText('Conectado com Alice', { exact: false })).toBeVisible();
    const p = await identity(inviter); const q = await identity(acceptor);
    const saved = await adminRead(`duomatches/${p.coupleId}`);
    expect(saved.fields.onboardingCompletedBy.arrayValue.values.map(v => v.stringValue).sort()).toEqual([p.uid, q.uid].sort());
  } finally { await Promise.all(contexts.map(c => c.close())); }
});

// Read real app SDK state inside Chromium; no Firebase/network mocks.
async function identity(page) {
  return page.evaluate(async () => {
    const { auth, db, doc, getDoc } = await import('/src/infrastructure/firebase/index.js');
    const profile = await getDoc(doc(db, 'users', auth.currentUser.uid));
    return { uid: auth.currentUser.uid, ...profile.data() };
  });
}

async function dismissTour(page) {
  await page.getByRole('button', { name: 'Pular Tutorial', exact: true }).press('Enter');
  await expect(page.getByRole('button', { name: 'Fechar tutorial' })).toHaveCount(0);
  // Completing/skipping the tour intentionally routes to rounds. Reload returns
  // to the main view and also verifies the onboarding flag was saved.
  await page.reload();
  await expect(page.locator('[data-tour-id="rounds-card"]')).toBeVisible();
}

// Admin REST is restricted to fixture setup/server verification. Tested actions
// always use the UI/client SDK with the actual authenticated user's credentials.
const documents = 'http://127.0.0.1:8180/v1/projects/demo-duomatch-e2e/databases/(default)/documents';
function field(value) {
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(field) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, field(v)])) } };
}
async function adminRead(path) {
  const res = await fetch(`${documents}/${path}`, { headers: { Authorization: 'Bearer owner' } });
  expect(res.ok).toBeTruthy();
  return res.json();
}
async function adminSet(path, data) {
  const res = await fetch(`${documents}/${path}`, {
    method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, field(v)])) }),
  });
  expect(res.ok).toBeTruthy();
}

test('desafio diário/semanal aceita, reivindica e persiste no servidor após recarga', async ({ browser }) => {
  const { inviter, acceptor, contexts } = await pair(browser);
  try {
    await dismissTour(inviter); await dismissTour(acceptor);
    await inviter.getByRole('button', { name: 'Aceitar Desafio', exact: true }).click();
    await expect(inviter.getByRole('button', { name: 'Reivindicar Conclusão', exact: true })).toBeVisible();
    const profile = await identity(inviter);
    await expect.poll(async () => {
      const doc = await adminRead(`duomatches/${profile.coupleId}`);
      return JSON.stringify(doc.fields.weeklyChallenge || {});
    }).toContain(profile.uid);
    await inviter.reload();
    await expect(inviter.getByRole('button', { name: 'Reivindicar Conclusão', exact: true })).toBeVisible();
    await inviter.getByRole('button', { name: 'Reivindicar Conclusão', exact: true }).click();
    await expect(inviter.getByText('⏳ Aguardando confirmação do parceiro', { exact: true })).toBeVisible();
    await expect(acceptor.getByRole('button', { name: '✅ Confirmar', exact: true })).toBeVisible();
    await expect.poll(async () => JSON.stringify((await adminRead(`duomatches/${profile.coupleId}`)).fields.weeklyChallenge)).toContain('pending_partner_confirmation');
    await inviter.reload();
    await expect(inviter.getByText('⏳ Aguardando confirmação do parceiro', { exact: true })).toBeVisible();
  } finally { await Promise.all(contexts.map(c => c.close())); }
});

test('chat envia mensagem real para o parceiro e sobrevive à recarga', async ({ browser }) => {
  const { inviter, acceptor, contexts } = await pair(browser);
  try {
    await dismissTour(inviter); await dismissTour(acceptor);
    const p = await identity(inviter);
    const today = await inviter.evaluate(() => {
      const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const activityId = randomUUID();
    await adminSet(`duomatches/${p.coupleId}/activities/${activityId}`, {
      name: 'Caminhada E2E', type: 'atividade', category: 'Hobbies & Outros', points: 0,
      createdBy: p.uid, createdAt: new Date(), completionStatus: null,
      selections: { [p.uid]: { date: today, status: 'confirmed' }, [p.partnerId]: { date: today, status: 'confirmed' } },
    });
    await inviter.getByRole('button', { name: 'Abrir chat', exact: true }).click();
    await acceptor.getByRole('button', { name: 'Abrir chat', exact: true }).click();
    const message = `Olá do Chromium ${randomUUID()}`;
    await inviter.getByPlaceholder('Digite sua mensagem...').fill(message);
    await inviter.getByRole('button', { name: 'Enviar', exact: true }).click();
    await expect(inviter.locator('p.whitespace-pre-wrap').filter({ hasText: message })).toBeVisible();
    await expect(acceptor.locator('p.whitespace-pre-wrap').filter({ hasText: message })).toBeVisible();
    await acceptor.reload();
    await acceptor.getByRole('button', { name: 'Abrir chat', exact: true }).click();
    await expect(acceptor.locator('p.whitespace-pre-wrap').filter({ hasText: message })).toBeVisible();
  } finally { await Promise.all(contexts.map(c => c.close())); }
});

test('segurança recusa leitura e escrita de casal alheio pelo SDK no navegador', async ({ browser, page }) => {
  const { inviter, contexts } = await pair(browser);
  try {
    const victim = await identity(inviter);
    await register(page, 'Intruso');
    const before = await adminRead(`duomatches/${victim.coupleId}`);
    const result = await page.evaluate(async (coupleId) => {
      const { auth, db, doc, getDoc, updateDoc } = await import('/src/infrastructure/firebase/index.js');
      // Positive control: permissions/auth/network work for own document.
      const own = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const ref = doc(db, 'duomatches', coupleId);
      const attempt = async fn => { try { await fn(); return 'UNEXPECTED_SUCCESS'; } catch (e) { return e.code; } };
      return {
        ownExists: own.exists(),
        read: await attempt(() => getDoc(ref)),
        write: await attempt(() => updateDoc(ref, { confirmationTime: '00:01' })),
      };
    }, victim.coupleId);
    expect(result).toEqual({ ownExists: true, read: 'permission-denied', write: 'permission-denied' });
    const after = await adminRead(`duomatches/${victim.coupleId}`);
    expect(after.fields.confirmationTime).toEqual(before.fields.confirmationTime);
    expect(after.fields.members).toEqual(before.fields.members);
  } finally { await Promise.all(contexts.map(c => c.close())); }
});
