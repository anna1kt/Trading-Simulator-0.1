import { useEffect } from 'react';

export default function AboutPage() {

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            }); 
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="about-page container py-4">

            <section className="fade-in card p-4 mb-4 shadow-sm">
                <h2>💹 Trading Simulator 0.1</h2>
                <p>
                    Уникальная площадка для изучения трейдинга без риска. Получи $10,000 на стартовый баланс и начни торговать прямо сейчас!
                </p>
            </section>

            <section className="fade-in card p-4 mb-4 shadow-sm">
                <h3>📜 История трейдинга</h3>
                <p>
                    От древних рынков до современных криптобирж — трейдинг всегда был движущей силой экономики. Люди изучали поведение цен, создавали инструменты для анализа и искали возможности для прибыли.
                </p>
            </section>

            <section className="fade-in card p-4 mb-4 shadow-sm">
                <h3>🚀 Почему это важно</h3>
                <p>
                    В нашем симуляторе ты учишься реагировать на колебания рынка, анализировать графики, управлять портфелем и принимать решения, которые помогут развить навыки настоящего трейдера.
                </p>
            </section>

            <section className="fade-in card p-4 mb-4 shadow-sm">
                <h3>⚡ Возможности платформы</h3>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">🤑 Торговля акциями и криптовалютой без риска</li>
                    <li className="list-group-item">📊 Графики в реальном времени</li>
                    <li className="list-group-item">🏆 Лидерборд и мотивация для улучшения навыков</li>
                    <li className="list-group-item">💡 Аналитика и история твоих сделок</li>
                </ul>
            </section>

            <section className="fade-in card p-4 mb-4 shadow-sm">
                <h3>🎯 Готов начать?</h3>
                <p>
                    Присоединяйся, тренируй навыки трейдинга и стремись к вершине лидерборда! Без риска, только обучение и удовольствие от игры.
                </p>
            </section>

        </div>
    );
}

