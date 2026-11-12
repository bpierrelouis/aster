import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const internalNotices = /\b(?:démonstrateur|démonstration|démo|local(?:e)?|test)\b|mot de passe vide|sans mot de passe|comptes? de démonstration/i;

export async function expectPublicPresentation(page: Page) {
  await expect(page.locator('body')).not.toContainText(internalNotices);
  await expect(page).not.toHaveTitle(internalNotices);
}
