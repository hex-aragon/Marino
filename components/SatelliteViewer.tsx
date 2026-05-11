'use client';

import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DATA_SOURCES = [
  {
    name: 'AISStream',
    desc: '전 세계 선박 AIS 위치 데이터 실시간 WebSocket',
    href: 'https://aisstream.io',
  },
  {
    name: 'Open-Meteo Marine',
    desc: '무료 해양 기상 API — 파고, 풍파, 너울 예보',
    href: 'https://open-meteo.com/en/docs/marine-weather-api',
  },
  {
    name: 'NASA Worldview',
    desc: 'MODIS/VIIRS 일일 위성 영상 — 해무·해류 관찰',
    href: 'https://worldview.earthdata.nasa.gov',
  },
  {
    name: '국가해양위성센터',
    desc: '천리안 2B GOCI-II 한반도 해역 영상',
    href: 'https://kosc.kiost.ac.kr',
  },
  {
    name: '해양수산부',
    desc: '공공 항만·해상 통계 및 항행 안전 정보',
    href: 'https://www.mof.go.kr',
  },
  {
    name: 'Copernicus Marine',
    desc: '유럽우주국 해양 환경 데이터 (염도·수온·해류)',
    href: 'https://marine.copernicus.eu',
  },
];

export default function SatelliteViewer() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">🛰️ NASA Worldview 위성 이미지</h2>
        <div className="overflow-hidden rounded-xl border bg-card">
          <iframe
            src="https://worldview.earthdata.nasa.gov/?v=124.0,33.0,131.0,38.5&l=MODIS_Aqua_CorrectedReflectance_TrueColor"
            title="NASA Worldview"
            className="h-[400px] w-full"
            loading="lazy"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          출처: NASA EOSDIS Worldview · 한반도 해역 (124°E – 131°E, 33°N – 38.5°N)
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">📚 공공 데이터 출처</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map((src) => (
            <a
              key={src.name}
              href={src.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full transition-colors hover:border-primary/60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{src.name}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{src.desc}</CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
