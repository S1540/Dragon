"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Earth({ paused, interaction }) {
  const host = useRef(null);
  const pauseRef = useRef(paused);
  useEffect(() => { pauseRef.current = paused; }, [paused]);
  useEffect(() => {
    const container = host.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.innerWidth < 768;
    const lowPower = navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: "low-power" }); }
    catch { container.dataset.fallback = "true"; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile || lowPower ? 1.25 : 1.75));
    renderer.setClearColor(0x05070b, 0);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 5.5);
    const world = new THREE.Group();world.rotation.z = -0.20;scene.add(world);
    let disposed = false, ready = false, visible = true, contextLost = false;
    const loader = new THREE.TextureLoader();
    const earthMap = loader.load(mobile ? "/textures/earth-mobile.webp" : "/textures/earth.webp", () => { if (disposed) { earthMap.dispose(); return; } ready = true; container.dataset.ready = "true"; });
    const waterMap = loader.load("/textures/earth-water.webp", () => { if (disposed) waterMap.dispose(); });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.62, mobile ? 48 : 80, mobile ? 32 : 56), new THREE.ShaderMaterial({
      uniforms: { earthMap: { value: earthMap }, waterMap: { value: waterMap } },
      vertexShader: `varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition;
        void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vPosition=p.xyz;gl_Position=projectionMatrix*p;}`,
      fragmentShader: `uniform sampler2D earthMap;uniform sampler2D waterMap;varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;
        void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-1.2,1.0,1.6));float diffuse=max(dot(n,light),0.);vec3 tex=texture2D(earthMap,vUv).rgb;float water=texture2D(waterMap,vUv).r;float detail=dot(tex,vec3(.299,.587,.114));vec3 land=mix(vec3(.075,.17,.22),vec3(.32,.44,.49),detail);vec3 ocean=mix(vec3(.006,.035,.07),vec3(.025,.16,.23),detail);vec3 color=mix(land,ocean,water);color*=.17+diffuse*1.35;vec3 view=normalize(-vPosition);float rim=pow(1.-max(dot(n,view),0.),3.5);color+=vec3(.086,.65,.78)*rim*(.1+diffuse*.65);float spec=pow(max(dot(reflect(-light,n),view),0.),40.);color+=vec3(.15,.43,.5)*spec*water*.35;gl_FragColor=vec4(color,1.);}`,
    }));
    globe.rotation.y = 2.8;world.add(globe);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.665, 48, 32), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
      vertexShader: `varying vec3 n;varying vec3 p;void main(){n=normalize(normalMatrix*normal);vec4 pos=modelViewMatrix*vec4(position,1.);p=pos.xyz;gl_Position=projectionMatrix*pos;}`,
      fragmentShader: `varying vec3 n;varying vec3 p;void main(){float rim=pow(max(0.,1.+dot(normalize(n),normalize(-p))),5.);gl_FragColor=vec4(.086,.65,.78,rim*.48);}`,
    }));world.add(atmosphere);
    const positions=[];let seed=83;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    for(let i=0;i<(mobile?100:230);i++)positions.push((random()-.5)*8,(random()-.5)*6,(random()-.5)*5-1.5);
    const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    const stars = new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:0xdce7ef,size:.012,transparent:true,opacity:.5,depthWrite:false}));
    scene.add(stars);
    // Land-masked light beads sit on the real spherical surface, rotating with Earth.
    // Soft foreground sprites create optical bokeh without an expensive bloom pass.
    function lightField(count, surface) {
      const xyz = [], uvs = [], sizes = [], phases = [];
      for (let i = 0; i < count; i++) {
        const phi = random() * Math.PI * 2;
        const theta = Math.acos(2 * random() - 1);
        const radius = surface ? 1.64 + Math.pow(random(), 4) * .07 : 1.8 + random() * 1.05;
        xyz.push(-radius * Math.cos(phi) * Math.sin(theta), radius * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta));
        uvs.push(phi / (Math.PI * 2), 1 - theta / Math.PI);
        sizes.push(surface ? 2.1 + Math.pow(random(), 2) * 7 : 6 + Math.pow(random(), 2) * 52);
        phases.push(random() * Math.PI * 2);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(xyz, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
      geometry.setAttribute("aPhase", new THREE.Float32BufferAttribute(phases, 1));
      const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { waterMap: { value: waterMap }, uTime: { value: 0 }, uPulse: { value: 0 }, uSurface: { value: surface ? 1 : 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
        vertexShader: `attribute float aSize;attribute float aPhase;varying vec2 vUv;varying float vPhase;varying float vDepth;uniform float uTime;uniform float uSurface;uniform float uPixelRatio;
          void main(){vUv=uv;vPhase=aPhase;vec3 p=position;if(uSurface<.5){p+=.025*vec3(sin(uTime*.23+aPhase),cos(uTime*.17+aPhase),sin(uTime*.12+aPhase));}vec4 mv=modelViewMatrix*vec4(p,1.);vDepth=-mv.z;gl_Position=projectionMatrix*mv;gl_PointSize=min(48.,aSize*uPixelRatio*(4.5/-mv.z));}`,
        fragmentShader: `uniform sampler2D waterMap;uniform float uTime;uniform float uPulse;uniform float uSurface;varying vec2 vUv;varying float vPhase;varying float vDepth;
          void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float land=1.-texture2D(waterMap,vUv).r;if(uSurface>.5&&land<.55)discard;float glow=exp(-d*d*4.5);float core=exp(-d*d*32.);float flicker=.65+.35*sin(uTime*.65+vPhase);vec3 silver=vec3(.863,.906,.937);vec3 cyan=vec3(.086,.851,.91);vec3 tint=mix(cyan,silver,step(.7,fract(vPhase)));float alpha=(glow*.45+core*.7)*flicker*(1.+uPulse*2.);if(uSurface<.5)alpha*=.65;gl_FragColor=vec4(tint+core*.3,alpha);}`,
      });
      return new THREE.Points(geometry, material);
    }
    const surfaceLights = lightField(mobile ? 10000 : 32000, true);
    const fireflies = lightField(mobile ? 160 : 440, false);
    globe.add(surfaceLights);world.add(fireflies);
    const resize=()=>{const {width,height}=container.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.render(scene,camera);};
    const observer=new ResizeObserver(resize);observer.observe(container);resize();
    let frame, last=0, elapsed=0, slowFrames=0, lastDraw=0;
    const draw=(time)=>{
      frame=requestAnimationFrame(draw);const delta=Math.min((time-last)/1000,.05);last=time;
      if(!visible||document.hidden||contextLost)return;
      const staticFrame=motion.matches||pauseRef.current||lowPower;
      if(staticFrame&&time-lastDraw<250)return;
      if(!staticFrame){elapsed+=delta;globe.rotation.y+=delta*.035;fireflies.rotation.y-=delta*.016;stars.rotation.y+=delta*.012;stars.rotation.z=Math.sin(elapsed*.07)*.035;world.position.y=Math.sin(elapsed*.3)*.025;surfaceLights.material.uniforms.uTime.value=elapsed;fireflies.material.uniforms.uTime.value=elapsed;}
      const pulseAge = interaction?.current.pulse ? (time - interaction.current.pulse) / 1000 : 10;
      const pulse = !staticFrame && pulseAge < 1.5 ? Math.sin(pulseAge / 1.5 * Math.PI) * Math.exp(-pulseAge * 1.5) : 0;
      world.scale.setScalar(1 + pulse * .018);
      surfaceLights.material.uniforms.uPulse.value=pulse;
      fireflies.material.uniforms.uPulse.value=pulse;
      container.dataset.pulse=pulse.toFixed(3);
      container.dataset.starRotation=stars.rotation.y.toFixed(4);
      if(!staticFrame&&delta>.025)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
      if(slowFrames>100&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();slowFrames=0;}
      renderer.render(scene,camera);lastDraw=time;container.dataset.rotation=globe.rotation.y.toFixed(3);
    };
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:"80px"});intersection.observe(container);
    const lost=(event)=>{event.preventDefault();contextLost=true;container.dataset.ready="false";container.dataset.fallback="true";};
    const restored=()=>{contextLost=false;container.dataset.ready=String(ready);container.dataset.fallback="false";resize();};
    renderer.domElement.addEventListener("webglcontextlost",lost);renderer.domElement.addEventListener("webglcontextrestored",restored);frame=requestAnimationFrame(draw);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();renderer.domElement.removeEventListener("webglcontextlost",lost);renderer.domElement.removeEventListener("webglcontextrestored",restored);scene.traverse(object=>{object.geometry?.dispose();if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}});earthMap.dispose();waterMap.dispose();renderer.dispose();renderer.domElement.remove();};
  }, [interaction]);
  return <div ref={host} className="earth-canvas" role="img" aria-label="A slowly rotating three-dimensional Earth with a silver and cyan dragon-inspired orbital trail"><div className="earth-fallback" /></div>;
}
