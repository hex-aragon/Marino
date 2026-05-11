'use client';

import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function recentDate(daysAgo = 3) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const GIBS_SNAPSHOT = (date: string) =>
  `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Aqua_CorrectedReflectance_TrueColor&CRS=EPSG:4326&BBOX=33,124,38.5,131&WIDTH=1200&HEIGHT=900&FORMAT=image/jpeg&TIME=${date}`;

const WORLDVIEW_URL =
  'https://worldview.earthdata.nasa.gov/?v=124.0,33.0,131.0,38.5&l=MODIS_Aqua_CorrectedReflectance_TrueColor';

const DATA_SOURCES = [
  {
    name: 'AISStream',
    desc: 'Real-time WebSocket of global vessel AIS position data',
    href: 'https://aisstream.io',
  },
  {
    name: 'Open-Meteo Marine',
    desc: 'Free marine weather API — wave height, wind waves, swell forecasts',
    href: 'https://open-meteo.com/en/docs/marine-weather-api',
  },
  {
    name: 'NASA Worldview',
    desc: 'MODIS/VIIRS daily satellite imagery — sea fog and current observation',
    href: 'https://worldview.earthdata.nasa.gov',
  },
  {
    name: 'NOAA (National Oceanic and Atmospheric Administration)',
    desc: 'Global ocean currents, sea surface temperature, and marine forecasts',
    href: 'https://www.noaa.gov/',
  },
  {
    name: 'Copernicus Marine',
    desc: 'ESA marine environment data (salinity, sea temperature, currents)',
    href: 'https://marine.copernicus.eu',
  },
  {
    name: 'IMO (International Maritime Organization)',
    desc: 'Global maritime safety and security regulations and shipping statistics',
    href: 'https://www.imo.org/',
  },
];

export default function SatelliteViewer() {
  const date = recentDate(3);
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">🛰️ NASA Worldview Satellite Imagery</h2>
          <a
            href={WORLDVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
          >
            Open in NASA Worldview <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card">
          <img
            src={GIBS_SNAPSHOT(date)}
            alt={`NASA MODIS Aqua satellite imagery of Korean waters on ${date}`}
            className="h-[400px] w-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Source: NASA EOSDIS GIBS · MODIS Aqua True Color · {date} · Korean Peninsula waters (124°E
          – 131°E, 33°N – 38.5°N)
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">📚 Public Data Sources</h2>
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
