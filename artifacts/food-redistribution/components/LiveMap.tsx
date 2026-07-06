import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface LiveMapProps {
  progress: any;
  userCoords: { latitude: number; longitude: number };
  ngoCoords: { latitude: number; longitude: number };
  riderCoords: { latitude: number; longitude: number };
  route: { latitude: number; longitude: number }[];
  riderRouteIndex?: number;
  userLabel?: string;
  ngoLabel?: string;
}

function buildLeafletHTML(
  userLat: number, userLng: number,
  ngoLat: number, ngoLng: number,
  userLabel: string, ngoLabel: string
): string {
  const startLat = userLat + 0.006;
  const startLng = userLng + 0.005;

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
    background:rgba(0,0,0,0.75);color:#ef4444;
    border:1px solid rgba(239,68,68,0.5);
    border-radius:20px;padding:4px 12px;
    font:700 10px/1.5 sans-serif;letter-spacing:1.5px;z-index:1000;
    display:flex;align-items:center;gap:6px;
  }
  .dot{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:blink 1s step-start infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(1.8);opacity:0.08}}
</style>
</head>
<body>
<div id="map"></div>
<div class="live-badge"><div class="dot"></div>LIVE</div>
<script>
(function(){
  var uLat=${userLat},uLng=${userLng};
  var nLat=${ngoLat},nLng=${ngoLng};
  var sLat=${startLat},sLng=${startLng};

  var map=L.map('map',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,tap:false,touchZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  map.fitBounds([[sLat,sLng],[uLat,uLng],[nLat,nLng]],{padding:[55,55]});

  // Full route dashed
  L.polyline([[sLat,sLng],[uLat,uLng],[nLat,nLng]],{color:'#22C55E',weight:4,opacity:0.3,dashArray:'10,7'}).addTo(map);
  var traveledLine=L.polyline([],{color:'#22C55E',weight:5,opacity:0.95}).addTo(map);

  // User marker
  L.marker([uLat,uLng],{icon:L.divIcon({className:'',
    html:'<div style="background:#22C55E;width:40px;height:40px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-size:18px">🏠</div>',
    iconSize:[40,40],iconAnchor:[20,20]})})
    .addTo(map)
    .bindTooltip('<b style="font-size:12px">${userLabel} · Pickup</b>',{permanent:true,direction:'top',offset:[0,-24]});

  // NGO marker
  L.marker([nLat,nLng],{icon:L.divIcon({className:'',
    html:'<div style="background:#3B82F6;width:40px;height:40px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-size:18px">❤️</div>',
    iconSize:[40,40],iconAnchor:[20,20]})})
    .addTo(map)
    .bindTooltip('<b style="font-size:12px">${ngoLabel}</b>',{permanent:true,direction:'top',offset:[0,-24]});

  // Rider icon with pulsing ring
  var style=document.createElement('style');
  style.textContent='@keyframes pulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(1.8);opacity:0.08}}';
  document.head.appendChild(style);

  var riderIcon=L.divIcon({className:'',
    html:'<div style="width:50px;height:50px;display:flex;align-items:center;justify-content:center;position:relative"><div style="position:absolute;width:50px;height:50px;border-radius:50%;background:rgba(249,115,22,0.22);animation:pulse 1.2s ease-in-out infinite"></div><span style="font-size:28px;line-height:1;position:relative;z-index:2">🏍️</span></div>',
    iconSize:[50,50],iconAnchor:[25,25]});
  var rider=L.marker([sLat,sLng],{icon:riderIcon,zIndexOffset:2000}).addTo(map);

  // Full path: rider start → user (pickup) → NGO
  var path=[
    {lat:sLat,lng:sLng},
    {lat:sLat*0.67+uLat*0.33,lng:sLng*0.67+uLng*0.33},
    {lat:sLat*0.33+uLat*0.67,lng:sLng*0.33+uLng*0.67},
    {lat:uLat,lng:uLng},
    {lat:uLat*0.67+nLat*0.33,lng:uLng*0.67+nLng*0.33},
    {lat:uLat*0.33+nLat*0.67,lng:uLng*0.33+nLng*0.67},
    {lat:nLat,lng:nLng}
  ];

  var traveled=[[sLat,sLng]],idx=0;
  function step(){
    if(idx>=path.length-1)return;
    idx++;
    var p=path[idx];
    rider.setLatLng([p.lat,p.lng]);
    traveled.push([p.lat,p.lng]);
    traveledLine.setLatLngs(traveled);
    map.panTo([p.lat,p.lng],{animate:true,duration:2.5,easeLinearity:0.35});
    setTimeout(step,4000);
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
  userLabel = "You",
  ngoLabel = "NGO",
}: LiveMapProps) {
  const html = buildLeafletHTML(
    userCoords.latitude, userCoords.longitude,
    ngoCoords.latitude, ngoCoords.longitude,
    userLabel, ngoLabel
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 280, borderRadius: 20, overflow: "hidden", backgroundColor: "#e8f0e9" },
  webview: { flex: 1 },
});