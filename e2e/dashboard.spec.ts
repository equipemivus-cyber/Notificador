import { test, expect } from '@playwright/test';

test('deve carregar o dashboard e mostrar o título correto', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Notificador/i);
});

test('deve alternar entre as abas de filtro', async ({ page }) => {
    await page.goto('/');

    const mesTab = page.getByRole('button', { name: /Este Mês/i });
    await expect(mesTab).toBeVisible();
    await mesTab.click();
    await expect(mesTab).toHaveClass(/bg-slate-700/);
});
