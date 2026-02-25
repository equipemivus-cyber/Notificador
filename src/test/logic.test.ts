import { describe, it, expect } from 'vitest'

function matchesTab(aptDate: string, activeTab: string, today: Date) {
    const [day, month, year] = aptDate.split('/').map(Number);
    const aptDateObj = new Date(year, month - 1, day);

    today.setHours(0, 0, 0, 0);
    const isPast = aptDateObj < today;

    if (activeTab === 'hoje') {
        return !isPast;
    } else if (activeTab === 'anteriores') {
        return isPast;
    } else if (activeTab === 'este-mes') {
        return aptDateObj.getMonth() === today.getMonth() && aptDateObj.getFullYear() === today.getFullYear();
    }
    return false;
}

describe('Lógica de Filtragem de Datas', () => {
    const today = new Date(2026, 1, 25); // 25/02/2026

    it('deve identificar datas futuras como "hoje"', () => {
        expect(matchesTab('25/02/2026', 'hoje', new Date(today))).toBe(true);
        expect(matchesTab('26/02/2026', 'hoje', new Date(today))).toBe(true);
    });

    it('deve identificar datas passadas como "anteriores"', () => {
        expect(matchesTab('20/02/2026', 'anteriores', new Date(today))).toBe(true);
        expect(matchesTab('01/02/2026', 'anteriores', new Date(today))).toBe(true);
    });

    it('deve identificar todas as datas do mês atual em "este-mes"', () => {
        expect(matchesTab('01/02/2026', 'este-mes', new Date(today))).toBe(true);
        expect(matchesTab('20/02/2026', 'este-mes', new Date(today))).toBe(true);
        expect(matchesTab('28/02/2026', 'este-mes', new Date(today))).toBe(true);
    });

    it('não deve identificar datas de outros meses em "este-mes"', () => {
        expect(matchesTab('01/01/2026', 'este-mes', new Date(today))).toBe(false);
        expect(matchesTab('01/03/2026', 'este-mes', new Date(today))).toBe(false);
    });
})
