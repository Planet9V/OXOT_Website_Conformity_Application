/**
 * Flow authoring (admin) regression test.
 *
 * Admins author conformity flow *definitions* — an ordered list of typed steps —
 * from the /flows page, mirroring what the run-side Flow runner panel executes.
 * This test drives the authoring UI and asserts the exact wire payload the
 * generated create/update hooks send, because the whole point of the feature is
 * that reordering and per-step config persist correctly:
 *   - creating a flow serialises name/key/appliesTo and the ordered steps;
 *   - reordering a step before save changes the persisted step order;
 *   - question steps persist their answer options as config.options;
 *   - editing an existing flow keeps the key fixed and PUTs the new steps.
 *
 * Every API call is mocked (no API server / DB required).
 */

import { test, expect, type Page, type Route } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const ADMIN_SESSION = { authenticated: true, username: 'admin', role: 'admin' };

const EXISTING_FLOW = {
  id: 7,
  key: 'cra-default',
  name: 'CRA default process',
  description: 'The default CRA conformity flow.',
  appliesTo: { regulationKeys: ['cra'] },
  steps: [
    { id: 'scope', type: 'activity', title: 'Confirm scope & classification' },
    {
      id: 'harmonised',
      type: 'question',
      title: 'Are harmonised standards fully applied?',
      config: { options: ['yes', 'partially', 'no'] },
    },
  ],
  isTemplate: true,
  sortOrder: 0,
  createdAt: '2026-07-13T00:00:00Z',
  updatedAt: '2026-07-13T00:00:00Z',
};

async function baseMocks(page: Page, flows: unknown[]) {
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  await page.route('**/api/conformity/flows', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill(json(flows));
      return;
    }
    route.fallback();
  });
}

async function gotoFlows(page: Page) {
  await page.goto('/conformity/flows');
  await page.waitForLoadState('networkidle');
}

