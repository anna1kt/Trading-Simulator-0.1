import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

const PriceChart = forwardRef(function PriceChart({ data = [], interval = '1m' }, ref) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const maSeriesRef = useRef(null);
  const hasInitialDataRef = useRef(false);

  useImperativeHandle(ref, () => ({
    setDataOnce: (candles) => {
      if (!candleSeriesRef.current) return;
      candleSeriesRef.current.setData(candles);
      maSeriesRef.current.setData(calcMA(candles, 20));
      chartRef.current?.timeScale().fitContent();
      hasInitialDataRef.current = true;
    },
    append: (bar) => {
      if (!candleSeriesRef.current) return;
      candleSeriesRef.current.update(bar);
    },
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const showSeconds = ['1m','3m','5m','15m','30m','1h','2h'].includes(interval);

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { type: 'solid', color: '#0b0f17' },
        textColor: '#cbd5e1',
      },
      rightPriceScale: {
        borderColor: 'rgba(100, 114, 139, 0.3)',
        scaleMargins: { top: 0.1, bottom: 0.12 },
      },
      timeScale: {
        borderColor: 'rgba(100, 114, 139, 0.3)',
        timeVisible: true,
        secondsVisible: showSeconds,
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.08)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.08)' },
      },
      crosshair: { mode: 0 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, touch: true },
      handleScale: { axisPressedMouseMove: true, pinch: true, mouseWheel: true },
      autoSize: false,
      localization: {
        priceFormatter: (p) => `$${Number(p).toFixed(2)}`,
      },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceLineVisible: true,
      priceLineColor: 'rgba(255,255,255,0.25)',
    });

    const ma = chart.addSeries(LineSeries, {
      color: '#22d3ee',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candle;
    maSeriesRef.current = ma;

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    if (data?.length && !hasInitialDataRef.current) {
      candleSeriesRef.current.setData(data);
      maSeriesRef.current.setData(calcMA(data, 20));
      chartRef.current.timeScale().fitContent();
      hasInitialDataRef.current = true;
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      maSeriesRef.current = null;
    };
  }, [interval]); 

  useEffect(() => {
    if (!data?.length || !candleSeriesRef.current) return;
    if (!hasInitialDataRef.current) {
      candleSeriesRef.current.setData(data);
      maSeriesRef.current.setData(calcMA(data, 20));
      chartRef.current?.timeScale().fitContent();
      hasInitialDataRef.current = true;
      pulse(containerRef.current);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "420px",
        borderRadius: "12px",
        overflow: "hidden",
        background: "linear-gradient(180deg,#0b0f17,#0d1320 60%,#0b0f17)",
        border: "1px solid #1f2937",
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.35)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    />
  );
});

export default PriceChart;

function calcMA(candles, period = 20) {
  if (!candles?.length) return [];
  const out = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += Number(candles[i].close);
    if (i >= period) sum -= Number(candles[i - period].close);
    if (i >= period - 1) {
      out.push({ time: candles[i].time, value: +(sum / period).toFixed(2) });
    }
  }
  return out;
}

function pulse(el) {
  if (!el?.animate) return;
  el.animate(
    [
      { boxShadow: '0 0 0px rgba(34,211,238,0.0)' },
      { boxShadow: '0 0 30px rgba(34,211,238,0.15)' },
      { boxShadow: '0 0 0px rgba(34,211,238,0.0)' },
    ],
    { duration: 1000, easing: 'ease-in-out' }
  );
}