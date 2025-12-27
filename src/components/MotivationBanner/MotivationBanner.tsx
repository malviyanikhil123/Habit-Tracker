interface MotivationBannerProps {
    quote: string;
}

export function MotivationBanner({ quote }: MotivationBannerProps) {
    return (
        <section className="motivation-banner" aria-label="Daily motivation">
            <div className="motivation-icon" aria-hidden="true">🌱</div>
            <div className="motivation-text">
                <div className="motivation-title">Today</div>
                <div className="motivation-quote">{quote}</div>
            </div>
        </section>
    );
}
