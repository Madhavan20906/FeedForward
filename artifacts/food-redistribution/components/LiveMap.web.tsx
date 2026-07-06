import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface LiveMapProps {
  progress: Animated.Value;
  userCoords: { latitude: number; longitude: number };
  ngoCoords: { latitude: number; longitude: number };
  riderCoords: { latitude: number; longitude: number };
  route: { latitude: number; longitude: number }[];
  riderRouteIndex?: number;
  userLabel?: string;
  ngoLabel?: string;
}

function buildLeafletHTML(
  userLat: number,
  userLng: number,
  ngoLat: number,
  ngoLng: number,
  route: { latitude: number; longitude: number }[],
  userLabel: string,
  ngoLabel: string
): string {
  const routeJson = JSON.stringify(route);
  const midLat = (userLat + ngoLat) / 2;
  const midLng = (userLng + ngoLng) / 2;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body,#map{width:100%;height:100%;overflow:hidden}
  .leaflet-control-attribution,.leaflet-control-zoom{display:none!important}
  .live-badge{
    position:fixed;top:10px;right:10px;
    background:rgba(0,0,0,0.72);color:#ef4444;
    border:1px solid rgba(239,68,68,0.45);
    border-radius:20px;padding:4px 11px;
    font:700 10px/1.4 sans-serif;letter-spacing:1.5px;z-index:1000;
  }
  .pulse-dot{
    display:inline-block;width:7px;height:7px;
    border-radius:50%;background:#ef4444;
    margin-right:5px;vertical-align:middle;
    animation:blink 1s step-start infinite;
  }
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
</style>
</head>
<body>
<div id="map"></div>
<div class="live-badge"><span class="pulse-dot"></span>LIVE</div>
<script>
(function(){
  var userLat=${userLat}, userLng=${userLng};
  var ngoLat=${ngoLat}, ngoLng=${ngoLng};
  var route=${routeJson};
  var midLat=${midLat}, midLng=${midLng};

  var map = L.map('map',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,tap:false,touchZoom:false});
  map.setView([midLat,midLng],15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

  var bounds = L.latLngBounds([[userLat,userLng],[ngoLat,ngoLng]]);
  map.fitBounds(bounds,{padding:[40,40]});

  var routeCoords = route.map(function(p){return [p.latitude,p.longitude];});
  L.polyline(routeCoords,{color:'#22C55E',weight:4,opacity:0.35,dashArray:'10,7'}).addTo(map);

  var traveledLine = L.polyline([],{color:'#22C55E',weight:5,opacity:0.95}).addTo(map);

  var userIcon = L.divIcon({
    className:'',
    html:'<div style="background:#22C55E;width:38px;height:38px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35);font-size:16px;line-height:1">🏠</div>',
    iconSize:[38,38],iconAnchor:[19,19]
  });
  L.marker([userLat,userLng],{icon:userIcon}).addTo(map)
    .bindTooltip('<b style="font-size:12px">${userLabel}</b>',{permanent:true,direction:'top',offset:[0,-22]});

  var ngoIcon = L.divIcon({
    className:'',
    html:'<div style="background:#3B82F6;width:38px;height:38px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35);font-size:16px;line-height:1">❤️</div>',
    iconSize:[38,38],iconAnchor:[19,19]
  });
  L.marker([ngoLat,ngoLng],{icon:ngoIcon}).addTo(map)
    .bindTooltip('<b style="font-size:12px">${ngoLabel}</b>',{permanent:true,direction:'top',offset:[0,-22]});

  var dLat = userLat - ngoLat, dLng = userLng - ngoLng;
  var d = Math.sqrt(dLat*dLat+dLng*dLng)||0.005;
  var startLat = userLat + (dLat/d)*0.0045;
  var startLng = userLng + (dLng/d)*0.0045;

  var fullPath = [{lat:startLat,lng:startLng},{lat:userLat,lng:userLng}]
    .concat(route.map(function(p){return {lat:p.latitude,lng:p.longitude};}));

  var riderIcon = L.divIcon({
    className:'',
    html:'<div style="width:46px;height:46px;display:flex;align-items:center;justify-content:center;position:relative"><div style="position:absolute;width:46px;height:46px;border-radius:50%;background:rgba(249,115,22,0.20);animation:pulse 1.2s ease-in-out infinite"></div><span style="font-size:26px;line-height:1;position:relative;z-index:1">🏍️</span></div>',
    iconSize:[46,46],iconAnchor:[23,23]
  });
  var riderMarker = L.marker([startLat,startLng],{icon:riderIcon,zIndexOffset:2000}).addTo(map);

  var style=document.createElement('style');
  style.textContent='@keyframes pulse{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.6);opacity:0.1}}';
  document.head.appendChild(style);

  var traveledCoords = [[startLat,startLng]];
  var idx = 0;
  var STEP = 4000;

  function step(){
    if(idx>=fullPath.length-1) return;
    idx++;
    var p = fullPath[idx];
    riderMarker.setLatLng([p.lat,p.lng]);
    traveledCoords.push([p.lat,p.lng]);
    traveledLine.setLatLngs(traveledCoords);
    map.panTo([p.lat,p.lng],{animate:true,duration:2.5,easeLinearity:0.4});
    setTimeout(step,STEP);
  }

  setTimeout(step,2500);
})();
<\/script>
</body>
</html>`;
}

export default function LiveMap({
  userCoords,
  ngoCoords,
  route,
  userLabel = "You",
  ngoLabel = "NGO",
}: LiveMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (route.length === 0) return;
    const html = buildLeafletHTML(
      userCoords.latitude, userCoords.longitude,
      ngoCoords.latitude, ngoCoords.longitude,
      route, userLabel, ngoLabel
    );
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  }, [userCoords.latitude, userCoords.longitude, ngoCoords.latitude, ngoCoords.longitude, route.length]);

  const html = buildLeafletHTML(
    userCoords.latitude, userCoords.longitude,
    ngoCoords.latitude, ngoCoords.longitude,
    route.length > 0 ? route : [{ latitude: userCoords.latitude + 0.015, longitude: userCoords.longitude + 0.012 }],
    userLabel, ngoLabel
  );

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        style={styles.iframe as React.CSSProperties}
        sandbox="allow-scripts allow-same-origin"
        title="Live Delivery Map"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 280, borderRadius: 20, overflow: "hidden", backgroundColor: "#e8f0e9" },
  iframe: { width: "100%", height: "100%", border: "none", display: "block" },
});