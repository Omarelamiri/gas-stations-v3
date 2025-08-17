'use client';

import { useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useStations } from '@/hooks/useStations';
import { GasStation } from '@/types/station';
import { useRouter } from 'next/navigation';

interface MapViewProps {
  apiKey: string;
}

function renderStatus(status: Status) {
  return <h1>{status}</h1>;
}

export default function MapView({ apiKey }: MapViewProps) {
  const { stations } = useStations();
  const mapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 33.5731, lng: -7.5898 }, // default coordinates
      zoom: 12,
    });

    stations.forEach((station: GasStation) => {
      const marker = new window.google.maps.Marker({
        position: station.coordinates,
        map,
        title: station.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${station.name}</strong><br/>${station.address}<br/>Price: ${station.price}</div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        router.push(`/gas-stations/${station.id}`);
      });
    });
  }, [stations, router]);

  return (
    <div className="w-full h-[600px]">
      <Wrapper apiKey={apiKey} render={renderStatus}>
        <div ref={mapRef} className="w-full h-full" />
      </Wrapper>
    </div>
  );
}