test.describe('flow authoring', () => {
  test('creating a flow persists reordered steps and per-step config', async ({ page }) => {
    await baseMocks(page, []);

    let createdBody: any = null;
    await page.route('**/api/conformity/flows', async (route: Route) => {
      if (route.request().method() !== 'POST') {
        route.fallback();
        return;
      }
      createdBody = route.request().postDataJSON();
      route.fulfill(
        json({
          ...EXISTING_FLOW,
          id: 99,
          key: createdBody.key,
          name: createdBody.name,
          steps: createdBody.steps,
          appliesTo: createdBody.appliesTo ?? {},
        }),
      );
    });

    await gotoFlows(page);
    await expect(page.getByText('No flows yet.')).toBeVisible();

    await page.getByTestId('flow-new').click();
    await page.getByTestId('flow-name').fill('New audit flow');
    await page.getByTestId('flow-key').fill('audit-flow');

    // The dialog opens with one blank step. Fill it, then add a second.
    const editors = page.getByTestId('flow-step-editor');
    await editors.nth(0).getByTestId('flow-step-title').fill('First step');
    await page.getByTestId('flow-add-step').click();

    // Second step → question with options.
    const second = editors.nth(1);
    await second.getByTestId('flow-step-title').fill('Second step');
    await second.getByTestId('flow-step-type').click();
    await page.getByRole('option', { name: 'Question' }).click();
    await second.getByTestId('flow-step-options').fill('yes, no');

    // Reorder: move the second step up so it becomes first.
    await second.getByTestId('flow-step-up').click();

    await page.getByTestId('flow-save').click();

    await expect.poll(() => createdBody).not.toBeNull();
    expect(createdBody.key).toBe('audit-flow');
    expect(createdBody.name).toBe('New audit flow');
    // Reorder took effect: the question step is now first.
    expect(createdBody.steps.map((s: any) => s.title)).toEqual(['Second step', 'First step']);
    expect(createdBody.steps[0].type).toBe('question');
    expect(createdBody.steps[0].config).toEqual({ options: ['yes', 'no'] });
  });

  test('an artifact step persists the canonical artifactType chosen from the select', async ({
    page,
  }) => {
    await baseMocks(page, []);

    let createdBody: any = null;
    await page.route('**/api/conformity/flows', async (route: Route) => {
      if (route.request().method() !== 'POST') {
        route.fallback();
        return;
      }
      createdBody = route.request().postDataJSON();
      route.fulfill(
        json({
          ...EXISTING_FLOW,
          id: 101,
          key: createdBody.key,
          name: createdBody.name,
          steps: createdBody.steps,
          appliesTo: createdBody.appliesTo ?? {},
        }),
      );
    });

    await gotoFlows(page);
    await page.getByTestId('flow-new').click();
    await page.getByTestId('flow-name').fill('Artifact flow');
    await page.getByTestId('flow-key').fill('artifact-flow');

    const step = page.getByTestId('flow-step-editor').nth(0);
    await step.getByTestId('flow-step-title').fill('Draft the declaration of conformity');

    // Switch the step to the artifact type; this reveals the artifact-type select.
    await step.getByTestId('flow-step-type').click();
    await page.getByRole('option', { name: 'Artifact' }).click();

    // Author the artifact type by its human label; the wire value must be the
    // canonical key the runner generates, not the label.
    await step.getByTestId('flow-step-artifact-type').click();
    await page.getByRole('option', { name: 'EU Declaration of Conformity' }).click();

    await page.getByTestId('flow-save').click();

    await expect.poll(() => createdBody).not.toBeNull();
    expect(createdBody.steps).toHaveLength(1);
    expect(createdBody.steps[0].type).toBe('artifact');
    // Round-trip: the persisted config carries the canonical artifactType key.
    expect(createdBody.steps[0].config).toEqual({ artifactType: 'eu_doc' });
  });

  test('the artifact-type select offers the Annex II user-information document and persists its key', async ({
    page,
  }) => {
    // The picker derives from the generated client enum + label map, so this
    // pins the newest generatable type (user_information) end-to-end: label
    // shown to the author, canonical key on the wire.
    await baseMocks(page, []);

    let createdBody: any = null;
    await page.route('**/api/conformity/flows', async (route: Route) => {
      if (route.request().method() !== 'POST') {
        route.fallback();
        return;
      }
      createdBody = route.request().postDataJSON();
      route.fulfill(
        json({
          ...EXISTING_FLOW,
          id: 102,
          key: createdBody.key,
          name: createdBody.name,
          steps: createdBody.steps,
          appliesTo: createdBody.appliesTo ?? {},
        }),
      );
    });

    await gotoFlows(page);
    await page.getByTestId('flow-new').click();
    await page.getByTestId('flow-name').fill('User info flow');
    await page.getByTestId('flow-key').fill('user-info-flow');

    const step = page.getByTestId('flow-step-editor').nth(0);
    await step.getByTestId('flow-step-title').fill('Compile the Annex II user information');
    await step.getByTestId('flow-step-type').click();
    await page.getByRole('option', { name: 'Artifact' }).click();

    await step.getByTestId('flow-step-artifact-type').click();
    await page
      .getByRole('option', { name: 'User Information & Instructions (Annex II)' })
      .click();

    await page.getByTestId('flow-save').click();

    await expect.poll(() => createdBody).not.toBeNull();
    expect(createdBody.steps[0].type).toBe('artifact');
    expect(createdBody.steps[0].config).toEqual({ artifactType: 'user_information' });
  });

  test('editing a flow keeps the key fixed and PUTs updated steps', async ({ page }) => {
    await baseMocks(page, [EXISTING_FLOW]);

    let updatedBody: any = null;
    await page.route('**/api/conformity/flows/7', async (route: Route) => {
      if (route.request().method() !== 'PUT') {
        route.fallback();
        return;
      }
      updatedBody = route.request().postDataJSON();
      route.fulfill(json({ ...EXISTING_FLOW, steps: updatedBody.steps, name: updatedBody.name }));
    });

    await gotoFlows(page);
    const card = page.getByTestId('flow-card');
    await expect(card).toContainText('CRA default process');

    await page.getByTestId('flow-edit').click();

    // Key is fixed after creation.
    await expect(page.getByTestId('flow-key')).toBeDisabled();

    // Reorder the two seeded steps: move the second (question) up.
    const editors = page.getByTestId('flow-step-editor');
    await editors.nth(1).getByTestId('flow-step-up').click();

    await page.getByTestId('flow-save').click();

    await expect.poll(() => updatedBody).not.toBeNull();
    expect(updatedBody.steps.map((s: any) => s.title)).toEqual([
      'Are harmonised standards fully applied?',
      'Confirm scope & classification',
    ]);
    // The question step retains its options config through the round-trip.
    expect(updatedBody.steps[0].config).toEqual({ options: ['yes', 'partially', 'no'] });
  });

  test('the demo workspace is read-only for flow authoring', async ({ page }) => {
    await page.route('**/api/**', (route) => route.fulfill(json([])));
    await page.route('**/api/admin/session', (route) =>
      route.fulfill(json({ authenticated: true, username: 'oxotdemo', role: 'demo' })),
    );
    await page.route('**/api/conformity/flows', (route) => route.fulfill(json([EXISTING_FLOW])));

    await gotoFlows(page);
    await expect(page.getByText('CRA default process')).toBeVisible();
    await expect(page.getByText('The demo workspace is read-only.')).toBeVisible();
    await expect(page.getByTestId('flow-new')).toHaveCount(0);
    await expect(page.getByTestId('flow-edit')).toHaveCount(0);
  });
});
