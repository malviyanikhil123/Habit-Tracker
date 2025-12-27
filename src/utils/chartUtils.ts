/**
 * Get CSS variable value
 */
export function getCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Setup canvas for high DPI displays
 */
export function setupCanvas(
    canvas: HTMLCanvasElement,
    heightCssPx: number
): { ctx: CanvasRenderingContext2D; width: number; height: number } | null {
    const wrap = canvas.parentElement;
    const widthCssPx = wrap ? wrap.clientWidth : canvas.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.height = `${heightCssPx}px`;
    canvas.style.width = `${widthCssPx}px`;
    canvas.width = Math.floor(widthCssPx * dpr);
    canvas.height = Math.floor(heightCssPx * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: widthCssPx, height: heightCssPx };
}

/**
 * Draw a rounded rectangle
 */
export function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

/**
 * Render bar chart for habits
 */
export function renderBarChart(
    canvas: HTMLCanvasElement,
    data: { name: string; value: number }[]
): void {
    const setup = setupCanvas(canvas, 220);
    if (!setup) return;

    const { ctx, width, height } = setup;
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
        ctx.fillStyle = getCssVar('--color-text-muted') || '#4a6a6c';
        ctx.font = '13px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Add a habit to see the chart.', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max(1, ...data.map(d => d.value));
    const padding = { top: 16, right: 10, bottom: 46, left: 28 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const grid = getCssVar('--color-border-soft') || '#A6E3E9';
    const bar = '#71C9CE';
    const text = getCssVar('--color-text-muted') || '#4a6a6c';
    const textMain = getCssVar('--color-text-main') || '#2f2f2f';

    // Grid
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
    }

    const barSlot = chartW / data.length;
    const barW = Math.max(12, Math.min(26, barSlot * 0.6));

    data.forEach((d, i) => {
        const x = padding.left + i * barSlot + (barSlot - barW) / 2;
        const h = (d.value / maxValue) * chartH;
        const y = padding.top + chartH - h;

        // Bar
        ctx.fillStyle = bar;
        roundRect(ctx, x, y, barW, h, 6);
        ctx.fill();

        // Value
        ctx.fillStyle = textMain;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(d.value), x + barW / 2, y - 6);

        // Label
        const label = (d.name || '').trim();
        const short = label.length > 10 ? `${label.slice(0, 10)}…` : label;
        ctx.fillStyle = text;
        ctx.font = '11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.fillText(short, x + barW / 2, padding.top + chartH + 28);
    });
}

/**
 * Render progress line chart
 */
export function renderLineChart(
    canvas: HTMLCanvasElement,
    points: number[],
    daysInMonth: number
): void {
    const setup = setupCanvas(canvas, 220);
    if (!setup) return;

    const { ctx, width, height } = setup;
    ctx.clearRect(0, 0, width, height);

    if (points.length === 0) {
        ctx.fillStyle = getCssVar('--color-text-muted') || '#4a6a6c';
        ctx.font = '13px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Check off days to see progress.', width / 2, height / 2);
        return;
    }

    const padding = { top: 16, right: 10, bottom: 32, left: 28 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const grid = getCssVar('--color-border-soft') || '#A6E3E9';
    const line = '#71C9CE';
    const text = getCssVar('--color-text-muted') || '#4a6a6c';

    // Grid + Y labels
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = text;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
        ctx.fillText(`${100 - i * 25}%`, padding.left - 6, y + 4);
    }

    // X labels
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.ceil(daysInMonth / 7));
    for (let d = 1; d <= daysInMonth; d += step) {
        const x = padding.left + ((d - 1) / Math.max(1, daysInMonth - 1)) * chartW;
        ctx.fillText(String(d), x, padding.top + chartH + 22);
    }

    // Line
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach((pct, i) => {
        const x = padding.left + (i / Math.max(1, daysInMonth - 1)) * chartW;
        const y = padding.top + chartH - (pct / 100) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}
